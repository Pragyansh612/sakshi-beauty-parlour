'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

type Mode = 'login' | 'register' | 'forgot';

export function AuthPanel({
  initialMode = 'login',
  redirectTo,
}: {
  initialMode?: 'login' | 'register';
  redirectTo?: string;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);

  return (
    <div className="w-full max-w-[400px]">
      {mode !== 'forgot' && (
        <div className="flex bg-[#efe6d6] border border-[#e2d3b8] rounded-[30px] p-[5px] mb-8">
          <button
            onClick={() => setMode('login')}
            className={cn(
              'flex-1 text-center py-3 text-[13.5px] font-medium rounded-[24px] transition-all',
              mode === 'login' ? 'bg-[#2e2823] text-[#f6ede0]' : 'text-[#9b8e84]'
            )}
          >
            Login
          </button>
          <button
            onClick={() => setMode('register')}
            className={cn(
              'flex-1 text-center py-3 text-[13.5px] font-medium rounded-[24px] transition-all',
              mode === 'register' ? 'bg-[#2e2823] text-[#f6ede0]' : 'text-[#9b8e84]'
            )}
          >
            Register
          </button>
        </div>
      )}

      {mode === 'login' && (
        <LoginForm
          onForgotPassword={() => setMode('forgot')}
          onSwitchToRegister={() => setMode('register')}
          redirectTo={redirectTo}
        />
      )}
      {mode === 'register' && <RegisterForm onSwitchToLogin={() => setMode('login')} redirectTo={redirectTo} />}
      {mode === 'forgot' && <ForgotPasswordForm onBackToLogin={() => setMode('login')} />}
    </div>
  );
}
