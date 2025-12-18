
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import CanvasArea from './components/CanvasArea';
import FilmStrip from './components/FilmStrip';
import LandingPage from './components/LandingPage';
import BatchModal from './components/BatchModal';
import PricingPage from './components/PricingPage';
import AdminPage from './components/AdminPage';
import LegalPage from './components/LegalPage';
import VideoExportProgress from './components/VideoExportProgress';
import { useHistory } from './hooks/useHistory';
import { useExport, FREE_EXPORT_LIMIT } from './hooks/useExport';
import { usePresets } from './hooks/usePresets';
import { useAssets } from './hooks/useAssets';
import { AppState, TextConfig, CustomImageConfig, AnimationConfig, Preset, FontDef, DEFAULT_FONTS, ShapeOverride, CustomAsset } from './types';
import { renderToCanvas, generateSVG, getDimensions, createNoisePattern } from './utils/drawingEngine';
import { extractPaletteFromImage } from './utils/colorExtractor';
import { INITIAL_V2_STATE, migrateToV2 } from './utils/migration';
import { ArrowLeft, Loader2, Undo2, Redo2, History, LogOut } from 'lucide-react';
import { STORAGE_KEY, getCurrentRank, getNextRank, getProgress } from './utils/gamification';
import { savePresetsToStorage, loadPresetsFromStorage } from './utils/storage';
import { UserProvider, useUser } from './components/UserContext';

// WRAPPER COMPONENT TO PROVIDE USER CONTEXT
const AppWrapper: React.FC = () => {
    return (
        <UserProvider>
            <App />
        </UserProvider>
    );
};

