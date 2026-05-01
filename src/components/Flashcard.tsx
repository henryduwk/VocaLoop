import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Word } from '../types';
import { Volume2 } from 'lucide-react';

interface FlashcardProps {
  word: Word;
  onKnow: () => void;
  onAlmost: () => void;
  onDontKnow: () => void;
}

type SwipeDirection = 'right' | 'left' | 'down' | null;

export const Flashcard: React.FC<FlashcardProps> = ({
  word, onKnow, onAlmost, onDontKnow
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Drag state (unified for touch + mouse)
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null);

  // Refs for drag tracking (avoids stale closure issues)
  const startPos = useRef({ x: 0, y: 0 });
  const directionLocked = useRef<SwipeDirection>(null);
  const draggingRef = useRef(false);

  const minSwipeDistance = 80;

  const playAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter(v => v.lang.startsWith('en'));
      if (englishVoices.length > 0) {
        const preferredVoice = englishVoices.find(v => 
          v.name.includes('Google US English') || 
          v.name === 'Samantha' || 
          v.name === 'Alex'
        );
        utterance.voice = preferredVoice || englishVoices[0];
      }
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Audio is not supported in this browser.");
    }
  };

  // ─── Unified drag handlers ───────────────────────────────

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    startPos.current = { x: clientX, y: clientY };
    directionLocked.current = null;
    draggingRef.current = true;
    setIsDragging(true);
    setSwipeDirection(null);
  }, []);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!draggingRef.current) return;

    const diffX = clientX - startPos.current.x;
    const diffY = clientY - startPos.current.y;

    // Lock direction once user moves enough
    if (directionLocked.current === null) {
      const absX = Math.abs(diffX);
      const absY = Math.abs(diffY);
      if (absX > 8 || absY > 8) {
        if (absX > absY) {
          directionLocked.current = diffX > 0 ? 'right' : 'left';
        } else {
          // Only lock to "down" if dragging downward; ignore upward swipes
          if (diffY > 0) {
            directionLocked.current = 'down';
          } else {
            // Upward swipe → no action, release drag
            draggingRef.current = false;
            setIsDragging(false);
            return;
          }
        }
      }
    }

    const dir = directionLocked.current;
    if (dir === 'right' || dir === 'left') {
      setDragX(diffX);
      setDragY(0);
      setSwipeDirection(diffX > 0 ? 'right' : 'left');
    } else if (dir === 'down') {
      setDragX(0);
      setDragY(Math.max(0, diffY)); // only positive (downward)
      setSwipeDirection('down');
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);

    const dir = directionLocked.current;

    if (dir === 'right' || dir === 'left') {
      const finalX = dir === 'right' ? Math.max(0, dragX) : Math.min(0, dragX);
      if (Math.abs(finalX) > minSwipeDistance) {
        setIsFlipped(false);
        if (finalX > 0) onKnow();
        else onDontKnow();
      }
    } else if (dir === 'down') {
      if (dragY > minSwipeDistance) {
        setIsFlipped(false);
        onAlmost();
      }
    }

    setDragX(0);
    setDragY(0);
    setSwipeDirection(null);
    directionLocked.current = null;
  }, [dragX, dragY, onKnow, onDontKnow, onAlmost]);

  // ─── Touch events ───────────────────────────────────────

  // Prevent default scroll when swiping the card
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const preventScroll = (e: TouchEvent) => {
      if (draggingRef.current && directionLocked.current !== null) {
        e.preventDefault();
      }
    };

    card.addEventListener('touchmove', preventScroll, { passive: false });
    return () => card.removeEventListener('touchmove', preventScroll);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    handleDragEnd();
  };

  // ─── Mouse events (PC) ─────────────────────────────────

  const onMouseDown = (e: React.MouseEvent) => {
    // Ignore clicks on buttons
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      handleDragMove(e.clientX, e.clientY);
    };

    const onMouseUp = () => {
      if (!draggingRef.current) return;
      handleDragEnd();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [handleDragMove, handleDragEnd]);

  // ─── Card click (flip) ─────────────────────────────────

  const handleFlip = () => {
    if (Math.abs(dragX) < 10 && Math.abs(dragY) < 10 && !directionLocked.current) {
      setIsFlipped(!isFlipped);
    }
  };

  // ─── Visual styles ─────────────────────────────────────

  const getCardTransform = () => {
    if (swipeDirection === 'right' || swipeDirection === 'left') {
      return `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`;
    }
    if (swipeDirection === 'down') {
      return `translateY(${dragY}px)`;
    }
    return '';
  };

  const swipeStyle = {
    transform: getCardTransform(),
    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    opacity: swipeDirection === 'down' ? Math.max(0.4, 1 - dragY / 300) : 1,
  };

  const horizontalStampOpacity = Math.min(Math.abs(dragX) / 100, 1);
  const downStampOpacity = Math.min(dragY / 100, 1);

  // 복습 단계 표시 텍스트
  const getPhaseLabel = () => {
    const phase = word.reviewPhase || 0;
    if (word.status === 'New') return null;
    if (phase === 1) return '1일 후 복습';
    if (phase === 2) return '7일 후 복습';
    if (phase === 3) return '30일 후 복습';
    return null;
  };

  const phaseLabel = getPhaseLabel();

  // ─── Stamp components (reusable for front & back) ──────

  const renderStamps = (withBg: boolean) => (
    <>
      {/* KNOW stamp (right swipe) */}
      {dragX > 20 && swipeDirection === 'right' && (
        <div 
          className={`absolute top-8 left-8 border-4 border-green-500 text-green-500 text-3xl font-black rounded-xl px-4 py-2 rotate-[-15deg] z-10 ${withBg ? 'bg-white/80 backdrop-blur-sm' : ''}`}
          style={{ opacity: horizontalStampOpacity }}
        >
          KNOW ✓
        </div>
      )}
      {/* DON'T KNOW stamp (left swipe) */}
      {dragX < -20 && swipeDirection === 'left' && (
        <div 
          className={`absolute top-8 right-8 border-4 border-red-500 text-red-500 text-3xl font-black rounded-xl px-4 py-2 rotate-[15deg] z-10 ${withBg ? 'bg-white/80 backdrop-blur-sm' : ''}`}
          style={{ opacity: horizontalStampOpacity }}
        >
          DON'T KNOW
        </div>
      )}
      {/* ALMOST stamp (down swipe) */}
      {dragY > 20 && swipeDirection === 'down' && (
        <div 
          className={`absolute top-8 left-1/2 -translate-x-1/2 border-4 border-amber-500 text-amber-500 text-3xl font-black rounded-xl px-4 py-2 z-10 ${withBg ? 'bg-white/80 backdrop-blur-sm' : ''}`}
          style={{ opacity: downStampOpacity }}
        >
          헷갈린다 🤔
        </div>
      )}
    </>
  );

  return (
    <div className="w-full h-full flex flex-col max-w-md mx-auto overflow-hidden">
      <div 
        ref={cardRef}
        className="relative flex-1 min-h-[55vh] w-full perspective-1000 cursor-grab active:cursor-grabbing select-none"
        onClick={handleFlip}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        style={swipeStyle}
      >
        <div 
          className={`w-full h-full absolute top-0 left-0 transition-transform duration-500 transform-style-3d ${isFlipped && !isDragging ? 'rotate-y-180' : isFlipped ? 'rotate-y-180' : ''}`}
        >
          {/* Front side */}
          <div className="w-full h-full absolute backface-hidden bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center justify-center p-8 text-center select-none">
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-4xl font-bold text-slate-800">{word.word}</h2>
              <button 
                onClick={(e) => playAudio(e, word.word)} 
                className="mt-6 p-4 text-slate-400 hover:text-primary-600 bg-slate-50 hover:bg-primary-50 rounded-full transition-colors active:scale-95 shadow-sm"
              >
                <Volume2 size={28} />
              </button>
            </div>
            {phaseLabel && (
              <span className="mt-4 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">
                {phaseLabel}
              </span>
            )}
            <p className="text-slate-400 mt-8 text-sm animate-pulse">Tap anywhere to flip</p>
            
            {/* Gesture hint */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6 text-[10px] text-slate-300 font-medium">
              <span>← 모른다</span>
              <span>↓ 헷갈린다</span>
              <span>안다 →</span>
            </div>

            {renderStamps(false)}
          </div>

          {/* Back side */}
          <div className="w-full h-full absolute backface-hidden rotate-y-180 bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col p-8 overflow-y-auto select-none">
            <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-2">
              <h2 className="text-3xl font-bold text-slate-800">{word.word}</h2>
              <button 
                onClick={(e) => playAudio(e, word.word)} 
                className="p-2 text-slate-400 hover:text-primary-600 bg-slate-50 hover:bg-primary-50 rounded-full transition-colors active:scale-95"
              >
                <Volume2 size={20} />
              </button>
            </div>
            
            <div className="flex-1 space-y-4 py-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-primary-600 mb-1">Meaning</h4>
                <p className="text-lg text-slate-700">{word.meaning}</p>
              </div>
              
              {word.example && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Example</h4>
                  <p className="text-slate-700 italic">"{word.example}"</p>
                  {word.exampleTranslation && (
                    <p className="text-slate-500 text-sm mt-1">{word.exampleTranslation}</p>
                  )}
                </div>
              )}

              {word.memo && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Memo</h4>
                  <p className="text-slate-600 text-sm bg-slate-50 p-2 rounded-lg">{word.memo}</p>
                </div>
              )}
              
              {word.tags && word.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {word.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {renderStamps(true)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-6 pb-2 px-1">
        <button 
          onClick={(e) => { e.stopPropagation(); setIsFlipped(false); onDontKnow(); }}
          className="py-4 px-2 rounded-2xl font-bold text-lg bg-red-50 text-red-600 hover:bg-red-100 transition-transform active:scale-95 shadow-sm"
        >
          모른다
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsFlipped(false); onAlmost(); }}
          className="py-4 px-2 rounded-2xl font-bold text-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-transform active:scale-95 shadow-sm"
        >
          헷갈린다
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsFlipped(false); onKnow(); }}
          className="py-4 px-2 rounded-2xl font-bold text-lg bg-green-50 text-green-600 hover:bg-green-100 transition-transform active:scale-95 shadow-sm"
        >
          안다
        </button>
      </div>
    </div>
  );
};
