import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { Deck, Word } from '../types';
import { getDecks, getWords, addDeck, updateDeck, deleteDeck } from '../utils/storage';
import { DeckCard } from '../components/DeckCard';
import { getToday } from '../utils/date';

export const Decks: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [deckName, setDeckName] = useState('');
  const [deckDesc, setDeckDesc] = useState('');
  
  const navigate = useNavigate();

  const loadData = () => {
    setDecks(getDecks());
    setWords(getWords());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (deck?: Deck) => {
    if (deck) {
      setEditingDeck(deck);
      setDeckName(deck.name);
      setDeckDesc(deck.description || '');
    } else {
      setEditingDeck(null);
      setDeckName('');
      setDeckDesc('');
    }
    setIsModalOpen(true);
  };

  const handleSaveDeck = () => {
    if (!deckName.trim()) return;
    
    if (editingDeck) {
      updateDeck(editingDeck.id, { name: deckName, description: deckDesc });
    } else {
      addDeck({
        id: `deck-${Date.now()}`,
        name: deckName,
        description: deckDesc,
        createdAt: getToday(),
        updatedAt: getToday()
      });
    }
    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteDeck = (id: string) => {
    if (confirm("Are you sure you want to delete this deck? All words in it will be lost.")) {
      deleteDeck(id);
      loadData();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Your Decks</h1>
          <p className="text-slate-500 mt-2">Manage your vocabulary collections</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-sm transition-colors font-medium"
        >
          <Plus size={18} className="mr-2" />
          Create Deck
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.map(deck => (
          <DeckCard 
            key={deck.id}
            deck={deck}
            words={words.filter(w => w.deckId === deck.id)}
            onOpen={() => navigate(`/decks/${deck.id}`)}
            onEdit={() => handleOpenModal(deck)}
            onDelete={() => handleDeleteDeck(deck.id)}
          />
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">{editingDeck ? 'Edit Deck' : 'Create New Deck'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deck Name</label>
                <input 
                  type="text" 
                  value={deckName}
                  onChange={e => setDeckName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="e.g., TOEFL Vocabulary"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                <textarea 
                  value={deckDesc}
                  onChange={e => setDeckDesc(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="What is this deck for?"
                  rows={3}
                />
              </div>
              <button 
                onClick={handleSaveDeck}
                disabled={!deckName.trim()}
                className="w-full py-2 bg-primary-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
