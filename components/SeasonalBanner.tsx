import React, { useState, useEffect } from 'react';
import { X, CalendarDays, Sparkles } from 'lucide-react';

// Seasonal Event Definitions
interface SeasonalEvent {
    id: string;
    name: string;
    emoji: string;
    date: Date; // Target date for the event
    style: string; // Pattern style to apply
    colors: string[]; // Suggested palette
}

// Calculate days until an event
const getDaysUntil = (date: Date): number => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Get current year's upcoming events (or next year if passed)
const getSeasonalEvents = (): SeasonalEvent[] => {
    const now = new Date();
    const year = now.getFullYear();
    const nextYear = year + 1;

    // CNY dates (approximate - varies each year based on lunar calendar)
    // 2025: Jan 29, 2026: Feb 17
    const cnyDate = year === 2024 ? new Date(2025, 0, 29) :
        year === 2025 ? new Date(2025, 0, 29) :
            new Date(nextYear, 1, 10);

    // Christmas - Dec 25
    const xmasDate = new Date(year, 11, 25);
    const xmasDateToUse = getDaysUntil(xmasDate) < 0 ? new Date(nextYear, 11, 25) : xmasDate;

    // New Year - Jan 1
    const nyDate = new Date(year, 0, 1);
    const nyDateToUse = getDaysUntil(nyDate) < 0 ? new Date(nextYear, 0, 1) : nyDate;

    return [
        {
            id: 'christmas',
            name: 'Christmas',
            emoji: '🎄',
            date: xmasDateToUse,
            style: 'seasonal-christmas',
            colors: ['#165B33', '#BB2528', '#F8B229']
        },
        {
            id: 'newyear',
            name: 'New Year',
            emoji: '🎉',
            date: nyDateToUse,
            style: 'seasonal-newyear',
            colors: ['#FFD700', '#FF6B6B', '#A855F7']
        },
        {
            id: 'valentine',
            name: "Valentine's Day",
            emoji: '💕',
            date: new Date(getDaysUntil(new Date(year, 1, 14)) < 0 ? nextYear : year, 1, 14),
            style: 'seasonal-valentine',
            colors: ['#E91E63', '#FF69B4', '#F8BBD9']
        },
        {
            id: 'cny',
            name: 'Chinese New Year',
            emoji: '🐉',
            date: cnyDate,
            style: 'seasonal-cny',
            colors: ['#D32F2F', '#FFD700', '#FF6F00']
        },
    ];
};

interface SeasonalBannerProps {
    onApplyStyle?: (style: string) => void;
}

const SeasonalBanner: React.FC<SeasonalBannerProps> = ({ onApplyStyle }) => {
    const [dismissed, setDismissed] = useState<string[]>([]);
    const [events, setEvents] = useState<SeasonalEvent[]>([]);

    useEffect(() => {
        // Load dismissed events from localStorage
        const savedDismissed = localStorage.getItem('pv_seasonal_dismissed');
        if (savedDismissed) {
            try {
                setDismissed(JSON.parse(savedDismissed));
            } catch (e) { }
        }

        // Get upcoming events
        setEvents(getSeasonalEvents());
    }, []);

    const handleDismiss = (eventId: string) => {
        const newDismissed = [...dismissed, eventId];
        setDismissed(newDismissed);
        localStorage.setItem('pv_seasonal_dismissed', JSON.stringify(newDismissed));
    };

    // Filter to only show events within 60 days and not dismissed
    const upcomingEvents = events.filter(event => {
        const daysUntil = getDaysUntil(event.date);
        return daysUntil > 0 && daysUntil <= 60 && !dismissed.includes(event.id);
    });

    if (upcomingEvents.length === 0) return null;

    const event = upcomingEvents[0]; // Show only the most relevant event
    const daysUntil = getDaysUntil(event.date);

    return (
        <div className="mx-3 mb-3 p-3 bg-gradient-to-r from-red-50 to-amber-50 border border-red-200/50 rounded-xl shadow-sm animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-lg">
                        {event.emoji}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-red-700">{event.name}</span>
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[9px] font-bold rounded-full uppercase">
                                {daysUntil} days
                            </span>
                        </div>
                        <p className="text-[10px] text-red-600/80 mt-0.5">
                            Festive patterns trending on microstock!
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => handleDismiss(event.id)}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                    title="Dismiss"
                >
                    <X size={14} />
                </button>
            </div>

            <button
                onClick={() => onApplyStyle?.(event.style)}
                className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white text-xs font-bold rounded-lg transition-all shadow-sm hover:shadow"
            >
                <Sparkles size={12} />
                <span>Use {event.name} Pack</span>
            </button>
        </div>
    );
};

export default SeasonalBanner;
