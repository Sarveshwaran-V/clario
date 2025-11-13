
import React, { useState, useCallback, useEffect } from 'react';
import { UrlInputForm } from './components/UrlInputForm';
import { NameInputForm } from './components/NameInputForm';
import { GuideDisplay } from './components/GuideDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { HistoryView } from './components/HistoryView';
import { TopicSelector } from './components/TopicSelector';
import { ClarioLogoIcon, HistoryIcon, SettingsIcon, CloseIcon } from './components/icons';
import { explainToolFromUrl, analyzePageTopics, explainToolFromName } from './services/geminiService';
import { addToHistory } from './services/storageService';
import type { ToolExplanation, HistoryItem, PageTopic } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'main' | 'history'>('main');
  const [inputMode, setInputMode] = useState<'url' | 'name'>('url');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<ToolExplanation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [topics, setTopics] = useState<PageTopic[] | null>(null);
  const [cachedTopics, setCachedTopics] = useState<PageTopic[] | null>(null);
  const [analyzedToolName, setAnalyzedToolName] = useState<string>('');

  const handleSuccessfulExplanation = useCallback(async (result: ToolExplanation, url?: string) => {
    setExplanation(result);
    setCurrentUrl(url || '');
    await addToHistory(result, url);
  }, []);

  const getExplanation = useCallback(async (url: string, toolName: string, topic: string) => {
    setIsLoading(true);
    setError(null);
    setExplanation(null);

    try {
      const result = await explainToolFromUrl(url, toolName, topic);
      await handleSuccessfulExplanation(result, url);
    } catch (err) {
      console.error(err);
      setError('Failed to get explanation. The tool might be too new or obscure. Please try another URL.');
    } finally {
      setIsLoading(false);
    }
  }, [handleSuccessfulExplanation]);

  const handleFormSubmit = useCallback(async (url: string) => {
    if (!url) {
      setError('Please enter a valid URL.');
      return;
    }
    
    setView('main'); // Ensure we are on the main view
    setIsLoading(true);
    setError(null);
    setExplanation(null);
    setTopics(null);
    setCachedTopics(null);
    setCurrentUrl(url);

    try {
      const { toolName, topics: availableTopics } = await analyzePageTopics(url);
      
      if (!toolName || availableTopics.length === 0) {
        setError('Could not identify a specific tool or project at this URL. Please try a different one.');
        setIsLoading(false);
        return;
      }
      
      setAnalyzedToolName(toolName);
      setCachedTopics(availableTopics);

      if (availableTopics.length > 1) {
        setTopics(availableTopics);
        setIsLoading(false); 
      } else {
        await getExplanation(url, toolName, availableTopics[0]?.title || 'A general overview');
      }
    } catch (err) {
      console.error(err);
      setError('Could not analyze the URL. Please check the URL and try again.');
      setIsLoading(false);
    }
  }, [getExplanation]);

  const handleNameSubmit = useCallback(async (name: string) => {
    if (!name) {
      setError('Please enter a tool name.');
      return;
    }
    
    setView('main');
    setIsLoading(true);
    setError(null);
    setExplanation(null);
    setTopics(null);
    setCurrentUrl(''); // No URL for this flow

    try {
      const result = await explainToolFromName(name);
      await handleSuccessfulExplanation(result); // No URL passed
    } catch (err) {
      console.error(err);
      setError('Failed to get explanation. The tool might be too new or obscure. Please try another name.');
    } finally {
      setIsLoading(false);
    }
  }, [handleSuccessfulExplanation]);

  const handleTopicSelect = useCallback(async (topic: string) => {
      setTopics(null);
      await getExplanation(currentUrl, analyzedToolName, topic);
  }, [currentUrl, analyzedToolName, getExplanation]);

  const handleReset = useCallback(() => {
    setExplanation(null);
    setError(null);
    setCurrentUrl('');
    setTopics(null);
    setCachedTopics(null);
    setInputMode('url');
    setView('main');
    setAnalyzedToolName('');
  }, []);

  const handleSelectHistoryItem = useCallback((item: HistoryItem) => {
    setExplanation(item);
    setCurrentUrl(item.url || '');
    setError(null);
    setTopics(null);
    setIsLoading(false);
    setView('main');
  }, []);
  
  const handleBackToTopics = useCallback(() => {
    if (cachedTopics) {
        setExplanation(null);
        setError(null);
        setTopics(cachedTopics);
    }
  }, [cachedTopics]);

  const navigateToHistory = useCallback(() => {
    setError(null);
    setExplanation(null);
    setView('history');
  }, []);

  const hasContent = isLoading || !!error || !!topics || !!explanation;
  const isInitialState = !hasContent && view === 'main';

  return (
    <div className="h-full overflow-y-auto bg-black text-neutral-200 p-4 sm:p-6 flex flex-col font-sans">
      <header className="pb-4 shrink-0">
        <div className="flex justify-between items-center">
          <button onClick={handleReset} className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-neutral-400 rounded-md">
            <ClarioLogoIcon className="w-6 h-6 text-white" />
            <span className="font-bold text-lg text-white">Clario</span>
          </button>
          <div className="flex items-center gap-4">
             { !topics && (
                <>
                    <button onClick={navigateToHistory} aria-label="History" className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-neutral-400 rounded-full">
                    <HistoryIcon className="w-5 h-5 text-neutral-400 hover:text-white transition" />
                    </button>
                    <button aria-label="Settings" className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-neutral-400 rounded-full">
                    <SettingsIcon className="w-5 h-5 text-neutral-400 hover:text-white transition" />
                    </button>
                </>
             )}
             { topics && (
                 <button onClick={handleReset} aria-label="Close" className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-neutral-400 rounded-full">
                    <CloseIcon className="w-6 h-6 text-neutral-400 hover:text-white transition" />
                 </button>
             )}
          </div>
        </div>
        { !topics && <div className="border-b border-neutral-800 mt-4"></div> }
      </header>

      <main className="flex-grow flex flex-col pt-6">
        {view === 'history' ? (
          <HistoryView onSelect={handleSelectHistoryItem} onBack={() => setView('main')} />
        ) : (
          <>
            {isLoading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
            {topics && <TopicSelector topics={topics} url={currentUrl} onSelect={handleTopicSelect} />}
            {explanation && (
              <GuideDisplay 
                explanation={explanation} 
                url={currentUrl}
                onReset={handleReset}
                onBack={cachedTopics && cachedTopics.length > 1 ? handleBackToTopics : undefined}
              />
            )}
            {isInitialState && (
              <div className="text-center flex-grow flex flex-col justify-center animate-fade-in">
                <div className="max-w-sm mx-auto w-full px-4">
                    <h2 className="text-3xl font-bold text-white mb-3">AI-Powered Guides</h2>
                    <p className="text-neutral-400 mb-8">
                      Understand any tool, instantly. Analyze a URL, a page, or just enter a name to get started.
                    </p>
                    
                    <div className="flex bg-neutral-800/50 p-1 rounded-lg mb-6 border border-neutral-700">
                      <button 
                        onClick={() => setInputMode('url')}
                        className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-colors ${inputMode === 'url' ? 'bg-neutral-200 text-black' : 'text-neutral-400 hover:bg-neutral-700/50'}`}
                      >
                        By URL
                      </button>
                      <button 
                        onClick={() => setInputMode('name')}
                        className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-colors ${inputMode === 'name' ? 'bg-neutral-200 text-black' : 'text-neutral-400 hover:bg-neutral-700/50'}`}
                      >
                        By Name
                      </button>
                    </div>

                    {inputMode === 'url' ? (
                      <UrlInputForm onSubmit={handleFormSubmit} isLoading={isLoading} />
                    ) : (
                      <NameInputForm onSubmit={handleNameSubmit} isLoading={isLoading} />
                    )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;