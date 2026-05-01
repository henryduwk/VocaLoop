import { Deck, Word } from '../types';
import { getToday } from './date';

const DECKS_KEY = "vocaloop_decks";
const WORDS_KEY = "vocaloop_words";

export const getDecks = (): Deck[] => {
  const data = localStorage.getItem(DECKS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveDecks = (decks: Deck[]): void => {
  localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
};

export const getWords = (): Word[] => {
  const data = localStorage.getItem(WORDS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveWords = (words: Word[]): void => {
  localStorage.setItem(WORDS_KEY, JSON.stringify(words));
};

export const addDeck = (deck: Deck): void => {
  const decks = getDecks();
  saveDecks([...decks, deck]);
};

export const updateDeck = (deckId: string, updates: Partial<Deck>): void => {
  const decks = getDecks();
  const index = decks.findIndex(d => d.id === deckId);
  if (index !== -1) {
    decks[index] = { ...decks[index], ...updates, updatedAt: getToday() };
    saveDecks(decks);
  }
};

export const deleteDeck = (deckId: string): void => {
  const decks = getDecks();
  saveDecks(decks.filter(d => d.id !== deckId));
  const words = getWords();
  saveWords(words.filter(w => w.deckId !== deckId));
};

export const addWord = (word: Word): void => {
  const words = getWords();
  saveWords([...words, word]);
};

export const addWords = (newWords: Word[]): void => {
  const words = getWords();
  saveWords([...words, ...newWords]);
};

export const updateWord = (wordId: string, updates: Partial<Word>): void => {
  const words = getWords();
  const index = words.findIndex(w => w.id === wordId);
  if (index !== -1) {
    words[index] = { ...words[index], ...updates, updatedAt: getToday() };
    saveWords(words);
  }
};

export const deleteWord = (wordId: string): void => {
  const words = getWords();
  saveWords(words.filter(w => w.id !== wordId));
};

export const getWordsByDeck = (deckId: string): Word[] => {
  return getWords().filter(w => w.deckId === deckId);
};

export const resetDeckProgress = (deckId: string): void => {
  const words = getWords();
  const today = getToday();
  const updatedWords = words.map(w => {
    if (w.deckId === deckId) {
      return {
        ...w,
        status: 'New',
        reviewPhase: 0,
        reviewCount: 0,
        correctCount: 0,
        wrongCount: 0,
        nextReviewAt: today,
        updatedAt: today
      } as Word;
    }
    return w;
  });
  saveWords(updatedWords);
};

// 오늘 복습해야 할 단어 (nextReviewAt이 오늘 이전이고, Mastered가 아닌 단어)
export const getDueWords = (deckId?: string): Word[] => {
  const today = getToday();
  return getWords().filter(w => 
    (!deckId || w.deckId === deckId) && 
    w.nextReviewAt <= today &&
    w.status !== 'Mastered'
  );
};

export const getDifficultWords = (deckId?: string): Word[] => {
  return getWords().filter(w => 
    (!deckId || w.deckId === deckId) && w.status === 'Forgotten'
  );
};

export const initializeSampleData = (): void => {
  if (getDecks().length > 0) return;

  const today = getToday();
  const sampleDeck: Deck = {
    id: "deck-toefl",
    name: "TOEFL Vocabulary",
    description: "Sample TOEFL vocabulary deck",
    createdAt: today,
    updatedAt: today
  };

  const sampleWords: Word[] = [
    {
      id: "word-1",
      deckId: "deck-toefl",
      word: "sufficient",
      meaning: "충분한",
      example: "This evidence is sufficient to support the argument.",
      exampleTranslation: "이 증거는 그 주장을 뒷받침하기에 충분하다.",
      memo: "Often used in academic writing.",
      difficulty: "Normal",
      tags: ["TOEFL", "academic"],
      status: "New",
      reviewPhase: 0,
      reviewCount: 0,
      correctCount: 0,
      wrongCount: 0,
      nextReviewAt: today,
      createdAt: today,
      updatedAt: today
    },
    {
      id: "word-2",
      deckId: "deck-toefl",
      word: "approach",
      meaning: "접근하다 / 접근법",
      example: "The researcher used a new approach to solve the problem.",
      exampleTranslation: "그 연구자는 문제를 해결하기 위해 새로운 접근법을 사용했다.",
      memo: "Can be both a noun and a verb.",
      difficulty: "Easy",
      tags: ["TOEFL", "academic"],
      status: "New",
      reviewPhase: 0,
      reviewCount: 0,
      correctCount: 0,
      wrongCount: 0,
      nextReviewAt: today,
      createdAt: today,
      updatedAt: today
    },
    {
      id: "word-3",
      deckId: "deck-toefl",
      word: "fluctuate",
      meaning: "변동하다",
      example: "Oil prices tend to fluctuate due to global supply issues.",
      exampleTranslation: "석유 가격은 글로벌 공급 문제로 인해 변동하는 경향이 있다.",
      memo: "Useful for economics and business topics.",
      difficulty: "Hard",
      tags: ["business", "economics"],
      status: "New",
      reviewPhase: 0,
      reviewCount: 0,
      correctCount: 0,
      wrongCount: 0,
      nextReviewAt: today,
      createdAt: today,
      updatedAt: today
    },
    {
      id: "word-4",
      deckId: "deck-toefl",
      word: "fragile",
      meaning: "깨지기 쉬운 / 취약한",
      example: "The company ships fragile medical equipment by air.",
      exampleTranslation: "그 회사는 깨지기 쉬운 의료 장비를 항공편으로 운송한다.",
      memo: "Useful for logistics topics.",
      difficulty: "Normal",
      tags: ["logistics", "business"],
      status: "New",
      reviewPhase: 0,
      reviewCount: 0,
      correctCount: 0,
      wrongCount: 0,
      nextReviewAt: today,
      createdAt: today,
      updatedAt: today
    }
  ];

  addDeck(sampleDeck);
  sampleWords.forEach(w => addWord(w));
};
