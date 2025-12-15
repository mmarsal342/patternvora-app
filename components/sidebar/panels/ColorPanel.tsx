
import React, { useRef, useState, useEffect } from 'react';
import { Palette, Pipette, PaintBucket } from 'lucide-react';
import { useSidebar } from '../SidebarContext';
import CollapsibleSection from '../../common/CollapsibleSection';
import { PALETTES } from '../../../utils/palettes';

const ColorPanel: React.FC = () => {
    const { activeLayerConfig, updateState, onExtractPalette } = useSidebar();
    const paletteInputRef = useRef<HTMLInputElement>(null);
    const [bgHex, setBgHex] = useState(activeLayerConfig.palette.bg);

    // Sync bgHex when config changes (e.g. undo/redo or layer switch)
    useEffect(() => {
        setBgHex(activeLayerConfig.palette.bg);
    }, [activeLayerConfig.palette.bg]);

    const handlePaletteColorChange = (index: number, newColor: string) => {
        const newColors = [...activeLayerConfig.palette.colors];
        newColors[index] = newColor;
        updateState({
            palette: { ...activeLayerConfig.palette, name: 'Custom', colors: newColors }
        }, false);
    };

    const handleBgChange = (newColor: string) => {
        setBgHex(newColor);
        updateState({ palette: { ...activeLayerConfig.palette, bg: newColor } }, false);
    };

    return (
        <CollapsibleSection title="Colors" icon={<Palette size={16} />}>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Palette</span>
                    <button
                        onClick={() => paletteInputRef.current?.click()}
                        className="text-[10px] text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium bg-indigo-50 px-2 py-1 rounded-full transition-colors"
                    >
                        <Pipette size={10} /> Extract from Image
                    </button>
                    <input type="file" ref={paletteInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && onExtractPalette(e.target.files[0])} />
                </div>

                {/* Scrollable Palette Grid */}
                <div className="grid grid-cols-4 gap-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
                    {PALETTES.map((palette, i) => (
                        <button
                            key={i}
                            onClick={() => { updateState({ palette }, true); setBgHex(palette.bg); }}
                            className={`group relative h-9 rounded-lg overflow-hidden ring-2 ring-offset-1 transition-all shadow-sm ${activeLayerConfig.palette.name === palette.name ? 'ring-indigo-500 ring-offset-white scale-105 z-10' : 'ring-transparent hover:ring-slate-200'
                                }`}
                        >
                            <div className="flex h-full w-full">
                                {palette.colors.map((c, j) => <div key={j} style={{ backgroundColor: c }} className="flex-1 h-full" />)}
                            </div>
                            {/* Tooltip - appears as overlay inside button */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-[8px] font-bold px-1 text-center leading-tight">
                                    {palette.name}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Customizer */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3">
                    {/* Active Palette Editor */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-slate-500">Active Colors</span>
                        </div>
                        <div className="flex gap-1.5">
                            {activeLayerConfig.palette.colors.map((color, idx) => (
                                <div key={idx} className="relative group flex-1 aspect-square rounded-md overflow-hidden border border-slate-200 hover:border-indigo-400 transition-colors shadow-sm">
                                    <div style={{ backgroundColor: color }} className="w-full h-full"></div>
                                    <input type="color" value={color} onChange={(e) => handlePaletteColorChange(idx, e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Background Editor */}
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-600">
                                <PaintBucket size={14} />
                                <span className="text-xs font-medium">Background</span>
                            </div>

                            <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    id="transparentBg"
                                    checked={activeLayerConfig.transparentBackground}
                                    onChange={(e) => updateState({ transparentBackground: e.target.checked }, true)}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <span className="text-[10px] text-slate-500 font-medium">Transparent</span>
                            </label>
                        </div>

                        {/* Color picker - always visible but disabled when transparent */}
                        <div className={`flex items-center gap-2 transition-opacity ${activeLayerConfig.transparentBackground ? 'opacity-40 pointer-events-none' : ''}`}>
                            <input
                                type="text"
                                value={bgHex.toUpperCase()}
                                onChange={(e) => handleBgChange(e.target.value)}
                                onBlur={() => handleBgChange(activeLayerConfig.palette.bg)}
                                className="flex-1 bg-white border border-slate-200 rounded p-1.5 text-[10px] text-slate-600 font-mono text-center focus:border-indigo-500 outline-none uppercase"
                                disabled={activeLayerConfig.transparentBackground}
                            />
                            <div className="relative w-8 h-8 rounded-md overflow-hidden border border-slate-200 shadow-sm flex-shrink-0" style={{ backgroundColor: activeLayerConfig.palette.bg }}>
                                <input
                                    type="color"
                                    value={activeLayerConfig.palette.bg}
                                    onChange={(e) => handleBgChange(e.target.value)}
                                    className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer opacity-0"
                                    disabled={activeLayerConfig.transparentBackground}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CollapsibleSection>
    );
};

export default ColorPanel;
