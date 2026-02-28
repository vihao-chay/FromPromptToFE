import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { generateCodeFromInputs } from '../../services/geminiService';

const PROMPT_HISTORY_KEY = 'editor_prompt_history';
const PROMPT_HISTORY_MAX = 15;

const DEFAULT_ERD = `Table users {
  id uuid [pk]
  email varchar
  name varchar
  created_at timestamp
}

Table projects {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  name varchar
}`;

const DEFAULT_API_SPEC = `openapi: 3.0.0
info:
  title: Sample API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List users
      responses:
        '200':
          description: OK`;

const DEFAULT_DESIGN_SYSTEM = `{
  "colors": { "primary": "#135bec", "background": "#101622" },
  "typography": { "fontFamily": "Inter", "scale": 1.25 }
}`;

type OutputTab = 'code' | 'preview' | 'tasks';
type Device = 'desktop' | 'tablet' | 'mobile';
type TaskStatus = 'Pending' | 'Running' | 'Success' | 'Failed';

const TASK_IDS = [
  { id: '1', label: 'Parse ERD Schema' },
  { id: '2', label: 'Generate API client' },
  { id: '3', label: 'Build UI components' },
  { id: '4', label: 'Apply design system' },
];

const STEP_EXPLANATIONS: string[] = [
  'Dựa trên prompt của bạn, tôi đang phân tích yêu cầu về giao diện và chức năng. Sau đó thiết kế cấu trúc component và luồng dữ liệu phù hợp để triển khai.',
  'Đang tạo các component cần thiết: form nhập liệu, validation, và bố cục trang. Các phần này sẽ được kết nối với logic và state của ứng dụng.',
  'Sinh code React (TSX) với hooks và component, cùng bản HTML tương ứng. Code được format và comment để bạn dễ chỉnh sửa và tích hợp vào project.',
  'Áp dụng design system (màu sắc, typography, spacing) vào giao diện. Giao diện sẽ nhất quán và sẵn sàng để xem preview bên phải.',
];

interface PromptHistoryItem {
  id: string;
  text: string;
  createdAt: number;
}

type ChatTurn =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'assistant'; status: 'running' | 'done' | 'error'; tasks: { id: string; label: string; status: TaskStatus; progress: number }[]; tsx?: string; html?: string };

