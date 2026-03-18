'use client';

import { logoutAction } from '@/app/actions/admin-auth';

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
      >
        Sign Out
      </button>
    </form>
  );
}
