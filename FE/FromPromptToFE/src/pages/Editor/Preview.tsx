
import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';
import { generateCode } from '../../services/geminiService';
import { htmlForPreview } from '../../lib/htmlPreview';

const Preview: React.FC = () => {
  const [generatedTsx, setGeneratedTsx] = useState<string>('// Generating code...');
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [activeFile, setActiveFile] = useState<'index.tsx' | 'index.html'>('index.tsx');
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const cachedTsx = sessionStorage.getItem('last_generated_code');
    const cachedHtml = sessionStorage.getItem('last_generated_html');
    if (cachedTsx) {
      setGeneratedTsx(cachedTsx);
      setGeneratedHtml(cachedHtml || '');
      setIsGenerating(false);
      return;
    }
    const ui = sessionStorage.getItem('last_ui_prompt') || 'A simple landing page';
    const schema = sessionStorage.getItem('last_schema_prompt') || '';

    const triggerGen = async () => {
      const code = await generateCode(ui, schema);
      setGeneratedTsx(code);
      sessionStorage.setItem('last_generated_code', code);
      setIsGenerating(false);
    };

    triggerGen();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden font-display">
      {/* Workspace Header */}
      <header className="h-16 border-b border-slate-200 dark:border-border-dark flex items-center justify-between px-6 bg-white dark:bg-surface-dark z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-xl">auto_awesome</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Generated Code Preview</h1>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${isGenerating ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'} border border-primary/20 flex items-center gap-1`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-amber-500 animate-pulse' : 'bg-primary'}`}></span>
            {isGenerating ? 'Generating...' : 'Ready'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-slate-500">settings</span>
          </button>
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-slate-500">share</span>
          </button>
          <div className="h-8 w-[1px] bg-slate-200 dark:bg-border-dark mx-1"></div>
          <button className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span> Export
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Pane: Code Viewer */}
        <section className="w-1/2 flex flex-col border-r border-slate-200 dark:border-border-dark bg-[#0d1117]">
          <div className="h-10 border-b border-slate-800 flex items-center justify-between px-4 bg-[#161b22] shrink-0">
            <div className="flex items-center gap-4 h-full">
              <div
                className={`h-full border-b-2 px-4 flex items-center gap-2 text-sm font-medium cursor-pointer transition-all ${activeFile === 'index.tsx' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                onClick={() => setActiveFile('index.tsx')}
              >
                <span className="material-symbols-outlined text-sm">code</span> index.tsx
              </div>
              <div
                className={`h-full border-b-2 px-4 flex items-center gap-2 text-sm font-medium cursor-pointer transition-all ${activeFile === 'index.html' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                onClick={() => setActiveFile('index.html')}
              >
                <span className="material-symbols-outlined text-sm">code</span> index.html
              </div>
            </div>
            <button className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-xs uppercase font-bold">
              <span className="material-symbols-outlined text-sm">content_copy</span> Copy
            </button>
          </div>
          <div className="flex-1 overflow-auto bg-[#1e1e1e] custom-scrollbar">
            <SyntaxHighlighter
              language={activeFile === 'index.tsx' ? "tsx" : "html"}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '1rem',
                background: 'transparent',
                fontSize: '0.875rem',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
              }}
              showLineNumbers={true}
            >
              {activeFile === 'index.tsx'
                ? generatedTsx || "// Generating code..."
                : generatedHtml || ""}
            </SyntaxHighlighter>
          </div>
        </section>

        {/* Right Pane: Interaction & Preview */}
        <section className="w-1/2 flex flex-col bg-background-light dark:bg-background-dark">
          {/* Top Section: AI Instructions */}
          <div className="h-2/5 p-6 border-b border-slate-200 dark:border-border-dark flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">psychology</span>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Edit with AI</h2>
            </div>
            <div className="flex-1 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-4 flex flex-col shadow-sm">
              <textarea
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 resize-none font-display text-base"
                placeholder="E.g., 'Make the headline larger and change the button color to deep indigo...'"
              />
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="material-symbols-outlined text-sm">history</span>
                  <span>3 previous revisions</span>
                </div>
                <button className="bg-primary hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-sm">bolt</span> Apply AI Changes
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Section: UI Preview */}
          <div className="h-3/5 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500">visibility</span>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">UI Preview</h2>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-slate-500 hover:text-primary">
                  <span className="material-symbols-outlined text-sm">smartphone</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-primary/10 text-primary border border-primary/20">
                  <span className="material-symbols-outlined text-sm">desktop_windows</span>
                </button>
                <div className="h-4 w-[1px] bg-slate-300 dark:bg-border-dark mx-1"></div>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-slate-500 hover:text-slate-700">
                  <span className="material-symbols-outlined text-sm">refresh</span>
                </button>
              </div>
            </div>
            <div className="flex-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-border-dark overflow-hidden relative group">
              {generatedHtml ? (
                <iframe title="HTML Preview" srcDoc={htmlForPreview(generatedHtml)} className="w-full h-full min-h-[300px]" />
              ) : (
                <div className="w-full h-full p-8 flex flex-col justify-center">
                  <div className="space-y-6 max-w-lg">
                    <div className={`h-12 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg ${isGenerating ? 'animate-pulse' : ''}`}></div>
                    <div className="space-y-3">
                      <div className={`h-4 w-full bg-slate-100 dark:bg-slate-800 rounded ${isGenerating ? 'animate-pulse' : ''}`}></div>
                      <div className={`h-4 w-5/6 bg-slate-100 dark:bg-slate-800 rounded ${isGenerating ? 'animate-pulse' : ''}`}></div>
                    </div>
                    <div className="h-12 w-40 bg-primary/20 rounded-lg border border-primary/30 flex items-center justify-center text-primary font-bold">
                      Get Started
                    </div>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full text-[10px] text-white/70 uppercase tracking-widest border border-white/10">
                {generatedHtml ? 'HTML Preview' : 'Interactive Sandbox'}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Status Bar */}
      <footer className="h-8 border-t border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark flex items-center justify-between px-6 text-[10px] uppercase font-bold text-slate-500 tracking-wider shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            AI Connected
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">source</span>
            main-branch
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span>React 18.2.0</span>
          <div className="flex items-center gap-1 text-primary">
            <span className="material-symbols-outlined text-xs">done_all</span>
            Synced
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Preview;
