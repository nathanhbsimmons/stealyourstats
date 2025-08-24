import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createApiClients } from '@/lib/api-clients'

// GET /api/songs - Search songs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    // Search in database first
    const songs = await prisma.song.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { altTitles: { has: query } }
        ]
      },
      include: {
        artist: true,
        performances: {
          include: {
            show: {
              include: {
                venue: true
              }
            }
          }
        }
      },
      take: limit
    })

    // If no results in database, try external API
    if (songs.length === 0) {
      try {
        const apiClients = createApiClients()
        // Search for Grateful Dead songs via setlist.fm
        // Note: You'll need to get the Grateful Dead artist ID first
        const searchResults = await apiClients.setlistFm.searchSongs('c0cc72d2-89a7-40a3-9c01-8b6a1e9d7c8c', query)
        
        // Transform and return external results
        return NextResponse.json({
          songs: searchResults.setlist || [],
          source: 'external'
        })
      } catch (apiError) {
        console.error('External API search failed:', apiError)
        // Return empty results if external API fails
        return NextResponse.json({ songs: [], source: 'database' })
      }
    }

    return NextResponse.json({
      songs,
      source: 'database'
    })

  } catch (error) {
    console.error('Songs search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/songs - Create new song (for data ingestion)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, altTitles, artistId, slug } = body

    if (!title || !artistId || !slug) {
      return NextResponse.json(
        { error: 'Title, artistId, and slug are required' },
        { status: 400 }
      )
    }

    const song = await prisma.song.create({
      data: {
        title,
        altTitles: altTitles || [title],
        artistId,
        slug
      },
      include: {
        artist: true
      }
    })

    return NextResponse.json(song, { status: 201 })

  } catch (error) {
    console.error('Song creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
