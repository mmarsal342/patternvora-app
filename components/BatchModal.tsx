
import React, { useState, useEffect, useRef } from 'react';
import { AppState, PatternStyle, CompositionType, EXPORT_SIZES, ExportSize } from '../types';
import { PALETTES } from '../utils/palettes';
import { renderToCanvas, getDimensions, createNoisePattern } from '../utils/drawingEngine';
import { X, Sparkles, Download, Check, RefreshCw, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import saveAs from 'file-saver';

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseState: AppState;
  loadedImages: Record<string, HTMLImageElement>;
}

type BatchStrategy = 'remix-seed' | 'shuffle-colors' | 'chaos';
type ExportFormat = 'png' | 'jpg' | 'svg';

const BatchModal: React.FC<BatchModalProps> = ({ isOpen, onClose, baseState, loadedImages }) => {
  const [count, setCount] = useState(10);
  const [strategy, setStrategy] = useState<BatchStrategy>('remix-seed');
  const [variations, setVariations] = useState<{ id: string; state: AppState; thumbnail: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('png');
  const [selectedSize, setSelectedSize] = useState<ExportSize>(4096);

  const workerRef = useRef<Worker | null>(null);

  // Find active layer from base state
  const activeLayer = baseState.layers.find(l => l.id === baseState.activeLayerId) || baseState.layers[0];
  const isVectorCompatible = activeLayer.config.style !== 'custom-image';

  // Force PNG/JPG if style is incompatible with vector export preference
  useEffect(() => {
      if (!isVectorCompatible && selectedFormat === 'svg') {
          setSelectedFormat('png');
      }
  }, [isVectorCompatible, selectedFormat]);

  // Cleanup worker on unmount
  useEffect(() => {
      return () => {
          workerRef.current?.terminate();
      };
  }, []);

  // Generate Variations Logic (Preview - Fast, Main Thread is fine for small thumbnails)
  const generateVariations = async () => {
    setIsGenerating(true);
    setVariations([]);
    setProgress(0);

    const newVariations: { id: string; state: AppState; thumbnail: string }[] = [];
    
    // Helper to get fresh active layer index from a state
    const getLayerIndex = (s: AppState) => s.layers.findIndex(l => l.id === s.activeLayerId);

    for (let i = 0; i < count; i++) {
        const newState: AppState = JSON.parse(JSON.stringify(baseState));
        const idx = getLayerIndex(newState);
        
        if (idx >= 0) {
            const config = newState.layers[idx].config;
            
            // Strategy Logic
            if (strategy === 'remix-seed') {
                config.seed = Math.random() * 999999;
            } else if (strategy === 'shuffle-colors') {
                config.seed = Math.random() * 999999;
                config.palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
            } else if (strategy === 'chaos') {
                config.seed = Math.random() * 999999;
                config.palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
                
                const styles: PatternStyle[] = ['geometric', 'organic', 'grid', 'bauhaus', 'confetti', 'radial', 'typo', 'mosaic', 'hex', 'waves', 'memphis', 'isometric'];
                if (config.customImage.assets.length > 0) {
                    styles.push('custom-image');
                }
                config.style = styles[Math.floor(Math.random() * styles.length)];
                
                const comps: CompositionType[] = ['random', 'center', 'frame', 'diagonal', 'thirds', 'bottom', 'cross', 'ring', 'x-shape', 'split-v', 'split-h', 'corners'];
                config.composition = comps[Math.floor(Math.random() * comps.length)];
                
                config.scale = 0.5 + Math.random() * 1.5;
            }
        }

        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300 * (getDimensions(newState.aspectRatio, 100).height / getDimensions(newState.aspectRatio, 100).width);
        const ctx = canvas.getContext('2d');
        if (ctx) {
             const noise = createNoisePattern(50);
             // renderToCanvas works on Main Thread too
             renderToCanvas(ctx, canvas.width, canvas.height, newState, loadedImages, 0, noise);
             newVariations.push({
                 id: `var-${i}-${Date.now()}`,
                 state: newState,
                 thumbnail: canvas.toDataURL('image/jpeg', 0.6)
             });
        }
        
        setProgress(((i + 1) / count) * 100);
        await new Promise(r => setTimeout(r, 5));
    }

    setVariations(newVariations);
    setIsGenerating(false);
  };

  const handleDownloadZip = async () => {
      if (variations.length === 0) return;
      setIsZipping(true);
      setProgress(0);
      
      try {
          // Initialize Worker
          if (!workerRef.current) {
              workerRef.current = new Worker(new URL('../utils/batchWorker.ts', import.meta.url), { type: 'module' });
          }

          // Convert HTMLImageElements to ImageBitmaps for Worker transfer
          const bitmapAssets: Record<string, ImageBitmap> = {};
          const assetPromises = Object.entries(loadedImages).map(async ([id, img]) => {
              // createImageBitmap is the key to sending images to workers
              // Explicit cast needed for some TypeScript configurations
              bitmapAssets[id] = await createImageBitmap(img as HTMLImageElement);
          });
          await Promise.all(assetPromises);

          // Prepare Job
          const configs = variations.map((v, i) => {
             const layer = v.state.layers.find(l => l.id === v.state.activeLayerId) || v.state.layers[0];
             return {
                id: v.id,
                state: v.state,
                fileName: `pattern-${i+1}-${layer.config.style}`
             }
          });

          // Send to Worker
          workerRef.current.postMessage({
              type: 'START_BATCH',
              configs,
              format: selectedFormat,
              size: selectedSize, // Send resolution to worker
              loadedImages: bitmapAssets
          }, Object.values(bitmapAssets)); // Transfer ownership of bitmaps

          // Listen
          workerRef.current.onmessage = (e) => {
              const { type, value, blob, message } = e.data;
              if (type === 'PROGRESS') {
                  setProgress(value);
              } else if (type === 'DONE') {
                  saveAs(blob, `patternvora-batch-${Date.now()}.zip`);
                  
                  // NOTE: We do NOT increment the export counter here anymore.
                  // Gamification rule: Only manual single exports count towards rank.
                  
                  setIsZipping(false);
              } else if (type === 'ERROR') {
                  console.error("Worker Error:", message);
                  alert("Batch generation failed.");
                  setIsZipping(false);
              }
          };

      } catch (e) {
          console.error("Batch init failed", e);
          alert("Failed to start background process.");
          setIsZipping(false);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Sparkles className="text-indigo-600" size={20}/> Batch Studio
                    </h2>
                    <p className="text-sm text-slate-500">Generate variations and export as ZIP via Background Worker.</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* Controls */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Quantity</label>
                     <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                         {[10, 20, 50].map(n => (
                             <button
                                key={n}
                                onClick={() => setCount(n)}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${count === n ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                             >
                                 {n}
                             </button>
                         ))}
                     </div>
                 </div>

                 <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Strategy</label>
                     <select 
                        value={strategy}
                        onChange={(e) => setStrategy(e.target.value as BatchStrategy)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                     >
                         <option value="remix-seed">Remix Positions (Same Style/Color)</option>
                         <option value="shuffle-colors">Shuffle Colors (Same Style)</option>
                         <option value="chaos">Total Chaos (Random Style/Color)</option>
                     </select>
                 </div>

                 <div className="flex items-end">
                     <button 
                        onClick={generateVariations}
                        disabled={isGenerating || isZipping}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                     >
                         {isGenerating ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16} />}
                         {isGenerating ? `Previewing ${Math.round(progress)}%` : 'Generate Previews'}
                     </button>
                 </div>
            </div>

            {/* Grid Preview */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
                {variations.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                         <Sparkles size={48} className="mb-4 text-slate-300"/>
                         <p className="text-sm font-medium">Select options and click Generate Previews</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {variations.map((item) => (
                            <div key={item.id} className="aspect-square bg-white rounded-lg p-1 shadow-sm border border-slate-200 animate-in zoom-in-50 duration-200">
                                <img src={item.thumbnail} className="w-full h-full object-contain rounded bg-slate-50" alt="variant" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer / Download */}
            <div className="p-6 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div className="flex items-center gap-4 w-full sm:w-auto">
                     <div className="flex-1 sm:flex-none">
                         <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Format</label>
                         <div className="flex items-center gap-2">
                            <select 
                                value={selectedFormat}
                                onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                                className="w-full sm:w-28 bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-700 outline-none"
                            >
                                <option value="png">PNG</option>
                                <option value="jpg">JPG</option>
                                <option value="svg" disabled={!isVectorCompatible}>
                                    SVG {!isVectorCompatible ? '(N/A)' : ''}
                                </option>
                            </select>
                            
                            {/* Resolution Select for Batch */}
                            {selectedFormat !== 'svg' && (
                                <select 
                                    value={selectedSize}
                                    onChange={(e) => setSelectedSize(parseInt(e.target.value) as ExportSize)}
                                    className="w-full sm:w-28 bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-700 outline-none"
                                >
                                    {EXPORT_SIZES.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            )}
                         </div>
                     </div>
                 </div>
                 
                 <div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg flex items-center gap-2 leading-tight">
                    <AlertCircle size={14} className="shrink-0"/>
                    {!isVectorCompatible ? "SVG export disabled for Image Assets." : "Video disabled in Batch Mode."}
                 </div>

                 <button 
                    onClick={handleDownloadZip}
                    disabled={variations.length === 0 || isGenerating || isZipping}
                    className="w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                 >
                     {isZipping ? <Loader2 size={18} className="animate-spin"/> : <Download size={18} />}
                     {isZipping ? `Processing Background ${Math.round(progress)}%` : 'Download ZIP'}
                 </button>
            </div>

        </div>
    </div>
  );
};

export default BatchModal;
