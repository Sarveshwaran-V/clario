
import React, { useState } from 'react';
import type { ToolExplanation, ChatMessage, GeneratedWorkflow, WorkflowStep, DetailedWorkflowStep } from '../types';
import { 
  CloseIcon, 
  DocumentTextIcon, 
  WorkflowIcon, 
  StarIcon, 
  ChevronDownIcon, 
  ThumbUpIcon, 
  ThumbDownIcon,
  WandSparklesIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  LightBulbIcon,
  ArrowLeftIcon,
} from './icons';
import { ChatBox } from './ChatBox';
import { WorkflowGenerator } from './WorkflowGenerator';
import { askFollowUpQuestion } from '../services/geminiService';

interface GuideDisplayProps {
  explanation: ToolExplanation;
  url: string;
  onReset: () => void;
  onBack?: () => void;
}

interface AccordionItemProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
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

// A reusable component to render workflow steps consistently
const WorkflowSteps: React.FC<{ workflow: (WorkflowStep[] | DetailedWorkflowStep[]) }> = ({ workflow }) => (
  <ol className="space-y-4">
    {workflow.map((step, index) => {
      // Defensive check to ensure step is an object.
      if (typeof step !== 'object' || step === null) {
        console.warn('Skipping malformed workflow step:', step);
        return null; // Skip rendering this step if it's not a valid object.
      }
      
      return (
        <li key={index} className="flex items-start gap-4">
          <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 bg-neutral-700 rounded-full text-sm font-semibold text-white">
            {index + 1}
          </div>
          <div className="flex-1">
            <h5 className="font-semibold text-white">{step.title}</h5>
            <p className="text-neutral-400 text-sm leading-relaxed"><HighlightedText text={step.description} /></p>
            {'tip' in step && step.tip && (
              <div className="mt-3 p-3 bg-neutral-800/60 border border-neutral-700 rounded-lg flex items-start gap-3">
                <LightBulbIcon className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h6 className="font-semibold text-neutral-300">Pro-Tip</h6>
                  <p className="text-neutral-400 text-sm"><HighlightedText text={step.tip} /></p>
                </div>
              </div>
            )}
          </div>
        </li>
      );
    })}
  </ol>
);


const AccordionItem: React.FC<AccordionItemProps> = ({ title, icon, isOpen, onToggle, children }) => {
  return (
    <div className="bg-neutral-900 rounded-lg">
      <button
        className="flex justify-between items-center w-full p-4 text-left text-neutral-200"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold">{title}</span>
        </div>
        <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 pt-0 text-neutral-300">{children}</div>
      </div>
    </div>
  );
};

