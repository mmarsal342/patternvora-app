import React, { useRef, useState } from 'react';
import { Layers, ChevronDown, ChevronUp, Grid, X, Plus, Lock, Circle, Square, Triangle, Hexagon, Star, Spline, Minus, Activity, MousePointer2, Image as ImageIcon, Lamp, Flame, Gift, Cloud, Sparkles, Fan, TreePine, Snowflake, Bell, Candy, PartyPopper, Wine, Clock, CircleDot, Heart, Flower2, Mail, Ribbon, Moon, Building2, Diamond, Shapes, HelpCircle } from 'lucide-react';
import { useSidebar } from '../SidebarContext';
import CollapsibleSection from '../../common/CollapsibleSection';
import { PatternStyle, CompositionType, ShapeFillColorMode } from '../../../types';
import RangeControl from '../../common/RangeControl';

const StylePanel: React.FC = () => {
    const { activeLayerConfig, updateState } = useSidebar();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const shapeFillInputRef = useRef<HTMLInputElement>(null);

    // Auto-open if assets exist, otherwise start closed to save space
    const [isAssetsOpen, setIsAssetsOpen] = useState(activeLayerConfig.customImage.assets.length > 0);
    const [isShapeFillOpen, setIsShapeFillOpen] = useState(activeLayerConfig.shapeFill?.enabled ?? false);

    const hasOverrides = Object.keys(activeLayerConfig.overrides).length > 0;
    const styleOptions = activeLayerConfig.styleOptions;
    const compOptions = activeLayerConfig.compositionOptions;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    const newAsset = {
                        id: Date.now().toString(),
                        src: event.target.result as string
                    };
                    const newAssets = [...activeLayerConfig.customImage.assets, newAsset].slice(0, 5);

                    const updates: any = {
                        customImage: { ...activeLayerConfig.customImage, assets: newAssets }
                    };

                    if (activeLayerConfig.style !== 'custom-image') {
                        updates.style = 'custom-image';
                        updates.scale = 1.5;
                        updates.complexity = 30;
                        updates.overrides = {};
                    } else {
                        updates.overrides = {};
                    }

                    updateState(updates, true);
                    setIsAssetsOpen(true); // Auto open on upload
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAsset = (id: string) => {
        const newAssets = activeLayerConfig.customImage.assets.filter(a => a.id !== id);

        const updates: any = {
            customImage: { ...activeLayerConfig.customImage, assets: newAssets }
        };

        if (newAssets.length === 0 && activeLayerConfig.style === 'custom-image') {
            updates.style = 'geometric';
            updates.overrides = {};
        } else {
            updates.overrides = {};
        }

        updateState(updates, true);
    };

    const handleClearCustomImage = () => {
        const updates: any = {
            customImage: { ...activeLayerConfig.customImage, assets: [] }
        };

        if (activeLayerConfig.style === 'custom-image') {
            updates.style = 'geometric';
            updates.overrides = {};
        }

        updateState(updates, true);
    };

    // Shape Fill Handlers
    const handleShapeFillUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    updateState({
                        shapeFill: {
                            ...activeLayerConfig.shapeFill,
                            enabled: true,
                            sourceImage: event.target.result as string
                        }
                    }, true);
                    setIsShapeFillOpen(true);
                }
            };
            reader.readAsDataURL(file);
        }
        // Reset input so same file can be re-uploaded
        if (shapeFillInputRef.current) shapeFillInputRef.current.value = '';
    };

    const handleRemoveShapeFill = () => {
        updateState({
            shapeFill: {
                ...activeLayerConfig.shapeFill,
                enabled: false,
                sourceImage: null
            }
        }, true);
    };

    const toggleShapeType = (shape: string) => {
        const current = styleOptions.shapeTypes;
        let newTypes;
        if (current.includes(shape)) {
            newTypes = current.filter(t => t !== shape);
        } else {
            newTypes = [...current, shape];
        }
        updateState({ styleOptions: { ...styleOptions, shapeTypes: newTypes } }, true);
    };

    const isCompositionDisabled = ['grid', 'radial', 'mosaic', 'hex', 'waves', 'isometric'].includes(activeLayerConfig.style);
    const isShapesSupported = ['geometric', 'organic', 'memphis', 'bauhaus', 'confetti', 'grid', 'mosaic', 'radial', 'seasonal-cny', 'seasonal-christmas', 'seasonal-newyear', 'seasonal-valentine', 'seasonal-ramadan'].includes(activeLayerConfig.style);

    // Helpers to define available shapes per style for UI rendering
    const getAvailableShapes = () => {
        const s = activeLayerConfig.style;
        const shapes = [];
        if (s === 'geometric' || s === 'grid' || s === 'mosaic' || s === 'radial' || s === 'confetti' || s === 'memphis' || s === 'bauhaus') {
            shapes.push({ id: 'circle', icon: Circle });
            shapes.push({ id: 'rect', icon: Square });
            shapes.push({ id: 'triangle', icon: Triangle });
        }
        if (s === 'geometric' || s === 'memphis' || s === 'confetti' || s === 'radial') {
            shapes.push({ id: 'star', icon: Star });
        }
        if (s === 'geometric' || s === 'radial') {
            shapes.push({ id: 'polygon', icon: Hexagon });
            shapes.push({ id: 'line', icon: Minus });
        }
        if (s === 'organic') {
            shapes.push({ id: 'blob', icon: Spline });
            shapes.push({ id: 'circle', icon: Circle });
        }
        if (s === 'bauhaus') {
            shapes.push({ id: 'arc', icon: Activity }); // Approximation
            shapes.push({ id: 'line', icon: Minus });
        }
        if (s === 'memphis') {
            shapes.push({ id: 'zigzag', icon: Activity });
            shapes.push({ id: 'cross', icon: Plus });
            shapes.push({ id: 'pill', icon: MousePointer2 }); // Approximation
        }
        // CNY Seasonal Shapes
        if (s === 'seasonal-cny') {
            shapes.push({ id: 'lantern', icon: Lamp });
            shapes.push({ id: 'dragon', icon: Flame });
            shapes.push({ id: 'angpao', icon: Gift });
            shapes.push({ id: 'cloud-cn', icon: Cloud });
            shapes.push({ id: 'firecracker', icon: Sparkles });
            shapes.push({ id: 'fan', icon: Fan });
        }
        // Christmas Seasonal Shapes
        if (s === 'seasonal-christmas') {
            shapes.push({ id: 'xmas-tree', icon: TreePine });
            shapes.push({ id: 'gift', icon: Gift });
            shapes.push({ id: 'snowflake', icon: Snowflake });
            shapes.push({ id: 'bell', icon: Bell });
            shapes.push({ id: 'candycane', icon: Candy });
            shapes.push({ id: 'santa-hat', icon: Activity }); // Santa hat icon placeholder
        }
        // New Year Seasonal Shapes
        if (s === 'seasonal-newyear') {
            shapes.push({ id: 'firework', icon: Sparkles });
            shapes.push({ id: 'champagne', icon: Wine });
            shapes.push({ id: 'clock-ny', icon: Clock });
            shapes.push({ id: 'balloon', icon: CircleDot });
            shapes.push({ id: 'party-hat', icon: Triangle });
            shapes.push({ id: 'party-popper', icon: PartyPopper });
            shapes.push({ id: 'starburst', icon: Star });
        }
        // Valentine Seasonal Shapes
        if (s === 'seasonal-valentine') {
            shapes.push({ id: 'heart', icon: Heart });
            shapes.push({ id: 'rose', icon: Flower2 });
            shapes.push({ id: 'love-letter', icon: Mail });
            shapes.push({ id: 'ring', icon: CircleDot });
        }
        // Ramadan/Eid Seasonal Shapes
        if (s === 'seasonal-ramadan') {
            shapes.push({ id: 'crescent', icon: Moon });
            shapes.push({ id: 'star-islamic', icon: Star });
            shapes.push({ id: 'mosque', icon: Building2 });
            shapes.push({ id: 'lantern-ramadan', icon: Lamp });
            shapes.push({ id: 'ketupat', icon: Gift });
            shapes.push({ id: 'dates', icon: CircleDot });
        }
        return shapes;
    };

    const availableShapes = getAvailableShapes();

    return (
        <CollapsibleSection title="Style" icon={<Layers size={16} />}>
            {hasOverrides && (
                <div className="mb-4 p-2 bg-amber-50 border border-amber-100 rounded text-[10px] text-amber-700 flex items-center gap-2">
                    <Lock size={12} className="shrink-0" />
                    <span>Controls locked because you have edited shapes manually. <button onClick={() => updateState({ overrides: {} }, true)} className="underline font-bold">Reset Shapes</button> to unlock.</span>
                </div>
            )}

            {/* Custom Image Upload Accordion - MOVED TO TOP */}
            <div className={`mb-4 border rounded-lg overflow-hidden transition-all ${hasOverrides ? 'opacity-50 pointer-events-none' : 'border-slate-200'}`}>
                <button
                    onClick={() => setIsAssetsOpen(!isAssetsOpen)}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        <ImageIcon size={14} className="text-indigo-500" />
                        <span>Custom Assets</span>
                        <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                            {activeLayerConfig.customImage.assets.length}/5
                        </span>
                    </div>
                    {isAssetsOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                </button>

                {isAssetsOpen && (
                    <div className="p-3 bg-white border-t border-slate-200 animate-in slide-in-from-top-2 duration-150">
                        <div className="grid grid-cols-3 gap-2 mb-2">
                            {activeLayerConfig.customImage.assets.map((asset) => (
                                <div key={asset.id} className="relative group aspect-square bg-slate-100 rounded-md border border-slate-200 overflow-hidden">
                                    <img src={asset.src} alt="Asset" className="w-full h-full object-contain p-1" />
                                    <button
                                        onClick={() => handleRemoveAsset(asset.id)}
                                        className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}

                            {activeLayerConfig.customImage.assets.length < 5 && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square border border-dashed border-slate-300 rounded-md flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                >
                                    <Plus size={16} />
                                    <span className="text-[9px] font-bold">ADD</span>
                                </button>
                            )}
                        </div>

                        <div className="flex items-center justify-between mt-2">
                            {activeLayerConfig.customImage.assets.length > 0 ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="originalColors"
                                        checked={activeLayerConfig.customImage.originalColors}
                                        onChange={(e) => {
                                            updateState({
                                                customImage: { ...activeLayerConfig.customImage, originalColors: e.target.checked }
                                            }, true);
                                        }}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="originalColors" className="text-[10px] text-slate-600 cursor-pointer">Original Colors</label>
                                </div>
                            ) : (
                                <span className="text-[9px] text-slate-400">Upload PNGs to use.</span>
                            )}

                            {activeLayerConfig.customImage.assets.length > 0 && (
                                <button
                                    className="text-[9px] text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1"
                                    onClick={handleClearCustomImage}
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </div>
                )}
            </div>

            {/* Shape Fill Accordion */}
            <div className={`mb-4 border rounded-lg overflow-hidden transition-all ${hasOverrides ? 'opacity-50 pointer-events-none' : 'border-purple-200'}`}>
                <button
                    onClick={() => setIsShapeFillOpen(!isShapeFillOpen)}
                    className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                    <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 uppercase tracking-wide">
                        <Shapes size={14} className="text-purple-500" />
                        <span>Shape Fill</span>
                        {activeLayerConfig.shapeFill?.enabled && (
                            <span className="bg-purple-200 text-purple-700 px-1.5 py-0.5 rounded-full text-[9px] font-bold">ON</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span
                            className="text-purple-400 hover:text-purple-600 cursor-help"
                            title="Fill a PNG silhouette with pattern shapes. Upload a PNG with transparent background (100-2000px). Simple icons work best. Colors are sampled from the image."
                        >
                            <HelpCircle size={12} />
                        </span>
                        {isShapeFillOpen ? <ChevronUp size={14} className="text-purple-400" /> : <ChevronDown size={14} className="text-purple-400" />}
                    </div>
                </button>

                {isShapeFillOpen && (
                    <div className="p-3 bg-white border-t border-purple-200 animate-in slide-in-from-top-2 duration-150">
                        {!activeLayerConfig.shapeFill?.sourceImage ? (
                            <button
                                onClick={() => shapeFillInputRef.current?.click()}
                                className="w-full p-4 border-2 border-dashed border-purple-300 rounded-lg flex flex-col items-center justify-center gap-2 text-purple-400 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            >
                                <Plus size={24} />
                                <span className="text-xs font-semibold">Upload PNG</span>
                                <span className="text-[9px] text-purple-300">Transparent background required</span>
                            </button>
                        ) : (
                            <>
                                <div className="relative group mb-3">
                                    <div className="aspect-square bg-slate-100 rounded-lg border border-purple-200 overflow-hidden flex items-center justify-center">
                                        <img
                                            src={activeLayerConfig.shapeFill.sourceImage}
                                            alt="Shape Fill Source"
                                            className="max-w-full max-h-full object-contain p-2"
                                        />
                                    </div>
                                    <button
                                        onClick={handleRemoveShapeFill}
                                        className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>

                                <RangeControl
                                    label="Density"
                                    value={activeLayerConfig.shapeFill?.density || 1}
                                    onChange={(v) => updateState({
                                        shapeFill: { ...activeLayerConfig.shapeFill, density: v }
                                    }, true)}
                                    min={0.5} max={2} step={0.1}
                                    displayValue={(activeLayerConfig.shapeFill?.density || 1).toFixed(1) + 'x'}
                                />

                                <div className="mt-3 space-y-1">
                                    <label className="text-[10px] font-semibold text-purple-600 uppercase">Color Mode</label>
                                    <div className="flex bg-purple-100 rounded-lg p-1">
                                        <button
                                            className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all ${activeLayerConfig.shapeFill?.colorMode === 'raw' ? 'bg-white text-purple-700 shadow-sm' : 'text-purple-500 hover:text-purple-700'}`}
                                            onClick={() => updateState({ shapeFill: { ...activeLayerConfig.shapeFill, colorMode: 'raw' } }, true)}
                                        >
                                            🎨 From Image
                                        </button>
                                        <button
                                            className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all ${activeLayerConfig.shapeFill?.colorMode === 'palette' ? 'bg-white text-purple-700 shadow-sm' : 'text-purple-500 hover:text-purple-700'}`}
                                            onClick={() => updateState({ shapeFill: { ...activeLayerConfig.shapeFill, colorMode: 'palette' } }, true)}
                                        >
                                            🎭 From Palette
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                        <input type="file" ref={shapeFillInputRef} className="hidden" accept="image/png" onChange={handleShapeFillUpload} />
                    </div>
                )}
            </div>

            <div className={`space-y-4 ${hasOverrides ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pattern Type</label>
                    <div className="relative">
                        <select
                            value={activeLayerConfig.style}
                            onChange={(e) => updateState({ style: e.target.value as PatternStyle }, true)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none"
                        >
                            <option value="geometric">Geometric Scatter</option>
                            <option value="organic">Organic Flow</option>
                            <option value="memphis">Memphis (80s Retro)</option>
                            <option value="grid">Structured Grid</option>
                            <option value="isometric">Isometric (3D Illusion)</option>
                            <option value="mosaic">Mosaic Grid</option>
                            <option value="hex">Hexagon Grid</option>
                            {/* <option value="waves">Abstract Waves</option> */} {/* Hidden - still buggy */}
                            <option value="bauhaus">Bauhaus Construct</option>
                            <option value="confetti">Confetti</option>
                            <option value="radial">Radial Mandala</option>
                            <option value="truchet">Truchet Maze</option>
                            <option value="guilloche">Guilloché (Spirograph)</option>
                            <option value="herringbone">Herringbone / Chevron</option>
                            <option value="typo">Typo Texture</option>
                            <optgroup label="💕 Seasonal">
                                <option value="seasonal-cny">🐉 Chinese New Year</option>
                                <option value="seasonal-christmas">🎄 Christmas</option>
                                <option value="seasonal-newyear">🎉 New Year</option>
                                <option value="seasonal-valentine">💕 Valentine's Day</option>
                                <option value="seasonal-ramadan">🌙 Ramadan & Eid</option>
                            </optgroup>
                            <option value="custom-image" disabled={activeLayerConfig.customImage.assets.length === 0}>Custom Brand Asset</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-3 text-slate-500 pointer-events-none" />
                    </div>
                </div>

                {/* Shape Filtering UI */}
                {isShapesSupported && availableShapes.length > 0 && activeLayerConfig.style !== 'custom-image' && (
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Shapes</label>
                        <div className="flex flex-wrap gap-1">
                            {availableShapes.map((shape) => {
                                const isActive = styleOptions.shapeTypes.length === 0 || styleOptions.shapeTypes.includes(shape.id);
                                const Icon = shape.icon;
                                return (
                                    <button
                                        key={shape.id}
                                        onClick={() => toggleShapeType(shape.id)}
                                        className={`p-2 rounded-md border transition-all ${isActive
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                                            : 'bg-white border-slate-200 text-slate-300 hover:border-slate-300'
                                            }`}
                                        title={`Toggle ${shape.id}`}
                                    >
                                        <Icon size={14} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Grid Specific Options */}
                {(activeLayerConfig.style === 'grid' || activeLayerConfig.style === 'mosaic') && (
                    <RangeControl
                        label="Grid Gap"
                        value={styleOptions.gridGap || 0}
                        onChange={(v) => updateState({ styleOptions: { ...styleOptions, gridGap: v } }, true)}
                        min={0} max={50} step={1} displayValue={(styleOptions.gridGap || 0) + 'px'}
                    />
                )}

                {/* Truchet Maze Specific Options */}
                {activeLayerConfig.style === 'truchet' && (
                    <div className="space-y-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">🎲 Maze Options</span>
                            <span
                                className="text-[9px] text-indigo-500 bg-indigo-100 px-2 py-1 rounded cursor-help"
                                title="💡 Best Seamless: Density 5 or 10, Single Arc, Single or Double Stroke"
                            >
                                ⓘ Tip
                            </span>
                        </div>

                        {/* Maze Density Slider */}
                        <RangeControl
                            label="Maze Density"
                            value={activeLayerConfig.truchetOptions?.mazeDensity || 10}
                            onChange={(v) => updateState({
                                truchetOptions: {
                                    ...activeLayerConfig.truchetOptions,
                                    mazeDensity: v
                                }
                            }, true)}
                            min={4} max={20} step={1}
                            displayValue={(activeLayerConfig.truchetOptions?.mazeDensity || 10).toString()}
                        />

                        {/* Arc Weight Slider */}
                        <RangeControl
                            label="Arc Weight"
                            value={activeLayerConfig.truchetOptions?.arcWeight || 5}
                            onChange={(v) => updateState({
                                truchetOptions: {
                                    ...activeLayerConfig.truchetOptions,
                                    arcWeight: v
                                }
                            }, true)}
                            min={1} max={10} step={1}
                            displayValue={(activeLayerConfig.truchetOptions?.arcWeight || 5).toString()}
                        />

                        {/* Concentric Count Dropdown */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-indigo-600 uppercase">Concentric Arcs</label>
                            <select
                                value={activeLayerConfig.truchetOptions?.concentricCount || 1}
                                onChange={(e) => updateState({
                                    truchetOptions: {
                                        ...activeLayerConfig.truchetOptions,
                                        concentricCount: parseInt(e.target.value)
                                    }
                                }, true)}
                                className="w-full bg-white border border-indigo-200 rounded p-2 text-sm text-slate-700"
                            >
                                <option value={1}>Single Arc</option>
                                <option value={2}>Double (2 nested)</option>
                                <option value={3}>Triple (3 nested)</option>
                            </select>
                        </div>

                        {/* Double Stroke Toggle */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="doubleStroke"
                                checked={activeLayerConfig.truchetOptions?.doubleStroke || false}
                                onChange={(e) => updateState({
                                    truchetOptions: {
                                        ...activeLayerConfig.truchetOptions,
                                        doubleStroke: e.target.checked
                                    }
                                }, true)}
                                className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="doubleStroke" className="text-[10px] font-semibold text-indigo-600 uppercase cursor-pointer">
                                Double Stroke
                            </label>
                        </div>
                    </div>
                )}

                {/* Guilloché / Spirograph Specific Options */}
                {activeLayerConfig.style === 'guilloche' && (
                    <div className="space-y-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">🌀 Guilloché Options</span>
                            <span
                                className="text-[9px] text-purple-500 bg-purple-100 px-2 py-1 rounded cursor-help"
                                title="💡 Perfect for: Certificates, currency designs, security patterns. Try Layer Count 3-5 for intricate designs."
                            >
                                ⓘ Tip
                            </span>
                        </div>

                        {/* Curve Type Dropdown */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-purple-600 uppercase">Curve Type</label>
                            <select
                                value={activeLayerConfig.guillocheOptions?.curveType || 'hypotrochoid'}
                                onChange={(e) => updateState({
                                    guillocheOptions: {
                                        ...activeLayerConfig.guillocheOptions,
                                        curveType: e.target.value as any
                                    }
                                }, true)}
                                className="w-full bg-white border border-purple-200 rounded p-2 text-sm text-slate-700"
                            >
                                <option value="hypotrochoid">Hypotrochoid (Inside)</option>
                                <option value="epitrochoid">Epitrochoid (Outside)</option>
                                <option value="mixed">Mixed (Alternating)</option>
                            </select>
                        </div>

                        {/* Major Radius */}
                        <RangeControl
                            label="Major Radius"
                            value={activeLayerConfig.guillocheOptions?.majorRadius || 100}
                            onChange={(v) => updateState({
                                guillocheOptions: {
                                    ...activeLayerConfig.guillocheOptions,
                                    majorRadius: v
                                }
                            }, true)}
                            min={50} max={200} step={5}
                            displayValue={(activeLayerConfig.guillocheOptions?.majorRadius || 100).toString()}
                        />

                        {/* Minor Radius */}
                        <RangeControl
                            label="Minor Radius"
                            value={activeLayerConfig.guillocheOptions?.minorRadius || 40}
                            onChange={(v) => updateState({
                                guillocheOptions: {
                                    ...activeLayerConfig.guillocheOptions,
                                    minorRadius: v
                                }
                            }, true)}
                            min={10} max={100} step={5}
                            displayValue={(activeLayerConfig.guillocheOptions?.minorRadius || 40).toString()}
                        />

                        {/* Pen Distance */}
                        <RangeControl
                            label="Pen Distance"
                            value={activeLayerConfig.guillocheOptions?.penDistance || 60}
                            onChange={(v) => updateState({
                                guillocheOptions: {
                                    ...activeLayerConfig.guillocheOptions,
                                    penDistance: v
                                }
                            }, true)}
                            min={10} max={150} step={5}
                            displayValue={(activeLayerConfig.guillocheOptions?.penDistance || 60).toString()}
                        />

                        {/* Layer Count */}
                        <RangeControl
                            label="Layer Count"
                            value={activeLayerConfig.guillocheOptions?.layerCount || 3}
                            onChange={(v) => updateState({
                                guillocheOptions: {
                                    ...activeLayerConfig.guillocheOptions,
                                    layerCount: v
                                }
                            }, true)}
                            min={1} max={7} step={1}
                            displayValue={(activeLayerConfig.guillocheOptions?.layerCount || 3).toString()}
                        />

                        {/* Stroke Weight */}
                        <RangeControl
                            label="Stroke Weight"
                            value={activeLayerConfig.guillocheOptions?.strokeWeight || 2}
                            onChange={(v) => updateState({
                                guillocheOptions: {
                                    ...activeLayerConfig.guillocheOptions,
                                    strokeWeight: v
                                }
                            }, true)}
                            min={1} max={5} step={0.5}
                            displayValue={(activeLayerConfig.guillocheOptions?.strokeWeight || 2).toString()}
                        />
                    </div>
                )}

                {/* Herringbone / Chevron Specific Options */}
                {activeLayerConfig.style === 'herringbone' && (
                    <div className="space-y-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">🧱 Tile Options</span>
                            <span
                                className="text-[9px] text-amber-500 bg-amber-100 px-2 py-1 rounded cursor-help"
                                title="💡 Best Seamless: Tile Ratio 2.5, Grout 2px. Chevron pattern tiles perfectly at any ratio."
                            >
                                ⓘ Tip
                            </span>
                        </div>

                        {/* Pattern Type Dropdown */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-amber-600 uppercase">Pattern</label>
                            <select
                                value={activeLayerConfig.herringboneOptions?.pattern || 'herringbone'}
                                onChange={(e) => updateState({
                                    herringboneOptions: {
                                        ...activeLayerConfig.herringboneOptions,
                                        pattern: e.target.value as any
                                    }
                                }, true)}
                                className="w-full bg-white border border-amber-200 rounded p-2 text-sm text-slate-700"
                            >
                                <option value="herringbone">Herringbone (Zigzag)</option>
                                <option value="chevron">Chevron (V-Shape)</option>
                                <option value="basket-weave">Basket Weave</option>
                            </select>
                        </div>

                        {/* Tile Ratio */}
                        <RangeControl
                            label="Tile Ratio"
                            value={activeLayerConfig.herringboneOptions?.tileRatio || 2.5}
                            onChange={(v) => updateState({
                                herringboneOptions: {
                                    ...activeLayerConfig.herringboneOptions,
                                    tileRatio: v
                                }
                            }, true)}
                            min={1.5} max={4} step={0.5}
                            displayValue={(activeLayerConfig.herringboneOptions?.tileRatio || 2.5).toFixed(1)}
                        />

                        {/* Grout Size */}
                        <RangeControl
                            label="Grout Size"
                            value={activeLayerConfig.herringboneOptions?.groutSize || 2}
                            onChange={(v) => updateState({
                                herringboneOptions: {
                                    ...activeLayerConfig.herringboneOptions,
                                    groutSize: v
                                }
                            }, true)}
                            min={0} max={10} step={1}
                            displayValue={(activeLayerConfig.herringboneOptions?.groutSize || 2) + 'px'}
                        />

                        {/* Color Mode Dropdown */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-amber-600 uppercase">Color Mode</label>
                            <select
                                value={activeLayerConfig.herringboneOptions?.colorMode || 'alternating'}
                                onChange={(e) => updateState({
                                    herringboneOptions: {
                                        ...activeLayerConfig.herringboneOptions,
                                        colorMode: e.target.value as any
                                    }
                                }, true)}
                                className="w-full bg-white border border-amber-200 rounded p-2 text-sm text-slate-700"
                            >
                                <option value="mono">Mono (Single Color)</option>
                                <option value="alternating">Alternating</option>
                                <option value="random">Random</option>
                            </select>
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Composition</label>
                    <div className="relative">
                        <select
                            value={activeLayerConfig.composition || 'random'}
                            onChange={(e) => updateState({ composition: e.target.value as CompositionType }, true)}
                            disabled={isCompositionDisabled}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="random">Random Scatter</option>
                            <option value="center">Central Cluster</option>
                            <option value="frame">Frame Border</option>
                            <option value="split-v">Split Vertical (1/2)</option>
                            <option value="split-h">Split Horizontal (1/2)</option>
                            <option value="corners">Corner Accents</option>
                            <option value="diagonal">Diagonal Flow</option>
                            <option value="thirds">Rule of Thirds</option>
                            <option value="bottom">Bottom Heavy</option>
                            <option value="cross">Cross (+)</option>
                            <option value="x-shape">X Shape (×)</option>
                            <option value="ring">Ring / Donut</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-3 text-slate-500 pointer-events-none" />
                    </div>
                    {isCompositionDisabled && (
                        <p className="text-[10px] text-amber-600 flex items-center gap-1 mt-1 bg-amber-50 p-1.5 rounded">
                            <Grid size={10} /> Override active: This style controls layout.
                        </p>
                    )}
                </div>

                {/* Symmetry / Kaleidoscope */}
                {(() => {
                    const isSymmetryDisabled = ['truchet', 'guilloche', 'herringbone'].includes(activeLayerConfig.style);
                    return (
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Symmetry</label>
                            <div className="relative">
                                <select
                                    value={isSymmetryDisabled ? 'none' : (activeLayerConfig.symmetryGroup || 'none')}
                                    onChange={(e) => updateState({ symmetryGroup: e.target.value as any }, true)}
                                    disabled={isSymmetryDisabled}
                                    className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none ${isSymmetryDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <option value="none">None</option>
                                    <option value="pm">🪞 Mirror (2x)</option>
                                    <option value="pmm">✨ Double Mirror (4x)</option>
                                    <option value="p4m">🔮 Kaleidoscope (8x)</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-3 text-slate-500 pointer-events-none" />
                            </div>
                            {isSymmetryDisabled && (
                                <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 bg-slate-100 p-1.5 rounded">
                                    🚫 Symmetry not available for {activeLayerConfig.style} patterns
                                </p>
                            )}
                            {!isSymmetryDisabled && activeLayerConfig.symmetryGroup && activeLayerConfig.symmetryGroup !== 'none' && (
                                <p className="text-[10px] text-purple-600 flex items-center gap-1 mt-1 bg-purple-50 p-1.5 rounded">
                                    🌀 Shapes will be mirrored/rotated around center
                                </p>
                            )}
                        </div>
                    );
                })()}

                {/* Composition Specific Controls */}
                {!isCompositionDisabled && activeLayerConfig.composition === 'diagonal' && (
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Direction</label>
                        <div className="flex bg-slate-100 rounded-lg p-1">
                            <button
                                className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all ${compOptions.direction === 'tl-br' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                onClick={() => updateState({ compositionOptions: { ...compOptions, direction: 'tl-br' } }, true)}
                            >
                                ↘ TL to BR
                            </button>
                            <button
                                className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all ${compOptions.direction === 'tr-bl' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                onClick={() => updateState({ compositionOptions: { ...compOptions, direction: 'tr-bl' } }, true)}
                            >
                                ↙ TR to BL
                            </button>
                        </div>
                    </div>
                )}

                {!isCompositionDisabled && activeLayerConfig.composition === 'frame' && (
                    <RangeControl
                        label="Frame Margin"
                        value={compOptions.margin || 25}
                        onChange={(v) => updateState({ compositionOptions: { ...compOptions, margin: v } }, true)}
                        min={0} max={50} step={1} displayValue={(compOptions.margin || 25) + '%'}
                    />
                )}
            </div>
        </CollapsibleSection>
    );
};

export default StylePanel;