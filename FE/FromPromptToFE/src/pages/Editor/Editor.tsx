import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useSearchParams } from "react-router-dom";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';
import oneLight from 'react-syntax-highlighter/dist/esm/styles/prism/one-light';
import { useTheme } from '../../hooks/useTheme';
import { generateCode } from "../../services/codeGenService";
import organizationService from "../../services/organizationService";
import projectService, { getContent } from "../../services/projectService";
import projectOutputService from "../../services/projectOutputService";
import changeLogService from "../../services/changeLogService";
import { htmlForPreview } from "../../lib/htmlPreview";
import { fetchContentIfUrl, uploadToSupabaseAndGetUrl } from "../../lib/supabaseClient";

const PROMPT_HISTORY_KEY = "editor_prompt_history";
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

const DESIGN_SYSTEM_PRESETS: Record<string, { label: string; json: string }> = {
  default: {
    label: "Default (free)",
    json: '{"colors":{"primary":"#135bec","background":"#101622"},"typography":{"fontFamily":"Inter","scale":1.25}}',
  },
  minimal: {
    label: "Minimal (free)",
    json: '{"colors":{"primary":"#0f172a","background":"#ffffff","muted":"#64748b"},"typography":{"fontFamily":"Inter","scale":1.2}}',
  },
  dark: {
    label: "Dark (free)",
    json: '{"colors":{"primary":"#818cf8","background":"#0f172a","surface":"#1e293b"},"typography":{"fontFamily":"Inter","scale":1.25}}',
  },
  accent: {
    label: "Accent (free)",
    json: '{"colors":{"primary":"#059669","background":"#f0fdf4","accent":"#10b981"},"typography":{"fontFamily":"Inter","scale":1.2}}',
  },
};

const PROMPT_TEMPLATES = [
  {
    id: "contact-form",
    icon: "mail",
    title: "Contact Form",
    description: "A contact form with name, email, and message fields. Clean and modern design.",
    prompt: "Create a responsive contact form with fields for name, email, and message. Include form validation, a submit button with hover effect, and a clean modern design using soft shadows and rounded corners.",
  },
  {
    id: "hero-section",
    icon: "web",
    title: "Hero Section",
    description: "A full-width hero section with headline, description, and CTA buttons.",
    prompt: "Create a stunning hero section with a large headline, a short description paragraph, and two call-to-action buttons (primary and secondary). Use a gradient background, modern typography, and make it fully responsive.",
  },
  {
    id: "product-card",
    icon: "shopping_bag",
    title: "Product Card",
    description: "A grid-style product card for an e-commerce catalog with image, title, and price.",
    prompt: "Create a product card component for an e-commerce site. Include an image placeholder area, product title, star rating (4.5 stars), price display ($29.99), and an 'Add to Cart' button. Use a card layout with subtle shadow and hover effect.",
  },
  {
    id: "login-page",
    icon: "lock",
    title: "Login Page",
    description: "A modern login page with email, password fields and social sign-in options.",
    prompt: "Create a beautiful login page with email and password input fields, a 'Remember me' checkbox, a 'Forgot password?' link, a sign-in button, and social login buttons for Google and GitHub. Center everything on the page with a card layout.",
  },
  {
    id: "pricing-table",
    icon: "payments",
    title: "Pricing Table",
    description: "A responsive pricing comparison table with 3 tiers: Basic, Pro, and Enterprise.",
    prompt: "Create a pricing table section with 3 tiers: Basic ($9/mo), Pro ($29/mo - highlighted as popular), and Enterprise ($99/mo). Each tier has a list of features with check/cross icons, and a 'Get Started' button. Make the Pro tier visually stand out.",
  },
  {
    id: "dashboard",
    icon: "dashboard",
    title: "Dashboard",
    description: "An admin dashboard layout with stats cards, a chart area, and a recent activity list.",
    prompt: "Create an admin dashboard layout with a sidebar navigation, 4 stats cards at the top (Total Users, Revenue, Orders, Conversion Rate), a chart placeholder area, and a recent activity/transactions list below. Use a dark or modern UI theme.",
  },
];

type OutputTab = "code" | "preview" | "tasks";
type Device = "desktop" | "tablet" | "mobile";
type TaskStatus = "Pending" | "Running" | "Success" | "Failed";

const TASK_IDS = [
  { id: "1", label: "Parse ERD Schema" },
  { id: "2", label: "Generate API client" },
  { id: "3", label: "Build UI components" },
  { id: "4", label: "Apply design system" },
];

/** Hiển thị từng step trong lúc xử lý (ngắn, lần lượt); xong thì thay bằng steps thật từ API. */
const STEPS_WHILE_RUNNING_VI: string[] = [
  "Đang phân tích yêu cầu...",
  "Đang tạo component...",
  "Đang sinh code TSX & HTML...",
  "Đang áp dụng design...",
];
const STEPS_WHILE_RUNNING_EN: string[] = [
  "Analyzing requirements...",
  "Creating components...",
  "Generating TSX & HTML...",
  "Applying design...",
];

const EDITOR_LABELS = {
  vi: {
    generating: "Đang tạo",
    completed: "Đã tạo xong",
    completedAt: (time: string) => `Đã tạo xong lúc ${time}`,
    viewCode: "Xem Code / Preview bên phải.",
    viewingThis: "✓ Đang xem bản này",
    processing: "Đang xử lý...",
    error: "Có lỗi khi tạo. Thử lại hoặc chỉnh prompt.",
    doneTitle: "Xong",
  },
  en: {
    generating: "Generating",
    completed: "Created",
    completedAt: (time: string) => `Created at ${time}`,
    viewCode: "View Code / Preview on the right.",
    viewingThis: "✓ Viewing this version",
    processing: "Processing...",
    error: "Something went wrong. Try again or adjust your prompt.",
    doneTitle: "Done",
  },
} as const;

