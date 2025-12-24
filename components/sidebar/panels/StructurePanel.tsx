import React from 'react';
import { Grid3X3, Shuffle, RotateCcw, Wind, Move, Palette, ChevronDown } from 'lucide-react';
import { useSidebar } from '../SidebarContext';
import CollapsibleSection from '../../common/CollapsibleSection';
import RangeControl from '../../common/RangeControl';
import { RotationLock, DistributionMode, ColorDistribution } from '../../../types';

const StructurePanel: React.FC = () => {
    const { activeLayerConfig, updateState } = useSidebar();

    const structure = activeLayerConfig.structure || {
        regularity: 0,
        sizeVariation: 50,
        rotationLock: 'free' as RotationLock,
        distributionMode: 'scatter' as DistributionMode,
        minSpacing: 0,
        colorDistribution: 'random' as ColorDistribution
    };

    // Check if structure controls are applicable to current style
    const isStructureDisabled = ['truchet', 'guilloche', 'herringbone', 'waves', 'isometric'].includes(activeLayerConfig.style);

    const handleChange = <K extends keyof typeof structure>(key: K, value: typeof structure[K]) => {
        updateState({
            structure: { ...structure, [key]: value }
        }, true);
    };

    const getRegularityLabel = (value: number): string => {
        if (value === 0) return 'Random';
        if (value <= 25) return 'Loose';
        if (value <= 50) return 'Balanced';
        if (value <= 75) return 'Ordered';
        if (value < 100) return 'Strict';
        return 'Perfect Grid';
    };

    const getSizeLabel = (value: number): string => {
        if (value === 0) return 'Uniform';
        if (value <= 25) return 'Subtle';
        if (value <= 50) return 'Moderate';
        if (value <= 75) return 'Dynamic';
        return 'Wild';
    };

    const distributionOptions: { value: DistributionMode; label: string; emoji: string }[] = [
        { value: 'scatter', label: 'Scatter', emoji: '✨' },
        { value: 'flow', label: 'Flow', emoji: '🌊' },
        { value: 'cluster', label: 'Cluster', emoji: '🎯' },
        { value: 'wave', label: 'Wave', emoji: '〰️' },
        { value: 'spiral', label: 'Spiral', emoji: '🌀' }
    ];

    const colorDistOptions: { value: ColorDistribution; label: string; emoji: string }[] = [
        { value: 'random', label: 'Random', emoji: '🎲' },
        { value: 'gradient-h', label: 'Horizontal Gradient', emoji: '↔️' },
        { value: 'gradient-v', label: 'Vertical Gradient', emoji: '↕️' },
        { value: 'gradient-radial', label: 'Radial Gradient', emoji: '🔵' },
        { value: 'zones', label: 'Zones', emoji: '🗺️' },
        { value: 'alternating', label: 'Alternating', emoji: '🔀' }
    ];

    return (
        <CollapsibleSection
            title="Structure"
            icon={<Grid3X3 size={16} />}
            defaultOpen={false}
        >
            {isStructureDisabled ? (
                <div className="p-3 bg-slate-100 rounded-lg text-center">
                    <p className="text-[10px] text-slate-500">
                        🚫 Structure controls are not available for <strong>{activeLayerConfig.style}</strong> patterns.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Info Banner */}
                    <div className="p-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                        <p className="text-[10px] text-indigo-700 leading-relaxed">
                            ✨ Fine-tune pattern appearance: placement, sizing, rotation, distribution, and coloring.
                        </p>
                    </div>

                    {/* Distribution Mode Dropdown */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                            <Wind size={12} className="text-blue-500" />
                            Distribution
                        </label>
                        <div className="relative">
                            <select
                                value={structure.distributionMode}
                                onChange={(e) => handleChange('distributionMode', e.target.value as DistributionMode)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none"
                            >
                                {distributionOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.emoji} {opt.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-3 text-slate-500 pointer-events-none" />
                        </div>
                        <p className="text-[9px] text-slate-400">
                            How shapes are distributed across the canvas
                        </p>
                    </div>

                    {/* Regularity Slider */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                                <Grid3X3 size={12} className="text-indigo-500" />
                                Regularity
                            </label>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                {getRegularityLabel(structure.regularity)}
                            </span>
                        </div>
                        <RangeControl
                            label=""
                            value={structure.regularity}
                            onChange={(v) => handleChange('regularity', v)}
                            min={0}
                            max={100}
                            step={5}
                            displayValue={`${structure.regularity}%`}
                        />
                    </div>

                    {/* Size Variation Slider */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                                <Shuffle size={12} className="text-purple-500" />
                                Size Variation
                            </label>
                            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                                {getSizeLabel(structure.sizeVariation)}
                            </span>
                        </div>
                        <RangeControl
                            label=""
                            value={structure.sizeVariation}
                            onChange={(v) => handleChange('sizeVariation', v)}
                            min={0}
                            max={100}
                            step={5}
                            displayValue={`${structure.sizeVariation}%`}
                        />
                    </div>

                    {/* Min Spacing Slider */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                                <Move size={12} className="text-green-500" />
                                Min Spacing
                            </label>
                            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                {structure.minSpacing === 0 ? 'Off' : `${structure.minSpacing}%`}
                            </span>
                        </div>
                        <RangeControl
                            label=""
                            value={structure.minSpacing}
                            onChange={(v) => handleChange('minSpacing', v)}
                            min={0}
                            max={50}
                            step={5}
                            displayValue={structure.minSpacing === 0 ? 'Off' : `${structure.minSpacing}%`}
                        />
                        <p className="text-[9px] text-slate-400">
                            Prevents overlapping • Higher = more space between shapes
                        </p>
                    </div>

                    {/* Rotation Lock Toggle */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                            <RotateCcw size={12} className="text-teal-500" />
                            Rotation Lock
                        </label>
                        <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                            {(['free', '45deg', '90deg'] as RotationLock[]).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => handleChange('rotationLock', mode)}
                                    className={`flex-1 py-2 text-[10px] font-bold rounded-md transition-all ${structure.rotationLock === mode
                                            ? 'bg-white text-teal-600 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                        }`}
                                >
                                    {mode === 'free' ? '🔄 Free' : mode === '45deg' ? '◇ 45°' : '◻ 90°'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Distribution Dropdown */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                            <Palette size={12} className="text-pink-500" />
                            Color Distribution
                        </label>
                        <div className="relative">
                            <select
                                value={structure.colorDistribution}
                                onChange={(e) => handleChange('colorDistribution', e.target.value as ColorDistribution)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 appearance-none"
                            >
                                {colorDistOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.emoji} {opt.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-3 text-slate-500 pointer-events-none" />
                        </div>
                        <p className="text-[9px] text-slate-400">
                            How colors from palette are distributed among shapes
                        </p>
                    </div>
                </div>
            )}
        </CollapsibleSection>
    );
};

export default StructurePanel;
