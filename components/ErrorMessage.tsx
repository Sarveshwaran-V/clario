import React, { useState } from 'react';
import { ExclamationTriangleIcon, LightBulbIcon } from './icons'; // Assuming LightBulbIcon exists or use another
import { explainError } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const handleExplain = async () => {
    setIsExplaining(true);
    try {
      if (message.includes("API_KEY environment variable not set")) {
        setExplanation("This error means the application cannot talk to Google Gemini AI because it's missing the API Key. \n\n**To fix this:**\n1.  Open the file `.env.local` in the project root.\n2.  Replace `PLACEHOLDER_REPLACE_ME` with your actual Google Gemini API Key.\n3.  Restart the development server.");
      } else {
        const result = await explainError(message);
        setExplanation(result);
      }
    } catch (err) {
      setExplanation("Failed to get an explanation.");
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-lg animate-fade-in">
      <div className="flex items-start gap-4">
        <ExclamationTriangleIcon className="w-6 h-6 flex-shrink-0 text-red-400 mt-1" />
        <div className="flex-grow">
          <h4 className="font-bold text-red-100 mb-1">An Error Occurred</h4>
          <p className="mb-3 text-sm">{message}</p>

          {!explanation && !isExplaining && (
            <button
              onClick={handleExplain}
              className="flex items-center gap-2 text-xs bg-red-800/40 hover:bg-red-800/60 text-red-200 px-3 py-2 rounded-md transition-colors border border-red-700/50"
            >
              <LightBulbIcon className="w-4 h-4" />
              Explain with AI
            </button>
          )}

          {isExplaining && (
            <div className="flex items-center gap-2 text-sm text-red-300 mt-2">
              <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
              Analyzing error...
            </div>
          )}

          {explanation && (
            <div className="mt-4 bg-black/40 p-4 rounded-md border border-red-500/30">
              <h5 className="flex items-center gap-2 font-semibold text-red-300 mb-2 text-sm">
                <LightBulbIcon className="w-4 h-4" />
                AI Explanation
              </h5>
              <div className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
                {explanation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
