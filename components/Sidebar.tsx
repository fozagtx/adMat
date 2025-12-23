'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Settings,
  HelpCircle,
  ChevronLeft,
  FolderOpen,
  Wrench,
} from 'lucide-react';

type NavItem = 'playground' | 'profiles' | 'tools';

interface SidebarProps {
  activeNav: NavItem;
  onNavChange: (nav: NavItem) => void;
}

const navItems = [
  { id: 'playground' as NavItem, label: 'Playground', icon: MessageSquare },
  { id: 'profiles' as NavItem, label: 'Profiles', icon: FolderOpen, badge: 'Soon' },
  { id: 'tools' as NavItem, label: 'Tools', icon: Wrench, badge: 'Soon' },
];

export default function Sidebar({ activeNav, onNavChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'h-screen flex flex-col bg-[#0a0a0a] border-r border-white/10 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-4 border-b border-white/10">
        <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
          <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center flex-shrink-0 border border-[#00ff41]/50 shadow-[0_0_10px_rgba(0,255,65,0.3)]">
            <span className="text-[#00ff41] font-bold text-xs tracking-tight" style={{ textShadow: '0 0 10px #00ff41, 0 0 20px #00ff41' }}>PI</span>
          </div>
          {!isCollapsed && (
            <span className="text-white font-semibold tracking-tight">AI Frontrunners</span>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          const isDisabled = !!item.badge;

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && onNavChange(item.id)}
              disabled={isDisabled}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-white/10 text-white'
                  : isDisabled
                  ? 'text-white/30 cursor-not-allowed'
                  : 'text-white/60 hover:bg-white/5 hover:text-white',
                isCollapsed && 'justify-center'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-medium bg-white/10 text-white/40 rounded">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        <button
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors',
            isCollapsed && 'justify-center'
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </button>
        <button
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors',
            isCollapsed && 'justify-center'
          )}
        >
          <HelpCircle className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Help</span>}
        </button>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors',
            isCollapsed && 'justify-center'
          )}
        >
          <ChevronLeft
            className={cn('w-5 h-5 flex-shrink-0 transition-transform', isCollapsed && 'rotate-180')}
          />
          {!isCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
