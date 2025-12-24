import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    disabled?: boolean;
    className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = 'top',
    delay = 300,
    disabled = false,
    className = ''
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showTooltip = () => {
        if (disabled) return;

        timeoutRef.current = setTimeout(() => {
            if (triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                const tooltipWidth = 200; // Approximate max width
                const tooltipHeight = 40; // Approximate height

                let x = 0, y = 0;

                switch (position) {
                    case 'top':
                        x = rect.left + rect.width / 2;
                        y = rect.top - 8;
                        break;
                    case 'bottom':
                        x = rect.left + rect.width / 2;
                        y = rect.bottom + 8;
                        break;
                    case 'left':
                        x = rect.left - 8;
                        y = rect.top + rect.height / 2;
                        break;
                    case 'right':
                        x = rect.right + 8;
                        y = rect.top + rect.height / 2;
                        break;
                }

                // Keep tooltip in viewport
                if (x < tooltipWidth / 2 + 10) x = tooltipWidth / 2 + 10;
                if (x > window.innerWidth - tooltipWidth / 2 - 10) x = window.innerWidth - tooltipWidth / 2 - 10;

                setCoords({ x, y });
                setIsVisible(true);
            }
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Position classes for the tooltip arrow and alignment
    const positionStyles: Record<string, React.CSSProperties> = {
        top: {
            left: coords.x,
            top: coords.y,
            transform: 'translate(-50%, -100%)',
        },
        bottom: {
            left: coords.x,
            top: coords.y,
            transform: 'translate(-50%, 0)',
        },
        left: {
            left: coords.x,
            top: coords.y,
            transform: 'translate(-100%, -50%)',
        },
        right: {
            left: coords.x,
            top: coords.y,
            transform: 'translate(0, -50%)',
        },
    };

    // Arrow styles
    const arrowStyles: Record<string, string> = {
        top: 'after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-slate-800',
        bottom: 'after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-b-slate-800',
        left: 'after:absolute after:left-full after:top-1/2 after:-translate-y-1/2 after:border-4 after:border-transparent after:border-l-slate-800',
        right: 'after:absolute after:right-full after:top-1/2 after:-translate-y-1/2 after:border-4 after:border-transparent after:border-r-slate-800',
    };

    return (
        <>
            <div
                ref={triggerRef}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                onFocus={showTooltip}
                onBlur={hideTooltip}
                className={className || 'inline-block'}
            >
                {children}
            </div>

            {isVisible && createPortal(
                <div
                    ref={tooltipRef}
                    className={`
                        fixed z-[9999] px-3 py-2 
                        bg-slate-800 text-white text-xs font-medium
                        rounded-lg shadow-lg shadow-slate-900/20
                        max-w-[200px] text-center leading-relaxed
                        pointer-events-none
                        ${arrowStyles[position]}
                    `}
                    style={positionStyles[position]}
                    role="tooltip"
                >
                    {content}
                </div>,
                document.body
            )}
        </>
    );
};

export default Tooltip;
