import React, { useState, useEffect } from 'react';
import { getWords, getDecks } from '../utils/storage';
import { Word, Deck } from '../types';
import { StatCard } from '../components/StatCard';
import { ProgressBar } from '../components/ProgressBar';
import { BookOpen, Target, CheckCircle2, BarChart3 } from 'lucide-react';
import { getToday } from '../utils/date';

export const Statistics: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);

  useEffect(() => {
    setWords(getWords());
    setDecks(getDecks());
  }, []);

  const totalWords = words.length;
  const masteredWords = words.filter(w => w.status === 'Mastered').length;
  const newWords = words.filter(w => w.status === 'New').length;
  const uncertainWords = words.filter(w => w.status === 'Uncertain').length;
  const forgottenWords = words.filter(w => w.status === 'Forgotten').length;

  const totalReviews = words.reduce((acc, w) => acc + w.reviewCount, 0);
  const totalCorrect = words.reduce((acc, w) => acc + w.correctCount, 0);
  const accuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

  const today = getToday();
  const reviewedToday = words.filter(w => w.lastReviewedAt === today).length;

  const difficultList = [...words].filter(w => w.status === 'Forgotten' || w.wrongCount > w.correctCount).sort((a, b) => b.wrongCount - a.wrongCount).slice(0, 10);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Learning Statistics</h1>
        <p className="text-slate-500 mt-2">Track your vocabulary progress over time</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Words" value={totalWords} icon={<BookOpen size={24} />} />
        <StatCard label="Mastered" value={masteredWords} icon={<CheckCircle2 size={24} />} />
        <StatCard label="Reviewed Today" value={reviewedToday} icon={<Target size={24} />} />
        <StatCard label="Accuracy" value={`${accuracy}%`} icon={<BarChart3 size={24} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Status Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 font-medium">✅ Mastered (완벽히 아는 단어)</span>
                <span className="text-slate-800 font-bold">{masteredWords}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${totalWords ? (masteredWords/totalWords)*100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 font-medium">🤔 Uncertain (헷갈리는 단어)</span>
                <span className="text-slate-800 font-bold">{uncertainWords}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-amber-500 h-3 rounded-full transition-all" style={{ width: `${totalWords ? (uncertainWords/totalWords)*100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 font-medium">❌ Forgotten (모르는 단어)</span>
                <span className="text-slate-800 font-bold">{forgottenWords}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-red-500 h-3 rounded-full transition-all" style={{ width: `${totalWords ? (forgottenWords/totalWords)*100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 font-medium">🆕 New (아직 학습 안 한 단어)</span>
                <span className="text-slate-800 font-bold">{newWords}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${totalWords ? (newWords/totalWords)*100 : 0}%` }}></div>
              </div>
            </div>
          </div>

          {/* 에빙하우스 복습 일정 안내 */}
          <div className="mt-6 bg-slate-50 rounded-xl p-4 text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700 text-sm mb-2">📅 에빙하우스 복습 일정</p>
            <p>• <span className="text-red-600 font-medium">모르는 단어</span>: 1일 후 → 7일 후 → 30일 후</p>
            <p>• <span className="text-amber-600 font-medium">헷갈리는 단어</span>: 7일 후 → 30일 후</p>
            <p>• <span className="text-green-600 font-medium">아는 단어</span>: 복습 완료 🎉</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Deck Progress</h3>
          <div className="space-y-5">
            {decks.map(deck => {
              const deckWords = words.filter(w => w.deckId === deck.id);
              const deckMastered = deckWords.filter(w => w.status === 'Mastered').length;
              return (
                <div key={deck.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 font-medium line-clamp-1">{deck.name}</span>
                    <span className="text-slate-500">{deckMastered} / {deckWords.length}</span>
                  </div>
                  <ProgressBar value={deckMastered} max={deckWords.length} />
                </div>
              );
            })}
            {decks.length === 0 && <p className="text-slate-500">No decks created yet.</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Most Difficult Words</h3>
        {difficultList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-lg">Word</th>
                  <th className="px-4 py-3 font-medium">Meaning</th>
                  <th className="px-4 py-3 font-medium">Mistakes</th>
                  <th className="px-4 py-3 font-medium rounded-tr-lg">Reviews</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {difficultList.map(word => (
                  <tr key={word.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800">{word.word}</td>
                    <td className="px-4 py-3 text-slate-600">{word.meaning}</td>
                    <td className="px-4 py-3 font-medium text-red-600">{word.wrongCount}</td>
                    <td className="px-4 py-3 text-slate-500">{word.reviewCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500">You don't have any difficult words yet. Keep studying!</p>
        )}
      </div>
    </div>
  );
};
