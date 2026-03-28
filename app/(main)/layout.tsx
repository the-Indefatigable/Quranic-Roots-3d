import { Sidebar } from '@/components/ui/Sidebar';
import { BottomNav } from '@/components/ui/BottomNav';
import { AuthProvider } from '@/components/auth/AuthProvider';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-canvas">
        <Sidebar />
        <main className="lg:pl-60 pb-16 lg:pb-0 min-h-screen">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 page-enter">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </AuthProvider>
  );
}
