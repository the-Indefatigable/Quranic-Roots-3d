import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

/**
 * Server-side admin gate. Call at the top of any admin server component or
 * route handler. Redirects non-admins to the home page. Returns the session
 * so callers can use the admin's id (e.g. for edit_history attribution).
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'admin') {
    redirect('/');
  }
  return session;
}
