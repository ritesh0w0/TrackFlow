import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema } from '@/validations/auth.schema';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function Login() {
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setApiError(null);
    setIsSubmitting(true);
    try {
      await login(data);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to log in. Please check your credentials.';
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 p-4 text-zinc-100">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg p-8 shadow-2xl space-y-6">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center justify-center bg-zinc-800 text-zinc-100 border border-zinc-700 text-xs px-2.5 py-1 rounded font-mono font-bold tracking-wider mb-2">
            TRACKFLOW
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Log in to TrackFlow</h1>
          <p className="text-xs text-zinc-400">Enter your email and password to access your account</p>
        </div>

        {apiError && (
          <div className="p-3 text-xs bg-red-950/60 border border-red-800 text-red-300 rounded font-medium">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="developer@trackflow.local"
              {...register('email')}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all"
            />
            {errors.email && (
              <p className="text-[11px] text-red-400 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all"
            />
            {errors.password && (
              <p className="text-[11px] text-red-400 mt-1">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold text-xs py-2 rounded-md transition-colors"
          >
            {isSubmitting ? 'Logging in...' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center text-xs text-zinc-400">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-zinc-200 hover:underline font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
