import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Plus, BookOpen, Target, CheckCircle2, AlertCircle, Library, RotateCcw } from 'lucide-react';
import { getDecks, getWords, getDueWords, initializeSampleData } from '../utils/storage';
import { Deck, Word } from '../types';
import { StatCard } from '../components/StatCard';
import { DeckCard } from '../components/DeckCard';
import { EmptyState } from '../components/EmptyState';

export const Home: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    initializeSampleData();
    setDecks(getDecks());
    setWords(getWords());
  }, []);

  const totalWords = words.length;
  const dueWordsToday = getDueWords().length;
  const masteredWords = words.filter(w => w.status === 'Mastered').length;
  const forgottenWords = words.filter(w => w.status === 'Forgotten').length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-6 sm:gap-0">
        <div className="w-full sm:w-auto">
          <h1 className="text-4xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Welcome to VocaLoop</h1>
          <p className="text-slate-500 mt-2 text-lg">Ready to review your vocabulary today?</p>
        </div>
        <div className="flex w-full sm:w-auto gap-2 sm:gap-3 flex-wrap justify-end">
          <Link 
            to="/decks"
            className="flex-1 sm:flex-none flex justify-center items-center px-3 sm:px-4 py-3 sm:py-2 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-bold text-sm sm:text-base shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} className="mr-1 sm:mr-2" />
            New Deck
          </Link>
          <button 
            onClick={() => {
              const weakWords = words.filter(w => w.status === 'Forgotten' || w.status === 'Uncertain');
              if (weakWords.length > 0) {
                navigate('/study/custom', { state: { customWordIds: weakWords.map(w => w.id) } });
              } else {
                alert('No weak words to review right now! Great job!');
              }
            }}
            className="flex-1 sm:flex-none flex justify-center items-center px-3 sm:px-4 py-3 sm:py-2 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors font-bold text-sm sm:text-base shadow-sm active:scale-95 whitespace-nowrap"
          >
            <RotateCcw size={18} className="mr-1 sm:mr-2" />
            Review Weak
          </button>
          <Link 
            to="/study/today"
            className="w-full sm:w-auto flex justify-center items-center px-4 sm:px-5 py-4 sm:py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-md transition-colors font-bold text-base active:scale-95 whitespace-nowrap"
          >
            <Play size={18} className="mr-2" />
            Start Review
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard 
          label="Total Words" 
          value={totalWords} 
          icon={<BookOpen size={24} />} 
        />
        <StatCard 
          label="Due Today" 
          value={dueWordsToday} 
          icon={<Target size={24} />} 
        />
        <StatCard 
          label="Mastered" 
          value={masteredWords} 
          icon={<CheckCircle2 size={24} />} 
        />
        <StatCard 
          label="Forgotten" 
          value={forgottenWords} 
          icon={<AlertCircle size={24} />} 
        />
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Your Decks</h2>
          <Link to="/decks" className="text-primary-600 font-medium hover:text-primary-700">View All</Link>
        </div>
        
        {decks.length === 0 ? (
          <EmptyState 
            title="No decks yet" 
            description="Create your first vocabulary deck to start learning."
            icon={<Library size={48} />}
            action={
              <Link to="/decks" className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium">
                Create Deck
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.slice(0, 3).map(deck => (
              <DeckCard 
                key={deck.id}
                deck={deck}
                words={words.filter(w => w.deckId === deck.id)}
                onOpen={() => navigate(`/decks/${deck.id}`)}
                onEdit={() => navigate(`/decks`)}
                onDelete={() => navigate(`/decks`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
