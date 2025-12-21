
import React from 'react';
import { Film, ChevronDown } from 'lucide-react';
import { useSidebar } from '../SidebarContext';
import CollapsibleSection from '../../common/CollapsibleSection';
import RangeControl from '../../common/RangeControl';
import { PrimaryAnimationType, SecondaryAnimationType, VideoResolution } from '../../../types';

const MotionPanel: React.FC = () => {
    const { activeLayerConfig, updateAnimation } = useSidebar();
    const anim = activeLayerConfig.animation;

    return (
        <CollapsibleSection title="Motion" icon={<Film size={16} />} defaultOpen={false}>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Animation</span>
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${anim.enabled ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                            {anim.enabled ? 'ON' : 'OFF'}
                        </span>
                        <input
                            type="checkbox"
                            className="toggle"
                            checked={anim.enabled}
                            onChange={(e) => updateAnimation({ enabled: e.target.checked })}
                        />
                    </div>
                </div>

                {anim.enabled && (
                    <>
                        <div>
                            <label className="text-xs text-slate-500 mb-1 block">Movement (Primary)</label>
                            <div className="relative">
                                <select
                                    value={anim.primary}
                                    onChange={(e) => updateAnimation({ primary: e.target.value as PrimaryAnimationType })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 appearance-none"
                                >
                                    <option value="none">None</option>
                                    <option value="orbit">Orbit (Rotation)</option>
                                    <option value="float">Float (Wave)</option>
                                    <option value="scan">Scan (Slide)</option>
                                </select>
                                <ChevronDown size={12} className="absolute right-2 top-2.5 text-slate-500 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-500 mb-1 block">Effect (Secondary)</label>
                            <div className="relative">
                                <select
                                    value={anim.secondary}
                                    onChange={(e) => updateAnimation({ secondary: e.target.value as SecondaryAnimationType })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 appearance-none"
                                >
                                    <option value="none">None</option>
                                    <option value="pulse">Pulse (Scale)</option>
                                    <option value="spin">Spin (Self-Rotate)</option>
                                </select>
                                <ChevronDown size={12} className="absolute right-2 top-2.5 text-slate-500 pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="flex-1">
                                <RangeControl
                                    label="Duration" value={anim.duration} onChange={(v) => updateAnimation({ duration: v })}
                                    min={2} max={20} step={1} displayValue={anim.duration + 's'}
                                />
                            </div>
                            <div className="w-1/3">
                                <label className="text-xs font-medium text-slate-600 block mb-1.5">Quality</label>
                                <div className="relative">
                                    <select
                                        value={anim.resolution || 'HD'}
                                        onChange={(e) => updateAnimation({ resolution: e.target.value as VideoResolution })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 h-[26px] text-[10px] font-bold text-slate-700 appearance-none"
                                    >
                                        <option value="SD">720p</option>
                                        <option value="HD">1080p ⭐</option>
                                    </select>
                                    <ChevronDown size={10} className="absolute right-1.5 top-2 text-slate-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Export Mode Toggle - Fast vs Quality */}
                        <div>
                            <label className="text-xs font-medium text-slate-600 block mb-2">Export Mode</label>
                            <div className="space-y-2">
                                <label className="flex items-start gap-2 p-2 rounded-lg border border-slate-200 hover:border-indigo-300 cursor-pointer transition-colors">
                                    <input
                                        type="radio"
                                        name="exportMode"
                                        value="fast"
                                        checked={true}
                                        disabled
                                        className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-slate-700">Fast Export (Only Mode)</span>
                                            <span className="text-[9px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-bold">2-3s</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-0.5">Hardware-accelerated. Quick exports with minor loop discontinuity (~1%).</p>
                                    </div>
                                </label>
                            </div>

                            {/* Intensity Control - Show if any animation is active */}
                            {(anim.primary !== 'none' || anim.secondary !== 'none') && (
                                <RangeControl
                                    label="Intensity / Amplitude" value={anim.intensity} onChange={(v) => updateAnimation({ intensity: v })}
                                    min={0.1} max={3.0} step={0.1} displayValue={anim.intensity.toFixed(1) + 'x'}
                                />
                            )}

                            {/* Direction Control - Only relevant for directional animations */}
                            {(['orbit', 'scan'].includes(anim.primary) || anim.secondary === 'spin') && (
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Direction</label>
                                    <div className="flex bg-slate-100 rounded-lg p-1">
                                        <button
                                            className={`flex-1 py-1 text-[10px] font-medium rounded-md transition-all ${anim.direction === 'normal' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                            onClick={() => updateAnimation({ direction: 'normal' })}
                                        >
                                            Normal (CW)
                                        </button>
                                        <button
                                            className={`flex-1 py-1 text-[10px] font-medium rounded-md transition-all ${anim.direction === 'reverse' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                            onClick={() => updateAnimation({ direction: 'reverse' })}
                                        >
                                            Reverse (CCW)
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </CollapsibleSection>
    );
};

export default MotionPanel;
