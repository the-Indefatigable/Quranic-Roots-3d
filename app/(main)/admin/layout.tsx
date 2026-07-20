import { requireAdmin } from '@/lib/adminGuard';
import { AdminTabs } from '@/components/admin/AdminTabs';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side gate for every /admin/* route.
  await requireAdmin();

  return (
    <div>
      <div className="mb-2">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--color-primary)' }}>
          Admin
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading tracking-tight leading-[1.05]" style={{ color: 'var(--color-ivory)' }}>
          Control Panel
        </h1>
      </div>
      <AdminTabs />
      {children}
    </div>
  );
}
