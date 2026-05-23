"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, PlusCircle, Activity, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/groups', icon: Users, label: 'Groups' },
    { href: '/groups/new', icon: PlusCircle, label: 'Add', isFab: true },
    { href: '/activity', icon: Activity, label: 'Activity' },
    { href: '/profile', icon: User, label: 'Profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-stone-200 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-20 max-w-md mx-auto px-4 relative">
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
              className={`flex flex-col items-center justify-center w-14 h-full space-y-1.5 transition-colors ${isActive ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <div className={`p-2 rounded-2xl transition-all ${isActive ? 'bg-lavender-50' : ''}`}>
                <Icon className={`w-6 h-6 ${isActive ? 'text-sky-400' : ''}`} />
              </div>
              <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'text-stone-900 font-semibold' : ''}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
