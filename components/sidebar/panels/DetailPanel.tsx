
import React from 'react';
import { Sliders, Lock } from 'lucide-react';
import { useSidebar } from '../SidebarContext';
import CollapsibleSection from '../../common/CollapsibleSection';
import RangeControl from '../../common/RangeControl';

const DetailPanel: React.FC = () => {
    const { activeLayerConfig, updateState } = useSidebar();

    const hasOverrides = Object.keys(activeLayerConfig.overrides).length > 0;

    return (
        <CollapsibleSection title="Detail" icon={<Sliders size={16} />} defaultOpen={false}>
            {hasOverrides && (
                <div className="mb-4 p-2 bg-amber-50 border border-amber-100 rounded text-[10px] text-amber-700 flex items-center gap-2">
                    <Lock size={12} className="shrink-0" />
                    <span>Controls locked because you have edited shapes manually. <button onClick={() => updateState({ overrides: {} }, true)} className="underline font-bold">Reset Shapes</button> to unlock.</span>
                </div>
            )}

            <div className={`space-y-5 ${hasOverrides ? 'opacity-50 pointer-events-none' : ''}`}>
                <RangeControl
                    label="Complexity" value={activeLayerConfig.complexity} onChange={(v) => updateState({ complexity: v })}
                    min={10} max={200} step={1} displayValue={activeLayerConfig.complexity.toString()} description="More shapes"
                />
                <RangeControl
                    label="Scale" value={activeLayerConfig.scale} onChange={(v) => updateState({ scale: v })}
                    min={0.5} max={3} step={0.1} displayValue={activeLayerConfig.scale.toFixed(1) + 'x'} description="Size of elements"
                />
                <RangeControl
                    label="Stroke Width" value={activeLayerConfig.strokeWidth} onChange={(v) => updateState({ strokeWidth: v })}
                    min={0} max={10} step={0.5} displayValue={activeLayerConfig.strokeWidth.toString()} description="Line thickness"
                />

                {/* Stroke Mode Control */}
                <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1.5">Stroke Mode</label>
                    <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                        <button
                            className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all ${activeLayerConfig.strokeMode === 'random' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => updateState({ strokeMode: 'random' })}
                            title="Mix of filled and stroked shapes"
                        >
                            Random
                        </button>
                        <button
                            className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all ${activeLayerConfig.strokeMode === 'fill' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => updateState({ strokeMode: 'fill' })}
                            title="All shapes filled with color"
                        >
                            Fill Only
                        </button>
                        <button
                            className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all ${activeLayerConfig.strokeMode === 'stroke' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => updateState({ strokeMode: 'stroke' })}
                            title="All shapes outlined only"
                        >
                            Stroke Only
                        </button>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1">Note: Some shapes (images, blobs, waves) always render as filled.</p>
                </div>

                <RangeControl
                    label="Texture" value={activeLayerConfig.texture} onChange={(v) => updateState({ texture: v })}
                    min={0} max={50} step={1} displayValue={activeLayerConfig.texture.toString()} description="Grain opacity"
                />
            </div>
        </CollapsibleSection>
    );
};

export default DetailPanel;
