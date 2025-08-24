import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/analysis/bpm - Store BPM analysis result
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { performanceId, recordingId, bpm, bpmConfidence, durationMs } = body

    if (!performanceId || !recordingId || !bpm || !bpmConfidence) {
      return NextResponse.json(
        { error: 'performanceId, recordingId, bpm, and bpmConfidence are required' },
        { status: 400 }
      )
    }

    // Validate that performance and recording exist
    const performance = await prisma.performance.findUnique({
      where: { id: performanceId }
    })

    if (!performance) {
      return NextResponse.json(
        { error: 'Performance not found' },
        { status: 404 }
      )
    }

    const recording = await prisma.recording.findUnique({
      where: { id: recordingId }
    })

    if (!recording) {
      return NextResponse.json(
        { error: 'Recording not found' },
        { status: 404 }
      )
    }

    // Create or update analysis
    const analysis = await prisma.analysis.upsert({
      where: {
        performanceId_recordingId: {
          performanceId,
          recordingId
        }
      },
      update: {
        bpm,
        bpmConfidence,
        durationMs: durationMs || undefined,
        analyzedAt: new Date()
      },
      create: {
        performanceId,
        recordingId,
        bpm,
        bpmConfidence,
        durationMs: durationMs || undefined
      }
    })

    // Update song rollup if this affects BPM statistics
    await updateSongRollupBpm(performance.songId)

    return NextResponse.json(analysis, { status: 201 })

  } catch (error) {
    console.error('BPM analysis storage error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to update song rollup BPM statistics
async function updateSongRollupBpm(songId: string) {
  try {
    // Get all BPM analyses for this song
    const analyses = await prisma.analysis.findMany({
      where: {
        performance: { songId },
        bpm: { not: null }
      },
      include: {
        performance: true
      },
      orderBy: { bpm: 'asc' }
    })

    if (analyses.length === 0) {
      return
    }

    // Find highest and lowest BPM performances
    const highestBpmAnalysis = analyses.reduce((max, a) => 
      a.bpm! > max.bpm! ? a : max
    )
    const lowestBpmAnalysis = analyses.reduce((min, a) => 
      a.bpm! < min.bpm! ? a : min
    )

    // Update rollup
    await prisma.songRollup.updateMany({
      where: { songId },
      data: {
        highestBpmPerformanceId: highestBpmAnalysis.performanceId,
        lowestBpmPerformanceId: lowestBpmAnalysis.performanceId,
        computedAt: new Date()
      }
    })

  } catch (error) {
    console.error('Error updating song rollup BPM:', error)
  }
}
