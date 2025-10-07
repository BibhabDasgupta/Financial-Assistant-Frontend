import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleAuthCallback, getCurrentUser } from '../services/authService';
import { useAuth } from '../context/authContext';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const processAuth = async () => {
      try {
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError(decodeURIComponent(errorParam));
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (!accessToken || !refreshToken) {
          setError('Authentication tokens not received');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Store tokens
        const success = handleAuthCallback(accessToken, refreshToken);

        if (success) {
          // Fetch user data
          const userData = await getCurrentUser();
          setUser(userData);
          
          // Redirect to dashboard
          navigate('/dashboard', { replace: true });
        } else {
          setError('Failed to authenticate');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    processAuth();
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-destructive">Authentication Failed</h2>
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <h2 className="text-2xl font-bold">Authenticating...</h2>
            <p className="text-muted-foreground">Please wait while we log you in</p>
          </>
        )}
      </div>
    </div>
  );
}