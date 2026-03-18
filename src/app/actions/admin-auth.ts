'use server';

import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export type LoginFormState = {
  error?: string;
};

export async function loginAction(
  _prev: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const password = formData.get('password') as string;

  if (!password) {
    return { error: 'Password is required.' };
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD env var not set');
    return { error: 'Server configuration error.' };
  }

  if (password !== adminPassword) {
    return { error: 'Invalid password.' };
  }

  const session = await getSession();
  session.isLoggedIn = true;
  await session.save();

  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  const session = await getSession();
  session.destroy();
  redirect('/admin/login');
}
