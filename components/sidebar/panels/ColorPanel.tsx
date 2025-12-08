
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
                        className={`group relative h-9 rounded-lg overflow-hidden ring-2 ring-offset-1 transition-all shadow-sm ${
                        activeLayerConfig.palette.name === palette.name ? 'ring-indigo-500 ring-offset-white scale-105 z-10' : 'ring-transparent hover:ring-slate-200'
                        }`}
                        title={palette.name}
                    >
                        <div className="flex h-full w-full">
                            {palette.colors.map((c, j) => <div key={j} style={{ backgroundColor: c }} className="flex-1 h-full" />)}
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
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <div className="flex items-center gap-2 text-slate-600">
                            <PaintBucket size={14} />
                            <span className="text-xs font-medium">Background</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <input 
                                    type="checkbox" 
                                    id="transparentBg"
                                    checked={activeLayerConfig.transparentBackground}
                                    onChange={(e) => updateState({ transparentBackground: e.target.checked }, true)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="transparentBg" className="text-[10px] text-slate-500 font-medium">Transparent</label>
                            </div>

                            {!activeLayerConfig.transparentBackground && (
                                <div className="flex items-center gap-2 animate-in fade-in duration-200">
                                    <input
                                        type="text"
                                        value={bgHex.toUpperCase()}
                                        onChange={(e) => handleBgChange(e.target.value)}
                                        onBlur={() => handleBgChange(activeLayerConfig.palette.bg)}
                                        className="w-16 bg-white border border-slate-200 rounded p-1 text-[10px] text-slate-600 font-mono text-center focus:border-indigo-500 outline-none uppercase"
                                    />
                                    <div className="relative w-6 h-6 rounded-md overflow-hidden border border-slate-200 shadow-sm" style={{ backgroundColor: activeLayerConfig.palette.bg }}>
                                        <input type="color" value={activeLayerConfig.palette.bg} onChange={(e) => handleBgChange(e.target.value)} className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer opacity-0" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CollapsibleSection>
    );
};

export default ColorPanel;
