'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Smile, BarChart3, Sparkles, ClipboardList, Clock } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: '기-log', href: '/', icon: Smile },
  { label: '기래프', href: '/graph', icon: BarChart3 },
  { label: '분석', href: '/analysis', icon: Sparkles },
  { label: '리포트', href: '/report', icon: ClipboardList },
  { label: '타임캡슐', href: '/capsule', icon: Clock },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md">
      <nav className="flex items-center justify-around py-2.5 px-2 rounded-3xl border border-white/5 bg-zinc-950/85 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.55)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-0.5 group py-1 px-1 rounded-2xl transition-all duration-300 flex-1"
            >
              <div
                className={`relative flex items-center justify-center p-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] scale-115 shadow-[0_0_12px_rgba(var(--color-primary-rgb),0.3)] border border-[var(--color-primary)]/10'
                    : 'text-zinc-500 group-hover:text-zinc-300 group-hover:scale-105'
                }`}
              >
                <Icon className="w-4 h-4" />
                {isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-pulse" />
                )}
              </div>
              <span
                className={`text-[9px] font-bold tracking-tight transition-colors duration-300 mt-1 ${
                  isActive ? 'text-[var(--color-primary)]' : 'text-zinc-600 group-hover:text-zinc-400'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

