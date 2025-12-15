
import React, { useEffect, useRef } from 'react';
import { HistoryItem } from '../types';
import { History } from 'lucide-react';

interface FilmStripProps {
    history: HistoryItem[];
    currentIndex: number;
    onJump: (index: number) => void;
    isVisible: boolean;
}

const FilmStrip: React.FC<FilmStripProps> = ({ 
    history, currentIndex, onJump, isVisible 
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to current item
    useEffect(() => {
        if (scrollRef.current && currentIndex >= 0 && isVisible) {
            const container = scrollRef.current;
            const itemWidth = 70; 
            const centerOffset = container.clientWidth / 2 - itemWidth / 2;
            container.scrollTo({
                left: (currentIndex * itemWidth) - centerOffset,
                behavior: 'smooth'
            });
        }
    }, [currentIndex, history.length, isVisible]);

    if (history.length === 0) return null;

    return (
        <div 
            className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 max-w-[90vw] transition-all duration-300 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
            }`}
        >
            {/* Strip Drawer */}
            <div 
                className="bg-white/80 border border-slate-200 p-2 rounded-xl backdrop-blur-md shadow-2xl flex gap-3 overflow-x-auto w-auto max-w-full custom-scrollbar animate-in slide-in-from-bottom-5 duration-300"
                ref={scrollRef}
                style={{ scrollbarWidth: 'none' }}
            >
                <div className="flex items-center justify-center px-2 border-r border-slate-200/50 mr-1 text-slate-400">
                    <History size={16} />
                </div>

                {history.map((item, idx) => (
                    <button
                        key={item.id}
                        onClick={() => onJump(idx)}
                        className={`relative group shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 shadow-sm ${
                            idx === currentIndex 
                                ? 'border-indigo-600 scale-100 ring-2 ring-indigo-200' 
                                : 'border-white scale-95 opacity-70 hover:opacity-100 hover:scale-100 hover:border-slate-300'
                        }`}
                    >
                        <img 
                            src={item.thumbnail} 
                            alt={`History ${idx}`} 
                            className="w-full h-full object-cover bg-slate-100"
                        />
                        {idx === currentIndex && (
                            <div className="absolute inset-0 bg-indigo-600/10 pointer-events-none"></div>
                        )}
                        <div className="absolute bottom-0 right-0 bg-black/50 text-white text-[9px] px-1 rounded-tl">
                            {idx + 1}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FilmStrip;
