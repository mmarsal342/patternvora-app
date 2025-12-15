
import React, { useState } from 'react';
import { Layers, Plus, Trash2, Eye, EyeOff, Lock, Unlock, Copy, GripVertical } from 'lucide-react';
import { useSidebar } from '../SidebarContext';
import CollapsibleSection from '../../common/CollapsibleSection';
import { Layer } from '../../../types';
import { DEFAULT_LAYER_CONFIG } from '../../../utils/migration';

const LayersPanel: React.FC = () => {
    const { state, updateStateDirectly, onGenerate } = useSidebar();
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const handleAddLayer = () => {
        const newLayer: Layer = {
            id: `layer-${Date.now()}`,
            name: `Layer ${state.layers.length + 1}`,
            visible: true,
            locked: false,
            blendMode: 'source-over',
            opacity: 1,
            // New layers are transparent by default for easier compositing
            config: { ...DEFAULT_LAYER_CONFIG, seed: Math.random() * 99999, transparentBackground: true }
        };

        updateStateDirectly({
            layers: [...state.layers, newLayer],
            activeLayerId: newLayer.id
        });
        setTimeout(onGenerate, 0);
    };

    const handleDuplicateLayer = (layer: Layer, e: React.MouseEvent) => {
        e.stopPropagation();
        const newLayer: Layer = {
            ...JSON.parse(JSON.stringify(layer)),
            id: `layer-${Date.now()}`,
            name: `${layer.name} Copy`
        };
        updateStateDirectly({
            layers: [...state.layers, newLayer],
            activeLayerId: newLayer.id
        });
        setTimeout(onGenerate, 0);
    };

    const handleRemoveLayer = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (state.layers.length <= 1) return;

        const newLayers = state.layers.filter(l => l.id !== id);
        const newActiveId = state.activeLayerId === id ? newLayers[newLayers.length - 1].id : state.activeLayerId;

        updateStateDirectly({
            layers: newLayers,
            activeLayerId: newActiveId
        });
        setTimeout(onGenerate, 0);
    };

    const updateLayer = (id: string, updates: Partial<Layer>) => {
        const newLayers = state.layers.map(l => l.id === id ? { ...l, ...updates } : l);
        updateStateDirectly({ layers: newLayers });
        setTimeout(onGenerate, 0);
    };

    // --- Drag & Drop Handlers ---
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // Required for Firefox to allow drag
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDragEnter = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null) return;
        if (draggedIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Essential to allow dropping
    };

    const handleDragEnd = () => {
        if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
            const newLayers = [...state.layers];
            const [movedLayer] = newLayers.splice(draggedIndex, 1);
            newLayers.splice(dragOverIndex, 0, movedLayer);

            updateStateDirectly({ layers: newLayers });
            setTimeout(onGenerate, 0);
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    return (
        <CollapsibleSection title="Layers" icon={<Layers size={16} />} defaultOpen={true}>
            <div className="space-y-2">
                {state.layers.map((layer, index) => (
                    <div
                        key={layer.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                        onClick={() => updateStateDirectly({ activeLayerId: layer.id })}
                        className={`group relative flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${state.activeLayerId === layer.id
                                ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                : 'bg-white border-slate-200 hover:border-indigo-100'
                            } ${layer.locked ? 'opacity-70' : ''} ${dragOverIndex === index ? 'border-indigo-500 ring-1 ring-indigo-500 z-10' : ''
                            } ${draggedIndex === index ? 'opacity-40' : ''
                            }`}
                    >
                        {/* Drag Handle */}
                        <div
                            className="cursor-grab text-slate-300 hover:text-slate-500 -ml-1 flex-shrink-0"
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <GripVertical size={14} />
                        </div>

                        {/* Visibility Toggle */}
                        <button
                            onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { visible: !layer.visible }); }}
                            className="text-slate-400 hover:text-slate-600 p-1 rounded"
                        >
                            {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-semibold truncate ${state.activeLayerId === layer.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                                    {layer.name}
                                </span>
                                {layer.config.style && (
                                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full capitalize">
                                        {layer.config.style}
                                    </span>
                                )}
                            </div>

                            {/* Layer Settings (Opacity/Blend) */}
                            {state.activeLayerId === layer.id && (
                                <div className="flex items-center gap-2 mt-1.5 animate-in slide-in-from-left-2 duration-150">
                                    <select
                                        value={layer.blendMode}
                                        onChange={(e) => updateLayer(layer.id, { blendMode: e.target.value as GlobalCompositeOperation })}
                                        className="text-[10px] bg-white border border-slate-200 rounded px-1 py-0.5 outline-none focus:border-indigo-300"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <option value="source-over">Normal</option>
                                        <option value="multiply">Multiply</option>
                                        <option value="screen">Screen</option>
                                        <option value="overlay">Overlay</option>
                                    </select>
                                    <input
                                        type="range"
                                        min="0" max="1" step="0.1"
                                        value={layer.opacity}
                                        onChange={(e) => updateLayer(layer.id, { opacity: parseFloat(e.target.value) })}
                                        onClick={(e) => e.stopPropagation()}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onTouchStart={(e) => e.stopPropagation()}
                                        className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Separator & Actions */}
                        <div className="flex items-center gap-0.5 ml-2 pl-2 border-l border-slate-200">
                            <button
                                onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { locked: !layer.locked }); }}
                                className={`p-1.5 rounded hover:bg-slate-100 ${layer.locked ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'}`}
                            >
                                {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                            </button>

                            <button
                                onClick={(e) => handleDuplicateLayer(layer, e)}
                                className="p-1.5 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-500"
                                title="Duplicate"
                            >
                                <Copy size={12} />
                            </button>

                            <button
                                onClick={(e) => handleRemoveLayer(layer.id, e)}
                                disabled={state.layers.length <= 1}
                                className="p-1.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 disabled:opacity-0"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    onClick={handleAddLayer}
                    className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-xs font-semibold text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={14} /> Add New Layer
                </button>
            </div>
        </CollapsibleSection>
    );
};

export default LayersPanel;
