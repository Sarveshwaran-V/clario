import React from 'react';
import type { SuggestedTool } from '../types';

interface ToolSuggestionListProps {
    tools: SuggestedTool[];
    onSelectTool: (toolName: string) => void;
}

export const ToolSuggestionList: React.FC<ToolSuggestionListProps> = ({ tools, onSelectTool }) => {
    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <h3 className="text-xl font-semibold text-white mb-6">Recommended Tools</h3>
            <div className="grid gap-4">
                {tools.map((tool, index) => (
                    <div
                        key={index}
                        className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-blue-500/50 transition-colors group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
                                {tool.name}
                            </h4>
                            <button
                                onClick={() => onSelectTool(tool.name)}
                                className="text-xs bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 rounded-full transition-colors border border-neutral-700"
                            >
                                Get Guide →
                            </button>
                        </div>

                        <p className="text-neutral-300 text-sm mb-3">
                            {tool.description}
                        </p>

                        <div className="bg-blue-900/20 border border-blue-900/30 rounded-lg p-3 mb-4">
                            <p className="text-xs text-blue-200">
                                <span className="font-semibold text-blue-400">Why this tool:</span> {tool.reasoning}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {tool.tags.map((tag, i) => (
                                <span key={i} className="text-xs text-neutral-500 bg-neutral-950 px-2 py-1 rounded">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
