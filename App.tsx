
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import CanvasArea from './components/CanvasArea';
import FilmStrip from './components/FilmStrip'; 
import LandingPage from './components/LandingPage';
import BatchModal from './components/BatchModal';
import PricingPage from './components/PricingPage';
import { useHistory } from './hooks/useHistory'; 
import { AppState, TextConfig, CustomImageConfig, AnimationConfig, Preset, FontDef, DEFAULT_FONTS, ShapeOverride, CustomAsset } from './types';
import { renderToCanvas, generateSVG, getDimensions, createNoisePattern } from './utils/drawingEngine';
import { extractPaletteFromImage } from './utils/colorExtractor';
import { INITIAL_V2_STATE, migrateToV2 } from './utils/migration';
import { ArrowLeft, Loader2, Undo2, Redo2, History } from 'lucide-react';
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
  const { user, isPro, syncExportCount } = useUser();

  // Determine initial view (Default to Landing)
  const [view, setView] = useState<'landing' | 'editor' | 'pricing'>('landing');

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

  const [isGeneratingSVG, setIsGeneratingSVG] = useState(false);
  const [isExportingPNG, setIsExportingPNG] = useState(false);
  const [isExportingJPG, setIsExportingJPG] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Edit Mode Toggle (Mouse/Pointer)
  const [isEditMode, setIsEditMode] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [presets, setPresets] = useState<Preset[]>([]);
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

  // LOAD PRESETS (Async via IndexedDB)
  useEffect(() => {
      const load = async () => {
          const loaded = await loadPresetsFromStorage();
          setPresets(loaded);
      };
      load();
  }, []);

  // SAVE PRESETS (Async via IndexedDB)
  useEffect(() => {
      if (presets.length > 0) {
          savePresetsToStorage(presets);
      }
  }, [presets]);

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

  const handleSavePreset = useCallback((name: string) => {
      const newPreset: Preset = {
          id: Date.now().toString(),
          name,
          createdAt: Date.now(),
          state: state
      };
      setPresets(prev => [newPreset, ...prev]);
  }, [state]);

  const handleLoadPreset = useCallback((preset: Preset) => {
      pushState(preset.state, loadedImages);
      updateStateDirectly(preset.state);
  }, [pushState, updateStateDirectly, loadedImages]);

  const handleImportPreset = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
          try {
              if (ev.target?.result) {
                  const imported = JSON.parse(ev.target.result as string) as Preset;
                  if (imported.state) {
                      const migratedState = migrateToV2(imported.state);
                      const finalPreset = { ...imported, state: migratedState };
                      
                      setPresets(prev => [finalPreset, ...prev]);
                      pushState(migratedState, loadedImages);
                      updateStateDirectly(migratedState);
                  }
              }
          } catch (err) {
              alert("Invalid Preset JSON");
          }
      };
      reader.readAsText(file);
  }, [pushState, updateStateDirectly, loadedImages]);

  const handleFontUpload = useCallback(async (file: File) => {
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
  }, [updateText]);

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

  // Modified Export Handlers to Check Tier
  const checkTierAccess = (feature: '4k' | 'svg') => {
      if (feature === '4k' && !isPro) {
          alert("4K Export is a Pro Feature. Please upgrade!");
          setView('pricing');
          return false;
      }
      if (feature === 'svg' && !isPro) {
          alert("SVG Export is a Pro Feature. Please upgrade!");
          setView('pricing');
          return false;
      }
      return true;
  };

  const incrementExportCount = () => {
     syncExportCount();
  };

  const handleDownloadPNG = useCallback((size: number) => {
    if (size > 2000 && !checkTierAccess('4k')) return;
    
    setIsExportingPNG(true);
    setTimeout(() => {
        try {
            const canvas = document.createElement('canvas');
            const dims = getDimensions(state.aspectRatio, size); 
            canvas.width = dims.width;
            canvas.height = dims.height;
            const ctx = canvas.getContext('2d');
            
            const noisePattern = createNoisePattern(50); 

            if (ctx) {
              renderToCanvas(ctx, dims.width, dims.height, state, loadedImages, 0, noisePattern, true);
              
              // Watermark for Free Users
              if (!isPro) {
                  ctx.save();
                  ctx.font = `bold ${size * 0.03}px sans-serif`;
                  ctx.fillStyle = 'rgba(0,0,0,0.3)';
                  ctx.textAlign = 'right';
                  ctx.textBaseline = 'bottom';
                  ctx.fillText('Made with PatternVora (Free)', dims.width - 20, dims.height - 20);
                  ctx.restore();
              }

              const link = document.createElement('a');
              link.download = `patternvora-${Date.now()}.png`;
              link.href = canvas.toDataURL('image/png');
              link.click();
              incrementExportCount();
            }
        } catch (e) {
            console.error("Export failed", e);
            alert("Failed to export image.");
        } finally {
            setIsExportingPNG(false);
        }
    }, 100);
  }, [state, loadedImages, isPro]);

  const handleDownloadJPG = useCallback((size: number) => {
    if (size > 2000 && !checkTierAccess('4k')) return;

    setIsExportingJPG(true);
    setTimeout(() => {
        try {
            const canvas = document.createElement('canvas');
            const dims = getDimensions(state.aspectRatio, size); 
            canvas.width = dims.width;
            canvas.height = dims.height;
            const ctx = canvas.getContext('2d');
            const noisePattern = createNoisePattern(50);

            if (ctx) {
              renderToCanvas(ctx, dims.width, dims.height, state, loadedImages, 0, noisePattern);
              
              // Watermark for Free Users
              if (!isPro) {
                  ctx.save();
                  ctx.font = `bold ${size * 0.03}px sans-serif`;
                  ctx.fillStyle = 'rgba(0,0,0,0.3)';
                  ctx.textAlign = 'right';
                  ctx.textBaseline = 'bottom';
                  ctx.fillText('Made with PatternVora (Free)', dims.width - 20, dims.height - 20);
                  ctx.restore();
              }

              const link = document.createElement('a');
              link.download = `patternvora-${Date.now()}.jpg`;
              link.href = canvas.toDataURL('image/jpeg', 0.95); 
              link.click();
              incrementExportCount();
            }
        } catch (e) {
            console.error("Export failed", e);
            alert("Failed to export JPG.");
        } finally {
            setIsExportingJPG(false);
        }
    }, 100);
  }, [state, loadedImages, isPro]);

  const handleDownloadSVG = useCallback(async () => {
    if (!checkTierAccess('svg')) return;

    setIsGeneratingSVG(true);
    try {
        const dims = getDimensions(state.aspectRatio, 1000); 
        const allFonts = [...DEFAULT_FONTS, ...customFonts];
        const svgString = await generateSVG(dims.width, dims.height, state, allFonts);
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `patternvora-${Date.now()}.svg`;
        link.click();
        incrementExportCount();
    } catch (error) {
        console.error("Failed to generate SVG", error);
    } finally {
        setIsGeneratingSVG(false);
    }
  }, [state, customFonts, isPro]);

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
      />;
  }

  if (view === 'pricing') {
      return <PricingPage onBack={() => setView('landing')} onStartFree={() => setView('editor')} />;
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
                   <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 text-[10px] font-bold uppercase rounded-full shadow-sm">PRO</span>
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
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    showHistory 
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
               
               {/* RANK WIDGET IN HEADER */}
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
                   
                   {/* Mini Progress Bar inside Header */}
                   {nextRank && (
                       <div className="absolute -bottom-1.5 left-2 right-2 h-0.5 bg-slate-100 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className={`h-full ${currentRank.color.replace('text-', 'bg-')}`} style={{ width: `${progressPercent}%` }}></div>
                       </div>
                   )}
               </div>
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
                onRecordVideo={() => setIsRecording(true)}
                isRecording={isRecording}
                onSavePreset={handleSavePreset}
                onLoadPreset={handleLoadPreset}
                presets={presets}
                onImportPreset={handleImportPreset}
                customFonts={customFonts}
                onUploadFont={handleFontUpload}
                isEditMode={isEditMode}
                onToggleEditMode={() => setIsEditMode(!isEditMode)}
                onOpenBatchModal={() => setIsBatchModalOpen(true)}
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
    </div>
  );
};

export default AppWrapper;
