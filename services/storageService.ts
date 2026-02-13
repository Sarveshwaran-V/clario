import type { HistoryItem, ToolExplanation } from '../types';

// Fix: Add a type declaration for the chrome object to resolve TypeScript errors.
declare const chrome: any;

const HISTORY_KEY = 'clario-history';
const MAX_HISTORY_ITEMS = 50;

const isChromeExtension = (): boolean => {
  // In a standard web app context, `chrome` will be undefined.
  return typeof chrome !== 'undefined' && !!chrome.storage?.local;
};


/**
 * Retrieves the entire history from storage.
 * @returns A promise that resolves to an array of HistoryItem objects.
 */
export const getHistory = async (): Promise<HistoryItem[]> => {
  try {
    if (isChromeExtension()) {
      const result = await chrome.storage.local.get(HISTORY_KEY);
      return result[HISTORY_KEY] || [];
    } else {
      const historyJson = window.localStorage.getItem(HISTORY_KEY);
      return historyJson ? JSON.parse(historyJson) : [];
    }
  } catch (e) {
    console.error("Failed to get history from storage:", e);
    return [];
  }
};

/**
 * Adds a new explanation to the history.
 * It prevents duplicates by removing any previous entry with the same URL or name.
 * The history is capped at a maximum number of items.
 * @param explanation The ToolExplanation object to save.
 * @param url The optional URL associated with the explanation.
 */
export const addToHistory = async (explanation: ToolExplanation, url?: string): Promise<void> => {
  try {
    const newHistoryItem: HistoryItem = { ...explanation, url, timestamp: Date.now() };
    let history = await getHistory();

    // Remove any previous entry with the same URL or the same tool name if no URL is provided.
    if (url) {
      history = history.filter(item => item.url !== url);
    } else {
      history = history.filter(item => item.toolName.toLowerCase() !== explanation.toolName.toLowerCase());
    }

    // Add the new item to the front of the array.
    history.unshift(newHistoryItem);

    // Enforce the maximum history size.
    if (history.length > MAX_HISTORY_ITEMS) {
      history = history.slice(0, MAX_HISTORY_ITEMS);
    }

    if (isChromeExtension()) {
      await chrome.storage.local.set({ [HISTORY_KEY]: history });
    } else {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  } catch (e) {
    console.error("Failed to add item to history:", e);
  }
};

/**
 * Clears the entire history from storage.
 */
export const clearHistory = async (): Promise<void> => {
  try {
    if (isChromeExtension()) {
      await chrome.storage.local.remove(HISTORY_KEY);
    } else {
      window.localStorage.removeItem(HISTORY_KEY);
    }
  } catch (e) {
    console.error("Failed to clear history:", e);
  }
};