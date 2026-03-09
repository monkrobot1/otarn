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
  randomStartOffset?: boolean;
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
  randomStartOffset = false,
}: SpriteAnimatorProps) => {
  const maxFrames = totalFrames || (cols * rows);

  // We only determine start frame once on mount
  const initialFrame = useRef((loop && randomStartOffset && maxFrames > 0) ? Math.floor(Math.random() * maxFrames) : 0);
  
  const frameRef = useRef(initialFrame.current);
  const playingRef = useRef(playing);
  const onCompleteRef = useRef(onComplete);
  const imgRef = useRef<HTMLImageElement>(null);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());

  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);

  useEffect(() => {
     onCompleteRef.current = onComplete;
  }, [onComplete]);

  const updateTransform = (frame: number) => {
      if (!imgRef.current || !cols || !rows) return;
      const col = frame % cols;
      const row = Math.floor(frame / cols);
      imgRef.current.style.transform = `translate(-${(col / cols) * 100}%, -${(row / rows) * 100}%)`;
  };

  useEffect(() => {
      // Upon receiving a completely new animation sprite, reset frame unless it's just the initial mount
      if (frameRef.current > 0 && !loop) {
          frameRef.current = 0;
          updateTransform(0);
      }
  }, [imageUrl]); 

  useEffect(() => {
    playingRef.current = playing;
    if (playing && frameRef.current >= maxFrames - 1 && !loop) {
        // Reset if we are asked to play but are already at the end
        frameRef.current = 0;
        updateTransform(0);
    }
  }, [playing, maxFrames, loop]);

  useEffect(() => {
    if (!playing) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const intervalTime = 1000 / fps;

    const animate = (time: number) => {
        if (time - lastTimeRef.current >= intervalTime) {
            lastTimeRef.current = time;
            
            if (frameRef.current >= maxFrames - 1) {
                if (loop) {
                    frameRef.current = 0;
                    updateTransform(0);
                } else {
                    if (onCompleteRef.current) onCompleteRef.current();
                    return; // Stop animating naturally
                }
            } else {
                frameRef.current += 1;
                updateTransform(frameRef.current);
            }
        }
        requestRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [playing, fps, maxFrames, loop, cols, rows]);

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
            ref={imgRef}
            src={imageUrl}
            onLoad={(e) => {
                const img = e.currentTarget;
                if (cols && rows && img.naturalWidth && img.naturalHeight) {
                    setAspectRatio((img.naturalWidth / cols) / (img.naturalHeight / rows));
                }
                updateTransform(frameRef.current);
            }}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${cols * 100}%`,
                height: `${rows * 100}%`,
                maxWidth: 'none',
                transform: `translate(-${((initialFrame.current % cols) / cols) * 100}%, -${(Math.floor(initialFrame.current / cols) / rows) * 100}%)`,
                transition: 'none'
            }}
        />
    </div>
  );
};
