
import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div role="status" className="flex flex-col items-center justify-center text-center p-8 bg-neutral-900/50 border border-neutral-700 rounded-lg">
    <div className="w-10 h-10 border-4 border-t-indigo-500 border-r-indigo-500 border-b-indigo-500 border-l-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-neutral-300 font-semibold">Preparing Your AI-Powered Guide...</p>
    <p className="mt-1 text-neutral-400 text-sm">Our AI is consulting its knowledge base to create a detailed, easy-to-understand explanation for you.</p>
  </div>
);
