
import React, { useState, useEffect } from 'react';
import {
    RefreshCw, Download, Video, MousePointer2, Dices, Sparkles, X, Wand2, Settings2, ChevronDown, ChevronUp, RotateCcw, Bookmark, Loader2
} from 'lucide-react';
import { AppState, TextConfig, CustomImageConfig, AnimationConfig, Preset, FontDef, PatternStyle, CompositionType, LayerConfig, EXPORT_SIZES, ExportSize } from '../types';
import { PALETTES } from '../utils/palettes';
import { SidebarProvider, useSidebar, SidebarContextType } from './sidebar/SidebarContext';
import { useUser } from './UserContext';
import { presetsApi } from '../services/api';

// Import Panels
import LayersPanel from './sidebar/panels/LayersPanel';
import CanvasPanel from './sidebar/panels/CanvasPanel';
import StylePanel from './sidebar/panels/StylePanel';
import ColorPanel from './sidebar/panels/ColorPanel';
import DetailPanel from './sidebar/panels/DetailPanel';
import TextPanel from './sidebar/panels/TextPanel';
import MotionPanel from './sidebar/panels/MotionPanel';

import PresetsPanel from './sidebar/panels/PresetsPanel';
import SeasonalBanner from './SeasonalBanner';

// Define the full props interface
interface SidebarProps {
    state: AppState;
    updateState: (updates: Partial<AppState>, immediate?: boolean) => void;
    updateText: (updates: Partial<TextConfig>) => void;
    updateCustomImage: (updates: Partial<CustomImageConfig>) => void;
    updateAnimation: (updates: Partial<AnimationConfig>) => void;
    onGenerate: () => void;
    onDownloadPNG: (size: number) => void;
    onDownloadJPG: (size: number) => void;
    onDownloadSVG: () => void;
    isGeneratingSVG?: boolean;
    isExportingPNG?: boolean;
    isExportingJPG?: boolean;
    onExtractPalette: (file: File) => void;
    onRecordVideo: () => void;
    isRecording: boolean;
    onSavePreset: (name: string) => void;
    onLoadPreset: (preset: Preset) => void;
    presets: Preset[];
    onImportPreset: (e: React.ChangeEvent<HTMLInputElement>) => void;
    customFonts: FontDef[];
    onUploadFont: (file: File) => void;
    isEditMode?: boolean;
    onToggleEditMode?: () => void;
    onOpenBatchModal: () => void;
    onReset: () => void;
}