export const GuideDisplay: React.FC<GuideDisplayProps> = ({ explanation, url, onReset, onBack }) => {
  const [openAccordion, setOpenAccordion] = useState<string>('summary');
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  // State for chat functionality
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<GeneratedWorkflow | null>(null);
  
  const { toolName, tagline, summary, workflow, keyActions } = explanation;

  const handleToggle = (accordionName: string) => {
    setOpenAccordion(openAccordion === accordionName ? '' : accordionName);
  };

  const handleWorkflowGenerated = (workflow: GeneratedWorkflow) => {
    setGeneratedWorkflow(workflow);
    setMessages([]); // Reset chat for the new context
    setOpenAccordion('chat'); // Automatically open chat to show the result
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isChatLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: content.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsChatLoading(true);

    try {
      const response = await askFollowUpQuestion(userMessage.content, explanation, newMessages, generatedWorkflow);
      const modelMessage: ChatMessage = { role: 'model', content: response };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'model',
        content: "Sorry, I couldn't process that. Please try again."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };


  return (
    <div className="animate-fade-in max-w-2xl mx-auto w-full">
      <div className="bg-neutral-950 rounded-xl shadow-2xl overflow-hidden">
        <header className="p-4 flex justify-between items-start">
          <div className="flex items-center gap-2">
             {onBack ? (
              <button onClick={onBack} className="text-neutral-500 hover:text-white transition-colors" aria-label="Go back to topic selection">
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
            ) : (
              <SparklesIcon className="w-6 h-6 text-neutral-400" />
            )}
          </div>
          <h2 className="text-lg font-bold text-center text-neutral-100 flex-1">{toolName}</h2>
          <button onClick={onReset} className="text-neutral-500 hover:text-white transition-colors" aria-label="Close guide">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="px-6 pb-6 text-center">
            <h1 className="text-2xl font-bold text-white">{tagline}</h1>
            {url && (
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-neutral-400 transition-colors mt-2 inline-block text-sm">
                  View on {new URL(url).hostname.replace('www.','')}
              </a>
            )}
        </div>

        <main className="px-2">
          <div className="space-y-2">
            <AccordionItem title="Summary" icon={<DocumentTextIcon className="w-5 h-5"/>} isOpen={openAccordion === 'summary'} onToggle={() => handleToggle('summary')}>
              <p className="text-neutral-300 leading-relaxed"><HighlightedText text={summary} /></p>
            </AccordionItem>
            
            <AccordionItem title="Core Workflow" icon={<WorkflowIcon className="w-5 h-5"/>} isOpen={openAccordion === 'workflow'} onToggle={() => handleToggle('workflow')}>
               <WorkflowSteps workflow={workflow} />
            </AccordionItem>

            <AccordionItem title="Key Features" icon={<StarIcon className="w-5 h-5"/>} isOpen={openAccordion === 'features'} onToggle={() => handleToggle('features')}>
              <ul className="space-y-3">
                {keyActions.map((action, index) => (
                  <li key={index}>
                    <h4 className="font-semibold text-white">{action.name}</h4>
                    <p className="text-neutral-400 text-sm"><HighlightedText text={action.description} /></p>
                  </li>
                ))}
              </ul>
            </AccordionItem>

             <AccordionItem title="Guided Workflows" icon={<WandSparklesIcon className="w-5 h-5"/>} isOpen={openAccordion === 'generator'} onToggle={() => handleToggle('generator')}>
                <WorkflowGenerator 
                    toolName={explanation.toolName}
                    suggestedWorkflows={explanation.suggestedWorkflows}
                    onWorkflowGenerated={handleWorkflowGenerated}
                />
            </AccordionItem>
            
            <AccordionItem title="Ask a Follow-up" icon={<ChatBubbleLeftRightIcon className="w-5 h-5"/>} isOpen={openAccordion === 'chat'} onToggle={() => handleToggle('chat')}>
               {generatedWorkflow && (
                <div className="mb-6 pb-6 border-b border-neutral-800">
                  <h4 className="font-bold text-white mb-4">Your Custom Workflow:</h4>
                  <WorkflowSteps workflow={generatedWorkflow} />
                </div>
               )}
               <ChatBox 
                  explanation={explanation}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isChatLoading={isChatLoading}
                  currentMessage={currentMessage}
                  setCurrentMessage={setCurrentMessage}
                  hasCustomContext={!!generatedWorkflow}
               />
            </AccordionItem>
          </div>
        </main>
        
        <footer className="text-center p-6 space-y-4">
            <p className="text-sm text-neutral-500">Was this guide helpful?</p>
            <div className="flex justify-center items-center gap-3">
                <button 
                  onClick={() => setFeedback('like')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${feedback === 'like' ? 'bg-green-500/20 text-green-400' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
                  aria-label="Helpful"
                >
                    <ThumbUpIcon className="w-4 h-4" />
                    <span>Helpful</span>
                </button>
                 <button 
                  onClick={() => setFeedback('dislike')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${feedback === 'dislike' ? 'bg-red-500/20 text-red-400' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
                  aria-label="Not helpful"
                >
                    <ThumbDownIcon className="w-4 h-4" />
                    <span>Not Helpful</span>
                </button>
            </div>
            <a href="#" className="text-xs text-neutral-600 hover:text-neutral-500 underline">Report an Issue</a>
        </footer>
      </div>
    </div>
  );
};