const App: React.FC = () => {
    const { user, isPro, syncExportCount, login, logout, isLoading, isGuest } = useUser();

    // Determine initial view based on URL path
    const getInitialView = (): 'landing' | 'editor' | 'pricing' | 'admin' | 'legal' => {
        const path = window.location.pathname;
        if (path === '/admin') return 'admin';
        if (path === '/pricing') return 'pricing';
        if (path === '/legal' || path === '/terms' || path === '/privacy') return 'legal';
        if (path === '/editor' || path === '/studio') return 'editor';
        return 'landing';
    };

    const [view, setView] = useState<'landing' | 'editor' | 'pricing' | 'admin' | 'legal'>(getInitialView);

    // Debug admin detection
    useEffect(() => {
        console.log('[Admin Debug] User:', user?.email, 'isLoading:', isLoading);
    }, [user, isLoading]);

    // Handle Payment Return Logic
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('payment_success') === 'true') {
            // In a real app, you might want to verify with backend here
            alert("Payment Successful! Welcome to Pro.");

            // Clear URL params
            window.history.replaceState({}, document.title, window.location.pathname);

            // Force reload user profile to get new Tier status
            // (In this mock implementation, we manually simulate it, but in real UserProvider it would re-fetch)
            if (user) {
                // Just a visual hack for now since we are in Mock mode in this output
                localStorage.setItem('pv_mock_user', JSON.stringify({ ...user, tier: 'pro' }));
                window.location.reload();
            }
            setView('editor');
        }
    }, [user]);


    const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement>>({});

    // Initialize history with Initial V2 State
    const [initialHistoryState] = useState<AppState>(INITIAL_V2_STATE);

    const {
        state,
        history,
        currentIndex,
        pushState,
        undo,
        redo,
        jumpTo,
        updateStateDirectly,
        initHistory,
        canUndo,
        canRedo
    } = useHistory(initialHistoryState);

    // Export states provided by useExport hook below
    const [isRecording, setIsRecording] = useState(false);

    // Video export progress state
    const [exportProgress, setExportProgress] = useState({
        isExporting: false,
        mode: 'fast' as 'fast' | 'quality',
        phase: 'rendering' as 'rendering' | 'encoding',
        percent: 0,
        message: ''
    });

    // Edit Mode Toggle (Mouse/Pointer)
    const [isEditMode, setIsEditMode] = useState(false);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    // Using usePresets hook for preset management
    // presets, handleSavePreset, handleLoadPreset, handleImportPreset provided by hook below

    const [customFonts, setCustomFonts] = useState<FontDef[]>([]);

    // Gamification State (Syncs with User Context now)
    const exportCount = user ? user.exportCount : parseInt(localStorage.getItem(STORAGE_KEY) || '0');

    const debounceTimerRef = useRef<any>(null);

    useEffect(() => {
        initHistory(initialHistoryState, loadedImages);
    }, [initHistory, initialHistoryState]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                undo();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                redo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    // Presets hook - replaces inline load/save useEffects and handlers
    const {
        presets,
        handleSavePreset,
        handleLoadPreset,
        handleImportPreset
    } = usePresets({
        state,
        loadedImages,
        pushState,
        updateStateDirectly
    });

    // Export hook - replaces inline export handlers and tier checking
    const {
        isExportingPNG,
        isExportingJPG,
        isGeneratingSVG,
        handleDownloadPNG,
        handleDownloadJPG,
        handleDownloadSVG,
        checkTierAccess
    } = useExport({
        state,
        loadedImages,
        customFonts,
        user,
        isPro,
        isGuest,
        onLogin: login,
        onShowPricing: () => setView('pricing'),
        onExportComplete: syncExportCount
    });

    const handleStateUpdate = useCallback((updates: Partial<AppState>, immediateHistory: boolean = false) => {
        updateStateDirectly(updates);

        if (immediateHistory) {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            pushState({ ...state, ...updates }, loadedImages);
        } else {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = setTimeout(() => {
                pushState({ ...state, ...updates }, loadedImages);
            }, 500);
        }
    }, [state, updateStateDirectly, pushState, loadedImages]);

    const updateState = useCallback((updates: Partial<AppState>, immediate?: boolean) => {
        handleStateUpdate(updates, immediate ?? false);
    }, [handleStateUpdate]);

    const updateText = useCallback((updates: Partial<TextConfig>) => {
        // Find active layer
        const activeIndex = state.layers.findIndex(l => l.id === state.activeLayerId);
        if (activeIndex === -1) return;

        const layer = state.layers[activeIndex];
        const mergedText = { ...layer.config.text, ...updates };

        const newLayers = [...state.layers];
        newLayers[activeIndex] = {
            ...layer,
            config: {
                ...layer.config,
                text: mergedText
            }
        };

        const isSlider = 'x' in updates || 'y' in updates || 'fontSize' in updates || 'opacity' in updates || 'content' in updates;
        handleStateUpdate({ layers: newLayers }, !isSlider);
    }, [state.layers, state.activeLayerId, handleStateUpdate]);

    const updateCustomImage = useCallback((updates: Partial<CustomImageConfig>) => {
        // Handled by SidebarContext
    }, [state]);

    const updateAnimation = useCallback((updates: Partial<AnimationConfig>) => {
        // Handled by SidebarContext
    }, [state]);

    const updateShapeOverride = useCallback((index: number, override: Partial<ShapeOverride>, layerId?: string) => {
        const targetLayerId = layerId || state.activeLayerId;
        const layerIndex = state.layers.findIndex(l => l.id === targetLayerId);
        if (layerIndex === -1) return;

        const layer = state.layers[layerIndex];
        const currentOverride = layer.config.overrides[index] || {};
        const newOverride = { ...currentOverride, ...override };
        const newOverrides = { ...layer.config.overrides, [index]: newOverride };

        const newLayer = { ...layer, config: { ...layer.config, overrides: newOverrides } };
        const newLayers = [...state.layers];
        newLayers[layerIndex] = newLayer;

        handleStateUpdate({ layers: newLayers }, true); // Force immediate history push on drop/finish
    }, [state.layers, state.activeLayerId, handleStateUpdate]);

    // Preset handlers (handleSavePreset, handleLoadPreset, handleImportPreset) 
    // are now provided by usePresets hook above

    const handleFontUpload = useCallback(async (file: File) => {
        // Custom font upload is Pro only
        if (!isPro) {
            alert('Custom Font Upload is a Pro Feature. Upgrade to unlock!');
            setView('pricing');
            return;
        }

        try {
            const fontName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '');
            const url = URL.createObjectURL(file);
            const fontFace = new FontFace(fontName, `url(${url})`);
            const loadedFace = await fontFace.load();
            document.fonts.add(loadedFace);

            const newFont: FontDef = {
                name: fontName,
                value: fontName,
                url: url,
                type: 'custom'
            };

            setCustomFonts(prev => [...prev, newFont]);
            updateText({ fontFamily: fontName });

        } catch (err) {
            console.error("Font upload failed", err);
            alert("Failed to load custom font.");
        }
    }, [updateText, isPro]);

    // Handle Image Loading (Multi-Asset)
    useEffect(() => {
        const loadImages = async () => {
            const allAssets: CustomAsset[] = [];
            state.layers.forEach(layer => {
                allAssets.push(...layer.config.customImage.assets);
            });

            if (allAssets.length === 0) {
                return;
            }

            const newImages: Record<string, HTMLImageElement> = { ...loadedImages };
            let hasChanges = false;

            const promises = allAssets.map(asset => new Promise<void>((resolve) => {
                if (newImages[asset.id]) {
                    resolve();
                    return;
                }
                hasChanges = true;
                const img = new Image();
                img.src = asset.src;
                img.onload = () => {
                    newImages[asset.id] = img;
                    resolve();
                };
                img.onerror = () => resolve();
            }));

            await Promise.all(promises);
            if (hasChanges) {
                setLoadedImages(newImages);
            }
        };

        loadImages();
    }, [state.layers]);

    const handleGenerate = useCallback(() => {
        // Handled in SidebarContext
    }, []);

    const handleExtractPalette = useCallback(async (file: File) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            if (e.target?.result) {
                try {
                    const { colors, bg } = await extractPaletteFromImage(e.target.result as string);

                    // Update Active Layer's palette
                    const activeLayerIndex = state.layers.findIndex(l => l.id === state.activeLayerId);
                    if (activeLayerIndex === -1) return;

                    const newLayers = [...state.layers];
                    newLayers[activeLayerIndex] = {
                        ...newLayers[activeLayerIndex],
                        config: {
                            ...newLayers[activeLayerIndex].config,
                            palette: {
                                name: 'Custom Extracted',
                                colors: colors,
                                bg: bg
                            }
                        }
                    };

                    handleStateUpdate({ layers: newLayers }, true);
                } catch (err) {
                    console.error("Extraction failed", err);
                }
            }
        };
        reader.readAsDataURL(file);
    }, [state.layers, state.activeLayerId, handleStateUpdate]);

    // Export handlers (handleDownloadPNG, handleDownloadJPG, handleDownloadSVG, checkTierAccess)
    // are now provided by useExport hook above

    // Reset to fresh pattern state
    const handleReset = useCallback(() => {
        if (window.confirm('Are you sure you want to reset? All unsaved changes will be lost.')) {
            initHistory(INITIAL_V2_STATE, {});
            setLoadedImages({});
            setIsEditMode(false);
        }
    }, [initHistory]);

    // Gamification Data Helpers
    const currentRank = getCurrentRank(exportCount);
    const nextRank = getNextRank(exportCount);
    const RankIcon = currentRank.icon;
    const progressPercent = getProgress(exportCount);

    if (view === 'landing') {
        return <LandingPage
            onStart={() => {
                setView('editor');
            }}
            onPricing={() => setView('pricing')}
            onAdmin={() => setView('admin')}
            onLegal={() => setView('legal')}
        />;
    }

    if (view === 'pricing') {
        return <PricingPage onBack={() => setView('landing')} onStartFree={() => setView('editor')} />;
    }

    if (view === 'admin') {
        return <AdminPage onBack={() => setView('landing')} />;
    }

    if (view === 'legal') {
        return <LegalPage onBack={() => setView('landing')} />;
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden text-slate-700 bg-slate-50 font-sans">
            <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">P</div>
                    <div>
                        <h1 className="font-bold text-slate-900 leading-none">PatternVora</h1>
                        <p className="hidden sm:block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">by VoraLab</p>
                    </div>

                    {isPro && (
                        <span
                            className="ml-2 px-2 py-0.5 bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 text-[10px] font-bold uppercase rounded-full shadow-sm cursor-default"
                            title={user?.proExpiresAt ? `Subscription until ${new Date(user.proExpiresAt).toLocaleDateString()}` : 'Lifetime Access'}
                        >
                            {user?.tier === 'lifetime' || user?.tier === 'ltd' ? 'LIFETIME' : (
                                user?.proExpiresAt ? (
                                    <>PRO · {new Date(user.proExpiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</>
                                ) : 'PRO'
                            )}
                        </span>
                    )}

                    {/* LOGIN/LOGOUT BUTTON */}
                    <div className="ml-4 hidden sm:block">
                        {isLoading ? (
                            <div className="px-3 py-1.5 text-xs text-slate-400">
                                <Loader2 size={14} className="animate-spin" />
                            </div>
                        ) : user ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="" className="w-5 h-5 rounded-full" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                                        {user.name?.charAt(0) || user.email?.charAt(0)}
                                    </div>
                                )}
                                <span className="text-xs text-slate-600 max-w-[100px] truncate">{user.name || user.email}</span>
                                <button
                                    onClick={logout}
                                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut size={12} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={login}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium rounded-full transition-all shadow-sm hover:shadow"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span>Sign in</span>
                            </button>
                        )}
                    </div>

                    {/* EXPORT CREDITS COUNTER (Free users only) */}
                    {user && !isGuest && (
                        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full ml-2">
                            <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {isPro ? (
                                <span className="text-[10px] font-bold text-amber-700">∞ Exports</span>
                            ) : (
                                <span className="text-[10px] font-bold text-amber-700">
                                    {Math.max(0, FREE_EXPORT_LIMIT - (user.exportCount || 0))}/{FREE_EXPORT_LIMIT} left
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* CENTER CONTROLS - UNDO/REDO/HISTORY */}
                <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg border border-slate-200/50 backdrop-blur-sm shadow-inner">
                    <button
                        onClick={undo}
                        disabled={!canUndo}
                        className="p-1.5 rounded-md hover:bg-white text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo2 size={16} />
                    </button>
                    <button
                        onClick={redo}
                        disabled={!canRedo}
                        className="p-1.5 rounded-md hover:bg-white text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo2 size={16} />
                    </button>
                    <div className="w-px h-4 bg-slate-300 mx-1"></div>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-semibold transition-all ${showHistory
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-slate-600 hover:bg-white hover:text-indigo-600'
                            }`}
                        title="Toggle History Panel"
                    >
                        <History size={14} />
                        <span>History</span>
                    </button>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">

                    <div className="hidden sm:block h-6 w-px bg-slate-200"></div>

                    <button
                        onClick={() => setView('landing')}
                        className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
                    >
                        <ArrowLeft size={16} /> <span className="hidden sm:inline">Back to Home</span>
                    </button>

                    {/* RANK WIDGET IN HEADER - Hidden temporarily */}
                    {/*
                    <div className={`hidden sm:flex flex-col items-center justify-center relative group`}>
                        <div
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${currentRank.bgColor} ${currentRank.color} ${currentRank.border}`}
                            title={`${exportCount} Total Assets. ${nextRank ? nextRank.min - exportCount : 0} to next rank.`}
                        >
                            <RankIcon size={14} className="shrink-0" />
                            <span className="uppercase tracking-wide">{currentRank.name}</span>
                            <div className="w-px h-3 bg-current opacity-20"></div>
                            <span>{exportCount}</span>
                        </div>

                        {nextRank && (
                            <div className="absolute -bottom-1.5 left-2 right-2 h-0.5 bg-slate-100 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className={`h-full ${currentRank.color.replace('text-', 'bg-')}`} style={{ width: `${progressPercent}%` }}></div>
                            </div>
                        )}
                    </div>
                    */}
                </div>
            </header>

            <div className="flex flex-col md:flex-row w-full h-full pt-16">
                <main className="relative flex flex-col h-[45vh] md:h-auto md:flex-1 shrink-0 order-1 md:order-1 bg-slate-100">
                    <CanvasArea
                        state={state}
                        loadedImages={loadedImages}
                        setRecordingState={setIsRecording}
                        isRecording={isRecording}
                        updateText={updateText}
                        updateShapeOverride={updateShapeOverride}
                        isEditMode={isEditMode}
                        onExportProgress={(percent, message, phase) => {
                            setExportProgress(prev => ({
                                ...prev,
                                percent,
                                message,
                                phase: phase || prev.phase
                            }));
                        }}
                        onExportStart={(mode) => {
                            setExportProgress({
                                isExporting: true,
                                mode,
                                phase: 'rendering',
                                percent: 0,
                                message: 'Initializing...'
                            });
                        }}
                        onExportComplete={() => {
                            setExportProgress(prev => ({ ...prev, isExporting: false }));
                        }}
                    />

                    <FilmStrip
                        history={history}
                        currentIndex={currentIndex}
                        onJump={jumpTo}
                        isVisible={showHistory}
                    />
                </main>

                <div className="flex-1 md:h-full md:flex-none overflow-hidden order-2 md:order-2">
                    <Sidebar
                        state={state}
                        updateState={updateState}
                        updateText={updateText}
                        updateCustomImage={updateCustomImage}
                        updateAnimation={updateAnimation}
                        onGenerate={handleGenerate}
                        onDownloadPNG={handleDownloadPNG}
                        onDownloadJPG={handleDownloadJPG}
                        onDownloadSVG={handleDownloadSVG}
                        isGeneratingSVG={isGeneratingSVG}
                        isExportingPNG={isExportingPNG}
                        isExportingJPG={isExportingJPG}
                        onExtractPalette={handleExtractPalette}
                        onRecordVideo={() => {
                            if (!checkTierAccess('video')) return;
                            setIsRecording(true);
                        }}
                        isRecording={isRecording}
                        onSavePreset={handleSavePreset}
                        onLoadPreset={handleLoadPreset}
                        presets={presets}
                        onImportPreset={handleImportPreset}
                        customFonts={customFonts}
                        onUploadFont={handleFontUpload}
                        isEditMode={isEditMode}
                        onToggleEditMode={() => setIsEditMode(!isEditMode)}
                        onOpenBatchModal={() => {
                            if (!checkTierAccess('batch')) return;
                            setIsBatchModalOpen(true);
                        }}
                        onReset={handleReset}
                    />
                </div>
            </div>

            {(isExportingPNG || isExportingJPG || isGeneratingSVG) && (
                <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center flex-col text-white animate-in fade-in duration-200">
                    <Loader2 size={48} className="animate-spin mb-4" />
                    <h2 className="text-xl font-bold">
                        {isExportingPNG && "Rendering PNG..."}
                        {isExportingJPG && "Rendering JPG..."}
                        {isGeneratingSVG && "Generating Vector SVG..."}
                    </h2>
                    <p className="text-white/80 text-sm mt-2">Please wait while we process your artwork.</p>
                </div>
            )}

            <BatchModal
                isOpen={isBatchModalOpen}
                onClose={() => setIsBatchModalOpen(false)}
                baseState={state}
                loadedImages={loadedImages}
            />

            <VideoExportProgress
                isOpen={exportProgress.isExporting}
                mode={exportProgress.mode}
                phase={exportProgress.phase}
                percent={exportProgress.percent}
                message={exportProgress.message}
                onCancel={() => {
                    setExportProgress(prev => ({ ...prev, isExporting: false }));
                    setIsRecording(false);
                }}
            />
        </div>
    );
};

export default AppWrapper;
