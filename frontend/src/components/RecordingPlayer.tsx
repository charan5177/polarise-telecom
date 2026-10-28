import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, Download, Sparkles } from 'lucide-react';

interface RecordingPlayerProps {
  callId: number;
  callSid: string;
  durationSeconds: number;
  isSimulated?: boolean;
}

export const RecordingPlayer: React.FC<RecordingPlayerProps> = ({
  callId,
  callSid,
  durationSeconds,
  isSimulated = true
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const streamUrl = `/api/telephony/recordings/${callId}/stream`;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-3 rounded-xl border border-slate-200 bg-slate-50/80 p-2 text-xs">
      <audio
        ref={audioRef}
        src={streamUrl}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
      />

      <button
        onClick={togglePlay}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
      </button>

      <div className="flex-1 min-w-[120px]">
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mb-1">
          <span>{formatTime(currentTime)}</span>
          <span className="flex items-center space-x-1">
            {isSimulated && <Sparkles className="h-2.5 w-2.5 text-blue-500" />}
            <span>{formatTime(durationSeconds || 15)}</span>
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-blue-600 transition-all duration-200"
            style={{ width: `${(currentTime / (durationSeconds || 15)) * 100}%` }}
          />
        </div>
      </div>

      <a
        href={streamUrl}
        download={`Polarise_Recording_${callSid}.wav`}
        className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
        title="Download Audio (.wav)"
      >
        <Download className="h-3.5 w-3.5" />
      </a>
    </div>
  );
};
