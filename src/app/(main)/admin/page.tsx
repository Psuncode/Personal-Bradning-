import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { db } from '@/db';
import { contacts } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { LogoutButton } from './LogoutButton';

export const metadata = {
  title: 'Admin Dashboard',
};

export default async function AdminPage() {
  // Stage 2 auth: unseal iron-session cookie and validate
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect('/admin/login');
  }

  const allContacts = await db
    .select()
    .from(contacts)
    .orderBy(desc(contacts.createdAt));

  return (
    <div className="py-12 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              {allContacts.length} contact{allContacts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <LogoutButton />
        </div>

        {allContacts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">No contacts yet.</p>
            <p className="text-sm mt-2">Contact form submissions will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 pr-4 font-medium text-gray-500">Date</th>
                  <th className="pb-3 pr-4 font-medium text-gray-500">Name</th>
                  <th className="pb-3 pr-4 font-medium text-gray-500">Email</th>
                  <th className="pb-3 pr-4 font-medium text-gray-500">Subject</th>
                  <th className="pb-3 pr-4 font-medium text-gray-500">Message</th>
                  <th className="pb-3 pr-4 font-medium text-gray-500">UTM Source</th>
                  <th className="pb-3 font-medium text-gray-500">Referrer</th>
                </tr>
              </thead>
              <tbody>
                {allContacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 pr-4 whitespace-nowrap text-gray-600">
                      {contact.createdAt
                        ? new Date(contact.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3 pr-4 font-medium text-gray-900">{contact.name}</td>
                    <td className="py-3 pr-4 text-gray-700">{contact.email}</td>
                    <td className="py-3 pr-4 text-gray-700">{contact.subject ?? '—'}</td>
                    <td className="py-3 pr-4 text-gray-700 max-w-xs truncate">{contact.message}</td>
                    <td className="py-3 pr-4 text-gray-500">{contact.utmSource ?? '—'}</td>
                    <td className="py-3 text-gray-500 max-w-xs truncate">{contact.referrer ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
