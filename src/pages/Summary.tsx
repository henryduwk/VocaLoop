import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { StudySession } from '../types';
import { getDueWords } from '../utils/storage';

export const Summary: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const session = location.state?.session as StudySession;
  
  useEffect(() => {
    if (!session) {
      navigate('/');
    }
  }, [session, navigate]);

  if (!session) return null;

  const remainingDue = getDueWords().length;

  return (
    <div className="max-w-xl mx-auto px-4 py-12 flex flex-col items-center">
      <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
        <CheckCircle size={40} />
      </div>
      
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Session Complete!</h1>
      <p className="text-slate-500 text-center mb-8">
        You've successfully studied {session.studied} words. Keep up the great work!
      </p>

      <div className="bg-white w-full rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Results</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-3 bg-green-50 rounded-xl">
            <span className="text-green-600 font-bold text-2xl">{session.knowCount}</span>
            <span className="text-slate-600 font-medium text-sm mt-1">안다 ✓</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-amber-50 rounded-xl">
            <span className="text-amber-600 font-bold text-2xl">{session.almostCount}</span>
            <span className="text-slate-600 font-medium text-sm mt-1">헷갈린다</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-red-50 rounded-xl">
            <span className="text-red-600 font-bold text-2xl">{session.dontKnowCount}</span>
            <span className="text-slate-600 font-medium text-sm mt-1">모른다</span>
          </div>
        </div>

        <div className="mt-6 bg-slate-50 rounded-xl p-4 text-sm text-slate-600 space-y-1">
          <p className="font-semibold text-slate-700 mb-2">📅 다음 복습 일정</p>
          {session.dontKnowCount > 0 && (
            <p>• <span className="text-red-600 font-medium">모르는 단어</span>: 내일(1일 후) 복습</p>
          )}
          {session.almostCount > 0 && (
            <p>• <span className="text-amber-600 font-medium">헷갈리는 단어</span>: 7일 후 복습</p>
          )}
          {session.knowCount > 0 && (
            <p>• <span className="text-green-600 font-medium">아는 단어</span>: 복습 완료! 🎉</p>
          )}
        </div>

        <div className="mt-4 text-center text-sm text-slate-500">
          Remaining words due today: <span className="font-bold text-primary-600">{remainingDue}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full mb-3">
        {session.incorrectWordIds && session.incorrectWordIds.length > 0 && (
          <button 
            onClick={() => navigate('/study/custom', { state: { customWordIds: session.incorrectWordIds } })}
            className="flex-1 flex justify-center items-center px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
          >
            <RotateCcw size={18} className="mr-2" /> 틀린 단어 다시 학습
          </button>
        )}
        {session.studiedWordIds && session.studiedWordIds.length > 0 && (
          <button 
            onClick={() => navigate('/study/custom', { state: { customWordIds: session.studiedWordIds } })}
            className="flex-1 flex justify-center items-center px-6 py-3 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-xl font-medium hover:bg-indigo-100 transition-colors"
          >
            <RotateCcw size={18} className="mr-2" /> 전체 다시 학습
          </button>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {remainingDue > 0 && (
          <button 
            onClick={() => navigate('/study/today')}
            className="flex-1 flex justify-center items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            <RotateCcw size={18} className="mr-2" /> Study Again
          </button>
        )}
        <Link 
          to="/"
          className="flex-1 flex justify-center items-center px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
        >
           Return Home <ArrowRight size={18} className="ml-2" />
        </Link>
      </div>
    </div>
  );
};
