'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { bpmEstimator, BpmEstimationResult } from '@/lib/bpm-estimator';

interface AudioPlayerProps {
  trackName: string;
  duration?: number;
  performanceId?: string;
  recordingId?: string;
  existingBpm?: number;
  existingBpmConfidence?: number;
  showDate?: string;
  showId?: string;
  archiveIdentifier?: string; // Add this for Archive.org identifier
}

interface AudioTrack {
  name: string;
  url: string;
  size: number;
  format: string;
  duration?: number;
  trackNumber?: number;
  title?: string;
}

export default function AudioPlayer({ 
  trackName, 
  duration, 
  performanceId, 
  recordingId,
  existingBpm,
  existingBpmConfidence,
  showDate,
  showId,
  archiveIdentifier
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isEstimatingBpm, setIsEstimatingBpm] = useState(false);
  const [bpmResult, setBpmResult] = useState<BpmEstimationResult | null>(
    existingBpm ? {
      bpm: existingBpm,
      confidence: existingBpmConfidence || 0,
      duration: 0
    } : null
  );
  const [bpmError, setBpmError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<any>(null);
  const [availableTracks, setAvailableTracks] = useState<AudioTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<AudioTrack | null>(null);
  const [showTrackSelector, setShowTrackSelector] = useState(false);
  const [showAllTracks, setShowAllTracks] = useState(false);
  const [allShowTracks, setAllShowTracks] = useState<AudioTrack[]>([]);
  const [preferredFormat, setPreferredFormat] = useState<'MP3' | 'FLAC'>('MP3');
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasAttemptedLoadRef = useRef(false);

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

  // Memoize the loadAudioFromArchive function to prevent unnecessary re-renders
  const loadAudioFromArchive = useCallback(async () => {
    // Use archiveIdentifier if available, otherwise try to construct from showDate
    let identifier = archiveIdentifier;
    
    if (!identifier && showDate) {
      // Handle DD-MM-YYYY format from test index
      const dateParts = showDate.split('-');
      if (dateParts.length === 3) {
        if (dateParts[0].length === 2) {
          // DD-MM-YYYY format, convert to YYYY-MM-DD
          const [day, month, year] = dateParts;
          identifier = `gd${year}-${month}-${day}`;
        } else {
          // YYYY-MM-DD format
          identifier = `gd${showDate.replace(/-/g, '')}`;
        }
      }
    }

    if (!identifier) {
      setAudioError('No archive identifier available');
      return;
    }

    if (hasAttemptedLoadRef.current) {
      return; // Prevent duplicate calls
    }

    hasAttemptedLoadRef.current = true;
    setIsLoadingAudio(true);
    setAudioError(null);

    try {
      const response = await fetch(`/api/audio/search?showId=${encodeURIComponent(identifier)}&song=${encodeURIComponent(trackName)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.found && data.songTracks && data.songTracks.length > 0) {
        setAvailableTracks(data.songTracks);
        setShowDetails(data.show);
        setShowTrackSelector(true);
        
        // Also store all show tracks for browsing
        if (data.show && data.show.audioFiles) {
          setAllShowTracks(data.show.audioFiles);
        }
        
        // Auto-select the first track (usually the best quality)
        if (data.songTracks.length === 1) {
          setSelectedTrack(data.songTracks[0]);
          setAudioUrl(data.songTracks[0].url);
        } else {
          // For multiple tracks, let user choose
          setSelectedTrack(data.songTracks[0]);
          setAudioUrl(data.songTracks[0].url);
        }
      } else {
        setAudioError('No audio tracks found for this song');
      }
    } catch (error: any) {
      console.error('Failed to load audio:', error);
      setAudioError(error.message || 'Failed to load audio');
    } finally {
      setIsLoadingAudio(false);
    }
  }, [archiveIdentifier, showDate, trackName]);

  // Load audio when component mounts or dependencies change
  useEffect(() => {
    if (archiveIdentifier || showDate) {
      loadAudioFromArchive();
    }
  }, [archiveIdentifier, showDate, loadAudioFromArchive]);


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

  const handleTrackSelect = useCallback((track: AudioTrack) => {
    setSelectedTrack(track);
    setAudioUrl(track.url);
    setShowTrackSelector(false);
  }, []);

  const handleTrackDoubleClick = useCallback((track: AudioTrack) => {
    setSelectedTrack(track);
    setAudioUrl(track.url);
    setShowTrackSelector(false);
    
    // Auto-play the track after a short delay to ensure audio is loaded
    setTimeout(() => {
      const audio = audioRef.current;
      if (audio) {
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.error('Failed to auto-play track:', error);
        });
      }
    }, 100);
  }, []);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter tracks by format and deduplicate by song name
  const getFilteredTracks = (tracks: AudioTrack[], format: 'MP3' | 'FLAC') => {
    const filtered = tracks.filter(track => 
      track.format.toUpperCase().includes(format)
    );
    
    // Deduplicate by song name, preferring the selected format
    const uniqueTracks = new Map<string, AudioTrack>();
    
    filtered.forEach(track => {
      const songName = track.title || track.name;
      if (!uniqueTracks.has(songName) || track.format.toUpperCase().includes(format)) {
        uniqueTracks.set(songName, track);
      }
    });
    
    return Array.from(uniqueTracks.values());
  };

  const toggleFormat = () => {
    setPreferredFormat(prev => prev === 'MP3' ? 'FLAC' : 'MP3');
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
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

  const estimateBpm = async () => {
    if (!audioRef.current || !performanceId || !recordingId) {
      setBpmError('Missing performance or recording ID for BPM estimation');
      return;
    }

    setIsEstimatingBpm(true);
    setBpmError(null);

    try {
      const result = await bpmEstimator.estimateBpm(audioRef.current, 60);
      setBpmResult(result);

      // Store BPM result in database
      const response = await fetch('/api/analysis/bpm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          performanceId,
          recordingId,
          bpm: result.bpm,
          bpmConfidence: result.confidence,
          durationMs: duration
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to store BPM analysis');
      }

    } catch (error) {
      console.error('BPM estimation failed:', error);
      setBpmError(error instanceof Error ? error.message : 'BPM estimation failed');
    } finally {
      setIsEstimatingBpm(false);
    }
  };

  return (
    <div className="audio-player">
      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setCurrentTime(0);
            }
          }}
          onError={() => {
            setAudioError('Failed to load audio file');
          }}
        />
      )}

      {/* Track Info Display */}
      {selectedTrack ? (
        <div className="mb-4 p-3 border-2 border-black bg-gray-50 text-center">
          <div className="text-lg font-bold mb-2">
            🎵 {selectedTrack.title || selectedTrack.name}
          </div>
          <div className="text-sm text-gray-600">
            {selectedTrack.format.toUpperCase()} • {formatDuration(selectedTrack.duration)} • {formatFileSize(selectedTrack.size)}
            {selectedTrack.trackNumber && ` • Track ${selectedTrack.trackNumber}`}
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3 border-2 border-black bg-yellow-50 text-center">
          <div className="text-sm font-bold">
            🎵 NO TRACK SELECTED
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Select a track from the list below to start playing
          </div>
        </div>
      )}

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
          <span>{formatDuration(currentTime)}</span>
          <span>{selectedTrack?.duration ? formatDuration(selectedTrack.duration) : '--:--'}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${selectedTrack?.duration ? (currentTime / selectedTrack.duration) * 100 : 0}%` }}
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

      {/* BPM Estimation Section */}
      <div className="mt-4 pt-4 border-t-2 border-black">
        {bpmResult ? (
          <div className="mb-4">
            <div className="status-label mb-2">BPM ANALYSIS COMPLETE</div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{bpmResult.bpm.toFixed(1)}</div>
                <div className="text-sm uppercase">BPM</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{(bpmResult.confidence * 100).toFixed(1)}%</div>
                <div className="text-sm uppercase">CONFIDENCE</div>
              </div>
            </div>
            <div className="text-sm text-center mt-2">
              Analyzed {bpmResult.duration.toFixed(1)}s of audio
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <button 
              onClick={estimateBpm}
              disabled={isEstimatingBpm || !performanceId || !recordingId}
              className="btn-brutalist disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEstimatingBpm ? 'ANALYZING...' : 'ESTIMATE BPM'}
            </button>
            <span className="ml-2 text-sm">
              Click to analyze this track's tempo
            </span>
          </div>
        )}

        {bpmError && (
          <div className="mt-2 p-2 border-2 border-black bg-red-50 text-center">
            <div className="text-sm font-bold">ERROR: {bpmError}</div>
          </div>
        )}

        {!performanceId || !recordingId ? (
          <div className="mt-2 p-2 border-2 border-black bg-yellow-50 text-center">
            <div className="text-sm">BPM estimation requires performance and recording IDs</div>
          </div>
        ) : null}
      </div>

      {/* Audio Loading Status */}
      {isLoadingAudio && (
        <div className="mt-4 p-2 border-2 border-black bg-blue-50 text-center">
          <div className="text-sm">🔍 SEARCHING ARCHIVE.ORG...</div>
          <div className="text-xs mt-1">
            Identifier: {archiveIdentifier || (showDate ? `gd${showDate.split('-').reverse().join('')}` : 'Unknown')}
          </div>
        </div>
      )}

      {/* Audio Success Display */}
      {audioUrl && !isLoadingAudio && !audioError && (
        <div className="mt-4 p-2 border-2 border-black bg-green-50 text-center">
          <div className="text-sm font-bold">🎵 AUDIO LOADED SUCCESSFULLY</div>
          <div className="text-xs mt-1">
            Source: Archive.org | Format: {showDetails?.format || 'Unknown'}
          </div>
          {availableTracks.length > 1 && (
            <button
              onClick={() => setShowTrackSelector(!showTrackSelector)}
              className="mt-2 px-3 py-1 text-xs border-2 border-black bg-white hover:bg-black hover:text-white transition-colors"
            >
              {showTrackSelector ? 'HIDE' : 'SHOW'} TRACK SELECTOR ({getFilteredTracks(availableTracks, preferredFormat).length} TRACKS)
            </button>
          )}
          {allShowTracks.length > 0 && (
            <button
              onClick={() => setShowAllTracks(!showAllTracks)}
              className="mt-2 ml-2 px-3 py-1 text-xs border-2 border-black bg-white hover:bg-black hover:text-white transition-colors"
            >
              {showAllTracks ? 'HIDE' : 'SHOW'} ALL SHOW TRACKS ({getFilteredTracks(allShowTracks, preferredFormat).filter(track => track.trackNumber).length} AVAILABLE)
            </button>
          )}
        </div>
      )}

      {/* Track Selector */}
      {showTrackSelector && availableTracks.length > 1 && (
        <div className="mt-4 p-4 border-2 border-black bg-yellow-50">
          <div className="text-sm font-bold mb-3 text-center">
            🎵 SELECT AUDIO TRACK ({getFilteredTracks(availableTracks, preferredFormat).length} AVAILABLE)
          </div>
          
          {/* Format Toggle */}
          <div className="flex justify-center mb-3">
            <button
              onClick={toggleFormat}
              className="px-4 py-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors text-sm font-bold"
            >
              🔄 SWITCH TO {preferredFormat === 'MP3' ? 'FLAC' : 'MP3'}
            </button>
          </div>
          
          <div className="text-xs text-center mb-3 text-gray-600">
            Currently showing: {preferredFormat} format
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {getFilteredTracks(availableTracks, preferredFormat).map((track, index) => (
              <button
                key={index}
                onClick={() => handleTrackSelect(track)}
                onDoubleClick={() => handleTrackDoubleClick(track)}
                className={`w-full p-2 text-left border-2 transition-colors ${
                  selectedTrack === track 
                    ? 'border-black bg-black text-white' 
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-semibold text-sm">
                      {track.title || track.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {track.format.toUpperCase()} • {formatDuration(track.duration)} • {formatFileSize(track.size)}
                      {track.trackNumber && ` • Track ${track.trackNumber}`}
                    </div>
                  </div>
                  {selectedTrack === track && (
                    <div className="text-lg">✓</div>
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="text-xs text-center mt-2 text-gray-600">
            Currently playing: {selectedTrack?.title || selectedTrack?.name}
          </div>
          <div className="text-xs text-center mt-1 text-blue-600">
            💡 Double-click any track to play it directly
          </div>
        </div>
      )}

      {/* All Show Tracks Browser */}
      {showAllTracks && allShowTracks.length > 0 && (
        <div className="mt-4 p-4 border-2 border-black bg-blue-50">
          <div className="text-sm font-bold mb-3 text-center">
            🎵 ALL SHOW TRACKS ({getFilteredTracks(allShowTracks, preferredFormat).filter(track => track.trackNumber).length} AVAILABLE)
          </div>
          <div className="text-xs text-center mb-3 text-gray-600">
            Browse all available tracks from this show
          </div>
          
          {/* Format Toggle for All Show Tracks */}
          <div className="flex justify-center mb-3">
            <button
              onClick={toggleFormat}
              className="px-4 py-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors text-sm font-bold"
            >
              🔄 SWITCH TO {preferredFormat === 'MP3' ? 'FLAC' : 'MP3'}
            </button>
          </div>
          
          <div className="text-xs text-center mb-3 text-gray-600">
            Currently showing: {preferredFormat} format
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {getFilteredTracks(allShowTracks, preferredFormat)
              .filter(track => track.trackNumber) // Only show numbered tracks
              .sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0)) // Sort by track number
              .map((track, index) => (
                <button
                  key={index}
                  onClick={() => handleTrackSelect(track)}
                  onDoubleClick={() => handleTrackDoubleClick(track)}
                  className={`w-full p-2 text-left border-2 transition-colors ${
                    selectedTrack === track 
                      ? 'border-black bg-black text-white' 
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-semibold text-sm">
                        {track.trackNumber && `Track ${track.trackNumber}: `}{track.title || track.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {track.format.toUpperCase()} • {formatDuration(track.duration)} • {formatFileSize(track.size)}
                      </div>
                    </div>
                    {selectedTrack === track && (
                      <div className="text-lg">✓</div>
                    )}
                  </div>
                </button>
              ))}
          </div>
          <div className="text-xs text-center mt-2 text-gray-600">
            Click any track to play it
          </div>
          <div className="text-xs text-center mt-1 text-blue-600">
            💡 Double-click any track to play it directly
          </div>
        </div>
      )}

      {/* Audio Error Display */}
      {audioError && (
        <div className="mt-4 p-2 border-2 border-black bg-red-50 text-center">
          <div className="text-sm font-bold">AUDIO ERROR: {audioError}</div>
          <div className="text-xs mt-1">
            {archiveIdentifier ? `Archive ID: ${archiveIdentifier}` : 
             showDate ? `Constructed ID: gd${showDate.split('-').reverse().join('')}` : 'No identifier available'}
          </div>
        </div>
      )}

      {/* Show Details */}
      {showDetails && (
        <div className="mt-4 p-2 border-2 border-black bg-green-50">
          <div className="text-sm font-bold mb-2">SHOW RECORDING FOUND</div>
          <div className="text-xs space-y-1">
            <div><strong>Title:</strong> {showDetails.title}</div>
            <div><strong>Date:</strong> {showDetails.date}</div>
            <div><strong>Format:</strong> {showDetails.format}</div>
            <div><strong>Audio Files:</strong> {showDetails.audioFiles.length}</div>
            {showDetails.venue && <div><strong>Venue:</strong> {showDetails.venue}</div>}
          </div>
        </div>
      )}

      {/* Status Display */}
      <div className="mt-4 p-2 border-2 border-black text-center">
        <div className="text-sm">
          Status: {isPlaying ? 'Playing' : 'Paused'} | 
          Source: {audioUrl ? 'Archive.org' : 'No Audio'} | 
          Format: {showDetails?.format || 'Unknown'}
        </div>
      </div>
    </div>
  );
}