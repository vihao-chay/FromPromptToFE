import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '@/src/services/authService';

export default function GitHubCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(true);
    const hasProcessed = useRef(false); // Prevent duplicate processing across re-renders

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
                setTimeout(() => navigate('/login'), 3000);
                return;
            }

            // Check if code exists
            if (!code) {
                setError('No authorization code received');
                setIsProcessing(false);
                setTimeout(() => navigate('/login'), 3000);
                return;
            }

            try {
                console.log("Exchanging GitHub code for token...");
                // Exchange code for access token via backend
                const response = await authService.loginWithGitHub(code);
                console.log("GitHub Login Success", response.data);
                
                const token = response.data.content?.token || response.data.token;

                if (token) {
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(response.data.content));
                    
                    // Redirect to dashboard
                    navigate('/dashboard');
                } else {
                    throw new Error('Token not found in response');
                }
            } catch (err: unknown) {
                console.error("GitHub Login Error", err);
                const error = err as { response?: { data?: { message?: string; content?: any } }; message?: string };
                const errorMessage = error.response?.data?.message || error.message || 'GitHub login failed';
                
                console.log("Full error response:", error.response?.data);
                setError(errorMessage);
                setIsProcessing(false);
                setTimeout(() => navigate('/login'), 3000);
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
                            Completing GitHub sign in...
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
