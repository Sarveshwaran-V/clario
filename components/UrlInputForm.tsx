import React, { useState } from 'react';
import { ArrowRightIcon } from './icons';

interface UrlInputFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export const UrlInputForm: React.FC<UrlInputFormProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(url);
  };

  return (
    <div className="space-y-6">
      <form 
        onSubmit={handleSubmit} 
        className="flex items-center bg-neutral-800 border border-neutral-700 rounded-xl transition-all focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-black focus-within:ring-indigo-500"
      >
        <label htmlFor="url-input" className="sr-only">Paste a GitHub or tool URL</label>
        <input
          id="url-input"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a GitHub or tool URL..."
          className="flex-grow bg-transparent py-3 px-4 text-white placeholder-neutral-500 focus:outline-none"
          disabled={isLoading}
          required
        />
        <button
          type="submit"
          disabled={isLoading || !url}
          className="flex-shrink-0 p-3 text-neutral-500 hover:text-white disabled:text-neutral-600 disabled:cursor-not-allowed transition-colors"
          aria-label="Explain URL"
        >
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};