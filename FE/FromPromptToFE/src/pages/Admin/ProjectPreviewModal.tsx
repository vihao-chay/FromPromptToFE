import React, { useEffect, useState } from 'react';
import adminService, { AdminProjectPreview } from '../../services/adminService';

interface ProjectPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string | null;
}

const ProjectPreviewModal: React.FC<ProjectPreviewModalProps> = ({ isOpen, onClose, projectId }) => {
    const [preview, setPreview] = useState<AdminProjectPreview | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // active tab
    const [activeTab, setActiveTab] = useState<'prompt' | 'history' | 'code'>('prompt');

    useEffect(() => {
        if (isOpen && projectId) {
            setLoading(true);
            setError(null);
            setActiveTab('prompt'); // reset
            adminService.getProjectPreview(projectId)
                .then(res => {
                    setPreview(res.data.content);
                })
                .catch(err => {
                    setError(err.response?.data?.message || 'Failed to load preview');
                })
                .finally(() => setLoading(false));
        } else {
            setPreview(null);
        }
    }, [isOpen, projectId]);

    if (!isOpen) return null;

    const renderChatHistory = () => {
        if (!preview?.promptHistory) return <p className="text-slate-500 italic">No chat history available.</p>;
        try {
            const history = JSON.parse(preview.promptHistory);
            if (Array.isArray(history)) {
                return (
                    <div className="space-y-4">
                        {history.map((msg: any, i: number) => (
                            <div key={i} className={`p-4 rounded-xl text-sm ${msg.role === 'user' ? 'bg-primary/10 text-slate-900 border border-primary/20 dark:text-white dark:bg-primary/20' : 'bg-slate-100 border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}>
                                <p className="font-bold mb-1 capitalize text-xs opacity-70">{msg.role}</p>
                                <pre className="whitespace-pre-wrap font-sans leading-relaxed">{msg.content || msg.text || JSON.stringify(msg)}</pre>
                            </div>
                        ))}
                    </div>
                );
            }
            return <pre className="whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-4 rounded-xl overflow-auto">{preview.promptHistory}</pre>;
        } catch {
            return <pre className="whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-4 rounded-xl overflow-auto">{preview.promptHistory}</pre>;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#151821] rounded-2xl w-full max-w-5xl h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 zoom-in-95 animate-in">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1e28]">
                    <div className="flex flex-col">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">visibility</span>
                            {loading ? 'Loading Preview...' : preview?.name || 'Project Preview'}
                        </h3>
                        {preview?.organizationName && (
                            <p className="text-xs text-slate-500 font-medium mt-1">Org: {preview.organizationName}</p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                        <span className="material-symbols-outlined shrink-0 text-xl">close</span>
                    </button>
                </div>

                {/* Tabs & Content */}
                <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-[#151821]">
                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400">
                            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                            <p className="font-medium animate-pulse">Loading project details...</p>
                        </div>
                    ) : error ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-xl border border-red-200 dark:border-red-800 max-w-md text-center">
                                <span className="material-symbols-outlined text-4xl mb-2">error</span>
                                <p className="font-medium">{error}</p>
                            </div>
                        </div>
                    ) : preview ? (
                        <>
                            {/* Tab Bar */}
                            <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 px-6 pt-4 bg-slate-50/50 dark:bg-[#151821]">
                                <button
                                    className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${activeTab === 'prompt' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                    onClick={() => setActiveTab('prompt')}
                                >
                                    Initial Prompts
                                </button>
                                <button
                                    className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${activeTab === 'history' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                    onClick={() => setActiveTab('history')}
                                >
                                    Chat History
                                </button>
                                <button
                                    className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${activeTab === 'code' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                    onClick={() => setActiveTab('code')}
                                >
                                    Generated Output
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-[#0c0d12]">
                                {activeTab === 'prompt' && (
                                    <div className="grid lg:grid-cols-2 gap-6 h-full">
                                        <div className="flex flex-col bg-white dark:bg-[#1a1e28] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                                            <div className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 border-b border-slate-200 dark:border-slate-800 font-semibold text-indigo-700 dark:text-indigo-400 text-sm flex items-center gap-2">
                                                <span className="material-symbols-outlined text-base">person</span> User Prompt
                                            </div>
                                            <div className="p-4 overflow-auto flex-1">
                                                <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                                                    {preview.userPrompt || <span className="italic text-slate-400">Empty</span>}
                                                </pre>
                                            </div>
                                        </div>
                                        <div className="flex flex-col bg-white dark:bg-[#1a1e28] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                                            <div className="bg-amber-50 dark:bg-amber-900/30 px-4 py-2 border-b border-slate-200 dark:border-slate-800 font-semibold text-amber-700 dark:text-amber-400 text-sm flex items-center gap-2">
                                                <span className="material-symbols-outlined text-base">smart_toy</span> System Prompt
                                            </div>
                                            <div className="p-4 overflow-auto flex-1">
                                                <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-mono text-xs leading-relaxed">
                                                    {preview.systemPrompt || <span className="italic text-slate-400">Empty</span>}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'history' && (
                                    <div className="w-full h-full max-w-4xl mx-auto flex flex-col">
                                        {renderChatHistory()}
                                    </div>
                                )}

                                {activeTab === 'code' && (
                                    <div className="w-full h-full flex flex-col bg-[#1e1e1e] rounded-xl overflow-hidden border border-slate-800">
                                        <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between text-slate-300 text-sm border-b border-[#404040]">
                                            <span className="font-mono text-xs">Generated Code Overview (TSX/HTML)</span>
                                            {preview.generatedTsx && preview.generatedHtml ? (
                                                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">Ready</span>
                                            ) : <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 text-xs">Waiting</span>}
                                        </div>
                                        <div className="flex-1 p-4 overflow-auto">
                                            {preview.generatedTsx ? (
                                                <pre className="text-xs font-mono text-blue-300 leading-relaxed whitespace-pre-wrap">
                                                    {preview.generatedTsx}
                                                </pre>
                                            ) : preview.generatedHtml ? (
                                                <pre className="text-xs font-mono text-orange-300 leading-relaxed whitespace-pre-wrap">
                                                    {preview.generatedHtml}
                                                </pre>
                                            ) : (
                                                <div className="h-full flex items-center justify-center text-slate-500">No code generated yet.</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default ProjectPreviewModal;
