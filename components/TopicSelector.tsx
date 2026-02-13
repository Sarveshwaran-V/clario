import React, { useState, useMemo } from 'react';
import type { PageTopic } from '../types';
import {
  RepositoryIcon,
  FeatureIcon,
  InstallationIcon,
  ApiIcon,
  SomethingElseIcon,
  ArrowRightIcon,
  DesignFileIcon,
  DocumentTextIcon,
} from './icons';

interface TopicSelectorProps {
  topics: PageTopic[];
  url: string;
  onSelect: (topic: string) => void;
}

const iconMap: { [key: string]: React.FC<{className?: string}> } = {
  Repository: RepositoryIcon,
  Feature: FeatureIcon,
  Installation: InstallationIcon,
  API: ApiIcon,
  DesignFile: DesignFileIcon,
  Document: DocumentTextIcon,
  Other: SomethingElseIcon,
};

export const TopicSelector: React.FC<TopicSelectorProps> = ({ topics, url, onSelect }) => {
  const [customTopic, setCustomTopic] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleTopicClick = (topicTitle: string) => {
    onSelect(topicTitle);
  };

  const handleOtherTopicClick = () => {
    setShowCustomInput(true);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTopic.trim()) {
      onSelect(customTopic.trim());
    }
  };

  const mainTopics = useMemo(() => topics.filter(t => t.title.toLowerCase() !== 'something else').slice(0, 3), [topics]);
  const somethingElseTopic = useMemo(() => topics.find(t => t.title.toLowerCase() === 'something else'), [topics]);

  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in pb-8">
        <div className="text-left mb-8">
            <h1 className="text-3xl font-bold text-white">Help us understand this page.</h1>
            <p className="text-neutral-400 mt-2">
                Which of these best describes what you want to learn about <strong className="text-neutral-300 break-all">{url}</strong>?
            </p>
        </div>
        <div className="space-y-3">
            {mainTopics.map((topic) => {
                const IconComponent = iconMap[topic.icon] || RepositoryIcon;
                return (
                    <button 
                        key={topic.title} 
                        onClick={() => handleTopicClick(topic.title)}
                        className="w-full flex items-center gap-4 text-left p-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-all group"
                    >
                        <div className="flex-shrink-0 p-3 bg-neutral-800 group-hover:bg-neutral-700 rounded-lg transition-colors">
                            <IconComponent className="w-6 h-6 text-neutral-300" />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-semibold text-white">{topic.title}</h2>
                            <p className="text-neutral-400 text-sm">{topic.description}</p>
                        </div>
                        <svg className="w-5 h-5 text-neutral-500 group-hover:text-white transition-colors transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                );
            })}

            {somethingElseTopic && !showCustomInput && (
                 <button 
                    key={somethingElseTopic.title} 
                    onClick={handleOtherTopicClick}
                    className="w-full flex items-center gap-4 text-left p-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-all group"
                >
                    <div className="flex-shrink-0 p-3 bg-neutral-800 group-hover:bg-neutral-700 rounded-lg transition-colors">
                        <SomethingElseIcon className="w-6 h-6 text-neutral-300" />
                    </div>
                    <div className="flex-1">
                        <h2 className="font-semibold text-white">{somethingElseTopic.title}</h2>
                        <p className="text-neutral-400 text-sm">{somethingElseTopic.description}</p>
                    </div>
                    <svg className="w-5 h-5 text-neutral-500 group-hover:text-white transition-colors transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )}
            
            {showCustomInput && (
                <form onSubmit={handleCustomSubmit} className="pt-2 animate-fade-in">
                     <div 
                        className="flex items-center bg-neutral-800 border border-neutral-700 rounded-xl transition-all focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-black focus-within:ring-indigo-500"
                    >
                        <label htmlFor="custom-topic-input" className="sr-only">Specify the topic</label>
                        <input
                        id="custom-topic-input"
                        type="text"
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        placeholder="e.g., Contribution guidelines"
                        className="flex-grow bg-transparent py-3 px-4 text-white placeholder-neutral-500 focus:outline-none"
                        autoFocus
                        required
                        />
                        <button
                        type="submit"
                        disabled={!customTopic.trim()}
                        className="flex-shrink-0 p-3 text-neutral-500 hover:text-white disabled:text-neutral-600 disabled:cursor-not-allowed transition-colors"
                        aria-label="Explain custom topic"
                        >
                            <ArrowRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            )}
        </div>
    </div>
  );
};