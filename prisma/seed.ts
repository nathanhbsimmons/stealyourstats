import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create Grateful Dead artist
  const artist = await prisma.artist.upsert({
    where: { name: 'Grateful Dead' },
    update: {},
    create: {
      name: 'Grateful Dead',
      musicbrainzMbid: '6f856a92-6b9c-4c4a-8b6e-5c3f3c2b1a0f'
    }
  })

  console.log('✅ Created artist:', artist.name)

  // Create sample venues
  const venues = await Promise.all([
    prisma.venue.upsert({
      where: { name: 'Fillmore West' },
      update: {},
      create: {
        name: 'Fillmore West',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA'
      }
    }),
    prisma.venue.upsert({
      where: { name: 'Winterland Arena' },
      update: {},
      create: {
        name: 'Winterland Arena',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA'
      }
    }),
    prisma.venue.upsert({
      where: { name: 'Madison Square Garden' },
      update: {},
      create: {
        name: 'Madison Square Garden',
        city: 'New York',
        state: 'NY',
        country: 'USA'
      }
    })
  ])

  console.log('✅ Created venues:', venues.length)

  // Create sample songs
  const songs = await Promise.all([
    prisma.song.upsert({
      where: { slug: 'scarlet-begonias' },
      update: {},
      create: {
        artistId: artist.id,
        title: 'Scarlet Begonias',
        altTitles: ['Scarlet Begonias', 'Scarlet'],
        slug: 'scarlet-begonias'
      }
    }),
    prisma.song.upsert({
      where: { slug: 'fire-on-the-mountain' },
      update: {},
      create: {
        artistId: artist.id,
        title: 'Fire on the Mountain',
        altTitles: ['Fire on the Mountain', 'Fire'],
        slug: 'fire-on-the-mountain'
      }
    }),
    prisma.song.upsert({
      where: { slug: 'dark-star' },
      update: {},
      create: {
        artistId: artist.id,
        title: 'Dark Star',
        altTitles: ['Dark Star'],
        slug: 'dark-star'
      }
    }),
    prisma.song.upsert({
      where: { slug: 'truckin' },
      update: {},
      create: {
        artistId: artist.id,
        title: 'Truckin\'',
        altTitles: ['Truckin\'', 'Truckin'],
        slug: 'truckin'
      }
    }),
    prisma.song.upsert({
      where: { slug: 'casey-jones' },
      update: {},
      create: {
        artistId: artist.id,
        title: 'Casey Jones',
        altTitles: ['Casey Jones'],
        slug: 'casey-jones'
      }
    })
  ])

  console.log('✅ Created songs:', songs.length)

  // Create sample shows
  const shows = await Promise.all([
    prisma.show.upsert({
      where: { 
        artistId_date: {
          artistId: artist.id,
          date: new Date('1969-02-27')
        }
      },
      update: {},
      create: {
        artistId: artist.id,
        date: new Date('1969-02-27'),
        venueId: venues[0].id,
        archiveItemIds: ['gd1969-02-27'],
        sourceCount: 3
      }
    }),
    prisma.show.upsert({
      where: { 
        artistId_date: {
          artistId: artist.id,
          date: new Date('1977-05-08')
        }
      },
      update: {},
      create: {
        artistId: artist.id,
        date: new Date('1977-05-08'),
        venueId: venues[1].id,
        archiveItemIds: ['gd1977-05-08'],
        sourceCount: 5
      }
    }),
    prisma.show.upsert({
      where: { 
        artistId_date: {
          artistId: artist.id,
          date: new Date('1989-07-07')
        }
      },
      update: {},
      create: {
        artistId: artist.id,
        date: new Date('1989-07-07'),
        venueId: venues[2].id,
        archiveItemIds: ['gd1989-07-07'],
        sourceCount: 2
      }
    })
  ])

  console.log('✅ Created shows:', shows.length)

  // Create sample performances
  const performances = await Promise.all([
    prisma.performance.upsert({
      where: {
        showId_songId_setNumber_positionInSet: {
          showId: shows[0].id,
          songId: songs[0].id,
          setNumber: 1,
          positionInSet: 1
        }
      },
      update: {},
      create: {
        showId: shows[0].id,
        songId: songs[0].id,
        setNumber: 1,
        positionInSet: 1,
        isOpener: true,
        isCloser: false,
        isEncore: false
      }
    }),
    prisma.performance.upsert({
      where: {
        showId_songId_setNumber_positionInSet: {
          showId: shows[0].id,
          songId: songs[1].id,
          setNumber: 1,
          positionInSet: 2
        }
      },
      update: {},
      create: {
        showId: shows[0].id,
        songId: songs[1].id,
        setNumber: 1,
        positionInSet: 2,
        isOpener: false,
        isCloser: false,
        isEncore: false
      }
    }),
    prisma.performance.upsert({
      where: {
        showId_songId_setNumber_positionInSet: {
          showId: shows[1].id,
          songId: songs[0].id,
          setNumber: 1,
          positionInSet: 1
        }
      },
      update: {},
      create: {
        showId: shows[1].id,
        songId: songs[0].id,
        setNumber: 1,
        positionInSet: 1,
        isOpener: true,
        isCloser: false,
        isEncore: false
      }
    })
  ])

  console.log('✅ Created performances:', performances.length)

  // Create sample recordings
  const recordings = await Promise.all([
    prisma.recording.upsert({
      where: { archiveIdentifier: 'gd1969-02-27' },
      update: {},
      create: {
        showId: shows[0].id,
        archiveIdentifier: 'gd1969-02-27',
        sourceType: 'SBD',
        format: 'FLAC',
        trackMap: {
          'Scarlet Begonias': 'gd1969-02-27_sbd_01',
          'Fire on the Mountain': 'gd1969-02-27_sbd_02'
        },
        durationMap: {
          'Scarlet Begonias': 420000, // 7 minutes
          'Fire on the Mountain': 480000 // 8 minutes
        }
      }
    }),
    prisma.recording.upsert({
      where: { archiveIdentifier: 'gd1977-05-08' },
      update: {},
      create: {
        showId: shows[1].id,
        archiveIdentifier: 'gd1977-05-08',
        sourceType: 'SBD',
        format: 'FLAC',
        trackMap: {
          'Scarlet Begonias': 'gd1977-05-08_sbd_01',
          'Fire on the Mountain': 'gd1977-05-08_sbd_02'
        },
        durationMap: {
          'Scarlet Begonias': 450000, // 7.5 minutes
          'Fire on the Mountain': 510000 // 8.5 minutes
        }
      }
    })
  ])

  console.log('✅ Created recordings:', recordings.length)

  // Create sample analyses
  const analyses = await Promise.all([
    prisma.analysis.upsert({
      where: {
        performanceId_recordingId: {
          performanceId: performances[0].id,
          recordingId: recordings[0].id
        }
      },
      update: {},
      create: {
        performanceId: performances[0].id,
        recordingId: recordings[0].id,
        durationMs: 420000,
        bpm: 120.5,
        bpmConfidence: 0.85
      }
    }),
    prisma.analysis.upsert({
      where: {
        performanceId_recordingId: {
          performanceId: performances[1].id,
          recordingId: recordings[0].id
        }
      },
      update: {},
      create: {
        performanceId: performances[1].id,
        recordingId: recordings[0].id,
        durationMs: 480000,
        bpm: 118.2,
        bpmConfidence: 0.92
      }
    })
  ])

  console.log('✅ Created analyses:', analyses.length)

  // Create song rollups
  const rollups = await Promise.all([
    prisma.songRollup.upsert({
      where: { songId: songs[0].id },
      update: {},
      create: {
        songId: songs[0].id,
        debutShowId: shows[0].id,
        lastShowId: shows[1].id,
        longestPerformanceId: performances[2].id,
        shortestPerformanceId: performances[0].id,
        highestBpmPerformanceId: performances[0].id,
        lowestBpmPerformanceId: performances[1].id,
        openerCount: 2,
        closerCount: 0,
        encoreCount: 0,
        avgDurationByYear: {
          '1969': 420000,
          '1977': 450000
        }
      }
    })
  ])

  console.log('✅ Created song rollups:', rollups.length)

  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Database seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
