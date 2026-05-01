import React from 'react';
import { Deck, Word } from '../types';
import { Play, Edit2, Trash2 } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { formatDate } from '../utils/date';

interface DeckCardProps {
  deck: Deck;
  words: Word[];
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const DeckCard: React.FC<DeckCardProps> = ({ deck, words, onOpen, onEdit, onDelete }) => {
  const dueWords = words.filter(w => w.status !== 'Mastered' && w.nextReviewAt <= new Date().toISOString().split('T')[0]);
  const masteredWords = words.filter(w => w.status === 'Mastered');
  const progress = words.length > 0 ? (masteredWords.length / words.length) * 100 : 0;

  return (
    <div 
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onOpen}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">{deck.name}</h3>
          {deck.description && <p className="text-sm text-slate-500 mt-1 line-clamp-1">{deck.description}</p>}
        </div>
        <div className="flex opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-3 sm:p-2 text-primary-500 sm:text-slate-400 hover:text-primary-600 active:bg-primary-100 sm:hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Edit2 size={18} className="sm:w-4 sm:h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-3 sm:p-2 text-red-500 sm:text-slate-400 hover:text-red-600 active:bg-red-100 sm:hover:bg-red-50 rounded-lg transition-colors ml-1"
          >
            <Trash2 size={18} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Words</p>
          <p className="text-lg font-bold text-slate-700">{words.length}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Due Review</p>
          <p className="text-lg font-bold text-primary-600">{dueWords.length}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1 text-slate-500">
          <span>Progress</span>
          <span>{Math.round(progress)}% Mastered</span>
        </div>
        <ProgressBar value={masteredWords.length} max={words.length} />
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
        <span className="text-xs text-slate-400">
          {deck.lastStudiedAt ? `Last studied: ${formatDate(deck.lastStudiedAt)}` : 'Not studied yet'}
        </span>
        {dueWords.length > 0 && (
          <span className="flex items-center text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
            <Play size={14} className="mr-1" /> Review Now
          </span>
        )}
      </div>
    </div>
  );
};
