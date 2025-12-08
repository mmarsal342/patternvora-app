import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CollapsibleSectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, icon, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-slate-100 last:border-0">
            <h2>
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                        <span className="text-slate-500">{icon}</span>
                        {title}
                    </div>
                    {isOpen ? <ChevronDown size={14} className="text-slate-500"/> : <ChevronRight size={14} className="text-slate-500"/>}
                </button>
            </h2>
            {isOpen && <div className="px-4 pb-6 animate-in slide-in-from-top-2 duration-200">{children}</div>}
        </div>
    );
};

export default CollapsibleSection;