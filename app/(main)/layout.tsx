import { Sidebar } from '@/components/ui/Sidebar';
import { BottomNav } from '@/components/ui/BottomNav';
import { AuthProvider } from '@/components/auth/AuthProvider';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-canvas relative">
        {/* Global atmospheric background — golden manuscript texture */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(212,162,70,0.035) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]"
            style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212,162,70,0.05) 0%, transparent 70%)' }}
          />
        </div>

        <Sidebar />
        <main className="lg:pl-60 pb-16 lg:pb-0 min-h-screen relative z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 page-enter">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </AuthProvider>
  );
}