const Editor: React.FC = () => {
  const [erd, setErd] = useState(DEFAULT_ERD);
  const [apiSpec, setApiSpec] = useState(DEFAULT_API_SPEC);
  const [designSystem, setDesignSystem] = useState(DEFAULT_DESIGN_SYSTEM);
  const [prompt, setPrompt] = useState('Generate a modern dashboard with sidebar navigation and stats cards.');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [outputTab, setOutputTab] = useState<OutputTab>('code');
  const [device, setDevice] = useState<Device>('desktop');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedTsx, setGeneratedTsx] = useState<string>('');
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [activeCodeTab, setActiveCodeTab] = useState<'tsx' | 'html'>('tsx');
  const [tasks, setTasks] = useState<{ id: string; label: string; status: TaskStatus; progress: number }[]>(() =>
    TASK_IDS.map((t) => ({ ...t, status: 'Pending' as TaskStatus, progress: 0 }))
  );
  const [hasRunOnce, setHasRunOnce] = useState(false);
  const [runningStepIndex, setRunningStepIndex] = useState(0);
  const [chatTurns, setChatTurns] = useState<ChatTurn[]>([]);

  const savePromptToHistory = useCallback((text: string) => {
    const t = (text || '').trim();
    if (!t) return;
    try {
      const raw = localStorage.getItem(PROMPT_HISTORY_KEY);
      const list = raw ? (JSON.parse(raw) as PromptHistoryItem[]) : [];
      const next = [{ id: `${Date.now()}`, text: t, createdAt: Date.now() }, ...list.filter((p: PromptHistoryItem) => p.text !== t)].slice(0, PROMPT_HISTORY_MAX);
      localStorage.setItem(PROMPT_HISTORY_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const hasRunningTurn = chatTurns.some((t) => t.role === 'assistant' && t.status === 'running');
  useEffect(() => {
    if (!hasRunningTurn) return;
    const id = setInterval(() => setRunningStepIndex((i) => Math.min(i + 1, 4)), 1800);
    return () => clearInterval(id);
  }, [hasRunningTurn]);

  const handleGenerate = async () => {
    const userText = prompt.trim();
    if (!userText) return;
    setHasRunOnce(true);
    setIsSaving(true);
    const userTurnId = `user-${Date.now()}`;
    const assistantTurnId = `ast-${Date.now()}`;
    const initialTasks = TASK_IDS.map((t, i) => ({ ...t, status: (i === 0 ? 'Running' : 'Pending') as TaskStatus, progress: i === 0 ? 20 : 0 }));
    setRunningStepIndex(0);
    setChatTurns((prev) => [
      ...prev,
      { id: userTurnId, role: 'user', text: userText },
      { id: assistantTurnId, role: 'assistant', status: 'running', tasks: initialTasks },
    ]);
    setTasks((prev) => prev.map((t, i) => ({ ...t, status: i === 0 ? 'Running' : 'Pending', progress: i === 0 ? 20 : 0 })));
    setPrompt('');

    sessionStorage.setItem('last_ui_prompt', userText);
    sessionStorage.setItem('last_schema_prompt', erd);

    try {
      setTasks((prev) => prev.map((t, i) => (i <= 1 ? { ...t, status: 'Running' as TaskStatus, progress: i === 0 ? 100 : 50 } : t)));
      setChatTurns((prev) =>
        prev.map((turn) =>
          turn.id === assistantTurnId && turn.role === 'assistant'
            ? { ...turn, tasks: TASK_IDS.map((t, i) => ({ ...t, status: i <= 1 ? 'Running' : 'Pending', progress: i === 0 ? 100 : 50 })) }
            : turn
        )
      );
      const { tsx, html } = await generateCodeFromInputs({
        systemPrompt: userText,
        erdSchema: erd,
        apiSpec,
        designSystem,
      });
      setGeneratedTsx(tsx);
      setGeneratedHtml(html);
      const isError = tsx.startsWith('// Error');
      const finalTasks = TASK_IDS.map((t) => ({ ...t, status: (isError ? (t.status === 'Running' ? 'Failed' : t.status) : 'Success') as TaskStatus, progress: isError ? 0 : 100 }));
      setTasks((prev) => prev.map((t) => ({ ...t, status: isError ? (t.status === 'Running' ? 'Failed' : t.status) : ('Success' as TaskStatus), progress: isError ? 0 : 100 })));
      if (!isError) {
        sessionStorage.setItem('last_generated_code', tsx);
        sessionStorage.setItem('last_generated_html', html);
        savePromptToHistory(userText);
        setOutputTab('code');
      } else setOutputTab('tasks');
      setChatTurns((prev) =>
        prev.map((turn) =>
          turn.id === assistantTurnId && turn.role === 'assistant'
            ? { ...turn, status: isError ? 'error' : 'done', tasks: finalTasks, tsx, html }
            : turn
        )
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setGeneratedTsx(`// Error: ${msg}`);
      setGeneratedHtml(`<!-- Error: ${msg} -->`);
      setTasks((prev) => prev.map((t) => ({ ...t, status: t.status === 'Running' ? 'Failed' : t.status, progress: t.status === 'Running' ? 0 : t.progress })));
      setChatTurns((prev) =>
        prev.map((turn) =>
          turn.id === assistantTurnId && turn.role === 'assistant'
            ? { ...turn, status: 'error', tasks: TASK_IDS.map((t) => ({ ...t, status: 'Failed' as TaskStatus, progress: 0 })) }
            : turn
        )
      );
      setOutputTab('tasks');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    const text = activeCodeTab === 'tsx' ? generatedTsx : generatedHtml;
    const fallback = activeCodeTab === 'tsx' ? '// Run generation first.' : '<!-- Run generation first. -->';
    navigator.clipboard.writeText(text || fallback);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusClass = (status: string) => {
    if (status === 'Success') return 'bg-primary/10 text-primary border-primary/20';
    if (status === 'Running') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    if (status === 'Failed') return 'bg-red-500/10 text-red-500 border-red-500/20';
    return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  };

  const showOutputPanel = hasRunOnce;
  const showTabs = showOutputPanel && !isSaving && (generatedTsx || generatedHtml);

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <div className="flex flex-wrap items-center gap-1.5 text-xs px-4 pt-2 border-b border-slate-200 dark:border-[#282e39] pb-2">
        <Link className="text-slate-500 dark:text-[#9da6b9] hover:text-primary font-medium" to="/dashboard">Projects</Link>
        <span className="material-symbols-outlined text-slate-400 text-[10px]">chevron_right</span>
        <span className="text-slate-900 dark:text-white font-medium">Create New Project</span>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left: Chat log + input (ChatGPT style) */}
        <div className={`flex flex-col ${showOutputPanel ? 'w-[48%]' : 'flex-1'} min-w-0 transition-all duration-200`}>
          <div className="flex-1 flex flex-col min-h-0 max-w-4xl mx-auto w-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {chatTurns.map((turn) => {
                if (turn.role === 'user') {
                  return (
                    <div key={turn.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary/10 dark:bg-primary/20 px-4 py-2.5">
                        <p className="text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap">{turn.text}</p>
                      </div>
                    </div>
                  );
                }
                const isThisRunning = turn.role === 'assistant' && turn.status === 'running';
                const visibleCount = isThisRunning ? Math.min(runningStepIndex + 1, 4) : 4;
                return (
                  <div key={turn.id} className="flex justify-start">
                    <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-slate-100 dark:bg-[#1c1f27] border border-slate-200 dark:border-[#282e39] px-4 py-3">
                      {(turn.status === 'running' || turn.status === 'done') && (
                        <>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                            {turn.status === 'running' ? 'Đang tạo' : 'Đã tạo xong'}
                          </p>
                          <div className="space-y-4">
                            {STEP_EXPLANATIONS.slice(0, visibleCount).map((paragraph, i) => {
                              const isDone = turn.status === 'done' || (isThisRunning && i < runningStepIndex) || (isThisRunning && runningStepIndex >= 4);
                              const isCurrent = isThisRunning && i === runningStepIndex && runningStepIndex < 4;
                              return (
                                <div key={i} className="flex gap-2">
                                  <span className="flex-shrink-0 mt-0.5">
                                    {isDone ? (
                                      <span className="text-primary" title="Xong">
                                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                      </span>
                                    ) : (
                                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
                                    )}
                                  </span>
                                  <p className={`text-sm text-slate-600 dark:text-slate-300 leading-relaxed ${isCurrent ? 'text-slate-700 dark:text-slate-200' : ''}`}>
                                    {paragraph}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                          {turn.status === 'done' && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">Xem Code / Preview bên phải.</p>
                          )}
                        </>
                      )}
                      {turn.status === 'error' && (
                        <p className="text-sm text-red-500 dark:text-red-400">Có lỗi khi tạo. Thử lại hoặc chỉnh prompt.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input: + bên trái, placeholder giữa, nút gửi bên phải */}
            <div className="p-4 pt-0">
              {showAdvanced && (
                <div className="mb-3 rounded-xl border border-slate-200 dark:border-[#282e39] bg-white dark:bg-[#1c1f27] p-3 max-h-[220px] overflow-y-auto custom-scrollbar">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Tùy chọn: ERD, API Spec, Design System</p>
                  <SectionCard title="ERD / Schema" subtitle="DBML" value={erd} onChange={setErd} placeholder="Tables..." />
                  <SectionCard title="API Specs" subtitle="OpenAPI" value={apiSpec} onChange={setApiSpec} placeholder="OpenAPI..." />
                  <SectionCard title="Design System" subtitle="JSON" value={designSystem} onChange={setDesignSystem} placeholder="Colors..." />
                </div>
              )}
              <div className="flex items-end gap-0 rounded-2xl border border-slate-200 dark:border-[#282e39] bg-white dark:bg-[#1c1f27] shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary/30">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className={`flex-shrink-0 p-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#161921] transition-colors ${showAdvanced ? 'text-primary bg-primary/5' : ''}`}
                  title="Thêm ERD, API Spec, Design System"
                >
                  <span className="material-symbols-outlined text-[24px]">add</span>
                </button>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                  placeholder="Mô tả giao diện hoặc tính năng cần tạo (vd: tạo trang login, form đăng ký...)"
                  className="flex-1 min-h-[48px] max-h-[200px] resize-none py-3 px-4 text-sm text-slate-900 dark:text-white bg-transparent border-0 focus:ring-0 placeholder:text-slate-400 dark:placeholder:text-[#4d576e] custom-scrollbar"
                  rows={1}
                />
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isSaving || !prompt.trim()}
                  className="flex-shrink-0 p-3 text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Gửi"
                >
                  <span className="material-symbols-outlined text-[24px]">send</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Code / Preview / Tasks (chỉ sau khi đã chạy) */}
        {showOutputPanel && (
        <div className="flex-1 flex flex-col rounded-xl border border-slate-200 dark:border-[#282e39] bg-white dark:bg-[#1c1f27] overflow-hidden min-w-0 border-l">
          <div className="flex border-b border-slate-200 dark:border-[#282e39]">
            {(['code', 'preview', 'tasks'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setOutputTab(tab)}
                className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 px-4 text-sm font-medium capitalize border-b-2 transition-colors ${
                  outputTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 dark:text-[#9da6b9] hover:text-slate-700 dark:hover:text-white'
                }`}
              >
                {tab === 'code' && <span className="material-symbols-outlined text-lg">code</span>}
                {tab === 'preview' && <span className="material-symbols-outlined text-lg">desktop_windows</span>}
                {tab === 'tasks' && <span className="material-symbols-outlined text-lg">list</span>}
                {tab === 'code' && 'Code View'}
                {tab === 'preview' && 'Visual Preview'}
                {tab === 'tasks' && 'Task Status'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {outputTab === 'code' && (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-[#282e39] bg-slate-50 dark:bg-[#161921]">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveCodeTab('tsx')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${activeCodeTab === 'tsx' ? 'bg-primary/20 text-primary' : 'text-slate-500 dark:text-[#9da6b9] hover:bg-slate-200 dark:hover:bg-[#282e39]'}`}
                    >
                      index.tsx
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCodeTab('html')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${activeCodeTab === 'html' ? 'bg-primary/20 text-primary' : 'text-slate-500 dark:text-[#9da6b9] hover:bg-slate-200 dark:hover:bg-[#282e39]'}`}
                    >
                      index.html
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#3b4354] text-slate-700 dark:text-[#9da6b9] hover:bg-slate-100 dark:hover:bg-[#282e39] text-xs font-medium"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <Link
                      to="/github-integration"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 text-xs font-semibold"
                    >
                      <span className="material-symbols-outlined text-sm">upload</span>
                      Push to GitHub
                    </Link>
                  </div>
                </div>
                <pre className="flex-1 overflow-auto p-4 font-mono text-sm text-slate-700 dark:text-[#9da6b9] bg-[#0d1117] custom-scrollbar whitespace-pre">
                  {activeCodeTab === 'tsx'
                    ? (generatedTsx || '// Nhập prompt và bấm Gửi để tạo code TSX + HTML.')
                    : (generatedHtml || '<!-- Nhập prompt và bấm Gửi để tạo code. -->')}
                </pre>
              </div>
            )}

            {outputTab === 'preview' && (
              <div className="flex flex-col h-full p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-slate-500 dark:text-[#9da6b9]">Device preview</span>
                  <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-[#3b4354] p-1">
                    {[
                      { id: 'desktop' as const, icon: 'desktop_windows' },
                      { id: 'tablet' as const, icon: 'tablet' },
                      { id: 'mobile' as const, icon: 'smartphone' },
                    ].map(({ id, icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setDevice(id)}
                        className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-md transition-colors ${
                          device === id ? 'bg-primary/20 text-primary' : 'text-slate-500 dark:text-[#9da6b9] hover:bg-slate-100 dark:hover:bg-[#282e39]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">{icon}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div
                  className={`flex-1 rounded-xl border border-slate-200 dark:border-[#282e39] bg-white dark:bg-slate-900 overflow-hidden transition-all ${
                    device === 'desktop' ? 'max-w-full' : device === 'tablet' ? 'max-w-[768px] mx-auto w-full' : 'max-w-[375px] mx-auto w-full'
                  }`}
                >
                  <iframe
                    title="Preview"
                    srcDoc={generatedHtml ? generatedHtml : "<html><body style='margin:0;padding:24px;font-family:system-ui'><h1>Generated UI Preview</h1><p>Run generation to see TSX + HTML. Preview shows HTML.</p></body></html>"}
                    className="w-full h-full min-h-[280px]"
                  />
                </div>
              </div>
            )}

            {outputTab === 'tasks' && (
              <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                <ul className="space-y-4">
                  {tasks.map((task) => (
                    <li key={task.id} className="rounded-xl border border-slate-200 dark:border-[#282e39] bg-slate-50 dark:bg-[#161921] p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-900 dark:text-white">{task.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusClass(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-[#282e39] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

function SectionCard({
  title,
  subtitle,
  value,
  onChange,
  placeholder,
}: {
  title: string;
  subtitle: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[#282e39] bg-white dark:bg-[#1c1f27] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-[#282e39]">
        <span className="text-xs text-slate-500 dark:text-[#9da6b9] uppercase tracking-wider">{subtitle}</span>
        <span className="text-sm font-semibold text-slate-900 dark:text-white">{title}</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[100px] resize-y p-4 text-sm font-mono text-slate-900 dark:text-white bg-transparent border-0 focus:ring-0 placeholder:text-slate-400 dark:placeholder:text-[#4d576e] custom-scrollbar"
      />
    </div>
  );
}

export default Editor;
