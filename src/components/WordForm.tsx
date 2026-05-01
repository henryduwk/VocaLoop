import React, { useState } from 'react';
import { Word, Difficulty } from '../types';

interface WordFormProps {
  initialData?: Partial<Word>;
  onSave: (data: Partial<Word>) => void;
  onCancel: () => void;
}

export const WordForm: React.FC<WordFormProps> = ({ initialData, onSave, onCancel }) => {
  const [word, setWord] = useState(initialData?.word || '');
  const [meaning, setMeaning] = useState(initialData?.meaning || '');
  const [example, setExample] = useState(initialData?.example || '');
  const [exampleTranslation, setExampleTranslation] = useState(initialData?.exampleTranslation || '');
  const [memo, setMemo] = useState(initialData?.memo || '');
  const [difficulty, setDifficulty] = useState<Difficulty>(initialData?.difficulty || 'Normal');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word || !meaning) return;

    onSave({
      word,
      meaning,
      example,
      exampleTranslation,
      memo,
      difficulty,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Word *</label>
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Meaning *</label>
        <input
          type="text"
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Example</label>
        <textarea
          value={example}
          onChange={(e) => setExample(e.target.value)}
          className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Example Translation</label>
        <textarea
          value={exampleTranslation}
          onChange={(e) => setExampleTranslation(e.target.value)}
          className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Memo</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
          >
            <option value="Easy">Easy</option>
            <option value="Normal">Normal</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="TOEFL, noun, etc."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors font-medium"
        >
          Save Word
        </button>
      </div>
    </form>
  );
};
