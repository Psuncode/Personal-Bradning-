'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions/admin-auth';
import type { LoginFormState } from '@/app/actions/admin-auth';

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState<LoginFormState, FormData>(
    loginAction,
    {}
  );

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Login</h1>

        {state.error && (
          <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
