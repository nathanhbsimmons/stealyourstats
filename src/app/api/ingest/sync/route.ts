import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createApiClients } from '@/lib/api-clients'

// POST /api/ingest/sync - Sync data from external sources
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { artistName = 'Grateful Dead', startYear = 1965, endYear = 1995 } = body

    // Get or create artist
    let artist = await prisma.artist.findFirst({
      where: { name: artistName }
    })

    if (!artist) {
      // Try to get from MusicBrainz first
      try {
        const apiClients = createApiClients()
        const musicbrainzResult = await apiClients.musicbrainz.searchArtist(artistName)
        
        if (musicbrainzResult.artists && musicbrainzResult.artists.length > 0) {
          const mbArtist = musicbrainzResult.artists[0]
          artist = await prisma.artist.create({
            data: {
              name: mbArtist.name,
              musicbrainzMbid: mbArtist.id
            }
          })
        } else {
          // Create artist without MBID
          artist = await prisma.artist.create({
            data: { name: artistName }
          })
        }
      } catch (error) {
        console.error('MusicBrainz lookup failed:', error)
        // Create artist without MBID
        artist = await prisma.artist.create({
          data: { name: artistName }
        })
      }
    }

    // Sync setlists from setlist.fm
    const setlistResults = await syncSetlists(artist.id, startYear, endYear)
    
    // Sync recordings from Archive.org
    const recordingResults = await syncRecordings(artist.id, startYear, endYear)

    return NextResponse.json({
      message: 'Data sync completed',
      artist: artist.name,
      setlists: setlistResults,
      recordings: recordingResults
    })

  } catch (error) {
    console.error('Data sync error:', error)
    return NextResponse.json(
      { error: 'Data sync failed' },
      { status: 500 }
    )
  }
}

// Sync setlists from setlist.fm
async function syncSetlists(artistId: string, startYear: number, endYear: number) {
  try {
    const apiClients = createApiClients()
    const results = {
      showsCreated: 0,
      performancesCreated: 0,
      songsCreated: 0
    }

    // Get Grateful Dead artist ID from setlist.fm
    // Note: This would need to be looked up or stored
    const setlistFmArtistId = 'c0cc72d2-89a7-40a3-9c01-8b6a1e9d7c8c'

    for (let year = startYear; year <= endYear; year++) {
      try {
        const setlists = await apiClients.setlistFm.getArtistSetlists(setlistFmArtistId, 1, year)
        
        if (setlists.setlist) {
          for (const setlist of setlists.setlist) {
            // Create or update show
            const show = await prisma.show.upsert({
              where: {
                artistId_date: {
                  artistId,
                  date: new Date(setlist.eventDate)
                }
              },
              update: {
                archiveItemIds: setlist.archiveId ? [setlist.archiveId] : []
              },
              create: {
                artistId,
                date: new Date(setlist.eventDate),
                archiveItemIds: setlist.archiveId ? [setlist.archiveId] : [],
                sourceCount: 0
              }
            })

            // Create or update venue
            if (setlist.venue) {
              const venue = await prisma.venue.upsert({
                where: {
                  name_city: {
                    name: setlist.venue.name,
                    city: setlist.venue.city?.name || null
                  }
                },
                update: {},
                create: {
                  name: setlist.venue.name,
                  city: setlist.venue.city?.name,
                  state: setlist.venue.city?.state,
                  country: setlist.venue.city?.country
                }
              })

              // Update show with venue
              await prisma.show.update({
                where: { id: show.id },
                data: { venueId: venue.id }
              })
            }

            // Process setlist
            if (setlist.sets?.set) {
              for (const set of setlist.sets.set) {
                const setNumber = set.encore ? (set.encore === 1 ? 2 : 3) : 1
                
                for (let i = 0; i < set.song.length; i++) {
                  const songData = set.song[i]
                  
                  // Create or update song
                  const song = await prisma.song.upsert({
                    where: {
                      artistId_slug: {
                        artistId,
                        slug: songData.name.toLowerCase().replace(/\s+/g, '-')
                      }
                    },
                    update: {
                      altTitles: {
                        push: songData.name
                      }
                    },
                    create: {
                      artistId,
                      title: songData.name,
                      altTitles: [songData.name],
                      slug: songData.name.toLowerCase().replace(/\s+/g, '-')
                    }
                  })

                  // Create performance
                  await prisma.performance.upsert({
                    where: {
                      showId_songId_setNumber_positionInSet: {
                        showId: show.id,
                        songId: song.id,
                        setNumber,
                        positionInSet: i + 1
                      }
                    },
                    update: {},
                    create: {
                      showId: show.id,
                      songId: song.id,
                      setNumber,
                      positionInSet: i + 1,
                      isOpener: i === 0 && setNumber === 1,
                      isCloser: i === set.song.length - 1 && setNumber === (setlist.sets?.set?.length || 1),
                      isEncore: set.encore === true
                    }
                  })

                  results.performancesCreated++
                }
              }
            }

            results.showsCreated++
          }
        }

        // Rate limiting - wait between years
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error(`Failed to sync setlists for year ${year}:`, error)
        continue
      }
    }

    return results

  } catch (error) {
    console.error('Setlist sync error:', error)
    throw error
  }
}