const SidebarLayout: React.FC<Omit<SidebarProps, keyof SidebarContextType>> = (props) => {
    const {
        onDownloadPNG, onDownloadJPG, onDownloadSVG,
        isGeneratingSVG, isExportingPNG, isExportingJPG,
        onRecordVideo, isRecording,
        isEditMode, onToggleEditMode, onOpenBatchModal, onReset
    } = props;

    const { state, activeLayerConfig, updateState, onGenerate } = useSidebar();
    const { isPro, isGuest } = useUser();
    const [exportSize, setExportSize] = useState<ExportSize>(4096);
    const [isFooterOpen, setIsFooterOpen] = useState(true);

    // Quick Save Preset state
    const [showSaveForm, setShowSaveForm] = useState(false);
    const [presetName, setPresetName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [presetCount, setPresetCount] = useState(0);
    const presetLimit = isPro ? 50 : 10;

    // Fetch preset count on mount
    useEffect(() => {
        if (!isGuest) {
            presetsApi.list().then(data => setPresetCount(data.presets.length)).catch(() => { });
        }
    }, [isGuest]);

    const handleQuickSavePreset = async () => {
        if (!presetName.trim() || isSaving) return;
        setIsSaving(true);
        try {
            const configJson = JSON.stringify(activeLayerConfig);
            await presetsApi.save(presetName.trim(), configJson);
            setPresetCount(prev => prev + 1);
            setPresetName('');
            setShowSaveForm(false);
        } catch (err: any) {
            alert(err.message || 'Failed to save preset');
        } finally {
            setIsSaving(false);
        }
    };

    // Helper to generate a random configuration update
    const getRandomConfigUpdate = (currentConfig: LayerConfig): Partial<LayerConfig> => {
        const randomPalette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
        const styles: PatternStyle[] = ['geometric', 'organic', 'grid', 'bauhaus', 'confetti', 'radial', 'typo', 'mosaic', 'hex', 'memphis', 'isometric']; // 'waves' hidden - still buggy

        // Only include custom-image in shuffle if assets exist
        if (currentConfig.customImage.assets.length > 0) {
            styles.push('custom-image');
        }

        const randomStyle = styles[Math.floor(Math.random() * styles.length)];
        const comps: CompositionType[] = ['random', 'center', 'frame', 'diagonal', 'thirds', 'bottom', 'cross', 'ring', 'x-shape', 'split-v', 'split-h', 'corners'];
        const randomComp = comps[Math.floor(Math.random() * comps.length)];

        return {
            seed: Math.random() * 100000,
            palette: randomPalette,
            style: randomStyle,
            composition: randomComp,
            complexity: Math.floor(Math.random() * 100) + 20,
            scale: 0.5 + Math.random(),
        };
    };

    const handleRandomize = () => {
        const updates = getRandomConfigUpdate(activeLayerConfig);
        updateState(updates, true); // Routes to Active Layer
        onGenerate();
    };

    const handleRandomizeAll = () => {
        // Shuffle ALL unlocked layers
        const newLayers = state.layers.map(layer => {
            if (layer.locked) return layer; // Skip locked layers

            const updates = getRandomConfigUpdate(layer.config);
            return {
                ...layer,
                config: { ...layer.config, ...updates }
            };
        });

        updateState({ layers: newLayers }, true); // Routes to Global State
        onGenerate();
    };

    const handleRemix = () => {
        updateState({ seed: Math.random() * 100000 }, true);
        onGenerate();
    };

    const isAnimEnabled = activeLayerConfig.animation.enabled;

    return (
        <div className="w-full md:w-80 h-full flex flex-col bg-white border-t md:border-t-0 md:border-l border-slate-200 overflow-hidden font-sans text-slate-600 shadow-xl shadow-slate-200/50 z-30">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <SeasonalBanner onApplyStyle={(style) => updateState({ style: style as any }, true)} />
                <LayersPanel />
                <PresetsPanel />
                <div className="px-4 py-2 bg-slate-50 border-y border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                    Editing Active Layer
                </div>
                <CanvasPanel />
                <StylePanel />

                <TextPanel />
                <MotionPanel />

                <ColorPanel />
                <DetailPanel />

            </div>

            {/* Footer / Actions - Now Collapsible */}
            <div className={`bg-white border-t border-slate-200 flex-shrink-0 transition-all z-20 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]`}>
                {/* Toggle Handle */}
                <button
                    onClick={() => setIsFooterOpen(!isFooterOpen)}
                    className="w-full flex items-center justify-center py-1.5 hover:bg-slate-50 transition-colors cursor-pointer group"
                    title={isFooterOpen ? "Minimize Footer" : "Expand Footer"}
                >
                    {isFooterOpen ? (
                        <ChevronDown size={16} className="text-slate-300 group-hover:text-slate-500" />
                    ) : (
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide">
                            <ChevronUp size={16} className="text-slate-400" /> Actions & Export
                        </div>
                    )}
                </button>

                {isFooterOpen && (
                    <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-bottom-2 duration-200">
                        {/* Randomize Controls */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleRandomize}
                                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95 border border-slate-200"
                            >
                                <RefreshCw size={14} />
                                <span className="sm:hidden">Shuffle</span>
                                <span className="hidden sm:inline">Shuffle Layer</span>
                            </button>
                            <button
                                onClick={handleRandomizeAll}
                                className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-indigo-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                                title="Shuffle All Unlocked Layers"
                            >
                                <Wand2 size={14} className="fill-white/20" />
                                <span className="sm:hidden">All</span>
                                <span className="hidden sm:inline">Shuffle All</span>
                            </button>
                            <button
                                onClick={handleRemix}
                                className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors border border-slate-200"
                                title="Remix Layout Only (Keep Style & Colors)"
                            >
                                <Dices size={18} />
                            </button>
                        </div>

                        {/* Resolution Selector (Prep for Freemium) */}
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Settings2 size={10} /> Export Quality
                            </span>
                            <select
                                value={exportSize}
                                onChange={(e) => setExportSize(parseInt(e.target.value) as ExportSize)}
                                className="text-[10px] bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-400 font-medium text-slate-600"
                            >
                                {EXPORT_SIZES.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label} {opt.badge ? `(${opt.badge})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Export Grid */}
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => onDownloadPNG(exportSize)}
                                disabled={isExportingPNG}
                                className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                            >
                                {isExportingPNG ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={14} />}
                                <span>PNG</span>
                            </button>
                            <button
                                onClick={() => onDownloadJPG(exportSize)}
                                disabled={isExportingJPG}
                                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                            >
                                {isExportingJPG ? <div className="w-3 h-3 border-2 border-slate-400/30 border-t-slate-600 rounded-full animate-spin" /> : <Download size={14} />}
                                <span>JPG</span>
                            </button>
                            <button
                                onClick={onDownloadSVG}
                                disabled={isGeneratingSVG}
                                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                            >
                                {isGeneratingSVG ? <div className="w-3 h-3 border-2 border-slate-400/30 border-t-slate-600 rounded-full animate-spin" /> : <Download size={14} />}
                                <span>SVG</span>
                            </button>
                            <button
                                onClick={() => {
                                    if (!isRecording) {
                                        const proceed = window.confirm(
                                            '🎬 Recording Tips\n\n' +
                                            'For best quality:\n' +
                                            '• Use Google Chrome (recommended)\n' +
                                            '• Close other browser tabs\n' +
                                            '• Don\'t minimize the window during recording\n' +
                                            '• HD (1080p) works on most devices\n\n' +
                                            'Start recording?'
                                        );
                                        if (proceed) onRecordVideo();
                                    } else {
                                        onRecordVideo();
                                    }
                                }}
                                disabled={!isAnimEnabled && !isRecording}
                                className={`py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${isRecording
                                    ? 'bg-rose-100 text-rose-500 animate-pulse'
                                    : !isAnimEnabled
                                        ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                    }`}
                                title={!isAnimEnabled ? "Enable Motion to Record" : "Record Seamless Loop"}
                            >
                                {isRecording ? (
                                    <><span className="hidden sm:inline">Recording...</span><span className="sm:hidden">REC</span></>
                                ) : (
                                    <><Video size={14} /> <span>MP4</span></>
                                )}
                            </button>
                        </div>

                        <button
                            onClick={onToggleEditMode}
                            className={`w-full py-2 border rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${isEditMode
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            <MousePointer2 size={14} className={isEditMode ? "fill-indigo-700" : ""} />
                            {isEditMode ? 'Exit Edit Mode' : 'Edit Shapes'}
                        </button>

                        {/* Quick Save Preset */}
                        {!isGuest && (
                            !showSaveForm ? (
                                <button
                                    onClick={() => setShowSaveForm(true)}
                                    disabled={presetCount >= presetLimit}
                                    className="w-full py-2 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={`Save current config as preset (${presetCount}/${presetLimit} used)`}
                                >
                                    <Bookmark size={14} />
                                    Save to Presets
                                    <span className="text-[10px] bg-amber-200/60 px-1.5 py-0.5 rounded-full">{presetCount}/{presetLimit}</span>
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={presetName}
                                        onChange={(e) => setPresetName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleQuickSavePreset()}
                                        placeholder="Preset name..."
                                        maxLength={50}
                                        className="flex-1 px-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleQuickSavePreset}
                                        disabled={isSaving || !presetName.trim()}
                                        className="px-3 py-2 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center gap-1"
                                    >
                                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => { setShowSaveForm(false); setPresetName(''); }}
                                        className="px-2 py-2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )
                        )}

                        <button
                            onClick={onOpenBatchModal}
                            className="w-full py-2 bg-gradient-to-r from-rose-500 to-indigo-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.02] transition-all"
                        >
                            <Sparkles size={14} className="fill-white/30" /> Batch Studio (ZIP)
                        </button>

                        {/* Reset Pattern Button */}
                        <button
                            onClick={onReset}
                            className="w-full py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                            title="Reset to a fresh pattern"
                        >
                            <RotateCcw size={14} /> Reset / New Pattern
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const Sidebar: React.FC<SidebarProps> = (props) => {
    return (
        <SidebarProvider value={{
            state: props.state,
            updateState: props.updateState,
            updateText: props.updateText,
            updateCustomImage: props.updateCustomImage,
            updateAnimation: props.updateAnimation,
            onGenerate: props.onGenerate,
            onExtractPalette: props.onExtractPalette,
            onSavePreset: props.onSavePreset,
            onLoadPreset: props.onLoadPreset,
            presets: props.presets,
            onImportPreset: props.onImportPreset,
            customFonts: props.customFonts,
            onUploadFont: props.onUploadFont
        }}>
            <SidebarLayout
                onDownloadPNG={props.onDownloadPNG}
                onDownloadJPG={props.onDownloadJPG}
                onDownloadSVG={props.onDownloadSVG}
                isGeneratingSVG={props.isGeneratingSVG}
                isExportingPNG={props.isExportingPNG}
                isExportingJPG={props.isExportingJPG}
                onRecordVideo={props.onRecordVideo}
                isRecording={props.isRecording}
                isEditMode={props.isEditMode}
                onToggleEditMode={props.onToggleEditMode}
                onOpenBatchModal={props.onOpenBatchModal}
                onReset={props.onReset}
            />
        </SidebarProvider>
    );
};

export default Sidebar;
