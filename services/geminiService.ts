import { GoogleGenAI, Type } from "@google/genai";
import type { ToolExplanation, GeneratedWorkflow, ChatMessage, PageTopic } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Extracts a JSON object from a string that may contain markdown code fences.
 * @param text The text response from the model.
 * @returns The parsed JSON object.
 * @throws An error if no valid JSON is found or if parsing fails.
 */
function extractJson(text: string): any {
  // Look for a JSON block with markdown fences
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = text.match(jsonRegex);

  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      console.error("Failed to parse extracted JSON:", match[1], e);
      throw new Error("Invalid JSON format found within the code block.");
    }
  }

  // If no block is found, try parsing the whole string as a fallback.
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse raw text as JSON:", text, e);
    throw new Error("No valid JSON found in the model's response.");
  }
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    toolName: {
      type: Type.STRING,
      description: 'The official name of the software tool or GitHub project.'
    },
    tagline: {
      type: Type.STRING,
      description: 'A short, descriptive, one-sentence tagline for the tool that captures its main purpose (e.g., "An open-source JavaScript library for building user interfaces.").'
    },
    summary: {
      type: Type.STRING,
      description: 'A concise, one-paragraph summary explaining what the tool is for, its primary function, and who typically uses it. Avoid generic marketing language. Use backticks (`) around any technical terms, tool names, or code snippets for emphasis.'
    },
    workflow: {
      type: Type.ARRAY,
      description: 'A concrete, step-by-step workflow for a fundamental, primary use case of the tool. Should contain 3-5 actionable steps a new user would perform.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'A short, action-oriented title for the workflow step (e.g., "Create and Share a Wireframe").'
          },
          description: {
            type: Type.STRING,
            description: 'A one or two-sentence explanation of how to perform this step in plain English. Use backticks (`) around any technical terms, file names, or commands.'
          },
        },
        required: ['title', 'description']
      }
    },
    keyActions: {
      type: Type.ARRAY,
      description: 'A list of 3-4 specific, key features or actions that are fundamental to using this tool (e.g., "Real-time Collaboration", "Vector Networks").',
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: 'The name of the key action (e.g., "Component Inspector").'
          },
          description: {
            type: Type.STRING,
            description: 'A brief description of what this action does. Use backticks (`) around any technical terms for emphasis.'
          }
        },
        required: ['name', 'description']
      }
    },
    suggestedQuestions: {
      type: Type.ARRAY,
      description: 'A list of 3-4 common, insightful follow-up questions a new user might ask about this tool. The questions should be phrased from the user\'s perspective.',
      items: {
        type: Type.STRING
      }
    },
    suggestedWorkflows: {
        type: Type.ARRAY,
        description: 'A list of 3-4 specific, goal-oriented tasks a user might want to accomplish. These should be phrased as commands, like "Create my first component" or "Set up a new project".',
        items: {
            type: Type.STRING
        }
    }
  },
  required: ['toolName', 'tagline', 'summary', 'workflow', 'keyActions', 'suggestedQuestions', 'suggestedWorkflows']
};

const workflowSchema = {
  type: Type.OBJECT,
  properties: {
    workflow: {
      type: Type.ARRAY,
      description: 'An array of steps for the requested workflow.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'A short, clear, action-oriented title for the step.'
          },
          description: {
            type: Type.STRING,
            description: 'A detailed, beginner-friendly explanation of how to perform this step. Use backticks (\`) to highlight specific commands, filenames, or technical terms.'
          },
          tip: {
            type: Type.STRING,
            description: 'An optional but highly encouraged pro-tip, best practice, or shortcut related to this step that would be genuinely helpful to a new user. Use backticks (`) to highlight any important terms.'
          }
        },
        required: ['title', 'description']
      }
    }
  },
  required: ['workflow']
};

