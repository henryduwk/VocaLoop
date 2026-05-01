import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Decks } from './pages/Decks';
import { DeckDetail } from './pages/DeckDetail';
import { Study } from './pages/Study';
import { Summary } from './pages/Summary';
import { Statistics } from './pages/Statistics';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 transition-colors">
        <Header />
        <main className="flex-1 pb-24 sm:pb-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/decks" element={<Decks />} />
            <Route path="/decks/:deckId" element={<DeckDetail />} />
            <Route path="/study/today" element={<Study />} />
            <Route path="/study/:deckId" element={<Study />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
