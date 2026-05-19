import { redirect } from 'next/navigation';
import { getSession, isSessionValid } from '@/lib/session';
import { db } from '@/db';
import { contacts, bookings } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { LogoutButton } from './LogoutButton';

export const metadata = {
  title: 'Admin Dashboard',
};

export default async function AdminPage() {
  // Stage 2 auth: unseal iron-session cookie and validate. isSessionValid
  // also enforces the SESSION_VERSION kill switch (02-REVIEW.md CR-03) —
  // bumping env SESSION_VERSION revokes every previously-minted cookie.
  const session = await getSession();
  if (!isSessionValid(session)) {
    redirect('/admin/login');
  }

  const allContacts = await db
    .select()
    .from(contacts)
    .orderBy(desc(contacts.createdAt));

  const allBookings = await db
    .select()
    .from(bookings)
    .orderBy(desc(bookings.createdAt));

  return (
    <div className="py-12 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              {allContacts.length} contact{allContacts.length !== 1 ? 's' : ''} &middot;{' '}
              {allBookings.length} booking{allBookings.length !== 1 ? 's' : ''}
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* Contacts section */}
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

        <hr className="my-8 border-gray-200" />

        {/* Bookings section */}
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Bookings</h2>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
            {allBookings.length}
          </span>
        </div>

        {allBookings.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-sm">No bookings yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 pr-4 font-medium text-gray-500">Booked</th>
                  <th className="pb-3 pr-4 font-medium text-gray-500">Client Name</th>
                  <th className="pb-3 pr-4 font-medium text-gray-500">Email</th>
                  <th className="pb-3 pr-4 font-medium text-gray-500">Package ID</th>
                  <th className="pb-3 pr-4 font-medium text-gray-500">Event Date</th>
                  <th className="pb-3 pr-4 font-medium text-gray-500">Deposit</th>
                  <th className="pb-3 pr-4 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500">Payment Intent</th>
                </tr>
              </thead>
              <tbody>
                {allBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 pr-4 whitespace-nowrap text-gray-600">
                      {booking.createdAt
                        ? new Date(booking.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3 pr-4 font-medium text-gray-900">{booking.clientName}</td>
                    <td className="py-3 pr-4 text-gray-700">{booking.clientEmail}</td>
                    <td className="py-3 pr-4 text-gray-500">{booking.packageId ?? '—'}</td>
                    <td className="py-3 pr-4 whitespace-nowrap text-gray-600">
                      {booking.eventDate
                        ? new Date(booking.eventDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3 pr-4 text-gray-700 tabular-nums">
                      {booking.depositPaidInCents != null
                        ? `$${(booking.depositPaidInCents / 100).toFixed(0)}`
                        : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      {booking.status === 'confirmed' && (
                        <span className="text-green-600 font-medium">confirmed</span>
                      )}
                      {booking.status === 'cancelled' && (
                        <span className="text-red-600 font-medium">cancelled</span>
                      )}
                      {booking.status === 'completed' && (
                        <span className="text-gray-500 font-medium">completed</span>
                      )}
                      {!['confirmed', 'cancelled', 'completed'].includes(booking.status) && (
                        <span className="text-gray-600">{booking.status}</span>
                      )}
                    </td>
                    <td className="py-3 text-gray-500 font-mono text-xs">
                      {booking.stripePaymentIntentId
                        ? `...${booking.stripePaymentIntentId.slice(-8)}`
                        : '—'}
                    </td>
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
