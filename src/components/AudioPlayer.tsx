'use client';

import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  trackName: string;
  duration?: number;
}

export default function AudioPlayer({ trackName, duration }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Mock audio URL - in real app this would be from Archive.org
  const mockAudioUrl = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(audio.currentTime + 30, audio.duration);
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(audio.currentTime - 30, 0);
  };

  return (
    <div className="audio-player">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={mockAudioUrl}
        preload="metadata"
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setCurrentTime(0);
          }
        }}
      />

      {/* Playback Controls */}
      <div className="audio-controls">
        <button
          onClick={skipBackward}
          className="audio-btn"
        >
          ⏪
        </button>
        
        <button
          onClick={togglePlayPause}
          className="audio-btn"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        
        <button
          onClick={skipForward}
          className="audio-btn"
        >
          ⏩
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>{formatTime(currentTime)}</span>
          <span>{duration ? formatTime(duration / 1000) : '--:--'}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${duration ? (currentTime / (duration / 1000)) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-bold uppercase">VOLUME:</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24"
        />
        <span className="text-sm w-8">{Math.round(volume * 100)}%</span>
      </div>

      {/* BPM Estimation Button */}
      <div className="mt-4 pt-4 border-t-2 border-black">
        <button className="btn-brutalist">
          ESTIMATE BPM
        </button>
        <span className="ml-2 text-sm">
          Click to analyze this track's tempo
        </span>
      </div>

      {/* Status Display */}
      <div className="mt-4 p-2 border-2 border-black text-center">
        <div className="text-sm">
          Status: {isPlaying ? 'Playing' : 'Paused'} | 
          Source: Archive.org | 
          Format: FLAC
        </div>
      </div>
    </div>
  );
}
