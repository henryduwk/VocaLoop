import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Play, Search, Filter, Upload, RotateCcw } from 'lucide-react';
import { Deck, Word, WordStatus, Difficulty } from '../types';
import { getDecks, getWordsByDeck, addWord, addWords, updateWord, deleteWord, resetDeckProgress } from '../utils/storage';
import { WordForm } from '../components/WordForm';
import { getToday } from '../utils/date';
import * as xlsx from 'xlsx';

export const DeckDetail: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  
  const [deck, setDeck] = useState<Deck | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [isAddingWord, setIsAddingWord] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<WordStatus | 'All'>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'All'>('All');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = xlsx.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = xlsx.utils.sheet_to_json<any>(ws);

        const newWords: Word[] = data.map((row: any) => ({
          id: `word-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          deckId: deckId!,
          word: String(row['Word'] || row['단어'] || '').trim(),
          meaning: String(row['Meaning'] || row['의미'] || row['뜻'] || '').trim(),
          example: String(row['Example'] || row['예문'] || '').trim(),
          exampleTranslation: String(row['ExampleTranslation'] || row['예문해석'] || '').trim(),
          memo: String(row['Memo'] || row['메모'] || '').trim(),
          difficulty: (['Easy', 'Normal', 'Hard'].includes(row['Difficulty'] || row['난이도']) 
            ? (row['Difficulty'] || row['난이도']) 
            : 'Normal') as Difficulty,
          tags: String(row['Tags'] || row['태그'] || '').split(',').map((t: string) => t.trim()).filter(Boolean),
          status: 'New' as const,
          reviewPhase: 0,
          reviewCount: 0,
          correctCount: 0,
          wrongCount: 0,
          nextReviewAt: getToday(),
          createdAt: getToday(),
          updatedAt: getToday()
        })).filter((w: Word) => w.word !== '');

        if (newWords.length > 0) {
          addWords(newWords);
          loadData();
          alert(`Successfully imported ${newWords.length} words!`);
        } else {
          alert("No valid words found in the Excel file. Please ensure columns like 'Word' or '단어' exist.");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to parse the Excel file. Make sure it's a valid .xlsx or .csv file.");
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const loadData = () => {
    if (!deckId) return;
    const allDecks = getDecks();
    const foundDeck = allDecks.find(d => d.id === deckId);
    if (!foundDeck) {
      navigate('/decks');
      return;
    }
    setDeck(foundDeck);
    setWords(getWordsByDeck(deckId));
  };

  useEffect(() => {
    loadData();
  }, [deckId, navigate]);

  const handleSaveWord = (wordData: Partial<Word>) => {
    if (editingWord) {
      updateWord(editingWord.id, wordData);
    } else {
      addWord({
        ...wordData,
        id: `word-${Date.now()}`,
        deckId: deckId!,
        status: 'New' as const,
        reviewPhase: 0,
        reviewCount: 0,
        correctCount: 0,
        wrongCount: 0,
        nextReviewAt: getToday(),
        createdAt: getToday(),
        updatedAt: getToday()
      } as Word);
    }
    setIsAddingWord(false);
    setEditingWord(null);
    loadData();
  };

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all learning progress for this deck? This cannot be undone.')) {
      if (deckId) {
        resetDeckProgress(deckId);
        loadData();
      }
    }
  };

  const handleDeleteWord = (id: string) => {
    if (confirm('Delete this word?')) {
      deleteWord(id);
      loadData();
    }
  };

  const filteredWords = words.filter(w => {
    const matchesSearch = w.word.toLowerCase().includes(searchTerm.toLowerCase()) || w.meaning.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || w.status === statusFilter;
    const matchesDiff = difficultyFilter === 'All' || w.difficulty === difficultyFilter;
    return matchesSearch && matchesStatus && matchesDiff;
  });

  const dueCount = words.filter(w => w.status !== 'Mastered' && w.nextReviewAt <= getToday()).length;

  if (!deck) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/decks" className="inline-flex items-center text-slate-500 hover:text-slate-800 mb-6 font-medium">
        <ArrowLeft size={16} className="mr-1" /> Back to Decks
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{deck.name}</h1>
          <p className="text-slate-500 mt-2">{words.length} total words · {dueCount} due for review</p>
        </div>
        <div className="flex gap-2 sm:gap-3 flex-wrap justify-end">
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="hidden sm:flex items-center px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium"
          >
            <Upload size={18} className="mr-2" />
            Import Excel
          </button>
          <button 
            onClick={handleResetProgress}
            className="flex justify-center items-center px-3 sm:px-4 py-3 sm:py-2 bg-white text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors font-medium shadow-sm"
          >
            <RotateCcw size={18} className="sm:mr-2" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            onClick={() => {
              const weakWords = words.filter(w => w.status === 'Forgotten' || w.status === 'Uncertain');
              if (weakWords.length > 0) {
                navigate('/study/custom', { state: { customWordIds: weakWords.map(w => w.id) } });
              } else {
                alert('No weak words to review in this deck!');
              }
            }}
            className="flex-1 sm:flex-none flex justify-center items-center px-2 sm:px-4 py-3 sm:py-2 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors font-medium shadow-sm active:scale-95 whitespace-nowrap"
          >
            <RotateCcw size={18} className="mr-1 sm:mr-2 flex-shrink-0" />
            <span className="text-sm sm:text-base whitespace-nowrap">Review Weak</span>
          </button>
          <button 
            onClick={() => { setEditingWord(null); setIsAddingWord(true); }}
            className="flex-1 sm:flex-none flex justify-center items-center px-2 sm:px-4 py-3 sm:py-2 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium shadow-sm"
          >
            <Plus size={18} className="mr-1 sm:mr-2 flex-shrink-0" />
            <span className="text-sm sm:text-base whitespace-nowrap">Add Word</span>
          </button>
          <Link 
            to={`/study/${deck.id}`}
            className="flex-1 sm:flex-none flex justify-center items-center px-2 sm:px-5 py-3 sm:py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-sm transition-colors font-medium"
          >
            <Play size={18} className="mr-1 sm:mr-2 flex-shrink-0" />
            <span className="text-sm sm:text-base whitespace-nowrap">Study Now</span>
          </Link>
        </div>
      </div>

      {(isAddingWord || editingWord) ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">{editingWord ? 'Edit Word' : 'Add New Word'}</h2>
          <WordForm 
            initialData={editingWord || undefined}
            onSave={handleSaveWord}
            onCancel={() => { setIsAddingWord(false); setEditingWord(null); }}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search words..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <select 
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="pl-8 pr-8 py-2 bg-white border border-slate-200 rounded-xl outline-none appearance-none font-medium text-slate-700"
                >
                  <option value="All">All Status</option>
                  <option value="New">New</option>
                  <option value="Forgotten">Forgotten</option>
                  <option value="Uncertain">Uncertain</option>
                  <option value="Mastered">Mastered</option>
                </select>
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              </div>
              <div className="relative">
                <select 
                  value={difficultyFilter}
                  onChange={e => setDifficultyFilter(e.target.value as any)}
                  className="pl-8 pr-8 py-2 bg-white border border-slate-200 rounded-xl outline-none appearance-none font-medium text-slate-700"
                >
                  <option value="All">All Diff</option>
                  <option value="Easy">Easy</option>
                  <option value="Normal">Normal</option>
                  <option value="Hard">Hard</option>
                </select>
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hidden sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-medium">Word</th>
                    <th className="px-6 py-4 font-medium">Meaning</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Due</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWords.length > 0 ? (
                    filteredWords.map(word => (
                      <tr key={word.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-slate-800">{word.word}</td>
                        <td className="px-6 py-4 text-slate-600">{word.meaning}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium 
                            ${word.status === 'New' ? 'bg-blue-50 text-blue-600' :
                              word.status === 'Forgotten' ? 'bg-red-50 text-red-600' :
                              word.status === 'Uncertain' ? 'bg-amber-50 text-amber-600' :
                              word.status === 'Mastered' ? 'bg-green-50 text-green-600' :
                              'bg-slate-50 text-slate-600'
                            }`}
                          >
                            {word.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {word.nextReviewAt <= getToday() && word.status !== 'Mastered' ? (
                            <span className="text-primary-600 font-medium">Today</span>
                          ) : word.status === 'Mastered' ? (
                            <span className="text-slate-400">-</span>
                          ) : (
                            <span>{word.nextReviewAt}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingWord(word)} className="text-primary-600 hover:text-primary-800 font-medium">Edit</button>
                            <button onClick={() => handleDeleteWord(word.id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        No words found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List */}
          <div className="sm:hidden flex flex-col space-y-3 pb-[env(safe-area-inset-bottom)]">
            {filteredWords.length > 0 ? (
              filteredWords.map(word => (
                <div key={word.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-xl text-slate-800">{word.word}</h3>
                      <p className="text-slate-600 mt-1 text-base">{word.meaning}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase
                      ${word.status === 'New' ? 'bg-blue-50 text-blue-600' :
                        word.status === 'Forgotten' ? 'bg-red-50 text-red-600' :
                        word.status === 'Uncertain' ? 'bg-amber-50 text-amber-600' :
                        word.status === 'Mastered' ? 'bg-green-50 text-green-600' :
                        'bg-slate-50 text-slate-600'
                      }`}
                    >
                      {word.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                    <span className="text-xs font-medium text-slate-400">
                      Due: {word.nextReviewAt <= getToday() && word.status !== 'Mastered' ? (
                        <span className="text-primary-600 font-bold">Today</span>
                      ) : word.status === 'Mastered' ? (
                        <span>-</span>
                      ) : (
                        <span>{word.nextReviewAt}</span>
                      )}
                    </span>
                    <div className="flex space-x-4">
                      <button onClick={() => setEditingWord(word)} className="text-sm font-bold text-primary-600">EDIT</button>
                      <button onClick={() => handleDeleteWord(word.id)} className="text-sm font-bold text-red-500">DELETE</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-100">
                No words found matching your filters.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
