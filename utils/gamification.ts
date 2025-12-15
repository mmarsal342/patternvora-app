
import { Zap, Star, Hexagon, Crown, Trophy, Gem } from 'lucide-react';

export const STORAGE_KEY = 'pv_export_count';

export type RankTier = 'Novice' | 'Creator' | 'Artisan' | 'Master' | 'Grandmaster' | 'Legend';

export interface Rank {
    name: RankTier;
    min: number;
    color: string;      // Text Color
    bgColor: string;    // Background Color
    border: string;     // Border Color
    shadow: string;     // Shadow Color
    icon: any;
    description: string;
}

export const RANKS: Rank[] = [
    { 
        name: 'Novice', 
        min: 0, 
        color: 'text-slate-600', 
        bgColor: 'bg-slate-50', 
        border: 'border-slate-200', 
        shadow: 'shadow-slate-200',
        icon: Zap, 
        description: 'Start your journey.' 
    },
    { 
        name: 'Creator', 
        min: 100, 
        color: 'text-indigo-600', 
        bgColor: 'bg-indigo-50', 
        border: 'border-indigo-200',
        shadow: 'shadow-indigo-200', 
        icon: Star, 
        description: 'Building a portfolio.' 
    },
    { 
        name: 'Artisan', 
        min: 500, 
        color: 'text-emerald-600', 
        bgColor: 'bg-emerald-50', 
        border: 'border-emerald-200', 
        shadow: 'shadow-emerald-200',
        icon: Hexagon, 
        description: 'Crafting excellence.' 
    },
    { 
        name: 'Master', 
        min: 1000, 
        color: 'text-rose-600', 
        bgColor: 'bg-rose-50', 
        border: 'border-rose-200', 
        shadow: 'shadow-rose-200',
        icon: Trophy, 
        description: 'A true professional.' 
    },
    { 
        name: 'Grandmaster', 
        min: 5000, 
        color: 'text-purple-600', 
        bgColor: 'bg-purple-50', 
        border: 'border-purple-200', 
        shadow: 'shadow-purple-200',
        icon: Crown, 
        description: 'Pattern royalty.' 
    },
    { 
        name: 'Legend', 
        min: 10000, 
        color: 'text-fuchsia-600', 
        bgColor: 'bg-gradient-to-r from-indigo-50 to-fuchsia-50', 
        border: 'border-fuchsia-200', 
        shadow: 'shadow-fuchsia-200',
        icon: Gem, 
        description: 'God-tier designer.' 
    }
];

export const getCurrentRank = (count: number): Rank => {
    // Iterate backwards to find the highest rank met
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (count >= RANKS[i].min) {
            return RANKS[i];
        }
    }
    return RANKS[0];
};

export const getNextRank = (count: number): Rank | null => {
    for (let i = 0; i < RANKS.length; i++) {
        if (count < RANKS[i].min) {
            return RANKS[i];
        }
    }
    return null; // Max level reached
};

export const getProgress = (count: number) => {
    const current = getCurrentRank(count);
    const next = getNextRank(count);

    if (!next) return 100; // Legend

    const totalNeeded = next.min - current.min;
    const currentProgress = count - current.min;
    
    return Math.min(100, Math.max(0, (currentProgress / totalNeeded) * 100));
};
