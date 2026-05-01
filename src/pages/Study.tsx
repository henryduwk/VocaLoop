import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { X, Shuffle } from 'lucide-react';
import { Word, StudySession, StudyResult } from '../types';
import { getDueWords, updateWord, getWords } from '../utils/storage';
import { calculateNextReview } from '../utils/spacedRepetition';
import { Flashcard } from '../components/Flashcard';
import { ProgressBar } from '../components/ProgressBar';
import { EmptyState } from '../components/EmptyState';

export const Study: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [session, setSession] = useState<StudySession | null>(null);
  const [wordsToStudy, setWordsToStudy] = useState<Word[]>([]);
  
  useEffect(() => {
    let due: Word[] = [];
    if (location.state?.customWordIds) {
      due = getWords().filter(w => location.state.customWordIds.includes(w.id));
    } else if (deckId === 'today') {
      due = getDueWords();
    } else if (deckId) {
      due = getDueWords(deckId);
    }
    
    // Sort words: Forgotten -> Uncertain -> New -> Mastered
    due.sort((a, b) => {
      const order = { 'Forgotten': 1, 'Uncertain': 2, 'New': 3, 'Mastered': 4 };
      return (order[a.status] || 4) - (order[b.status] || 4);
    });

    setWordsToStudy(due);
    if (due.length > 0) {
      setSession({
        deckId: deckId === 'today' ? undefined : deckId,
        total: due.length,
        currentIndex: 0,
        studied: 0,
        knowCount: 0,
        almostCount: 0,
        dontKnowCount: 0,
      });
    }
  }, [deckId]);

  const handleReview = (result: StudyResult) => {
    if (!session || wordsToStudy.length === 0) return;
    
    const currentWord = wordsToStudy[session.currentIndex];
    const updates = calculateNextReview(currentWord, result);
    
    updateWord(currentWord.id, updates);
    
    const newSession = { ...session };
    newSession.studied += 1;
    if (!newSession.incorrectWordIds) newSession.incorrectWordIds = [];
    if (!newSession.studiedWordIds) newSession.studiedWordIds = [];
    
    newSession.studiedWordIds.push(currentWord.id);

    if (result === 'know') {
      newSession.knowCount += 1;
    } else if (result === 'almost') {
      newSession.almostCount += 1;
      newSession.incorrectWordIds.push(currentWord.id);
    } else if (result === 'dontKnow') {
      newSession.dontKnowCount += 1;
      newSession.incorrectWordIds.push(currentWord.id);
    }
    
    if (newSession.currentIndex < newSession.total - 1) {
      newSession.currentIndex += 1;
      setSession(newSession);
    } else {
      // Session complete
      navigate('/summary', { state: { session: newSession } });
    }
  };

  const handleShuffle = () => {
    if (!session || wordsToStudy.length <= session.currentIndex + 1) return;
    
    // Shuffle the remaining words
    const remainingWords = [...wordsToStudy.slice(session.currentIndex)];
    for (let i = remainingWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remainingWords[i], remainingWords[j]] = [remainingWords[j], remainingWords[i]];
    }
    
    setWordsToStudy([
      ...wordsToStudy.slice(0, session.currentIndex),
      ...remainingWords
    ]);
  };

  if (!session || wordsToStudy.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <EmptyState 
          title="All caught up!" 
          description="You have no words due for review right now. Great job!"
          action={
            <div className="flex space-x-3 justify-center mt-4">
              <button 
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
              >
                Return Home
              </button>
            </div>
          }
        />
      </div>
    );
  }

  const currentWord = wordsToStudy[session.currentIndex];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {deckId === 'today' ? "Today's Review" : "Study Session"}
          </h2>
          <p className="text-slate-500 text-sm">
            Card {session.currentIndex + 1} of {session.total}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleShuffle}
            title="Shuffle remaining cards"
            className="flex items-center p-2 text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-full transition-colors shadow-sm active:scale-95"
          >
            <Shuffle size={20} />
          </button>
          <button 
            onClick={() => {
              if(confirm("Exit session? Progress on current word will be lost.")) {
                navigate('/');
              }
            }}
            className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors active:scale-95"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="mb-8">
        <ProgressBar value={session.currentIndex} max={session.total} />
      </div>

      <div className="flex-1 flex flex-col justify-center pb-12">
        <Flashcard 
          key={currentWord.id} // force remount for new word
          word={currentWord}
          onKnow={() => handleReview('know')}
          onAlmost={() => handleReview('almost')}
          onDontKnow={() => handleReview('dontKnow')}
        />
      </div>
    </div>
  );
};