export const analyzePageTopics = async (url: string): Promise<{ toolName: string; topics: PageTopic[] }> => {
  const prompt = `
    Analyze the LIVE content of the URL: ${url}

    Your goal is to identify the primary "tool" a user wants to understand and suggest topics for explanation.

    **CRITICAL RULES FOR IDENTIFYING THE "TOOL":**
    1.  **If the URL is for a specific project on a known PLATFORM (like figma.com, miro.com, notion.so, canva.com, linear.app):**
        - The \`toolName\` MUST be the platform itself (e.g., "Figma", "Notion").
        - The \`topics\` should then relate to the *content* on that platform (e.g., for a Figma URL, a topic could be "This Figma design file").
    2.  **If the URL is for a specific project on a CODE REPOSITORY (like github.com, gitlab.com, bitbucket.org, sourceforge.net):**
        - The \`toolName\` MUST be the name of the repository or project (e.g., for \`github.com/facebook/react\`, the toolName is "React").
        - The \`topics\` should relate to the repository (e.g., "The entire repository", "Installation & Setup").
    3.  **For all other URLs (e.g., a product homepage like vercel.com):**
        - The \`toolName\` is the name of the product or open-source project featured on the page.

    After identifying the tool, identify different ways a user might want this page explained.

    You MUST return a JSON object with two keys: "toolName" and "topics".
    "toolName" must be a string containing the primary tool name based on the rules above.
    "topics" must be a JSON array of objects. Each object should have:
    1. "icon": A string name for an icon. Choose from: "Repository", "Feature", "Installation", "API", "DesignFile", "Document", "Other".
    2. "title": A short, descriptive title for the topic.
    3. "description": A brief one-sentence explanation of the topic.

    Always include an "Other" option in the topics array.

    Example for 'https://www.figma.com/design/OMT9eECLPgRGRbSTBKx0xU/arTruth':
    \`\`\`json
    {
      "toolName": "Figma",
      "topics": [
        { "icon": "DesignFile", "title": "The 'arTruth' design file", "description": "Explain the contents of this specific design." },
        { "icon": "Feature", "title": "Figma's core features", "description": "A general overview of Figma itself." },
        { "icon": "Other", "title": "Something else", "description": "Please specify another topic." }
      ]
    }
    \`\`\`

    Example for 'github.com/facebook/react':
    \`\`\`json
    {
      "toolName": "React",
      "topics": [
        { "icon": "Repository", "title": "The entire repository", "description": "A high-level project overview." },
        { "icon": "Installation", "title": "Installation & Setup", "description": "How to get started with the project." },
        { "icon": "API", "title": "API Documentation", "description": "Understand the available functions." },
        { "icon": "Other", "title": "Something else", "description": "Please specify the topic below." }
      ]
    }
    \`\`\`

    Your response MUST be a single JSON code block. Do not add any text before or after it.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.1,
    },
  });

  const jsonText = response.text.trim();
  try {
    const parsed = extractJson(jsonText);
    return { toolName: parsed.toolName, topics: parsed.topics || [] };
  } catch (e) {
    console.error("Failed to parse context JSON from Gemini:", jsonText, e);
    throw new Error("Received an invalid response when analyzing URL context.");
  }
};

export const explainToolFromUrl = async (url: string, toolName: string, topic: string): Promise<ToolExplanation> => {
  const prompt = `
    You are an expert content analysis bot. Your ONLY function is to read the live content from a given URL and structure it into a JSON guide.

    **PRIMARY DIRECTIVE: DO NOT USE ANY PRE-EXISTING KNOWLEDGE.** Your internal knowledge about software tools might be outdated. The content at the provided URL is the only source of truth. You MUST base your entire response exclusively on the information you find at the URL right now. If the information on the page for "${toolName}" contradicts your prior knowledge, you MUST prioritize the information from the URL.

    - **URL to Analyze:** ${url}
    - **Tool Name:** "${toolName}"
    - **Specific Topic to Focus On:** "${topic}"

    Based *only* on the content of the URL, generate a guide for a new user. The entire guide (summary, workflow, etc.) must be focused on the specified topic. For instance, if the topic is "Installation," the summary should introduce the tool from a setup perspective and the workflow must detail the installation steps.

    Your entire output MUST be a single JSON code block. Do not add any text before or after it. It must adhere to this structure:
    - "toolName": The name of the tool, which must be "${toolName}".
    - "tagline": Find the main tagline or headline on the page, relevant to the topic if possible.
    - "summary": A one-paragraph summary explaining the tool's purpose, based *strictly* on the text from the URL and focused on the chosen topic. Use backticks (\`) for technical terms.
    - "workflow": A 3-5 step workflow for a primary use case found on the page, relevant to the topic. EACH step MUST be an object with "title" and "description".
    - "keyActions": 3-4 key features mentioned on the page, relevant to the topic. EACH feature MUST be an object with "name" and "description".
    - "suggestedQuestions": An array of 3-4 insightful follow-up questions a user might have after reading the page's content about the topic.
    - "suggestedWorkflows": An array of 3-4 goal-oriented tasks a user could accomplish based on the information on the page, related to the topic.

    Example format:
    \`\`\`json
    {
      "toolName": "${toolName}",
      "tagline": "The main headline from the webpage.",
      "summary": "A summary based strictly on the URL's content, explaining what the tool does and who it's for, with a focus on the specific topic.",
      "workflow": [
        { "title": "Step 1: Found on Page", "description": "The first action described on the page related to the topic." },
        { "title": "Step 2: Core Action from Page", "description": "The main task a user can perform, as described on the page and related to the topic." }
      ],
      "keyActions": [
        { "name": "Feature Mentioned on Page", "description": "A description of a feature mentioned on the page, related to the topic." }
      ],
      "suggestedQuestions": [
        "How do I use feature X, which was mentioned on the page?",
        "What is the pricing model, as described on the page?"
      ],
      "suggestedWorkflows": [
        "Perform a task described on the homepage",
        "Sign up for the beta as mentioned on the page"
      ]
    }
    \`\`\`
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: {
      temperature: 0.3,
      tools: [{googleSearch: {}}],
    },
  });

  const jsonText = response.text.trim();
  try {
    const parsedExplanation = extractJson(jsonText) as ToolExplanation;
    // Ensure the tool name matches the requested context, as the model can sometimes deviate.
    if (!parsedExplanation.toolName || parsedExplanation.toolName.toLowerCase() !== toolName.toLowerCase()) {
        parsedExplanation.toolName = toolName;
    }
    return parsedExplanation;
  } catch (e) {
    console.error("Failed to parse JSON from Gemini:", jsonText, e);
    throw new Error("Received an invalid response from the AI model. The content at the URL might be unreadable or the format is unexpected.");
  }
};

export const explainToolFromName = async (toolName: string): Promise<ToolExplanation> => {
  const prompt = `
    You are an AI assistant designed to be an expert on all software tools and platforms. Your goal is to provide a high-quality, beginner-friendly guide to any tool, based on its name.

    The user has asked for an explanation of: "${toolName}"

    Your task is to generate a clear, insightful, and actionable guide for a brand new user who knows nothing about this tool. Use your general knowledge about the software.

    The guide must be in the provided JSON format and include:
    1.  **toolName**: The name of the tool. It must be "${toolName}".
    2.  **tagline**: A short, descriptive, one-sentence tagline for the tool that captures its main purpose (e.g., "An open-source JavaScript library for building user interfaces.").
    3.  **summary**: A concise, one-paragraph summary explaining what the tool is for, its primary function, and who typically uses it. Avoid generic marketing language. Use backticks (\`) around any technical terms, tool names, or code snippets for emphasis.
    4.  **workflow**: A concrete, step-by-step workflow for a fundamental, primary use case. This should be a real task a user would perform. For a design tool, it could be "Creating and Sharing a Simple Wireframe". For a code library, it could be "Setting up a project and rendering a component". Each step must be actionable. The workflow should have 3-5 steps.
    5.  **keyActions**: A list of 3-4 specific, key features or actions that are fundamental to using this tool. For example, for Figma, this could be "Real-time Collaboration", "Vector Networks", or "Prototyping". Avoid vague terms like "Explore Features".
    6.  **suggestedQuestions**: Generate 3-4 common but insightful questions a beginner might ask, phrased from their perspective. For example, for Figma: "How do I collaborate with my team?" or "What's the difference between a Frame and a Group?".
    7.  **suggestedWorkflows**: Generate 3-4 specific, goal-oriented tasks a user might want to accomplish. These should be phrased as commands, like "Create my first Figma component" or "Set up a new React project".

    Your response MUST conform to the JSON schema.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
      temperature: 0.5,
    },
  });

  const jsonText = response.text.trim();
  try {
    const parsedExplanation = JSON.parse(jsonText) as ToolExplanation;
    // Ensure the tool name matches the requested context, as the model can sometimes deviate.
    if (!parsedExplanation.toolName || parsedExplanation.toolName.toLowerCase() !== toolName.toLowerCase()) {
        parsedExplanation.toolName = toolName;
    }
    return parsedExplanation;
  } catch (e) {
    console.error("Failed to parse JSON from Gemini:", jsonText);
    throw new Error("Received an invalid response from the AI model.");
  }
};

export const generateWorkflow = async (goal: string, toolName: string): Promise<GeneratedWorkflow> => {
  const prompt = `
    You are an AI assistant who is an expert in teaching people how to use software tools.
    A user wants to learn how to perform a specific task in "${toolName}".

    The user's goal is: "${goal}"

    Your task is to generate a detailed, step-by-step workflow that is extremely clear and easy for an absolute beginner to follow. The workflow should have between 3 and 7 steps.

    For each step, provide:
    1.  **title**: A short, action-oriented title.
    2.  **description**: A clear, one or two-sentence explanation of how to perform the step. Use backticks (\`) to highlight specific commands, filenames, or technical terms.
    3.  **tip**: An optional but highly encouraged "pro-tip" or best practice that offers extra value, a shortcut, or a common mistake to avoid. Use backticks (\`) to highlight any important terms.

    Your response MUST be a JSON object that conforms to the provided schema, containing a "workflow" array.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: workflowSchema,
      temperature: 0.4,
    },
  });

  const jsonText = response.text.trim();
  try {
    const parsed = JSON.parse(jsonText);
    return parsed.workflow || [];
  } catch (e) {
    console.error("Failed to parse workflow JSON from Gemini:", jsonText);
    throw new Error("Received an invalid response when generating the workflow.");
  }
};


export const askFollowUpQuestion = async (
  question: string,
  toolExplanation: ToolExplanation,
  chatHistory: ChatMessage[],
  generatedWorkflow: GeneratedWorkflow | null
): Promise<string> => {
  const historyText = chatHistory
    .map(msg => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      // Content is now plain text, so no complex sanitization needed
      return `${role}: ${msg.content}`;
    })
    .join('\n');

  let workflowContext = '';
  if (generatedWorkflow && generatedWorkflow.length > 0) {
    workflowContext = `
    The user was also given this specific step-by-step guide:
    - Custom Workflow: ${JSON.stringify(generatedWorkflow)}
    `;
  }

  const prompt = `
    You are a helpful AI assistant explaining a software tool.
    The user is learning about "${toolExplanation.toolName}".

    The initial explanation you provided was:
    - Summary: ${toolExplanation.summary}
    - Core Workflow: ${JSON.stringify(toolExplanation.workflow.map(s => s.title))}
    - Key Actions: ${JSON.stringify(toolExplanation.keyActions.map(a => a.name))}
    ${workflowContext}

    Here is the conversation so far:
    ${historyText}

    Now, the user has a new question.
    User's Question: "${question}"

    Please provide a concise and helpful answer based on all the context provided (initial explanation, custom workflow, and conversation history). Focus on answering the user's specific question in a way that's easy for a beginner to understand. 
    
    If the question asks "how to" do something, provide a simple, step-by-step guide if possible. Use markdown for formatting like lists and bold text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error asking follow-up question:", error);
    return "I'm sorry, I encountered an error trying to answer that. Please try rephrasing your question.";
  }
};