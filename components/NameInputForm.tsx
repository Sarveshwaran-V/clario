import React, { useState } from 'react';
import { ArrowRightIcon } from './icons';

interface NameInputFormProps {
  onSubmit: (name: string) => void;
  isLoading: boolean;
}

export const NameInputForm: React.FC<NameInputFormProps> = ({ onSubmit, isLoading }) => {
  const [name, setName] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex items-center bg-neutral-800 border border-neutral-700 rounded-xl transition-all focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-black focus-within:ring-indigo-500"
    >
      <label htmlFor="name-input" className="sr-only">Enter a tool name</label>
      <input
        id="name-input"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., Figma, React, Docker..."
        className="flex-grow bg-transparent py-3 px-4 text-white placeholder-neutral-500 focus:outline-none"
        disabled={isLoading}
        required
      />
      <button
        type="submit"
        disabled={isLoading || !name.trim()}
        className="flex-shrink-0 p-3 text-neutral-500 hover:text-white disabled:text-neutral-600 disabled:cursor-not-allowed transition-colors"
        aria-label="Explain Tool Name"
      >
        <ArrowRightIcon className="w-5 h-5" />
      </button>
    </form>
  );
};
