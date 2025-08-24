import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/songs/[slug] - Get song details with rollup data
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Get song with rollup data
    const song = await prisma.song.findUnique({
      where: { slug },
      include: {
        artist: true,
        performances: {
          include: {
            show: {
              include: {
                venue: true
              }
            },
            analyses: {
              include: {
                recording: true
              }
            }
          }
        }
      }
    })

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 })
    }

    // Get or create rollup data
    let rollup = await prisma.songRollup.findUnique({
      where: { songId: song.id },
      include: {
        debutShow: {
          include: { venue: true }
        },
        lastShow: {
          include: { venue: true }
        },
        longestPerformance: {
          include: {
            show: { include: { venue: true } }
          }
        },
        shortestPerformance: {
          include: {
            show: { include: { venue: true } }
          }
        },
        highestBpmPerformance: {
          include: {
            show: { include: { venue: true } }
          }
        },
        lowestBpmPerformance: {
          include: {
            show: { include: { venue: true } }
          }
        }
      }
    })

    // If no rollup exists, compute it
    if (!rollup) {
      rollup = await computeSongRollup(song.id)
    }

    // Calculate average duration by year
    const avgDurationByYear = await calculateAverageDurationByYear(song.id)

    // Get BPM statistics
    const bpmStats = await getBpmStatistics(song.id)

    const songDetail = {
      song,
      debutShow: rollup?.debutShow,
      lastShow: rollup?.lastShow,
      longest: rollup?.longestPerformance ? {
        ...rollup.longestPerformance,
        durationMs: bpmStats.longestDuration
      } : null,
      shortest: rollup?.shortestPerformance ? {
        ...rollup.shortestPerformance,
        durationMs: bpmStats.shortestDuration
      } : null,
      highestBpm: rollup?.highestBpmPerformance ? {
        ...rollup.highestBpmPerformance,
        bpm: bpmStats.highestBpm,
        bpmConfidence: bpmStats.highestBpmConfidence
      } : null,
      lowestBpm: rollup?.lowestBpmPerformance ? {
        ...rollup.lowestBpmPerformance,
        bpm: bpmStats.lowestBpm,
        bpmConfidence: bpmStats.lowestBpmConfidence
      } : null,
      counts: {
        openers: rollup?.openerCount || 0,
        closers: rollup?.closerCount || 0,
        encores: rollup?.encoreCount || 0
      },
      sampling: {
        avgDurationByYear
      },
      eraHints: getEraHints(song.performances)
    }

    return NextResponse.json(songDetail)

  } catch (error) {
    console.error('Song detail error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to compute song rollup
async function computeSongRollup(songId: string) {
  const performances = await prisma.performance.findMany({
    where: { songId },
    include: {
      show: {
        include: { venue: true }
      },
      analyses: {
        include: { recording: true }
      }
    },
    orderBy: { show: { date: 'asc' } }
  })

  if (performances.length === 0) {
    throw new Error('No performances found for song')
  }

  const debutShow = performances[0].show
  const lastShow = performances[performances.length - 1].show

  // Find longest and shortest performances
  let longestPerformance = performances[0]
  let shortestPerformance = performances[0]
  let longestDuration = 0
  let shortestDuration = Infinity

  for (const performance of performances) {
    for (const analysis of performance.analyses) {
      if (analysis.durationMs) {
        if (analysis.durationMs > longestDuration) {
          longestDuration = analysis.durationMs
          longestPerformance = performance
        }
        if (analysis.durationMs < shortestDuration) {
          shortestDuration = analysis.durationMs
          shortestPerformance = performance
        }
      }
    }
  }

  // Count opener/closer/encore
  const openerCount = performances.filter(p => p.isOpener).length
  const closerCount = performances.filter(p => p.isCloser).length
  const encoreCount = performances.filter(p => p.isEncore).length

  // Create or update rollup
  const rollup = await prisma.songRollup.upsert({
    where: { songId },
    update: {
      debutShowId: debutShow.id,
      lastShowId: lastShow.id,
      longestPerformanceId: longestPerformance.id,
      shortestPerformanceId: shortestPerformance.id,
      openerCount,
      closerCount,
      encoreCount,
      computedAt: new Date()
    },
    create: {
      songId,
      debutShowId: debutShow.id,
      lastShowId: lastShow.id,
      longestPerformanceId: longestPerformance.id,
      shortestPerformanceId: shortestPerformance.id,
      openerCount,
      closerCount,
      encoreCount,
      avgDurationByYear: {}
    }
  })

  return rollup
}

// Helper function to calculate average duration by year
async function calculateAverageDurationByYear(songId: string) {
  const analyses = await prisma.analysis.findMany({
    where: {
      performance: { songId }
    },
    include: {
      performance: {
        include: { show: true }
      }
    }
  })

  const durationByYear: { [year: string]: number[] } = {}

  for (const analysis of analyses) {
    if (analysis.durationMs) {
      const year = analysis.performance.show.date.getFullYear().toString()
      if (!durationByYear[year]) {
        durationByYear[year] = []
      }
      durationByYear[year].push(analysis.durationMs)
    }
  }

  const avgDurationByYear: { [year: string]: number } = {}
  for (const [year, durations] of Object.entries(durationByYear)) {
    avgDurationByYear[year] = Math.round(
      durations.reduce((sum, duration) => sum + duration, 0) / durations.length
    )
  }

  return avgDurationByYear
}

// Helper function to get BPM statistics
async function getBpmStatistics(songId: string) {
  const analyses = await prisma.analysis.findMany({
    where: {
      performance: { songId },
      bpm: { not: null }
    },
    orderBy: { bpm: 'asc' }
  })

  if (analyses.length === 0) {
    return {
      longestDuration: 0,
      shortestDuration: 0,
      highestBpm: null,
      lowestBpm: null,
      highestBpmConfidence: null,
      lowestBpmConfidence: null
    }
  }

  const bpmAnalyses = analyses.filter(a => a.bpm !== null)
  const durationAnalyses = analyses.filter(a => a.durationMs !== null)

  return {
    longestDuration: Math.max(...durationAnalyses.map(a => a.durationMs!)),
    shortestDuration: Math.min(...durationAnalyses.map(a => a.durationMs!)),
    highestBpm: Math.max(...bpmAnalyses.map(a => a.bpm!)),
    lowestBpm: Math.min(...bpmAnalyses.map(a => a.bpm!)),
    highestBpmConfidence: bpmAnalyses.reduce((max, a) => 
      a.bpmConfidence && a.bpmConfidence > max ? a.bpmConfidence : max, 0
    ),
    lowestBpmConfidence: bpmAnalyses.reduce((min, a) => 
      a.bpmConfidence && a.bpmConfidence < min ? a.bpmConfidence : min, 1
    )
  }
}

// Helper function to get era hints
function getEraHints(performances: any[]) {
  const years = [...new Set(performances.map(p => p.show.date.getFullYear()))]
  const eraLabels = [
    { year: '1965-1967', label: 'Primal' },
    { year: '1968-1970', label: 'Pigpen Peak' },
    { year: '1971-1972', label: 'Europe \'72' },
    { year: '1973-1974', label: 'Wall of Sound' },
    { year: '1976-1978', label: 'Return + \'77' },
    { year: '1979-1986', label: 'Brent (early)' },
    { year: '1987-1990', label: 'Brent (late)' },
    { year: '1991-1995', label: 'Vince' }
  ]

  return years.map(year => {
    const era = eraLabels.find(era => {
      const [start, end] = era.year.split('-').map(y => parseInt(y))
      return year >= start && year <= (end || start)
    })
    return { year: year.toString(), label: era?.label || 'Unknown' }
  })
}