/** Detect prompt language: English vs Vietnamese. Prefer EN for common EN words (e.g. "login form") so steps match question. */
function detectPromptLanguage(prompt: string): "vi" | "en" {
  const t = (prompt || "").trim();
  if (!t) return "en";
  const hasViDiacritics =
    /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(
      t,
    );
  const commonEn =
    /\b(create|login|page|form|button|dashboard|register|forgot|password|sign|email|input|modal|table|list|card)\b/i.test(
      t,
    );
  const viOnlyWords =
    /\b(tạo|trang|đăng\s*nhập|mật\s*khẩu|màu|xanh|làm|nào|hãy|của|bạn|cho|giao\s*diện)\b/i.test(
      t,
    );
  if (hasViDiacritics || viOnlyWords) return "vi";
  if (commonEn) return "en";
  return "en";
}

interface PromptHistoryItem {
  id: string;
  text: string;
  createdAt: number;
}

type ChatTurn =
  | { id: string; role: "user"; text: string }
  | {
    id: string;
    role: "assistant";
    status: "running" | "done" | "error";
    completedAt?: number;
    steps?: string[];
    tasks: {
      id: string;
      label: string;
      status: TaskStatus;
      progress: number;
    }[];
    tsx?: string;
    html?: string;
    outputId?: string;
  };