// Sync recordings from Archive.org
async function syncRecordings(artistId: string, startYear: number, endYear: number) {
  try {
    const apiClients = createApiClients()
    const results = {
      recordingsCreated: 0,
      analysesCreated: 0
    }

    // Get shows for this artist
    const shows = await prisma.show.findMany({
      where: { artistId },
      select: { id: true, date: true, archiveItemIds: true }
    })

    for (const show of shows) {
      if (show.archiveItemIds.length === 0) continue

      for (const archiveId of show.archiveItemIds) {
        try {
          // Get show metadata from Archive.org
          const metadata = await apiClients.archiveOrg.getShowMetadata(archiveId)
          const files = await apiClients.archiveOrg.getShowFiles(archiveId)

          if (files && files.files) {
            // Process audio files
            const audioFiles = Object.entries(files.files).filter(([filename, fileData]: [string, any]) => {
              return fileData.format && ['FLAC', 'MP3', 'VBR MP3'].includes(fileData.format)
            })

            if (audioFiles.length > 0) {
              // Create recording
              const recording = await prisma.recording.upsert({
                where: { archiveIdentifier: archiveId },
                update: {
                  trackMap: audioFiles.reduce((acc, [filename, fileData]: [string, any]) => {
                    acc[filename] = fileData.name
                    return acc
                  }, {} as Record<string, string>),
                  durationMap: audioFiles.reduce((acc, [filename, fileData]: [string, any]) => {
                    if (fileData.length) {
                      acc[filename] = parseInt(fileData.length) * 1000 // Convert to milliseconds
                    }
                    return acc
                  }, {} as Record<string, number>)
                },
                create: {
                  showId: show.id,
                  archiveIdentifier: archiveId,
                  sourceType: 'SBD', // Default assumption
                  format: 'FLAC',
                  trackMap: audioFiles.reduce((acc, [filename, fileData]: [string, any]) => {
                    acc[filename] = fileData.name
                    return acc
                  }, {} as Record<string, string>),
                  durationMap: audioFiles.reduce((acc, [filename, fileData]: [string, any]) => {
                    if (fileData.length) {
                      acc[filename] = parseInt(fileData.length) * 1000
                    }
                    return acc
                  }, {} as Record<string, number>)
                }
              })

              results.recordingsCreated++

              // Update show source count
              await prisma.show.update({
                where: { id: show.id },
                data: { sourceCount: { increment: 1 } }
              })
            }
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 500))
          
        } catch (error) {
          console.error(`Failed to sync recording ${archiveId}:`, error)
          continue
        }
      }
    }

    return results

  } catch (error) {
    console.error('Recording sync error:', error)
    throw error
  }
}
