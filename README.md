# Clario - AI-Powered Guide Generator

An intelligent web application that analyzes any URL or tool name and generates comprehensive, beginner-friendly guides using Google's Gemini AI.

## Features

✨ **Analyze URLs** - Submit any website URL and get an AI-generated guide about the tool/product
📚 **Tool Exploration** - Search by tool name to get detailed explanations and workflows
🔍 **Smart Topic Selection** - The AI automatically identifies different ways to explain a tool
📋 **Step-by-Step Workflows** - Generate custom workflows for accomplishing specific tasks
💬 **Interactive Chat** - Ask follow-up questions about any guide
📖 **Guide Display** - Beautiful, easy-to-read explanations with key actions and suggested next steps

## Tech Stack

- **Frontend:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS 4
- **AI Model:** Google Gemini 2.5 (Pro & Flash)
- **API:** Google Generative AI SDK

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Sarveshwaran-V/clario.git
   cd clario
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file and add your API key:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and visit: `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## How to Use

1. **Enter a URL or Tool Name**
   - Paste any website URL (e.g., GitHub repo, product homepage)
   - Or search by tool name (e.g., "React", "Figma")

2. **Select a Topic**
   - The AI analyzes and suggests relevant topics to learn about
   - Choose how you want the tool explained

3. **Get Your Guide**
   - Read a comprehensive, beginner-friendly explanation
   - Explore the workflow, key actions, and suggested next steps

4. **Ask Questions**
   - Chat with the AI about the guide
   - Generate custom workflows for specific tasks

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variable: `GEMINI_API_KEY`
4. Deploy! 🚀

Your app will be live in seconds with automatic deployments on every push.

## Project Structure

```
clario-webapp/
├── components/          # React components
├── services/           # Gemini API integration
├── App.tsx            # Main application
├── index.tsx          # Entry point
├── vite.config.ts     # Vite configuration
└── README.md          # This file
```

## Environment Variables

- `GEMINI_API_KEY` - Your Google Gemini API key (required)

## Model Strategy

The app uses a strategic combination of Gemini models:

- **Gemini 2.5 Pro** - Heavy lifting tasks:
  - Analyzing URLs and extracting real content
  - Generating comprehensive guides
  - Deep reasoning about tools and workflows

- **Gemini 2.5 Flash** - Quick supporting tasks:
  - Generating custom workflows
  - Answering follow-up questions
  - Real-time chat interactions

## License

This project is open source and available under the MIT License.

## Author

Created by [Sarveshwaran V](https://github.com/Sarveshwaran-V)
