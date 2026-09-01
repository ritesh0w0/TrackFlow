import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { signupSchema } from '@/validations/auth.schema';
import { signup } from '@/services/auth.api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function Signup() {
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const passwordValue = watch('password') || '';

  const rules = [
    { label: 'At least 8 characters', valid: passwordValue.length >= 8 },
    { label: 'One uppercase letter (A-Z)', valid: /[A-Z]/.test(passwordValue) },
    { label: 'One lowercase letter (a-z)', valid: /[a-z]/.test(passwordValue) },
    { label: 'One number (0-9)', valid: /\d/.test(passwordValue) },
    {
      label: 'One special character (!@#$%^&*...)',
      valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordValue),
    },
  ];

  const onSubmit = async (data) => {
    setApiError(null);
    setIsSubmitting(true);
    try {
      await signup({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      // Automatically log in after successful signup
      await login({ email: data.email, password: data.password });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to sign up. Please try again.';
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
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Create an Account</h1>
          <p className="text-xs text-zinc-400">Sign up to start tracking projects and issues</p>
        </div>

        {apiError && (
          <div className="p-3 text-xs bg-red-950/60 border border-red-800 text-red-300 rounded font-medium">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Developer Name"
              {...register('name')}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all"
            />
            {errors.name && (
              <p className="text-[11px] text-red-400 mt-1">{errors.name.message}</p>
            )}
          </div>

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

          {/* Password Requirements Checklist */}
          {passwordValue && (
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-md p-3 space-y-1.5 text-[11px]">
              <p className="font-semibold text-zinc-400">Password Requirements:</p>
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 ${
                    rule.valid ? 'text-emerald-400 font-medium' : 'text-zinc-500'
                  }`}
                >
                  <span>{rule.valid ? '✓' : '○'}</span>
                  <span>{rule.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all"
            />
            {errors.confirmPassword && (
              <p className="text-[11px] text-red-400 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold text-xs py-2 rounded-md transition-colors"
          >
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="text-center text-xs text-zinc-400">
          Already have an account?{' '}
          <Link to="/login" className="text-zinc-200 hover:underline font-medium">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
