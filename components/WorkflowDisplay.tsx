import React from 'react';
import type { GeneratedWorkflow } from '../types';
import { LightBulbIcon } from './icons';

interface WorkflowDisplayProps {
  workflow: GeneratedWorkflow;
}

const HighlightedText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  const parts = text.split('`');
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="bg-neutral-700/50 text-neutral-200 font-mono text-sm px-1.5 py-0.5 rounded-md">
            {part}
          </code>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

export const WorkflowDisplay: React.FC<WorkflowDisplayProps> = ({ workflow }) => {
  if (!workflow || workflow.length === 0) {
    return null;
  }

  return (
    <div className="animate-fade-in max-h-[60vh] overflow-y-auto pr-2">
      <h4 className="text-lg font-bold text-white mb-4">Your Step-by-Step Guide:</h4>
      <ol className="space-y-4">
        {workflow.map((step, index) => (
          <li key={index} className="flex items-start gap-4">
            <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 bg-neutral-700 rounded-full text-sm font-semibold text-white">
              {index + 1}
            </div>
            <div className="flex-1">
                <h5 className="font-semibold text-white">{step.title}</h5>
                <p className="text-neutral-400 text-sm leading-relaxed"><HighlightedText text={step.description} /></p>
                {step.tip && (
                  <div className="mt-3 p-3 bg-indigo-900/30 border border-indigo-500/50 rounded-lg flex items-start gap-3">
                    <LightBulbIcon className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h6 className="font-semibold text-indigo-400">Pro-Tip</h6>
                        <p className="text-indigo-300/80 text-sm"><HighlightedText text={step.tip} /></p>
                    </div>
                  </div>
                )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};