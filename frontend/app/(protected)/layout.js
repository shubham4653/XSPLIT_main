import BottomNav from '@/components/layout/BottomNav';
import OfflineSync from '@/components/layout/OfflineSync';

export default function ProtectedLayout({ children }) {
  return (
    <div className="flex flex-col h-[100dvh] bg-background overflow-hidden">
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative pb-24">
        {children}
      </main>
      <BottomNav />
      <OfflineSync />
    </div>
  );
}
