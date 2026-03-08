import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '@/src/services/authService';

interface GitHubCallbackProps {
  onLogin?: () => void;
}

export default function GitHubCallback({ onLogin }: GitHubCallbackProps) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(true);
    const hasProcessed = useRef(false); // Prevent duplicate processing across re-renders
    const isLinking = searchParams.get('state') === 'github-integration';

    useEffect(() => {
        const handleCallback = async () => {
            if (hasProcessed.current) {
                console.log("Already processed, skipping...");
                return;
            }
            hasProcessed.current = true;

            const code = searchParams.get('code');
            const errorParam = searchParams.get('error');

            // Check for errors from GitHub
            if (errorParam) {
                setError(`GitHub authorization failed: ${errorParam}`);
                setIsProcessing(false);
                setTimeout(() => navigate(isLinking ? '/github-integration' : '/login'), 3000);
                return;
            }

            // Check if code exists
            if (!code) {
                setError('No authorization code received');
                setIsProcessing(false);
                setTimeout(() => navigate(isLinking ? '/github-integration' : '/login'), 3000);
                return;
            }

            try {
                if (isLinking) {
                    // User is already logged in — just link GitHub to current account
                    console.log("Linking GitHub account to current user...");
                    await authService.linkGitHub(code);
                    console.log("GitHub link success");
                    navigate('/github-integration', { replace: true });
                } else {
                    // Normal login flow
                    console.log("Exchanging GitHub code for token...");
                    const response = await authService.loginWithGitHub(code);
                    console.log("GitHub Login Success", response.data);

                    const data = response.data as Record<string, unknown> | undefined;
                    const content = (data?.content ?? data?.Content ?? data) as Record<string, unknown> | undefined;
                    const inner = (content?.content ?? content?.Content ?? content) as Record<string, unknown> | undefined;
                    const token =
                        (content?.token as string) ??
                        (content?.Token as string) ??
                        (inner?.token as string) ??
                        (inner?.Token as string) ??
                        (data?.token as string) ??
                        (data?.Token as string);

                    if (token && typeof token === 'string' && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token.trim())) {
                        const jwt = token.trim();
                        localStorage.setItem('token', jwt);
                        localStorage.setItem('user', JSON.stringify(content ?? data?.content ?? {}));
                        try {
                            await authService.getMe(jwt);
                        } catch (e) {
                            const err = e as { response?: { data?: { message?: string }; status?: number } };
                            const msg = err.response?.data?.message;
                            console.error('getMe after GitHub login failed', err.response?.status, err.response?.data);
                            setError(msg ? `Xác thực thất bại: ${msg}` : 'Phiên đăng nhập không xác thực được. Vui lòng thử lại.');
                            setIsProcessing(false);
                            return;
                        }
                        onLogin?.();
                        navigate('/dashboard', { replace: true });
                    } else {
                        throw new Error('Token not found or invalid (must be JWT from backend)');
                    }
                }
            } catch (err: unknown) {
                console.error("GitHub Login Error", err);
                const error = err as { response?: { data?: { message?: string; content?: any } }; message?: string };
                const errorMessage = error.response?.data?.message || error.message || 'GitHub login failed';
                
                console.log("Full error response:", error.response?.data);
                setError(errorMessage);
                setIsProcessing(false);
                setTimeout(() => navigate(isLinking ? '/github-integration' : '/login'), 3000);
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
            <div className="text-center">
                {isProcessing && !error && (
                    <>
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {isLinking ? 'Connecting GitHub account...' : 'Completing GitHub sign in...'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">Please wait</p>
                    </>
                )}
                
                {error && (
                    <>
                        <div className="text-red-500 text-5xl mb-4">✕</div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Authentication Failed
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                        <p className="text-sm text-gray-500">Redirecting to login...</p>
                    </>
                )}
            </div>
        </div>
    );
}
