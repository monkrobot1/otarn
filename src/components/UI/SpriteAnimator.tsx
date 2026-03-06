import { useState, useEffect, useRef } from 'react';

interface SpriteAnimatorProps {
  imageUrl: string;
  cols: number;
  rows: number;
  totalFrames?: number;
  fps?: number;
  playing: boolean;
  loop?: boolean;
  scale?: number;
  onComplete?: () => void;
  className?: string;
  mirrored?: boolean;
}

export const SpriteAnimator = ({
  imageUrl,
  cols,
  rows,
  totalFrames,
  fps = 12,
  playing,
  loop = false,
  scale = 1,
  onComplete,
  className = '',
  mirrored = false,
}: SpriteAnimatorProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const maxFrames = totalFrames || (cols * rows);
  
  const frameRef = useRef(currentFrame);
  const playingRef = useRef(playing);
  const intervalRef = useRef<number | null>(null);

  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);

  useEffect(() => {
    playingRef.current = playing;
    if (playing && currentFrame >= maxFrames - 1 && !loop) {
        // Reset if we are asked to play but are already at the end
        setCurrentFrame(0);
        frameRef.current = 0;
    }
  }, [playing, maxFrames, loop]);

  useEffect(() => {
    if (!playing) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const intervalTime = 1000 / fps;

    intervalRef.current = window.setInterval(() => {
      // Look closely at the sprite sheet provided, the last few frames might be blank
      // For now we'll play the whole grid 
      if (frameRef.current >= maxFrames - 1) {
        if (loop) {
          frameRef.current = 0;
          setCurrentFrame(0);
        } else {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (onComplete) onComplete();
        }
      } else {
        frameRef.current += 1;
        setCurrentFrame(frameRef.current);
      }
    }, intervalTime);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, fps, maxFrames, loop, onComplete]);




  // Calculate coordinates based on current frame
  const col = currentFrame % cols;
  const row = Math.floor(currentFrame / cols);


  return (
    <div 
        className={`overflow-hidden pointer-events-none relative flex-shrink-0 ${className}`}
        style={{
            transform: `scale(${scale}) ${mirrored ? 'scaleX(-1)' : ''}`,
            transformOrigin: 'bottom center',
            aspectRatio: aspectRatio
        }}
    >
        <img 
            src={imageUrl}
            onLoad={(e) => {
                const img = e.currentTarget;
                if (cols && rows && img.naturalWidth && img.naturalHeight) {
                    setAspectRatio((img.naturalWidth / cols) / (img.naturalHeight / rows));
                }
            }}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${cols * 100}%`,
                height: `${rows * 100}%`,
                maxWidth: 'none',
                transform: `translate(-${(col / cols) * 100}%, -${(row / rows) * 100}%)`,
                transition: 'none'
            }}
        />
    </div>
  );
};
