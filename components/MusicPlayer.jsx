import { Maximize2, Minimize2, Minus, Music, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import lofiTrack from "../🎧 LoFi Background Music to Relax_Study — No Copyright Chill Aesthetic Royalty Free Beats by Lukrembo [fvAXHczp2lU].mp3";

function MusicPlayer({
  isEnabled,
  onToggleEnabled,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isEnabled && isPlaying && !isMuted) {
      audioRef.current.play().catch(() => {
        // Autoplay prevented by browser
      });
    } else {
      audioRef.current.pause();
    }
  }, [isEnabled, isPlaying, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume / 100));
    }
  }, [volume, isMuted]);

  const handlePlay = () => {
    if (!isEnabled) {
      onToggleEnabled(true);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  if (isClosed) {
    return (
      <button
        type="button"
        className="music-player-reopen"
        onClick={() => setIsClosed(false)}
        title="Show music player"
      >
        <Music size={14} />
        <span>Music</span>
      </button>
    );
  }

  return (
    <div className={`music-player ${isMinimized ? "is-minimized" : ""}`}>
      <audio
        ref={audioRef}
        src={lofiTrack}
        onEnded={handleAudioEnded}
        loop
      />
      <div className="music-player-content">
        <div className="music-player-header">
          <Music size={16} className="music-player-icon" />
          <span className="music-player-label">LoFi Background</span>
          <div className="music-player-status">
            {isEnabled && isPlaying && <span className="pulse-dot" />}
          </div>
          <div className="music-player-window-actions">
            <button
              type="button"
              className="music-player-btn music-player-window-btn"
              onClick={() => setIsMinimized((value) => !value)}
              title={isMinimized ? "Maximize player" : "Minimize player"}
            >
              {isMinimized ? <Maximize2 size={12} /> : <Minus size={12} />}
            </button>
            <button
              type="button"
              className="music-player-btn music-player-window-btn"
              onClick={() => setIsMinimized(false)}
              title="Maximize player"
            >
              <Minimize2 size={12} />
            </button>
            <button
              type="button"
              className="music-player-btn music-player-window-btn music-player-window-btn--close"
              onClick={() => setIsClosed(true)}
              title="Close player"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        <div className={`music-player-controls ${isMinimized ? "is-hidden" : ""}`}>
          <button
            type="button"
            className="music-player-btn music-player-play"
            onClick={handlePlay}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <div className="music-player-volume-group">
            <button
              type="button"
              className="music-player-btn"
              onClick={() => onToggleMute(!isMuted)}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX size={14} />
              ) : (
                <Volume2 size={14} />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="music-player-slider"
              disabled={!isEnabled}
              title="Volume"
            />
            <span className="music-player-volume-label">{isMuted ? 0 : Math.round(volume)}%</span>
          </div>

          <button
            type="button"
            className={`music-player-btn music-player-toggle ${isEnabled ? "is-active" : ""}`}
            onClick={() => onToggleEnabled(!isEnabled)}
            title={isEnabled ? "Turn off" : "Turn on"}
          >
            <Music size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MusicPlayer;
