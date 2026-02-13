
import React, { useState, useCallback } from 'react';
import type { GeneratedWorkflow } from '../types';
import { generateWorkflow } from '../services/geminiService';
import { ErrorMessage } from './ErrorMessage';
import { RocketLaunchIcon, WandSparklesIcon } from './icons';

interface WorkflowGeneratorProps {
  toolName: string;
  suggestedWorkflows: string[];
  onWorkflowGenerated: (workflow: GeneratedWorkflow) => void;
}

const WorkflowLoadingSpinner: React.FC = () => (
  <div role="status" className="flex flex-col items-center justify-center text-center p-6 bg-neutral-800/50 border border-neutral-700 rounded-lg">
    <div className="w-8 h-8 border-4 border-t-cyan-400 border-r-cyan-400 border-b-cyan-400 border-l-transparent rounded-full animate-spin"></div>
    <p className="mt-3 text-neutral-300 font-semibold">Generating Your Custom Workflow...</p>
    <p className="mt-1 text-neutral-400 text-sm">The AI is crafting a step-by-step guide for your task.</p>
  </div>
);

export const WorkflowGenerator: React.FC<WorkflowGeneratorProps> = ({ toolName, suggestedWorkflows, onWorkflowGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customGoal, setCustomGoal] = useState('');
  
  const handleGenerateWorkflow = useCallback(async (goal: string) => {
    if (!goal.trim()) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateWorkflow(goal, toolName);
      if (result.length === 0) {
        setError("Sorry, I couldn't generate a workflow for that request. It might be too complex or unusual. Please try rephrasing it.");
      } else {
        onWorkflowGenerated(result);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while generating the workflow. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [toolName, onWorkflowGenerated]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerateWorkflow(customGoal);
  };

  return (
    <div>
      {isLoading ? (
        <WorkflowLoadingSpinner />
      ) : (
        <div className="animate-fade-in">
          <p className="text-neutral-400 mb-4">Select a common task or describe your own goal to get a step-by-step guide.</p>
          <div className="flex flex-wrap gap-2">
            {suggestedWorkflows.map((goal, index) => (
              <button
                key={index}
                onClick={() => handleGenerateWorkflow(goal)}
                className="flex items-center text-left bg-neutral-800 text-neutral-300 px-3 py-2 rounded-lg hover:bg-neutral-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RocketLaunchIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{goal}</span>
              </button>
            ))}
          </div>
          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-neutral-700"></div>
            <span className="flex-shrink mx-4 text-neutral-500 text-xs font-medium">OR</span>
            <div className="flex-grow border-t border-neutral-700"></div>
          </div>
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={customGoal}
              onChange={e => setCustomGoal(e.target.value)}
              placeholder="e.g., Create my first component"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg py-2.5 px-4 text-white placeholder-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              aria-label="Describe your workflow goal"
            />
            <button
              type="submit"
              disabled={isLoading || !customGoal.trim()}
              className="flex-shrink-0 bg-indigo-600 text-white font-semibold px-4 py-2.5 rounded-md hover:bg-indigo-500 disabled:bg-neutral-600 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              aria-label="Generate Workflow"
            >
              <WandSparklesIcon className="w-5 h-5" />
            </button>
          </form>
           {error && <div className="mt-4"><ErrorMessage message={error} /></div>}
        </div>
      )}
    </div>
  );
};
