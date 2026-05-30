"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, PlusCircle, Handshake, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/groups', icon: Users, label: 'Groups' },
    { href: '/groups/new', icon: PlusCircle, label: 'Add', isFab: true },
    { href: '/friends', icon: Handshake, label: 'Friends' },
    { href: '/profile', icon: User, label: 'Profile' }
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-[100] backdrop-blur-xl border-t shadow-[0_-8px_30px_rgba(0,0,0,0.05)]"
         style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex justify-around items-center h-20 max-w-2xl mx-auto px-4 relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isFab) {
            return (
              <div key={item.href} className="relative -top-6">
                <Link href={item.href} className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blush-300 to-blush-400 rounded-full shadow-blush transform transition-transform hover:scale-105 active:scale-95 border border-white/40">
                  <Icon className="w-7 h-7 text-stone-900" />
                </Link>
              </div>
            );
          }

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex flex-col items-center justify-center w-14 h-full space-y-1.5 transition-colors"
              style={{ color: isActive ? 'var(--foreground)' : 'var(--muted)' }}
            >
              <div className="p-2 rounded-2xl transition-all" style={{ background: isActive ? 'rgba(255,179,200,0.15)' : 'transparent' }}>
                <Icon className={`w-6 h-6 ${isActive ? 'text-blush-400' : ''}`} />
              </div>
              <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
