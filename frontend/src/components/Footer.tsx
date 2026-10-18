import React from 'react';
import { Shield } from 'lucide-react';
import { ActiveNavTab } from '../types/security';

interface FooterProps {
  onSelectTab: (tab: ActiveNavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="w-full bg-white border-t border-[#e5eeff] py-6 mt-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#565e74] text-xs">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#00288e]" />
          <span className="font-semibold text-[#0b1c30]">AuthGuard</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className="hover:text-[#00288e] transition-colors cursor-pointer"
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('history')}
            className="hover:text-[#00288e] transition-colors cursor-pointer"
          >
            Scan History
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('settings')}
            className="hover:text-[#00288e] transition-colors cursor-pointer"
          >
            Settings
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('about')}
            className="hover:text-[#00288e] transition-colors cursor-pointer"
          >
            About
          </button>
        </div>

        <div className="text-[11px] text-[#757684]">
          © 2026 AuthGuard
        </div>
      </div>
    </footer>
  );
};
