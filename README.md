# Steal Your Stats

A Grateful Dead song lookup tool with a retro Windows 95-style interface.

## Features

- **Song Search**: Fuzzy search through Grateful Dead songs with real-time results
- **Song Details**: Comprehensive information including debut show, last show, longest/shortest performances, and era context
- **Show Information**: Complete setlists, venue details, and available recordings
- **Audio Player**: Stream recordings directly from Archive.org with BPM estimation capability
- **Retro UI**: Authentic Windows 95-style interface with pixel-perfect styling

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, TailwindCSS
- **Audio**: HTML5 Audio API with custom controls
- **Search**: Fuse.js for fuzzy search functionality
- **Styling**: Custom CSS for authentic Windows 95 appearance

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd stealyourstats
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── Layout.tsx      # Main window layout
│   ├── Search.tsx      # Song search interface
│   ├── SongDetail.tsx  # Song information display
│   ├── ShowDetail.tsx  # Show details and setlist
│   └── AudioPlayer.tsx # Audio playback controls
├── types/               # TypeScript type definitions
│   └── index.ts        # Application data models
└── data/                # Mock data for development
    └── mockData.ts      # Sample songs, shows, and venues
```

## Data Sources

The application is designed to integrate with:
- **setlist.fm API**: For song appearances and setlist data
- **Archive.org API**: For audio recordings and streaming
- **MusicBrainz API**: For artist metadata

Currently uses mock data for development and demonstration purposes.

## Design Philosophy

The interface recreates the nostalgic feel of early 1990s desktop computing:
- Monochrome color scheme with gray window chrome
- Chunky borders and beveled buttons
- Pixel-perfect typography and spacing
- Authentic Windows 95-style controls and interactions

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. **New Components**: Create in `src/components/`
2. **Types**: Add to `src/types/index.ts`
3. **Mock Data**: Extend `src/data/mockData.ts`
4. **Styling**: Use TailwindCSS classes and custom CSS utilities

## Roadmap

- [ ] Real API integration (setlist.fm, Archive.org)
- [ ] BPM estimation with Web Audio API
- [ ] User accounts and favorites
- [ ] Mobile-responsive design
- [ ] Advanced filtering and sorting
- [ ] Performance analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Grateful Dead for the music
- Archive.org for preserving live recordings
- setlist.fm for comprehensive show data
- The Windows 95 design team for the iconic interface
