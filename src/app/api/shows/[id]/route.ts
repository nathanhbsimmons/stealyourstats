import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createApiClients } from '@/lib/api-clients'

// GET /api/shows/[id] - Get show details with setlist and recordings
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get show with all related data
    const show = await prisma.show.findUnique({
      where: { id },
      include: {
        artist: true,
        venue: true,
        performances: {
          include: {
            song: true,
            segueToSong: true
          },
          orderBy: [
            { setNumber: 'asc' },
            { positionInSet: 'asc' }
          ]
        },
        recordings: {
          include: {
            analyses: {
              include: {
                performance: true
              }
            }
          }
        }
      }
    })

    if (!show) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 })
    }

    // Transform performances into setlist format
    const setlist = show.performances.map(performance => ({
      setNumber: performance.setNumber || 1,
      positionInSet: performance.positionInSet || 1,
      songTitle: performance.song.title,
      segueToSongTitle: performance.segueToSong?.title || null,
      isOpener: performance.isOpener,
      isCloser: performance.isCloser,
      isEncore: performance.isEncore
    }))

    // Transform recordings into streamable format
    const recordings = show.recordings.map(recording => ({
      id: recording.id,
      sourceType: recording.sourceType,
      format: recording.format,
      trackMap: recording.trackMap as Record<string, string>,
      durationMap: recording.durationMap as Record<string, number>,
      streamable: true // Archive.org recordings are streamable
    }))

    // Get era context
    const eraContext = getEraContext(show.date)

    const showDetail = {
      show: {
        id: show.id,
        date: show.date,
        venue: show.venue,
        archiveItemIds: show.archiveItemIds,
        sourceCount: show.sourceCount
      },
      venue: show.venue,
      setlist,
      recordings,
      eraContext
    }

    return NextResponse.json(showDetail)

  } catch (error) {
    console.error('Show detail error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to get era context
function getEraContext(date: Date) {
  const year = date.getFullYear()
  
  const eraLabels = [
    { start: 1965, end: 1967, label: 'Primal', description: 'The early days of the Grateful Dead, featuring the original lineup with Pigpen on vocals and harmonica.' },
    { start: 1968, end: 1970, label: 'Pigpen Peak', description: 'Pigpen\'s golden era, with blues-heavy setlists and extended jams.' },
    { start: 1971, end: 1972, label: 'Europe \'72', description: 'The legendary European tour that captured the Dead at their most adventurous.' },
    { start: 1973, end: 1974, label: 'Wall of Sound', description: 'The massive Wall of Sound era, featuring some of the most technically advanced live sound systems ever built.' },
    { start: 1976, end: 1978, label: 'Return + \'77', description: 'The return from hiatus and the legendary 1977 tour, considered by many to be the Dead\'s peak year.' },
    { start: 1979, end: 1986, label: 'Brent (early)', description: 'The early Brent Mydland years, bringing new energy and keyboard textures to the band.' },
    { start: 1987, end: 1990, label: 'Brent (late)', description: 'The later Brent years, with more polished arrangements and expanded song repertoire.' },
    { start: 1991, end: 1995, label: 'Vince', description: 'The Vince Welnick era, the final chapter of the Grateful Dead with a more modern sound.' }
  ]

  const era = eraLabels.find(era => year >= era.start && year <= era.end)
  
  return {
    year: year.toString(),
    label: era?.label || 'Unknown',
    description: era?.description || 'Era information not available.'
  }
}
