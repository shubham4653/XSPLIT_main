import BottomNav from '@/components/layout/BottomNav';
import OfflineSync from '@/components/layout/OfflineSync';

export default function ProtectedLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* 
        pb-24 ensures that content is not hidden behind the fixed BottomNav.
        The BottomNav has fixed positioning at the bottom.
      */}
      <main className="flex-grow">
        {children}
      </main>
      <BottomNav />
      <OfflineSync />
    </div>
  );
}
