import React, { useState, useEffect, useCallback } from 'react';
import type { HistoryItem } from '../types';
import { getHistory, clearHistory } from '../services/storageService';
import { ArrowLeftIcon, TrashIcon, DocumentTextIcon } from './icons';

interface HistoryViewProps {
  onSelect: (item: HistoryItem) => void;
  onBack: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onSelect, onBack }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    const items = await getHistory();
    setHistory(items);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear your entire history? This cannot be undone.')) {
      await clearHistory();
      setHistory([]);
    }
  };

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-800">
        <button onClick={onBack} className="flex items-center gap-2 text-neutral-300 hover:text-white transition group">
          <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-semibold text-lg">History</span>
        </button>
        {history.length > 0 && (
          <button onClick={handleClearHistory} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition" aria-label="Clear all history">
            <TrashIcon className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-neutral-500">Loading history...</div>
      ) : history.length === 0 ? (
        <div className="text-center py-10 text-neutral-500">
          <p>Your history is empty.</p>
          <p className="text-sm">Guides you generate will appear here.</p>
        </div>
      ) : (
        <ul className="space-y-2 overflow-y-auto flex-grow">
          {history.map((item) => (
            <li key={item.timestamp}>
              <button
                onClick={() => onSelect(item)}
                className="w-full text-left p-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 transition flex items-start gap-4"
              >
                <div className="p-2 bg-neutral-800 rounded-md mt-1">
                   <DocumentTextIcon className="w-5 h-5 text-neutral-400" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-white truncate">{item.toolName}</p>
                    <p className="text-sm text-neutral-400 truncate">{item.tagline}</p>
                    <p className="text-xs text-neutral-500 mt-1">{timeAgo(item.timestamp)}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};