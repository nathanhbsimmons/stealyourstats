'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Search from '@/components/Search';
import SongDetail from '@/components/SongDetail';
import ShowDetail from '@/components/ShowDetail';
import { Song, Show } from '@/types';

type AppView = 'search' | 'song' | 'show';

export default function Home() {
  const [currentView, setCurrentView] = useState<AppView>('search');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
    setCurrentView('song');
  };

  const handleShowSelect = (show: Show) => {
    setSelectedShow(show);
    setCurrentView('show');
  };

  const handleBackToSearch = () => {
    setCurrentView('search');
    setSelectedSong(null);
    setSelectedShow(null);
  };

  const handleBackToSong = () => {
    setCurrentView('song');
    setSelectedShow(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'search':
        return <Search onSongSelect={handleSongSelect} />;
      case 'song':
        return selectedSong ? (
          <SongDetail
            song={selectedSong}
            onBack={handleBackToSearch}
            onShowSelect={handleShowSelect}
          />
        ) : null;
      case 'show':
        return selectedShow ? (
          <ShowDetail
            show={selectedShow}
            onBack={handleBackToSong}
          />
        ) : null;
      default:
        return <Search onSongSelect={handleSongSelect} />;
    }
  };

  const getWindowTitle = () => {
    switch (currentView) {
      case 'search':
        return 'STEAL YOUR STATS';
      case 'song':
        return selectedSong ? selectedSong.title.toUpperCase() : 'SONG DETAILS';
      case 'show':
        return 'SHOW DETAILS';
      default:
        return 'STEAL YOUR STATS';
    }
  };

  return (
    <Layout title={getWindowTitle()} onClose={handleBackToSearch}>
      {renderContent()}
    </Layout>
  );
}
