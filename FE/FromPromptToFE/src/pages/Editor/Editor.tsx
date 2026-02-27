import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { generateCodeFromInputs } from '../../services/geminiService';
import organizationService from '../../services/organizationService';
import projectService, { type ProjectDto } from '../../services/projectService';
import changeLogService from '../../services/changeLogService';

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

interface OrgOption {
  id: string;
  name: string;
}

const Editor: React.FC = () => {
  const [erd, setErd] = useState(DEFAULT_ERD);
  const [apiSpec, setApiSpec] = useState(DEFAULT_API_SPEC);
  const [designSystem, setDesignSystem] = useState(DEFAULT_DESIGN_SYSTEM);
  const [systemPrompt, setSystemPrompt] = useState('Generate a modern dashboard with sidebar navigation and stats cards.');
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
  const [organizations, setOrganizations] = useState<OrgOption[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    organizationService.getAll().then((res) => {
      const content = res.data?.content;
      const list = content?.totalItems ?? content?.TotalItems ?? (Array.isArray(content) ? content : []);
      const items = Array.isArray(list) ? list : [];
      setOrganizations(
        items.map((o: { id?: string; Id?: string; name?: string; Name?: string }) => ({
          id: String(o.id ?? o.Id ?? ''),
          name: String(o.name ?? o.Name ?? '').trim() || 'Unnamed organization',
        }))
      );
    }).catch(() => setOrganizations([]));
  }, []);

  useEffect(() => {
    if (!selectedOrganizationId) {
      setProjects([]);
      setSelectedProjectId('');
      return;
    }
    projectService.getAll({ organizationId: selectedOrganizationId, pageSize: 50 }).then((res) => {
      const content = res.data?.content;
      const list = content?.TotalItems ?? content?.totalItems ?? [];
      const items = Array.isArray(list) ? list : [];
      setProjects(items.map((p: ProjectDto & { Id?: string; Name?: string; OrganizationId?: string }) => ({
        id: String(p.id ?? p.Id ?? ''),
        organizationId: String(p.organizationId ?? p.OrganizationId ?? ''),
        name: String(p.name ?? p.Name ?? ''),
        projectType: p.projectType ?? '',
      })));
    }).catch(() => setProjects([]));
  }, [selectedOrganizationId]);

  const handleGenerate = async () => {
    setIsSaving(true);
    setTasks((prev) => prev.map((t, i) => ({ ...t, status: i === 0 ? 'Running' : 'Pending', progress: i === 0 ? 20 : 0 })));
    setOutputTab('tasks');

    sessionStorage.setItem('last_ui_prompt', systemPrompt);
    sessionStorage.setItem('last_schema_prompt', erd);

    try {
      setTasks((prev) => prev.map((t, i) => (i <= 1 ? { ...t, status: 'Running' as TaskStatus, progress: i === 0 ? 100 : 50 } : t)));
      const { tsx, html } = await generateCodeFromInputs({
        systemPrompt,
        erdSchema: erd,
        apiSpec,
        designSystem,
      });
      setGeneratedTsx(tsx);
      setGeneratedHtml(html);
      const isError = tsx.startsWith('// Error');
      setTasks((prev) => prev.map((t) => ({ ...t, status: isError ? (t.status === 'Running' ? 'Failed' : t.status) : ('Success' as TaskStatus), progress: isError ? (t.status === 'Running' ? 0 : t.progress) : 100 })));
      setOutputTab('code');
      if (!isError) {
        sessionStorage.setItem('last_generated_code', tsx);
        sessionStorage.setItem('last_generated_html', html);
        setSaveError(null);
        setSaveSuccess(false);
        if (selectedOrganizationId) {
          const name = projectName.trim() || systemPrompt.slice(0, 80) || 'Generated project';
          let projectId: string | null = null;
          try {
            if (selectedProjectId) {
              await projectService.update(selectedProjectId, {
                systemPrompt,
                entitySchema: erd,
              });
              projectId = selectedProjectId;
              setSaveSuccess(true);
            } else {
              const createRes = await projectService.create({
                organizationId: selectedOrganizationId,
                name: name.length >= 3 ? name : name + ' project',
                projectType: 'Generated',
                systemPrompt,
                entitySchema: erd,
              });
              const created = createRes.data?.content ?? (createRes as { data?: { content?: { id?: string } } }).data?.content;
              projectId = created?.id ?? (created as { Id?: string })?.Id ?? null;
              setSaveSuccess(true);
            }
            if (projectId) {
              try {
                await changeLogService.create({
                  organizationId: selectedOrganizationId,
                  entityType: 'Project',
                  entityId: projectId,
                  action: selectedProjectId ? 'Update' : 'Create',
                });
              } catch {
                // non-blocking
              }
            }
          } catch (e) {
            setSaveError(e instanceof Error ? e.message : 'Could not save project.');
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setGeneratedTsx(`// Error: ${msg}`);
      setGeneratedHtml(`<!-- Error: ${msg} -->`);
      setTasks((prev) => prev.map((t) => ({ ...t, status: t.status === 'Running' ? 'Failed' : t.status, progress: t.status === 'Running' ? 0 : t.progress })));
      setOutputTab('code');
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

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-2 text-sm font-display px-6 pt-4 border-b border-slate-200 dark:border-[#282e39] pb-3">
        <Link className="text-slate-500 dark:text-[#9da6b9] hover:text-primary transition-colors font-medium" to="/dashboard">Projects</Link>
        <span className="material-symbols-outlined text-slate-400 text-xs">chevron_right</span>
        <span className="text-slate-900 dark:text-white font-medium">Create New Project</span>
      </div>

      {/* Main: Left inputs + Right output */}
      <div className="flex-1 flex min-h-0 px-6 py-4 gap-6">
        {/* Left Panel - Organization + 4 input sections */}
        <div className="w-[42%] flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          <div className="rounded-xl border border-slate-200 dark:border-[#282e39] bg-white dark:bg-[#1c1f27] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-[#282e39]">
              <span className="text-xs text-slate-500 dark:text-[#9da6b9] uppercase tracking-wider">Optional</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Save to organization</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-[#9da6b9] mb-1">Organization</label>
                <select
                  value={selectedOrganizationId}
                  onChange={(e) => setSelectedOrganizationId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#3b4354] bg-slate-50 dark:bg-[#161921] text-slate-900 dark:text-white text-sm"
                >
                  <option value="">— Don't save to org —</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
              {selectedOrganizationId && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-[#9da6b9] mb-1">New project name (or update existing below)</label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g. Dashboard v1"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#3b4354] bg-slate-50 dark:bg-[#161921] text-slate-900 dark:text-white text-sm placeholder:text-slate-400"
                    />
                  </div>
                  {projects.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-[#9da6b9] mb-1">Or update existing project</label>
                      <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#3b4354] bg-slate-50 dark:bg-[#161921] text-slate-900 dark:text-white text-sm"
                      >
                        <option value="">— Create new —</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
              {saveSuccess && <p className="text-xs text-green-600 dark:text-green-400">Saved to organization.</p>}
              {saveError && <p className="text-xs text-red-500 dark:text-red-400">{saveError}</p>}
            </div>
          </div>
          <SectionCard
            title="ERD / Schema"
            subtitle="DBML style"
            value={erd}
            onChange={setErd}
            placeholder="Define tables and relations..."
          />
          <SectionCard
            title="API Specs"
            subtitle="OpenAPI"
            value={apiSpec}
            onChange={setApiSpec}
            placeholder="OpenAPI YAML/JSON..."
          />
          <SectionCard
            title="Design System"
            subtitle="JSON"
            value={designSystem}
            onChange={setDesignSystem}
            placeholder="Theme, colors, typography..."
          />
          <SectionCard
            title="System Prompt"
            subtitle="Instructions for generation"
            value={systemPrompt}
            onChange={setSystemPrompt}
            placeholder="Describe the app to generate..."
          />
        </div>

        {/* Right Panel - Tabbed output */}
        <div className="flex-1 flex flex-col rounded-xl border border-slate-200 dark:border-[#282e39] bg-white dark:bg-[#1c1f27] overflow-hidden min-w-0">
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
                    ? (generatedTsx || '// Click Run to generate TSX + HTML from ERD, API Spec, Design System & System Prompt.')
                    : (generatedHtml || '<!-- Click Run to generate TSX + HTML. -->')}
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
      </div>

      {/* Bottom bar: Run + status */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-[#282e39] bg-white dark:bg-[#111318]">
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-600">
          <span>IDE VERSION: 2.4.0</span>
          <span>AI ENGINE: GEMINI-3-PRO</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isSaving}
            className="flex items-center gap-2 min-w-[180px] cursor-pointer rounded-xl h-12 px-6 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-xl">play_arrow</span>
            )}
            <span>{isSaving ? 'Running...' : 'Run'}</span>
          </button>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-600">
            <div className="size-1.5 rounded-full bg-primary" />
            <span>SYSTEM ONLINE</span>
            <span className="ml-2">LATENCY: 42MS</span>
          </div>
        </div>
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
