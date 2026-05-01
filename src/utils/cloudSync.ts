const SYNC_KEY_STORAGE = 'vocaloop_sync_key';
const SYNC_TIMESTAMP_STORAGE = 'vocaloop_sync_timestamp';

export const getSyncKey = (): string | null => {
  return localStorage.getItem(SYNC_KEY_STORAGE);
};

export const setSyncKey = (key: string): void => {
  localStorage.setItem(SYNC_KEY_STORAGE, key);
};

export const removeSyncKey = (): void => {
  localStorage.removeItem(SYNC_KEY_STORAGE);
  localStorage.removeItem(SYNC_TIMESTAMP_STORAGE);
};

const getLocalTimestamp = (): string => {
  return localStorage.getItem(SYNC_TIMESTAMP_STORAGE) || '2000-01-01T00:00:00Z';
};

const setLocalTimestamp = (ts: string): void => {
  localStorage.setItem(SYNC_TIMESTAMP_STORAGE, ts);
};

/**
 * Push local data to cloud
 */
export const pushToCloud = async (): Promise<{ success: boolean; error?: string }> => {
  const syncKey = getSyncKey();
  if (!syncKey) return { success: false, error: 'no_key' };

  try {
    const decks = JSON.parse(localStorage.getItem('vocaloop_decks') || '[]');
    const words = JSON.parse(localStorage.getItem('vocaloop_words') || '[]');
    const timestamp = new Date().toISOString();

    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: syncKey, decks, words, timestamp }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.error };
    }

    setLocalTimestamp(timestamp);
    return { success: true };
  } catch {
    return { success: false, error: 'network_error' };
  }
};

/**
 * Pull cloud data to local
 */
export const pullFromCloud = async (): Promise<{ success: boolean; updated: boolean; error?: string }> => {
  const syncKey = getSyncKey();
  if (!syncKey) return { success: false, updated: false, error: 'no_key' };

  try {
    const res = await fetch(`/api/sync?key=${encodeURIComponent(syncKey)}`);
    if (!res.ok) {
      const data = await res.json();
      return { success: false, updated: false, error: data.error };
    }

    const { data } = await res.json();
    if (!data) return { success: true, updated: false }; // No cloud data yet

    const cloudTimestamp = data.timestamp || '2000-01-01T00:00:00Z';
    const localTimestamp = getLocalTimestamp();

    // If cloud is newer, update local
    if (cloudTimestamp > localTimestamp) {
      localStorage.setItem('vocaloop_decks', JSON.stringify(data.decks || []));
      localStorage.setItem('vocaloop_words', JSON.stringify(data.words || []));
      setLocalTimestamp(cloudTimestamp);
      return { success: true, updated: true };
    }

    return { success: true, updated: false };
  } catch {
    return { success: false, updated: false, error: 'network_error' };
  }
};

/**
 * Full sync: pull first, then push if local is newer
 */
export const fullSync = async (): Promise<{ success: boolean; direction?: 'pulled' | 'pushed' | 'none'; error?: string }> => {
  const pullResult = await pullFromCloud();
  if (!pullResult.success) return { success: false, error: pullResult.error };
  
  if (pullResult.updated) {
    return { success: true, direction: 'pulled' };
  }

  // Local is same or newer, push to cloud
  const pushResult = await pushToCloud();
  if (!pushResult.success) return { success: false, error: pushResult.error };
  
  return { success: true, direction: 'pushed' };
};
