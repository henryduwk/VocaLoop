import React, { useState, useEffect, useRef } from 'react';
import { Cloud, CloudOff, RefreshCw, Check, Settings } from 'lucide-react';
import { getSyncKey, setSyncKey, removeSyncKey, fullSync, pushToCloud } from '../utils/cloudSync';

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'not_configured';

export const SyncManager: React.FC = () => {
  const [syncKey, setSyncKeyState] = useState<string | null>(null);
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [showPanel, setShowPanel] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [message, setMessage] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = getSyncKey();
    setSyncKeyState(key);
    if (key) {
      doSync();
    }
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-sync when data changes
  useEffect(() => {
    if (!syncKey) return;

    const handleStorageChange = () => {
      // Debounced push
      const timer = setTimeout(() => pushToCloud(), 2000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('vocaloop-data-changed', handleStorageChange);
    return () => window.removeEventListener('vocaloop-data-changed', handleStorageChange);
  }, [syncKey]);

  const doSync = async () => {
    setStatus('syncing');
    setMessage('');
    const result = await fullSync();
    
    if (!result.success) {
      if (result.error === 'sync_not_configured' || result.error === 'network_error') {
        setStatus('not_configured');
        setMessage('서버 동기화가 설정되지 않았습니다');
      } else {
        setStatus('error');
        setMessage(result.error || '동기화 실패');
      }
      return;
    }

    setStatus('synced');
    if (result.direction === 'pulled') {
      setMessage('클라우드에서 데이터를 가져왔습니다');
      window.location.reload(); // Reload to reflect pulled data
    } else if (result.direction === 'pushed') {
      setMessage('데이터를 클라우드에 저장했습니다');
    } else {
      setMessage('이미 최신 상태입니다');
    }

    setTimeout(() => setStatus('idle'), 3000);
  };

  const handleConnect = () => {
    if (inputKey.length < 4) {
      setMessage('동기화 키는 4자 이상 입력하세요');
      return;
    }
    setSyncKey(inputKey);
    setSyncKeyState(inputKey);
    setShowPanel(false);
    setInputKey('');
    doSync();
  };

  const handleDisconnect = () => {
    removeSyncKey();
    setSyncKeyState(null);
    setStatus('idle');
    setMessage('');
    setShowPanel(false);
  };

  const getStatusIcon = () => {
    if (status === 'syncing') return <RefreshCw size={18} className="animate-spin" />;
    if (status === 'synced') return <Check size={18} />;
    if (status === 'error' || status === 'not_configured') return <CloudOff size={18} />;
    if (syncKey) return <Cloud size={18} />;
    return <CloudOff size={18} />;
  };

  const getStatusColor = () => {
    if (status === 'syncing') return 'text-blue-500';
    if (status === 'synced') return 'text-green-500';
    if (status === 'error') return 'text-red-500';
    if (status === 'not_configured') return 'text-slate-400';
    if (syncKey) return 'text-primary-600';
    return 'text-slate-400';
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Sync button */}
      <button
        onClick={() => syncKey ? doSync() : setShowPanel(!showPanel)}
        onContextMenu={(e) => { e.preventDefault(); setShowPanel(!showPanel); }}
        className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${getStatusColor()}`}
        title={syncKey ? '클릭: 동기화 / 우클릭: 설정' : '동기화 설정'}
      >
        {getStatusIcon()}
      </button>

      {/* Settings gear (always visible when connected) */}
      {syncKey && (
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="p-1 rounded-full hover:bg-slate-100 transition-colors text-slate-400"
          title="동기화 설정"
        >
          <Settings size={14} />
        </button>
      )}

      {/* Panel */}
      {showPanel && (
        <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50">
          <h3 className="font-bold text-slate-800 mb-3 text-sm">☁️ 클라우드 동기화</h3>
          
          {syncKey ? (
            <div className="space-y-3">
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs text-green-700 font-medium">연결됨</p>
                <p className="text-sm text-green-800 font-mono mt-1">키: {syncKey}</p>
              </div>
              <button
                onClick={doSync}
                className="w-full py-2 bg-primary-600 text-white rounded-xl font-medium text-sm hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} /> 지금 동기화
              </button>
              <button
                onClick={handleDisconnect}
                className="w-full py-2 bg-slate-100 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors"
              >
                연결 해제
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                동기화 키를 입력하면 여러 기기에서 같은 단어장을 사용할 수 있습니다.
                <br /><strong>모든 기기에서 같은 키를 입력하세요.</strong>
              </p>
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="동기화 키 입력 (예: mykey2025)"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
              />
              <button
                onClick={handleConnect}
                disabled={inputKey.length < 4}
                className="w-full py-2 bg-primary-600 text-white rounded-xl font-medium text-sm hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                연결하기
              </button>
            </div>
          )}

          {message && (
            <p className={`text-xs mt-2 ${status === 'error' ? 'text-red-500' : 'text-slate-500'}`}>
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