const Editor: React.FC = () => {
  const { theme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const projectIdFromUrl = searchParams.get("projectId") ?? "";

  const [projectName, setProjectName] = useState("");
  const [erd, setErd] = useState("");
  const [apiSpec, setApiSpec] = useState("");
  const [designSystem, setDesignSystem] = useState(DEFAULT_DESIGN_SYSTEM);
  const [selectedDesignPreset, setSelectedDesignPreset] = useState<
    string | null
  >(null);
  const [prompt, setPrompt] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [openSection, setOpenSection] = useState<
    "erd" | "api" | "design" | null
  >(null);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [plusMenuSubmenu, setPlusMenuSubmenu] = useState<"design" | null>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const advancedPanelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [popoverStyle, setPopoverStyle] = useState({ top: 0, left: 0 });
  const [outputTab, setOutputTab] = useState<OutputTab>("code");
  const [device, setDevice] = useState<Device>("desktop");
  const [isSaving, setIsSaving] = useState(false);
  const [outputSaved, setOutputSaved] = useState(false);
  const [outputSaveError, setOutputSaveError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [generatedTsx, setGeneratedTsx] = useState<string>("");
  const [generatedHtml, setGeneratedHtml] = useState<string>("");
  const [activeCodeTab, setActiveCodeTab] = useState<"tsx" | "html">("tsx");
  const [tasks, setTasks] = useState<
    { id: string; label: string; status: TaskStatus; progress: number }[]
  >(() =>
    TASK_IDS.map((t) => ({
      ...t,
      status: "Pending" as TaskStatus,
      progress: 0,
    })),
  );
  const [hasRunOnce, setHasRunOnce] = useState(false);
  const [runningStepIndex, setRunningStepIndex] = useState(0);
  const [chatTurns, setChatTurns] = useState<ChatTurn[]>([]);
  const [outputsList, setOutputsList] = useState<
    Array<{
      id?: string;
      Id?: string;
      createdAt?: string;
      CreatedAt?: string;
      systemPrompt?: string;
      status?: string;
      stepOutput?: string;
      generatedTsx?: string;
      generatedHtml?: string;
    }>
  >([]);
  const [selectedOutputId, setSelectedOutputId] = useState<string | null>(null);

  const templateScrollRef = useRef<HTMLDivElement>(null);
  const [isTemplateDragging, setIsTemplateDragging] = useState(false);
  const [templateStartX, setTemplateStartX] = useState(0);
  const [templateScrollLeft, setTemplateScrollLeft] = useState(0);

  const handleTemplateMouseDown = (e: React.MouseEvent) => {
    setIsTemplateDragging(true);
    if (templateScrollRef.current) {
      setTemplateStartX(e.pageX - templateScrollRef.current.offsetLeft);
      setTemplateScrollLeft(templateScrollRef.current.scrollLeft);
    }
  };

  const handleTemplateMouseLeave = () => setIsTemplateDragging(false);
  const handleTemplateMouseUp = () => setIsTemplateDragging(false);

  const handleTemplateMouseMove = (e: React.MouseEvent) => {
    if (!isTemplateDragging || !templateScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - templateScrollRef.current.offsetLeft;
    const walk = (x - templateStartX) * 1.5;
    templateScrollRef.current.scrollLeft = templateScrollLeft - walk;
  };

  useEffect(() => {
    const el = templateScrollRef.current;
    if (!el) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", handleWheelNative, { passive: false });

    return () => {
      el.removeEventListener("wheel", handleWheelNative);
    };
  }, []);

  const handleTemplateWheel = (e: React.WheelEvent) => {
    if (templateScrollRef.current) {
      templateScrollRef.current.scrollLeft += e.deltaY;
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  const savePromptToHistory = useCallback((text: string) => {
    const t = (text || "").trim();
    if (!t) return;
    try {
      const raw = localStorage.getItem(PROMPT_HISTORY_KEY);
      const list = raw ? (JSON.parse(raw) as PromptHistoryItem[]) : [];
      const next = [
        { id: `${Date.now()}`, text: t, createdAt: Date.now() },
        ...list.filter((p: PromptHistoryItem) => p.text !== t),
      ].slice(0, PROMPT_HISTORY_MAX);
      localStorage.setItem(PROMPT_HISTORY_KEY, JSON.stringify(next));
    } catch { }
  }, []);

  const hasRunningTurn = chatTurns.some(
    (t) => t.role === "assistant" && t.status === "running",
  );
  useEffect(() => {
    if (!hasRunningTurn) return;
    const id = setInterval(
      () => setRunningStepIndex((i) => Math.min(i + 1, 4)),
      1800,
    );
    return () => clearInterval(id);
  }, [hasRunningTurn]);

  useEffect(() => {
    if (!plusMenuOpen) return;
    const el = plusMenuRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      setPopoverStyle({ left: rect.left, top: rect.top - 8 });
    }
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const isPlusButton = plusMenuRef.current?.contains(target);
      const isInsidePopup = document
        .getElementById("plus-menu-portal")
        ?.contains(target);
      if (!isPlusButton && !isInsidePopup) {
        setPlusMenuOpen(false);
        setPlusMenuSubmenu(null);
      }
    };
    const t = setTimeout(
      () => document.addEventListener("click", onDocClick, true),
      0,
    );
    return () => {
      clearTimeout(t);
      document.removeEventListener("click", onDocClick, true);
    };
  }, [plusMenuOpen]);

  useEffect(() => {
    if (!projectIdFromUrl) {
      setProjectName("");
      return;
    }
    projectService
      .getById(projectIdFromUrl)
      .then((res) => {
        const content = getContent(res.data) as
          | { name?: string; Name?: string }
          | undefined;
        const name = content?.name ?? content?.Name ?? "";
        setProjectName(name || "");
      })
      .catch(() => setProjectName(""));
  }, [projectIdFromUrl]);

  const parseStepsFromOutput = (stepOutput: string | undefined): string[] => {
    let steps: string[] = [];
    try {
      if (stepOutput) {
        const parsed = JSON.parse(stepOutput);
        if (Array.isArray(parsed))
          steps = parsed
            .filter((s: unknown) => typeof s === "string")
            .slice(0, 4);
      }
    } catch { }
    if (steps.length < 4) steps = STEPS_WHILE_RUNNING_EN.slice(0, 4);
    return steps;
  };

  /** Sort outputs past → future (oldest first) for display; newest is last. */
  const sortOutputsPastToFuture = useCallback((list: typeof outputsList) => {
    return [...list].sort((a, b) => {
      const ta = new Date(a.createdAt ?? a.CreatedAt ?? 0).getTime();
      const tb = new Date(b.createdAt ?? b.CreatedAt ?? 0).getTime();
      return ta - tb;
    });
  }, []);

  useEffect(() => {
    if (!projectIdFromUrl) {
      setOutputsList([]);
      setSelectedOutputId(null);
      return;
    }
    projectOutputService
      .getOutputsByProjectId(projectIdFromUrl)
      .then((list) => {
        const sorted = sortOutputsPastToFuture(list);
        setOutputsList(sorted);
        if (sorted.length === 0) return;
        const turns: ChatTurn[] = [];
        sorted.forEach((output, idx) => {
          const outputId = output.id ?? output.Id ?? `out-${idx}`;
          const userText = output.systemPrompt ?? "";
          const createdAtStr = output.createdAt ?? output.CreatedAt;
          const completedAt = createdAtStr
            ? new Date(createdAtStr).getTime()
            : undefined;
          const taskStatus =
            output.status === "Success"
              ? ("Success" as TaskStatus)
              : ("Failed" as TaskStatus);
          const steps = parseStepsFromOutput(output.stepOutput);
          turns.push({ id: `user-${outputId}`, role: "user", text: userText });
          turns.push({
            id: `ast-${outputId}`,
            role: "assistant",
            status: "done",
            completedAt,
            steps,
            tasks: TASK_IDS.map((t) => ({
              ...t,
              status: taskStatus,
              progress: output.status === "Success" ? 100 : 0,
            })),
            tsx: output.generatedTsx,
            html: output.generatedHtml,
            outputId,
          });
        });
        setChatTurns(turns);
        const latest = sorted[sorted.length - 1];
        const latestId = latest?.id ?? latest?.Id ?? null;
        setSelectedOutputId(latestId);
        setGeneratedTsx(latest?.generatedTsx ?? "");
        setGeneratedHtml(latest?.generatedHtml ?? "");
        setHasRunOnce(sorted.length > 0);
        setOutputTab("code");
        if (latest) {
          const taskStatus =
            latest.status === "Success"
              ? ("Success" as TaskStatus)
              : ("Failed" as TaskStatus);
          setTasks(
            TASK_IDS.map((t) => ({
              ...t,
              status: taskStatus,
              progress: latest.status === "Success" ? 100 : 0,
            })),
          );
        }
      })
      .catch(() => {
        setOutputsList([]);
        setSelectedOutputId(null);
      });
  }, [projectIdFromUrl, sortOutputsPastToFuture]);

  useEffect(() => {
    if (!selectedOutputId || outputsList.length === 0) return;
    const out = outputsList.find((o) => (o.id ?? o.Id) === selectedOutputId);
    if (out) {
      setGeneratedTsx("// Loading code...");
      setGeneratedHtml("");
      Promise.all([
        fetchContentIfUrl(out.generatedTsx ?? ""),
        fetchContentIfUrl(out.generatedHtml ?? "")
      ]).then(([tsxStr, htmlStr]) => {
        setGeneratedTsx(tsxStr);
        setGeneratedHtml(htmlStr);
      });
    }
  }, [selectedOutputId, outputsList]);

  useEffect(() => {
    if (!showAdvanced) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsidePanel = advancedPanelRef.current?.contains(target);
      const isPlusArea = plusMenuRef.current?.contains(target);
      const isInsidePopup = document
        .getElementById("plus-menu-portal")
        ?.contains(target);
      if (!isInsidePanel && !isPlusArea && !isInsidePopup) {
        setShowAdvanced(false);
        setOpenSection(null);
      }
    };
    const t = setTimeout(
      () => document.addEventListener("click", onDocClick, true),
      0,
    );
    return () => {
      clearTimeout(t);
      document.removeEventListener("click", onDocClick, true);
    };
  }, [showAdvanced]);

  const handleGenerate = async () => {
    const userText = prompt.trim();
    if (!userText) return;
    setHasRunOnce(true);
    setIsSaving(true);
    const userTurnId = `user-${Date.now()}`;
    const assistantTurnId = `ast-${Date.now()}`;
    const initialTasks = TASK_IDS.map((t, i) => ({
      ...t,
      status: (i === 0 ? "Running" : "Pending") as TaskStatus,
      progress: i === 0 ? 20 : 0,
    }));
    setRunningStepIndex(0);
    setChatTurns((prev) => [
      ...prev,
      { id: userTurnId, role: "user", text: userText },
      {
        id: assistantTurnId,
        role: "assistant",
        status: "running",
        tasks: initialTasks,
      },
    ]);
    setTasks((prev) =>
      prev.map((t, i) => ({
        ...t,
        status: i === 0 ? "Running" : "Pending",
        progress: i === 0 ? 20 : 0,
      })),
    );
    setPrompt("");

    sessionStorage.setItem("last_ui_prompt", userText);
    sessionStorage.setItem("last_schema_prompt", erd);

    try {
      setTasks((prev) =>
        prev.map((t, i) =>
          i <= 1
            ? {
              ...t,
              status: "Running" as TaskStatus,
              progress: i === 0 ? 100 : 50,
            }
            : t,
        ),
      );
      setChatTurns((prev) =>
        prev.map((turn) =>
          turn.id === assistantTurnId && turn.role === "assistant"
            ? {
              ...turn,
              tasks: TASK_IDS.map((t, i) => ({
                ...t,
                status: i <= 1 ? "Running" : "Pending",
                progress: i === 0 ? 100 : 50,
              })),
            }
            : turn,
        ),
      );
      const result = await generateCode({
        systemPrompt: userText,
        erdSchema: erd,
        apiSpec,
        designSystem,
      });
      const { steps, tsx, html } = result;
      setGeneratedTsx(tsx);
      setGeneratedHtml(html);
      const isError = tsx.startsWith("// Error");
      const finalTasks = TASK_IDS.map((t, i) => ({
        ...t,
        status: (isError
          ? i === 0
            ? "Failed"
            : "Pending"
          : "Success") as TaskStatus,
        progress: isError ? 0 : 100,
      }));
      setTasks((prev) =>
        prev.map((t) => ({
          ...t,
          status: isError
            ? t.status === "Running"
              ? "Failed"
              : t.status
            : ("Success" as TaskStatus),
          progress: isError ? 0 : 100,
        })),
      );
      if (!isError) {
        sessionStorage.setItem("last_generated_code", tsx);
        sessionStorage.setItem("last_generated_html", html);
        try {
          localStorage.setItem("editor_last_preview_html", html);
          localStorage.setItem(
            "editor_last_preview_updated",
            String(Date.now()),
          );
        } catch { }
        savePromptToHistory(userText);
        setOutputTab("code");
        const stepOutputJson = JSON.stringify(steps ?? []);
        const promptHistoryEntries = [
          ...chatTurns.map((t) => ({
            role: t.role,
            content:
              t.role === "user"
                ? t.text
                : ((t as { steps?: string[] }).steps ?? []).join("\n"),
          })),
          { role: "user" as const, content: userText },
        ];
        const promptHistoryJson = JSON.stringify(promptHistoryEntries);
        const doSaveOutput = async (projectId: string) => {
          setOutputSaveError(null);
          try {
            let finalTsx = tsx;
            let finalHtml = html;
            const tsxPath = `projects/${projectId}/${Date.now()}_code.tsx`;
            const htmlPath = `projects/${projectId}/${Date.now()}_page.html`;
            
            const uploadedTsx = await uploadToSupabaseAndGetUrl(tsx, tsxPath, 'text/plain');
            if (uploadedTsx) finalTsx = uploadedTsx;
            
            const uploadedHtml = await uploadToSupabaseAndGetUrl(htmlForPreview(html, false), htmlPath, 'text/html');
            if (uploadedHtml) finalHtml = uploadedHtml;

            const savePayload = {
              generatedTsx: finalTsx,
              generatedHtml: finalHtml,
              systemPrompt: userText,
              userPrompt: userText,
              taskStatus: "Success",
              stepOutput: stepOutputJson,
              promptHistory: promptHistoryJson,
            };
            await projectOutputService.saveOutput(projectId, savePayload);
            changeLogService.create({ entityType: "ProjectOutput", entityId: projectId, action: "Generate" }).catch(() => { });
            if (html)
              try {
                localStorage.setItem("project_preview_" + projectId, html);
              } catch { }
            setOutputSaved(true);
            setTimeout(() => setOutputSaved(false), 3000);
            projectOutputService
              .getOutputsByProjectId(projectId)
              .then((list) => {
                const sorted = sortOutputsPastToFuture(list);
                setOutputsList(sorted);
                const turns: ChatTurn[] = [];
                sorted.forEach((output, idx) => {
                  const outputId = output.id ?? output.Id ?? `out-${idx}`;
                  const userText = output.systemPrompt ?? "";
                  const createdAtStr = output.createdAt ?? output.CreatedAt;
                  const completedAt = createdAtStr
                    ? new Date(createdAtStr).getTime()
                    : undefined;
                  const taskStatus =
                    output.status === "Success"
                      ? ("Success" as TaskStatus)
                      : ("Failed" as TaskStatus);
                  const steps = parseStepsFromOutput(output.stepOutput);
                  turns.push({
                    id: `user-${outputId}`,
                    role: "user",
                    text: userText,
                  });
                  turns.push({
                    id: `ast-${outputId}`,
                    role: "assistant",
                    status: "done",
                    completedAt,
                    steps,
                    tasks: TASK_IDS.map((t) => ({
                      ...t,
                      status: taskStatus,
                      progress: output.status === "Success" ? 100 : 0,
                    })),
                    tsx: output.generatedTsx,
                    html: output.generatedHtml,
                    outputId,
                  });
                });
                setChatTurns(turns);
                const latest = sorted[sorted.length - 1];
                const latestId = latest?.id ?? latest?.Id ?? null;
                setSelectedOutputId(latestId);
                setGeneratedTsx(latest?.generatedTsx ?? "");
                setGeneratedHtml(latest?.generatedHtml ?? "");
              })
              .catch(() => { });
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            console.error("[ProjectOutput] save failed:", e);
            setOutputSaveError(msg);
          }
        };
        const derivedName =
          (userText.slice(0, 80) || "Generated").trim() || "Generated";
        if (projectIdFromUrl) {
          void doSaveOutput(projectIdFromUrl);
          projectService
            .update(projectIdFromUrl, {
              projectType: "Completed",
              systemPrompt: userText,
              entitySchema: erd || undefined,
            })
            .catch(() => { });
        } else {
          organizationService
            .getAll()
            .then((res) => {
              const content = getContent(res.data) as
                | {
                  TotalItems?: { id?: string; Id?: string }[];
                  totalItems?: { id?: string; Id?: string }[];
                }
                | undefined;
              const list = Array.isArray(content?.TotalItems)
                ? content.TotalItems
                : Array.isArray(content?.totalItems)
                  ? content.totalItems
                  : [];
              const firstId = list[0]?.id ?? list[0]?.Id;
              if (firstId) {
                projectService
                  .create({
                    organizationId: String(firstId),
                    name: derivedName,
                    projectType: "Completed",
                    systemPrompt: userText,
                    entitySchema: erd || undefined,
                  })
                  .then((createRes) => {
                    const created = getContent(createRes.data) as
                      | {
                        id?: string;
                        Id?: string;
                        name?: string;
                        Name?: string;
                      }
                      | undefined;
                    const projectId = created?.id ?? created?.Id;
                    if (projectId) {
                      const pid = String(projectId);
                      void doSaveOutput(pid);
                      if (html)
                        try {
                          localStorage.setItem("project_preview_" + pid, html);
                        } catch { }
                      setSearchParams({ projectId: pid });
                    }
                  })
                  .catch((e) => {
                    console.error("[Project] create failed:", e);
                  });
              }
            })
            .catch((e) => {
              console.error("[Organization] getAll failed:", e);
            });
        }
      } else {
        const failedPayload = {
          systemPrompt: userText,
          userPrompt: userText,
          taskStatus: "Failed",
          stepOutput: JSON.stringify(steps ?? []),
          promptHistory: JSON.stringify([
            ...chatTurns.map((t) => ({
              role: t.role,
              content:
                t.role === "user"
                  ? t.text
                  : ((t as { steps?: string[] }).steps ?? []).join("\n"),
            })),
            { role: "user" as const, content: userText },
          ]),
        };
        if (projectIdFromUrl)
          projectOutputService
            .saveOutput(projectIdFromUrl, failedPayload)
            .catch(() => { });
        setOutputTab("tasks");
      }
      setChatTurns((prev) =>
        prev.map((turn) =>
          turn.id === assistantTurnId && turn.role === "assistant"
            ? {
              ...turn,
              status: isError ? "error" : "done",
              completedAt: isError ? undefined : Date.now(),
              steps: steps?.length >= 4 ? steps : undefined,
              tasks: finalTasks,
              tsx,
              html,
            }
            : turn,
        ),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const errorTsx = `// Error: ${msg}`;
      const errorHtml = `<!-- Error: ${msg} -->`;
      setGeneratedTsx(errorTsx);
      setGeneratedHtml(errorHtml);
      setTasks((prev) =>
        prev.map((t) => ({
          ...t,
          status: t.status === "Running" ? "Failed" : t.status,
          progress: t.status === "Running" ? 0 : t.progress,
        })),
      );
      setChatTurns((prev) =>
        prev.map((turn) =>
          turn.id === assistantTurnId && turn.role === "assistant"
            ? {
              ...turn,
              status: "error",
              tasks: TASK_IDS.map((t) => ({
                ...t,
                status: "Failed" as TaskStatus,
                progress: 0,
              })),
              tsx: errorTsx,
              html: errorHtml,
            }
            : turn,
        ),
      );
      setOutputTab("tasks");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    const text = activeCodeTab === "tsx" ? generatedTsx : generatedHtml;
    const fallback =
      activeCodeTab === "tsx"
        ? "// Run generation first."
        : "<!-- Run generation first. -->";
    navigator.clipboard.writeText(text || fallback);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusClass = (status: string) => {
    if (status === "Success")
      return "bg-primary/10 text-primary border-primary/20";
    if (status === "Running")
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    if (status === "Failed")
      return "bg-red-500/10 text-red-500 border-red-500/20";
    return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  };

  const hasSuccessOutput = Boolean(
    generatedTsx && !generatedTsx.startsWith("// Error"),
  );
  const showOutputPanel = hasRunOnce && !isSaving && hasSuccessOutput;
  const showTabs = showOutputPanel && (generatedTsx || generatedHtml);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      <div className="flex-shrink-0 flex flex-wrap items-center gap-1.5 text-xs px-4 pt-2 border-b border-slate-200 dark:border-[#282e39] pb-2">
        <Link
          className="text-slate-500 dark:text-[#9da6b9] hover:text-primary font-medium"
          to="/dashboard"
        >
          Projects
        </Link>
        <span className="material-symbols-outlined text-slate-400 text-[10px]">
          chevron_right
        </span>
        <span className="text-slate-900 dark:text-white font-medium">
          {projectName.trim() || "Create New Project"}
        </span>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left: Chat log + input (ChatGPT style) */}
        <div
          className={`flex flex-col min-h-0 ${showOutputPanel ? "w-[48%]" : "flex-1"} min-w-0 transition-all duration-200`}
        >
          <div className="flex-1 flex flex-col min-h-0 max-w-4xl mx-auto w-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar flex flex-col">
              {chatTurns.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] py-12 px-4">
                  <div className="rounded-3xl bg-gradient-to-b from-slate-50 to-slate-100/80 dark:from-[#1c1f27] dark:to-[#161921] border border-slate-200/80 dark:border-[#282e39] p-10 max-w-md w-full text-center shadow-sm">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 dark:bg-primary/20 mb-5">
                      <span className="material-symbols-outlined text-3xl text-primary">
                        auto_awesome
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2 tracking-tight">
                      Describe your idea
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      Type in the box below and AI will generate React (TSX) and
                      HTML for you.
                    </p>
                  </div>
                  {/* Template Prompts for Newbies */}
                  <div className="mt-8 w-full max-w-3xl">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 px-1">
                      Get started with templates
                    </p>

                    {/* Đã thay ScrollContainer bằng div, bỏ snap-x */}
                    <div
                      ref={templateScrollRef}
                      onMouseDown={handleTemplateMouseDown}
                      onMouseLeave={handleTemplateMouseLeave}
                      onMouseUp={handleTemplateMouseUp}
                      onMouseMove={handleTemplateMouseMove}
                      onWheel={handleTemplateWheel}
                      className={`flex overflow-x-auto gap-4 pb-4 select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-1 ${isTemplateDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    >
                      {PROMPT_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={(e) => {
                            if (isTemplateDragging) e.preventDefault();
                            else setPrompt(tpl.prompt);
                          }}
                          // Đã bỏ class snap-start
                          className="group relative flex flex-col flex-shrink-0 w-[240px] sm:w-[260px] text-left rounded-2xl border border-slate-200 dark:border-[#282e39] bg-white dark:bg-[#1c1f27] p-5 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-[#232a3b] transition-all duration-300 active:scale-[0.98] shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.02)]"
                        >
                          <div className="flex items-center gap-3 mb-3 pointer-events-none">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/15 dark:group-hover:bg-primary/30 transition-colors duration-300">
                              <span className="material-symbols-outlined text-[20px] text-primary group-hover:scale-110 transition-transform duration-300">
                                {tpl.icon}
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                              {tpl.title}
                            </span>
                          </div>
                          <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 pointer-events-none">
                            {tpl.description}
                          </p>
                          <div className="absolute top-5 right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0 duration-300 pointer-events-none">
                            <span className="material-symbols-outlined text-[18px] text-primary">
                              arrow_forward
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {chatTurns.map((turn, turnIndex) => {
                if (turn.role === "user") {
                  return (
                    <div key={turn.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary/10 dark:bg-primary/20 px-4 py-2.5">
                        <p className="text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap">
                          {turn.text}
                        </p>
                      </div>
                    </div>
                  );
                }
                const isThisRunning =
                  turn.role === "assistant" && turn.status === "running";
                const hasRealSteps =
                  turn.status === "done" &&
                  turn.steps &&
                  turn.steps.length >= 4;
                const userPrompt =
                  turnIndex > 0 && chatTurns[turnIndex - 1]?.role === "user"
                    ? (chatTurns[turnIndex - 1] as { text: string }).text
                    : "";
                const lang = detectPromptLanguage(userPrompt);
                const labels = EDITOR_LABELS[lang];
                const stepsWhileRunning =
                  lang === "vi"
                    ? STEPS_WHILE_RUNNING_VI
                    : STEPS_WHILE_RUNNING_EN;
                const stepTexts = hasRealSteps
                  ? turn.steps!.slice(0, 4)
                  : stepsWhileRunning;
                const visibleCount = hasRealSteps
                  ? 4
                  : isThisRunning
                    ? Math.min(runningStepIndex + 1, 4)
                    : 0;
                const completedTime =
                  turn.status === "done" && turn.completedAt != null
                    ? new Date(turn.completedAt).toLocaleTimeString(
                      lang === "vi" ? "vi-VN" : "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: lang === "en",
                      },
                    )
                    : "";
                const turnOutputId = turn.outputId;
                const isSelected =
                  turnOutputId && turnOutputId === selectedOutputId;
                return (
                  <div key={turn.id} className="flex justify-start">
                    <div
                      role={turnOutputId ? "button" : undefined}
                      onClick={
                        turnOutputId
                          ? () => {
                            setSelectedOutputId(turnOutputId);
                          }
                          : undefined
                      }
                      className={`max-w-[90%] rounded-2xl rounded-bl-md bg-slate-100 dark:bg-[#1c1f27] border px-4 py-3 ${turnOutputId ? "cursor-pointer hover:border-primary/40 transition-colors" : "border-slate-200 dark:border-[#282e39]"} ${isSelected ? "ring-2 ring-primary border-primary" : "border-slate-200 dark:border-[#282e39]"}`}
                    >
                      {(turn.status === "running" ||
                        turn.status === "done") && (
                          <>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                              {turn.status === "running"
                                ? labels.generating
                                : completedTime
                                  ? labels.completedAt(completedTime)
                                  : labels.completed}
                            </p>
                            <div className="space-y-4">
                              {stepTexts
                                .slice(0, visibleCount)
                                .map((paragraph, i) => {
                                  const isDone =
                                    turn.status === "done" ||
                                    (isThisRunning && i < runningStepIndex) ||
                                    (isThisRunning && runningStepIndex >= 4);
                                  const isCurrent =
                                    isThisRunning &&
                                    i === runningStepIndex &&
                                    runningStepIndex < 4;
                                  return (
                                    <div key={i} className="flex gap-2">
                                      <span className="flex-shrink-0 mt-0.5">
                                        {isDone ? (
                                          <span
                                            className="text-primary"
                                            title={labels.doneTitle}
                                          >
                                            <span className="material-symbols-outlined text-[14px]">
                                              check_circle
                                            </span>
                                          </span>
                                        ) : (
                                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
                                        )}
                                      </span>
                                      <p
                                        className={`text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words whitespace-pre-wrap min-w-0 ${isCurrent ? "text-slate-700 dark:text-slate-200" : ""}`}
                                      >
                                        {paragraph}
                                      </p>
                                    </div>
                                  );
                                })}
                            </div>
                            {turn.status === "running" && (
                              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200 dark:border-[#282e39]">
                                <span className="material-symbols-outlined text-primary text-[18px] animate-spin">
                                  progress_activity
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {labels.processing}
                                </span>
                              </div>
                            )}
                            {turn.status === "done" && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                                {isSelected
                                  ? labels.viewingThis
                                  : labels.viewCode}
                              </p>
                            )}
                          </>
                        )}
                      {turn.status === "error" && (
                        <p className="text-sm text-red-500 dark:text-red-400">
                          {turn.tsx?.replace(/^\/\/\s*Error:\s*/i, "").trim() ||
                            labels.error}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input: + bên trái, placeholder giữa, nút gửi bên phải */}
            <div className="p-4 pt-0">
              {showAdvanced && openSection && (
                <div
                  ref={advancedPanelRef}
                  className="mb-3 rounded-xl border border-slate-200 dark:border-[#282e39] bg-white dark:bg-[#1c1f27] p-3 max-h-[280px] overflow-y-auto custom-scrollbar"
                >
                  {openSection === "erd" && (
                    <SectionCard
                      title="ERD / Schema"
                      subtitle="DBML"
                      value={erd}
                      onChange={setErd}
                      placeholder="Tables..."
                    />
                  )}
                  {openSection === "api" && (
                    <SectionCard
                      title="API Specs"
                      subtitle="OpenAPI"
                      value={apiSpec}
                      onChange={setApiSpec}
                      placeholder="OpenAPI..."
                    />
                  )}
                  {openSection === "design" && (
                    <SectionCard
                      title="Design System"
                      subtitle="JSON"
                      value={designSystem}
                      onChange={setDesignSystem}
                      placeholder="Colors..."
                    />
                  )}
                </div>
              )}
              <div className="flex items-end gap-2 rounded-2xl border border-slate-200 dark:border-[#282e39] bg-white dark:bg-[#1c1f27] shadow-sm overflow-visible focus-within:ring-2 focus-within:ring-primary/30 min-h-[48px] py-1 pl-1 pr-2">
                <div ref={plusMenuRef} className="relative flex-shrink-0 z-20">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPlusMenuOpen((v) => !v);
                      setPlusMenuSubmenu(null);
                    }}
                    className={`flex-shrink-0 p-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#161921] transition-colors ${plusMenuOpen ? "text-primary bg-primary/5" : ""}`}
                    title="Add ERD, API Spec, or Design System"
                  >
                    <span className="material-symbols-outlined text-[24px]">
                      add
                    </span>
                  </button>
                  {plusMenuOpen &&
                    createPortal(
                      <div
                        id="plus-menu-portal"
                        className="fixed z-[100] w-60 rounded-xl border border-slate-200 dark:border-[#282e39] bg-white dark:bg-[#1c1f27] shadow-lg py-1 transform -translate-y-full"
                        style={{
                          left: popoverStyle.left,
                          top: popoverStyle.top,
                        }}
                      >
                        {!plusMenuSubmenu ? (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenSection("erd");
                                setShowAdvanced(true);
                                setPlusMenuOpen(false);
                                setPlusMenuSubmenu(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#282e39]"
                            >
                              <span className="material-symbols-outlined text-[20px] text-slate-500">
                                schema
                              </span>
                              ERD / Schema
                              <span className="material-symbols-outlined text-[16px] ml-auto text-slate-400">
                                chevron_right
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenSection("api");
                                setShowAdvanced(true);
                                setPlusMenuOpen(false);
                                setPlusMenuSubmenu(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#282e39]"
                            >
                              <span className="material-symbols-outlined text-[20px] text-slate-500">
                                api
                              </span>
                              API Spec
                              <span className="material-symbols-outlined text-[16px] ml-auto text-slate-400">
                                chevron_right
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPlusMenuSubmenu("design")}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#282e39]"
                            >
                              <span className="material-symbols-outlined text-[20px] text-slate-500">
                                palette
                              </span>
                              Design System
                              <span className="material-symbols-outlined text-[16px] ml-auto text-slate-400">
                                chevron_right
                              </span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setPlusMenuSubmenu(null)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#282e39]"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                arrow_back
                              </span>
                              Back
                            </button>
                            <div className="border-t border-slate-200 dark:border-[#282e39] my-1" />
                            {Object.entries(DESIGN_SYSTEM_PRESETS).map(
                              ([id, { label, json }]) => (
                                <button
                                  key={id}
                                  type="button"
                                  onClick={() => {
                                    try {
                                      setDesignSystem(
                                        JSON.stringify(
                                          JSON.parse(json),
                                          null,
                                          2,
                                        ),
                                      );
                                    } catch {
                                      setDesignSystem(json);
                                    }
                                    setSelectedDesignPreset(id);
                                    setPlusMenuOpen(false);
                                    setPlusMenuSubmenu(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#282e39]"
                                >
                                  <span className="material-symbols-outlined text-[20px] text-primary">
                                    palette
                                  </span>
                                  {label}
                                </button>
                              ),
                            )}
                            <div className="border-t border-slate-200 dark:border-[#282e39] my-1" />
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDesignPreset(null);
                                setDesignSystem("");
                                setOpenSection("design");
                                setShowAdvanced(true);
                                setPlusMenuOpen(false);
                                setPlusMenuSubmenu(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#282e39]"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                edit_note
                              </span>
                              Custom (edit JSON)
                            </button>
                          </>
                        )}
                      </div>,
                      document.body,
                    )}
                </div>
                {selectedDesignPreset &&
                  DESIGN_SYSTEM_PRESETS[selectedDesignPreset] && (
                    <div className="flex items-center mb-1 gap-1.5 flex-shrink-0 rounded-full bg-slate-100 dark:bg-[#282e39] border border-slate-200 dark:border-[#3b4354] pl-2.5 pr-1.5 py-1">
                      <span className="material-symbols-outlined text-primary text-[16px]">
                        palette
                      </span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        {DESIGN_SYSTEM_PRESETS[selectedDesignPreset].label}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDesignPreset(null);
                          setDesignSystem(DEFAULT_DESIGN_SYSTEM);
                        }}
                        className="p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:text-slate-300 dark:hover:bg-[#3b4354] transition-colors"
                        aria-label="Remove design system"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          close
                        </span>
                      </button>
                    </div>
                  )}
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                  placeholder="Ask anything — e.g. login page, dashboard, form..."
                  className="flex-1 min-h-[44px] max-h-[200px] resize-none overflow-y-auto py-2.5 px-3 text-sm text-slate-900 dark:text-white bg-transparent border-0 focus:ring-0 placeholder:text-slate-400 dark:placeholder:text-[#4d576e] custom-scrollbar"
                  rows={1}
                />
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isSaving || !prompt.trim()}
                  className="flex-shrink-0 p-3 text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Send"
                >
                  <span className="material-symbols-outlined text-[24px]">
                    send
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Code / Preview / Tasks (chỉ sau khi đã chạy) */}
        {showOutputPanel && (
          <div className="flex-1 flex flex-col min-h-0 min-w-0 rounded-xl border border-slate-200 dark:border-[#282e39] bg-white dark:bg-[#1c1f27] overflow-hidden border-l">
            <div className="flex border-b border-slate-200 dark:border-[#282e39]">
              {(["code", "preview", "tasks"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setOutputTab(tab)}
                  className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 px-4 text-sm font-medium capitalize border-b-2 transition-colors ${outputTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 dark:text-[#9da6b9] hover:text-slate-700 dark:hover:text-white"
                    }`}
                >
                  {tab === "code" && (
                    <span className="material-symbols-outlined text-lg">
                      code
                    </span>
                  )}
                  {tab === "preview" && (
                    <span className="material-symbols-outlined text-lg">
                      desktop_windows
                    </span>
                  )}
                  {tab === "tasks" && (
                    <span className="material-symbols-outlined text-lg">
                      list
                    </span>
                  )}
                  {tab === "code" && "Code View"}
                  {tab === "preview" && "Visual Preview"}
                  {tab === "tasks" && "Task Status"}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {outputTab === "code" && (
                <div className="flex flex-col min-h-0 flex-1">
                  <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-[#282e39] bg-slate-50 dark:bg-[#161921]">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setActiveCodeTab("tsx")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${activeCodeTab === "tsx" ? "bg-primary/20 text-primary" : "text-slate-500 dark:text-[#9da6b9] hover:bg-slate-200 dark:hover:bg-[#282e39]"}`}
                      >
                        index.tsx
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCodeTab("html")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${activeCodeTab === "html" ? "bg-primary/20 text-primary" : "text-slate-500 dark:text-[#9da6b9] hover:bg-slate-200 dark:hover:bg-[#282e39]"}`}
                      >
                        index.html
                      </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {(outputSaved || outputSaveError) && (
                        <span
                          className={`text-xs ${outputSaved ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {outputSaved
                            ? "Saved to project output"
                            : outputSaveError}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#3b4354] text-slate-700 dark:text-[#9da6b9] hover:bg-slate-100 dark:hover:bg-[#282e39] text-xs font-medium"
                      >
                        <span className="material-symbols-outlined text-sm">
                          content_copy
                        </span>
                        {copied ? "Copied!" : "Copy"}
                      </button>
                      <Link
                        to={`/github-integration${projectIdFromUrl ? `?projectId=${projectIdFromUrl}` : ""}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 text-xs font-semibold"
                      >
                        <span className="material-symbols-outlined text-sm">
                          upload
                        </span>
                        Push to GitHub
                      </Link>
                    </div>
                  </div>
                  <div className={`flex-1 min-h-0 overflow-auto custom-scrollbar ${theme === 'dark' ? 'bg-[#0d1117]' : 'bg-[#fafbfc]'}`}>
                    <SyntaxHighlighter
                      language={activeCodeTab === "tsx" ? "tsx" : "html"}
                      style={theme === 'dark' ? vscDarkPlus : oneLight}
                      customStyle={{
                        margin: 0,
                        padding: '1rem',
                        background: 'transparent',
                        fontSize: '0.875rem',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                      }}
                      showLineNumbers={true}
                    >
                      {activeCodeTab === "tsx"
                        ? generatedTsx || "// Enter a prompt and click Send to generate TSX + HTML code."
                        : generatedHtml || "<!-- Enter a prompt and click Send to generate TSX + HTML code. -->"}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )}

              {outputTab === "preview" && (
                <div className="flex flex-col h-full p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-500 dark:text-[#9da6b9]">
                      Device preview
                    </span>
                    <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-[#3b4354] p-1">
                      {[
                        { id: "desktop" as const, icon: "desktop_windows" },
                        { id: "tablet" as const, icon: "tablet" },
                        { id: "mobile" as const, icon: "smartphone" },
                      ].map(({ id, icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setDevice(id)}
                          className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-md transition-colors ${device === id
                            ? "bg-primary/20 text-primary"
                            : "text-slate-500 dark:text-[#9da6b9] hover:bg-slate-100 dark:hover:bg-[#282e39]"
                            }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {icon}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div
                    className={`flex-1 rounded-xl border border-slate-200 dark:border-[#282e39] bg-white dark:bg-slate-900 overflow-hidden transition-all ${device === "desktop"
                      ? "max-w-full"
                      : device === "tablet"
                        ? "max-w-[768px] mx-auto w-full"
                        : "max-w-[375px] mx-auto w-full"
                      }`}
                  >
                    <iframe
                      title="Preview"
                      srcDoc={
                        generatedHtml
                          ? htmlForPreview(generatedHtml)
                          : htmlForPreview("<html><body style='margin:0;padding:24px;font-family:system-ui'><h1>Generated UI Preview</h1><p>Run generation to see TSX + HTML. Preview shows HTML.</p></body></html>")
                      }
                      className="w-full h-full min-h-[280px]"
                    />
                  </div>
                </div>
              )}

              {outputTab === "tasks" && (
                <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                  <ul className="space-y-4">
                    {tasks.map((task) => (
                      <li
                        key={task.id}
                        className="rounded-xl border border-slate-200 dark:border-[#282e39] bg-slate-50 dark:bg-[#161921] p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900 dark:text-white">
                            {task.label}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusClass(task.status)}`}
                          >
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
        <span className="text-xs text-slate-500 dark:text-[#9da6b9] uppercase tracking-wider">
          {subtitle}
        </span>
        <span className="text-sm font-semibold text-slate-900 dark:text-white">
          {title}
        </span>
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
