import React, { useRef, useEffect } from 'react';
import type { ToolExplanation, ChatMessage } from '../types';
import { UserCircleIcon, SparklesIcon, PaperAirplaneIcon } from './icons';

interface ChatBoxProps {
  explanation: ToolExplanation;
  messages: ChatMessage[];
  onSendMessage: (content: string) => Promise<void>;
  isChatLoading: boolean;
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
  hasCustomContext: boolean;
}

const ChatLoadingIndicator: React.FC = () => (
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
  </div>
);

export const ChatBox: React.FC<ChatBoxProps> = ({ 
  explanation, 
  messages, 
  onSendMessage, 
  isChatLoading,
  currentMessage,
  setCurrentMessage,
  hasCustomContext
}) => {
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages, isChatLoading]);
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSendMessage(currentMessage);
    setCurrentMessage('');
  };
  
  const handleSuggestedQuestionClick = async (question: string) => {
    setCurrentMessage(question);
    await onSendMessage(question);
    setCurrentMessage('');
  };

  return (
    <div>
      <div 
        ref={chatHistoryRef}
        className="h-72 overflow-y-auto space-y-4 pb-4"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <div className="text-center text-neutral-500 pt-8">
            <p>{hasCustomContext ? `Ask anything about the workflow above.` : `Ask me anything about ${explanation.toolName}.`}</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <SparklesIcon className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />}
             <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-neutral-800 text-neutral-300'}`}>
              <div className="prose prose-sm prose-invert" dangerouslySetInnerHTML={{__html: msg.content.replace(/\n/g, '<br />')}}></div>
            </div>
            {msg.role === 'user' && <UserCircleIcon className="w-6 h-6 text-neutral-400 flex-shrink-0 mt-1" />}
          </div>
        ))}
        {isChatLoading && (
          <div className="flex items-start gap-3">
             <SparklesIcon className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
             <div className="max-w-md p-3 rounded-lg bg-neutral-800">
                <ChatLoadingIndicator />
             </div>
          </div>
        )}
      </div>
      <div className="pt-4">
        {messages.length === 0 && !hasCustomContext && explanation.suggestedQuestions && explanation.suggestedQuestions.length > 0 && (
          <div className="mb-4 animate-fade-in">
            <div className="flex flex-wrap gap-2">
              {explanation.suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedQuestionClick(q)}
                  disabled={isChatLoading}
                  className="flex items-center text-left bg-neutral-800 text-neutral-300 px-3 py-2 rounded-lg hover:bg-neutral-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{q}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <form onSubmit={handleFormSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={currentMessage}
            onChange={e => setCurrentMessage(e.target.value)}
            placeholder={`Ask a follow-up...`}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg py-2.5 px-4 text-white placeholder-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            disabled={isChatLoading}
            aria-label="Ask a follow-up question"
          />
          <button
            type="submit"
            disabled={isChatLoading || !currentMessage.trim()}
            className="flex-shrink-0 bg-indigo-600 text-white p-2.5 rounded-full hover:bg-indigo-500 disabled:bg-neutral-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110"
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};