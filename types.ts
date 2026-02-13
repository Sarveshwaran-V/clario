
export interface WorkflowStep {
  title: string;
  description: string;
}

export interface KeyAction {
  name: string;
  description: string;
}

export interface ToolExplanation {
  toolName: string;
  tagline: string;
  summary: string;
  workflow: WorkflowStep[];
  keyActions: KeyAction[];
  suggestedQuestions: string[];
  suggestedWorkflows: string[];
}

export interface SuggestedTool {
    name: string;
    description: string;
    reasoning: string;
    tags: string[];
}

export interface HistoryItem extends ToolExplanation {
  url?: string;
  timestamp: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface DetailedWorkflowStep {
  title: string;
  description: string;
  tip?: string;
}

export type GeneratedWorkflow = DetailedWorkflowStep[];

export interface PageTopic {
  icon: string;
  title: string;
  description: string;
}
