import { Sidebar } from '@/components/ui/Sidebar';
import { BottomNav } from '@/components/ui/BottomNav';
import { AuthProvider } from '@/components/auth/AuthProvider';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen relative">
        {/* Ambient background glow */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gold/[0.04] rounded-full blur-[120px]" />
        </div>

        <Sidebar />
        <main className="lg:pl-60 pb-16 lg:pb-0 min-h-screen relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 page-enter">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </AuthProvider>
  );
}
