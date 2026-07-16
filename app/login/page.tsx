'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { notify } from '@/lib/notify';
import { handleApiError } from '@/lib/api-utils';
export default function LoginPage() {
  const router = useRouter();
  const { loginAdmin, isAdmin, authLoading } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (isAdmin) {
      router.replace('/admin');
    }
  }, [authLoading, isAdmin, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || loading) return;

    setError('');
    setLoading(true);

    try {
      await loginAdmin(email, password);
      notify.success({
        title: 'Access Granted',
        message: 'Logged in as administrator.',
      });
      router.push('/admin');
    } catch (authError) {
      const message = handleApiError(authError, 'Login Failed');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-dvh bg-background'>
      <div className='mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-4'>
        <div className='mb-8 flex flex-col items-center gap-3'>
          <div className=''>
            <Image
              src='/logo.png'
              alt='Zelvobd'
              width={160}
              height={80}
              className='h-20 w-auto object-contain'
              priority
            />
          </div>
          <div className='text-center'>
            <h1 className='text-2xl font-semibold text-foreground'>Admin Login</h1>
            <p className='mt-1 text-sm text-muted-foreground'>Sign in to manage your store</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className='space-y-4 rounded-2xl bg-card p-6 shadow-card'>
          <div>
            <label className='mb-1 block text-xs font-medium text-foreground'>Email</label>
            <div className='flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-3 cursor-text'>
              <Mail className='h-4 w-4 shrink-0 text-muted-foreground' />
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='adminemail@example.com'
                required
                className='flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground cursor-text caret-current'
              />
            </div>
          </div>

          <div>
            <label className='mb-1 block text-xs font-medium text-foreground'>Password</label>
            <div className='flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-3 cursor-text'>
              <Lock className='h-4 w-4 shrink-0 text-muted-foreground' />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter password'
                required
                className='flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground cursor-text caret-current'
              />
              <button
                type='button'
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                className='shrink-0 text-muted-foreground'
              >
                {showPw ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
              </button>
            </div>
          </div>

          <div className='flex items-center justify-between text-xs'>
            <label className='flex items-center gap-2 text-foreground'>
              <input type='checkbox' className='h-4 w-4 rounded border-border' />
              Remember me
            </label>
            <Link href='/login' className='font-medium text-primary'>
              Forgot Password?
            </Link>
          </div>

          {error && <p className='text-xs text-accent'>{error}</p>}

          <button
            type='submit'
            disabled={loading}
            className='h-11 w-full rounded-full bg-primary text-sm font-semibold text-white shadow-sm disabled:opacity-70'
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
