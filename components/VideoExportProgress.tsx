// Video Export Progress Modal
import React from 'react';
import { Loader2, X, Zap, Sparkles } from 'lucide-react';

interface VideoExportProgressProps {
    isOpen: boolean;
    mode: 'fast' | 'quality';
    phase: 'rendering' | 'encoding';
    percent: number;
    message: string;
    onCancel?: () => void;
}

const VideoExportProgress: React.FC<VideoExportProgressProps> = ({
    isOpen,
    mode,
    phase,
    percent,
    message,
    onCancel
}) => {
    if (!isOpen) return null;

    const isFast = mode === 'fast';
    const Icon = isFast ? Zap : Sparkles;
    const bgColor = isFast ? 'bg-green-500' : 'bg-purple-500';
    const textColor = isFast ? 'text-green-600' : 'text-purple-600';

    return (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className={`${bgColor} px-6 py-4 flex items-center justify-between`}>
                    <div className="flex items-center gap-3 text-white">
                        <Icon size={24} className="animate-pulse" />
                        <div>
                            <h3 className="font-bold text-lg">
                                {isFast ? 'Fast Export' : 'High Quality Export'}
                            </h3>
                            <p className="text-white/80 text-xs">
                                {isFast ? 'Hardware encoding...' : 'FFmpeg software encoding...'}
                            </p>
                        </div>
                    </div>
                    {onCancel && !isFast && (
                        <button
                            onClick={onCancel}
                            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                            title="Cancel"
                        >
                            <X size={20} className="text-white" />
                        </button>
                    )}
                </div>

                {/* Progress Content */}
                <div className="p-6 space-y-4">
                    {/* Phase Indicator */}
                    {!isFast && (
                        <div className="flex items-center justify-center gap-8 mb-4">
                            <div className="flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${phase === 'rendering' ? 'bg-purple-100' : 'bg-slate-100'}`}>
                                    <Loader2 size={24} className={`${phase === 'rendering' ? 'text-purple-600 animate-spin' : 'text-slate-400'}`} />
                                </div>
                                <span className={`text-xs mt-2 ${phase === 'rendering' ? 'text-purple-600 font-semibold' : 'text-slate-400'}`}>
                                    Rendering
                                </span>
                            </div>

                            <div className="flex-1 h-px bg-slate-200 relative">
                                <div
                                    className={`absolute inset-y-0 left-0 bg-purple-500 transition-all duration-500`}
                                    style={{ width: phase === 'encoding' ? '100%' : '0%' }}
                                />
                            </div>

                            <div className="flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${phase === 'encoding' ? 'bg-purple-100' : 'bg-slate-100'}`}>
                                    <Sparkles size={24} className={`${phase === 'encoding' ? 'text-purple-600 animate-pulse' : 'text-slate-400'}`} />
                                </div>
                                <span className={`text-xs mt-2 ${phase === 'encoding' ? 'text-purple-600 font-semibold' : 'text-slate-400'}`}>
                                    Encoding
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Progress Bar */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">
                                {message}
                            </span>
                            <span className={`text-sm font-bold ${textColor}`}>
                                {Math.round(percent)}%
                            </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${bgColor} transition-all duration-300 ease-out`}
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                    </div>

                    {/* Info Text */}
                    {isFast ? (
                        <p className="text-xs text-slate-500 text-center">
                            Please keep this window active for best results.
                        </p>
                    ) : (
                        <p className="text-xs text-slate-500 text-center">
                            You can continue using the editor while encoding.
                        </p>
                    )}

                    {/* Time Estimate */}
                    {!isFast && percent < 95 && (
                        <div className="pt-2 border-t border-slate-100">
                            <p className="text-[10px] text-slate-400 text-center">
                                Estimated time: {percent < 50 ? '20-30 seconds' : 'Almost done...'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoExportProgress;
