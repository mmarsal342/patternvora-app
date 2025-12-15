
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { AppState, TextConfig, ShapeOverride } from '../types';
import { renderToCanvas, getDimensions, createNoisePattern, getShapeAtPosition, ShapeData } from '../utils/drawingEngine';
import { Move, Scaling, RotateCw, Trash2, Maximize, X, Grid3x3, Square, Download } from 'lucide-react';

interface CanvasAreaProps {
    state: AppState;
    loadedImages: Record<string, HTMLImageElement>;
    setRecordingState: (isRecording: boolean) => void;
    isRecording: boolean;
    updateText?: (updates: Partial<TextConfig>) => void;
    updateShapeOverride?: (index: number, override: Partial<ShapeOverride>, layerId?: string) => void;
    isEditMode?: boolean;
}

type SelectedShape = ShapeData & { layerId: string };
type ViewMode = 'single' | 'tile';

const CanvasArea: React.FC<CanvasAreaProps> = ({ state, loadedImages, setRecordingState, isRecording, updateText, updateShapeOverride, isEditMode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasWrapperRef = useRef<HTMLDivElement>(null);
    const [displayDims, setDisplayDims] = useState({ width: 0, height: 0 });

    // View Modes
    const [viewMode, setViewMode] = useState<ViewMode>('single');
    const [canvasDataUrl, setCanvasDataUrl] = useState<string>('');
    const [isExportingTile, setIsExportingTile] = useState(false);

    // Full Preview State
    const [showFullPreview, setShowFullPreview] = useState(false);
    const fullScreenContainerRef = useRef<HTMLDivElement>(null);
    const fullScreenCanvasRef = useRef<HTMLCanvasElement>(null);
    const [fullScreenDims, setFullScreenDims] = useState({ width: 0, height: 0 });

    // Reusable Temp Canvas for memory optimization during animation/recording
    const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

    // Interaction State
    const [textBounds, setTextBounds] = useState({ width: 0, height: 0 });

    // Shape Editing State
    const [selectedShape, setSelectedShape] = useState<SelectedShape | null>(null);

    // DRAG PERFORMANCE OPTIMIZATION
    const transientOverridesRef = useRef<Record<number, Partial<ShapeOverride>>>({});
    const isShapeDraggingRef = useRef(false);
    const isShapeResizingRef = useRef(false);
    const isShapeRotatingRef = useRef(false);

    const isDraggingRef = useRef(false);
    const isResizingRef = useRef(false);
    const dragStartRef = useRef({
        x: 0, y: 0,
        initialValX: 0, initialValY: 0, initialSize: 0, initialRot: 0,
        initialShapeSize: 1
    });

    // Guides State
    const [activeGuides, setActiveGuides] = useState<{ x: boolean; y: boolean }>({ x: false, y: false });

    const startTimeRef = useRef<number>(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // State Guards
    const stoppingRef = useRef(false);
    const recorderReadyRef = useRef(false);
    const isInitializingRef = useRef(false);

    // Cache noise pattern
    const noisePattern = useMemo(() => {
        return createNoisePattern(50);
    }, []);

    // Get active layer text config
    const activeLayer = state.layers.find(l => l.id === state.activeLayerId) || state.layers[0];
    const activeText = activeLayer.config.text;

    // Initialize Temp Canvas
    useEffect(() => {
        if (!tempCanvasRef.current) {
            tempCanvasRef.current = document.createElement('canvas');
        }
    }, []);

    // Handle Resize for Main Canvas
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;

                if (width === 0 || height === 0) return;

                const dims = getDimensions(state.aspectRatio, 100);
                const ratio = dims.width / dims.height;

                let w = width;
                let h = w / ratio;

                // Adjust dimensions based on View Mode to fit nicely
                const padding = viewMode === 'single' ? 0 : 40;
                const availW = width - padding;
                const availH = height - padding;

                if (h > availH) {
                    h = availH;
                    w = h * ratio;
                }

                if (w > availW) {
                    w = availW;
                    h = w / ratio;
                }

                setDisplayDims({ width: w, height: h });
            }
        });

        observer.observe(container);
        return () => observer.disconnect();
    }, [state.aspectRatio, viewMode]);

    // Handle Resize for Full Screen Preview
    useEffect(() => {
        if (!showFullPreview) return;
        const container = fullScreenContainerRef.current;
        if (!container) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width === 0 || height === 0) return;

                const dims = getDimensions(state.aspectRatio, 100);
                const ratio = dims.width / dims.height;

                let w = width;
                let h = w / ratio;

                if (h > height) {
                    h = height;
                    w = h * ratio;
                }
                w = w * 0.95;
                h = h * 0.95;

                setFullScreenDims({ width: w, height: h });
            }
        });
        observer.observe(container);
        return () => observer.disconnect();
    }, [showFullPreview, state.aspectRatio]);

    // Measure Text for Gizmo
    useEffect(() => {
        if (!activeText.enabled || !activeText.content || displayDims.width === 0) {
            setTextBounds({ width: 0, height: 0 });
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const fontSizePx = activeText.fontSize * (displayDims.width / 1000);
            ctx.font = `bold ${fontSizePx}px ${activeText.fontFamily}`;

            const lines = activeText.content.split('\n');
            let maxWidth = 0;
            lines.forEach(line => {
                const m = ctx.measureText(line);
                if (m.width > maxWidth) maxWidth = m.width;
            });

            const totalHeight = lines.length * (fontSizePx * 1.2);
            setTextBounds({ width: maxWidth, height: totalHeight });
        }
    }, [activeText, displayDims.width]);

    // Clear selection if edit mode is toggled off
    useEffect(() => {
        if (!isEditMode) {
            setSelectedShape(null);
        }
        if (viewMode !== 'single') {
            // Edit mode only works in single view
            setSelectedShape(null);
        }
    }, [isEditMode, viewMode]);

    // Handle Delete Key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isEditMode || !selectedShape || !updateShapeOverride) return;

            if (e.key === 'Delete' || e.key === 'Backspace') {
                updateShapeOverride(selectedShape.index, { hidden: true }, selectedShape.layerId);
                setSelectedShape(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isEditMode, selectedShape, updateShapeOverride]);


    // Text Gizmo Handlers
    const handlePointerDownText = (e: React.PointerEvent, mode: 'move' | 'resize') => {
        e.preventDefault();
        e.stopPropagation();

        if (mode === 'move') isDraggingRef.current = true;
        if (mode === 'resize') isResizingRef.current = true;

        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            initialValX: activeText.x,
            initialValY: activeText.y,
            initialSize: activeText.fontSize,
            initialRot: 0,
            initialShapeSize: 0
        };

        window.addEventListener('pointermove', handleGlobalPointerMoveText);
        window.addEventListener('pointerup', handleGlobalPointerUpText);
    };

    const handleGlobalPointerMoveText = (e: PointerEvent) => {
        if (!updateText) return;

        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;

        if (isDraggingRef.current) {
            const pctX = (dx / displayDims.width) * 100;
            const pctY = (dy / displayDims.height) * 100;

            let nextX = dragStartRef.current.initialValX + pctX;
            let nextY = dragStartRef.current.initialValY + pctY;

            const SNAP_THRESHOLD = 1.5;
            let snapX = false;
            let snapY = false;

            if (Math.abs(nextX - 50) < SNAP_THRESHOLD) { nextX = 50; snapX = true; }
            if (Math.abs(nextY - 50) < SNAP_THRESHOLD) { nextY = 50; snapY = true; }

            setActiveGuides(prev => {
                if (prev.x !== snapX || prev.y !== snapY) return { x: snapX, y: snapY };
                return prev;
            });

            updateText({ x: nextX, y: nextY });
        }

        if (isResizingRef.current) {
            const scaleFactor = 0.5;
            const delta = (dx + dy) * scaleFactor;
            const newSize = Math.max(10, dragStartRef.current.initialSize + delta);
            updateText({ fontSize: newSize });
        }
    };

    const handleGlobalPointerUpText = () => {
        isDraggingRef.current = false;
        isResizingRef.current = false;
        setActiveGuides({ x: false, y: false });
        window.removeEventListener('pointermove', handleGlobalPointerMoveText);
        window.removeEventListener('pointerup', handleGlobalPointerUpText);
    };

    // Shape Gizmo Handlers
    const handleCanvasClick = (e: React.MouseEvent) => {
        if (viewMode !== 'single') return; // Only allow editing in single mode

        if (isEditMode) {
            const rect = canvasWrapperRef.current?.getBoundingClientRect();
            if (!rect) return;
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            const hit = getShapeAtPosition(clickX, clickY, displayDims.width, displayDims.height, state);
            setSelectedShape(hit);
            return;
        }

        if (!isRecording) {
            setShowFullPreview(true);
        }
    };

    const handlePointerDownShape = (e: React.PointerEvent, mode: 'move' | 'resize' | 'rotate') => {
        e.preventDefault();
        e.stopPropagation();

        if (!selectedShape) return;

        if (mode === 'move') isShapeDraggingRef.current = true;
        if (mode === 'resize') isShapeResizingRef.current = true;
        if (mode === 'rotate') isShapeRotatingRef.current = true;

        const layer = state.layers.find(l => l.id === selectedShape.layerId);
        const currentOverride = layer?.config.overrides[selectedShape.index] || {};
        const currentX = currentOverride.x !== undefined ? currentOverride.x : (selectedShape.x / displayDims.width) * 100;
        const currentY = currentOverride.y !== undefined ? currentOverride.y : (selectedShape.y / displayDims.height) * 100;
        const currentSize = currentOverride.size !== undefined ? currentOverride.size : 1;
        const currentRot = currentOverride.rotation !== undefined ? currentOverride.rotation : selectedShape.rotation;

        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            initialValX: currentX,
            initialValY: currentY,
            initialShapeSize: currentSize,
            initialRot: currentRot,
            initialSize: 0
        };

        transientOverridesRef.current = { [selectedShape.index]: currentOverride };

        window.addEventListener('pointermove', handleGlobalPointerMoveShape);
        window.addEventListener('pointerup', handleGlobalPointerUpShape);
    };

    const handleGlobalPointerMoveShape = (e: PointerEvent) => {
        if (!selectedShape) return;
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;

        const newOverride: Partial<ShapeOverride> = { ...transientOverridesRef.current[selectedShape.index] };

        if (isShapeDraggingRef.current) {
            const pctX = (dx / displayDims.width) * 100;
            const pctY = (dy / displayDims.height) * 100;
            newOverride.x = dragStartRef.current.initialValX + pctX;
            newOverride.y = dragStartRef.current.initialValY + pctY;
        }

        if (isShapeResizingRef.current) {
            const scaleFactor = 0.005;
            const delta = (dx + dy) * scaleFactor;
            newOverride.size = Math.max(0.1, dragStartRef.current.initialShapeSize + delta);
        }

        if (isShapeRotatingRef.current) {
            const sensitivity = 0.5;
            newOverride.rotation = dragStartRef.current.initialRot + (dx * sensitivity);
        }

        transientOverridesRef.current[selectedShape.index] = newOverride;
        setSelectedShape(prev => prev ? ({ ...prev }) : null);
    };

    const handleGlobalPointerUpShape = () => {
        isShapeDraggingRef.current = false;
        isShapeResizingRef.current = false;
        isShapeRotatingRef.current = false;
        window.removeEventListener('pointermove', handleGlobalPointerMoveShape);
        window.removeEventListener('pointerup', handleGlobalPointerUpShape);

        if (selectedShape && updateShapeOverride) {
            const finalOverride = transientOverridesRef.current[selectedShape.index];
            if (finalOverride) {
                updateShapeOverride(selectedShape.index, finalOverride, selectedShape.layerId);
            }
        }
        transientOverridesRef.current = {};
    };

    // Cleanup when recording toggles
    useEffect(() => {
        if (isRecording) {
            stoppingRef.current = false;
            recorderReadyRef.current = false;
            // startTimeRef is set in init
        } else {
            isInitializingRef.current = false;
        }
    }, [isRecording]);

    // Recording Initialization
    useEffect(() => {
        if (isRecording && !isInitializingRef.current && canvasRef.current) {
            isInitializingRef.current = true;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            const resolution = activeLayer.config.animation.resolution || 'HD';
            const baseSize = resolution === 'SD' ? 1280 : resolution === '4K' ? 3840 : 1920;

            const renderDims = getDimensions(state.aspectRatio, baseSize);
            if (renderDims.width % 2 !== 0) renderDims.width -= 1;
            if (renderDims.height % 2 !== 0) renderDims.height -= 1;

            canvas.width = renderDims.width;
            canvas.height = renderDims.height;

            if (ctx) renderToCanvas(ctx, renderDims.width, renderDims.height, state, loadedImages, 0, noisePattern, false, tempCanvasRef.current);

            setTimeout(() => {
                try {
                    const stream = canvas.captureStream(30);
                    const mimeOptions = ['video/mp4; codecs="avc1.42E01E"', 'video/webm;codecs=h264', 'video/webm'];
                    let mimeType = mimeOptions.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
                    let ext = mimeType.includes('mp4') ? 'mp4' : 'webm';

                    const bitrate = resolution === 'SD' ? 6000000 : resolution === '4K' ? 35000000 : 15000000;

                    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: bitrate });
                    chunksRef.current = [];

                    recorder.ondataavailable = (e) => {
                        if (e.data.size > 0) chunksRef.current.push(e.data);
                    };

                    recorder.onstop = () => {
                        try { stream.getTracks().forEach(track => track.stop()); } catch (e) { }
                        const blob = new Blob(chunksRef.current, { type: mimeType });
                        if (blob.size > 0) {
                            // Calculate actual bitrate from file size
                            const durationSec = activeLayer.config.animation.duration;
                            const fileSizeMB = blob.size / (1024 * 1024);
                            const actualBitrateMbps = (fileSizeMB * 8) / durationSec;
                            const bitrateStr = actualBitrateMbps.toFixed(1);

                            // Resolution label
                            const resLabel = resolution === 'SD' ? '720p' : resolution === '4K' ? '4K' : '1080p';

                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `patternvora-${resLabel}-${bitrateStr}mbps-${Date.now()}.${ext}`;
                            a.click();
                        }
                        setRecordingState(false);
                        recorderReadyRef.current = false;
                        isInitializingRef.current = false;
                    };

                    mediaRecorderRef.current = recorder;
                    recorder.start();

                    recorderReadyRef.current = true;
                    startTimeRef.current = performance.now();

                } catch (e) {
                    console.error("Recording init failed", e);
                    setRecordingState(false);
                    isInitializingRef.current = false;
                }
            }, 100);
        }
    }, [isRecording, setRecordingState, state.aspectRatio, activeLayer.config.animation.resolution]);

    // Unified Animation Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let fsCtx: CanvasRenderingContext2D | null = null;
        if (showFullPreview && fullScreenCanvasRef.current) {
            fsCtx = fullScreenCanvasRef.current.getContext('2d');
        }

        let baseSize = 2000;
        if (isRecording) {
            const resolution = activeLayer.config.animation.resolution || 'HD';
            baseSize = resolution === 'SD' ? 1280 : resolution === '4K' ? 3840 : 1920;
        }

        const renderDims = getDimensions(state.aspectRatio, baseSize);
        if (isRecording) {
            if (renderDims.width % 2 !== 0) renderDims.width -= 1;
            if (renderDims.height % 2 !== 0) renderDims.height -= 1;
        }

        if (canvas.width !== renderDims.width || canvas.height !== renderDims.height) {
            canvas.width = renderDims.width;
            canvas.height = renderDims.height;
        }

        if (showFullPreview && fullScreenCanvasRef.current) {
            const dpr = window.devicePixelRatio || 1;
            const fsWidth = Math.floor(fullScreenDims.width * dpr);
            const fsHeight = Math.floor(fullScreenDims.height * dpr);
            if (fullScreenCanvasRef.current.width !== fsWidth || fullScreenCanvasRef.current.height !== fsHeight) {
                fullScreenCanvasRef.current.width = fsWidth;
                fullScreenCanvasRef.current.height = fsHeight;
            }
        }

        const isAnyAnimEnabled = state.layers.some(l => l.config.animation.enabled);
        const loopDuration = activeLayer.config.animation.duration;

        // View Mode Optimization: Only update DataURL periodically if not in single mode
        // To prevent thrashing the DOM with new background images every frame
        let lastDataUrlUpdate = 0;

        const renderFrame = (timestamp: number) => {
            let elapsedTime = 0;

            if (isAnyAnimEnabled) {
                const durationMs = loopDuration * 1000;

                if (isRecording) {
                    if (recorderReadyRef.current) {
                        elapsedTime = timestamp - startTimeRef.current;
                        if (elapsedTime >= durationMs && !stoppingRef.current) {
                            stoppingRef.current = true;
                            if (mediaRecorderRef.current?.state === 'recording') {
                                mediaRecorderRef.current.stop();
                            }
                        }
                    } else {
                        elapsedTime = 0;
                    }
                } else {
                    if (!startTimeRef.current) startTimeRef.current = timestamp;
                    elapsedTime = timestamp - startTimeRef.current;
                }
            }

            renderToCanvas(
                ctx,
                renderDims.width,
                renderDims.height,
                state,
                loadedImages,
                elapsedTime,
                noisePattern,
                false,
                tempCanvasRef.current,
                transientOverridesRef.current
            );

            if (viewMode !== 'single' && (!isRecording)) {
                // For Tile modes, we need to export the canvas to a URL for the CSS background
                // Throttle this to 30fps to save performance if it's just a visual check
                if (timestamp - lastDataUrlUpdate > 30) {
                    setCanvasDataUrl(canvas.toDataURL());
                    lastDataUrlUpdate = timestamp;
                }
            }

            if (showFullPreview && fsCtx && fullScreenCanvasRef.current) {
                const fsW = fullScreenCanvasRef.current.width;
                const fsH = fullScreenCanvasRef.current.height;
                renderToCanvas(
                    fsCtx,
                    fsW,
                    fsH,
                    state,
                    loadedImages,
                    elapsedTime,
                    noisePattern,
                    false,
                    tempCanvasRef.current,
                    transientOverridesRef.current
                );
            }

            if (isRecording || isAnyAnimEnabled || (isEditMode && Object.keys(transientOverridesRef.current).length > 0)) {
                requestId = requestAnimationFrame(renderFrame);
            } else {
                // If static, ensure we update the data URL once for the tile view
                if (viewMode !== 'single') {
                    setCanvasDataUrl(canvas.toDataURL());
                }
            }
        };

        let requestId: number | null = requestAnimationFrame(renderFrame);

        return () => {
            if (requestId) cancelAnimationFrame(requestId);
        };

    }, [state, displayDims, loadedImages, isRecording, noisePattern, showFullPreview, fullScreenDims, activeLayer, isEditMode, viewMode]);

    const selectedShapeStyle = useMemo(() => {
        if (!selectedShape) return {};
        const layer = state.layers.find(l => l.id === selectedShape.layerId);

        const transient = transientOverridesRef.current[selectedShape.index] || {};
        const stored = layer?.config.overrides[selectedShape.index] || {};
        const currentOverride = { ...stored, ...transient };

        const xPercent = currentOverride.x !== undefined ? currentOverride.x : (selectedShape.x / displayDims.width) * 100;
        const yPercent = currentOverride.y !== undefined ? currentOverride.y : (selectedShape.y / displayDims.height) * 100;
        const sizeMult = currentOverride.size !== undefined ? currentOverride.size : 1;
        const rotation = currentOverride.rotation !== undefined ? currentOverride.rotation : selectedShape.rotation;

        const genDims = getDimensions(state.aspectRatio, 2000);
        const scaleRatio = displayDims.width / genDims.width;
        const displaySize = selectedShape.size * sizeMult * scaleRatio;

        return {
            left: `${xPercent}%`,
            top: `${yPercent}%`,
            width: displaySize,
            height: displaySize,
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`
        };
    }, [selectedShape, state.layers, displayDims, state.aspectRatio, transientOverridesRef.current]);

    const handleDownloadTile = () => {
        setIsExportingTile(true);
        setTimeout(() => {
            try {
                const unitSize = 1000;
                const dims = getDimensions(state.aspectRatio, unitSize);

                // 1. Render single high-res unit
                const singleCanvas = document.createElement('canvas');
                singleCanvas.width = dims.width;
                singleCanvas.height = dims.height;
                const ctx = singleCanvas.getContext('2d');

                if (ctx) {
                    renderToCanvas(ctx, dims.width, dims.height, state, loadedImages, 0, noisePattern);

                    // 2. Create larger 3x3 canvas
                    const tiledCanvas = document.createElement('canvas');
                    tiledCanvas.width = dims.width * 3;
                    tiledCanvas.height = dims.height * 3;
                    const tCtx = tiledCanvas.getContext('2d');

                    if (tCtx) {
                        // 3. Draw 3x3 Grid
                        for (let y = 0; y < 3; y++) {
                            for (let x = 0; x < 3; x++) {
                                tCtx.drawImage(singleCanvas, x * dims.width, y * dims.height);
                            }
                        }

                        // 4. Download
                        const link = document.createElement('a');
                        link.download = `pattern-tiled-3x3-${Date.now()}.png`;
                        link.href = tiledCanvas.toDataURL('image/png');
                        link.click();
                    }
                }
            } catch (e) {
                console.error("Tile export failed", e);
                alert("Failed to export tile.");
            } finally {
                setIsExportingTile(false);
            }
        }, 100);
    };

    return (
        <div ref={containerRef} className="flex-1 bg-slate-50 flex flex-col items-center justify-center overflow-hidden relative p-4 md:p-8 select-none">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px'
                }}
            ></div>

            <div
                ref={canvasWrapperRef}
                style={{
                    width: displayDims.width,
                    height: displayDims.height,
                    boxShadow: isRecording
                        ? '0 0 0 4px #f43f5e, 0 20px 50px -12px rgba(244, 63, 94, 0.5)'
                        : (viewMode === 'single' ? '0 25px 50px -12px rgba(15, 23, 42, 0.15)' : 'none')
                }}
                className={`relative transition-all duration-300 group`}
                onClick={handleCanvasClick}
            >
                {isRecording && (
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-rose-600/90 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg backdrop-blur-sm">
                        <div className="w-2 h-2 bg-white rounded-full"></div> REC
                    </div>
                )}

                {!isRecording && !isEditMode && viewMode === 'single' && (
                    <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-slate-900/70 text-white px-2 py-1.5 rounded-lg text-[10px] font-bold backdrop-blur-sm flex items-center gap-1.5 pointer-events-none">
                            <Maximize size={12} /> Full Preview
                        </div>
                    </div>
                )}

                {/* MAIN RENDERING CANVAS (Hidden in Tile mode but still renders) */}
                <canvas
                    ref={canvasRef}
                    className={`w-full h-full rounded-sm pointer-events-none ${viewMode !== 'single' ? 'opacity-0 absolute inset-0' : 'relative'}`}
                />

                {/* --- TILE VIEW MODE --- */}
                {viewMode === 'tile' && canvasDataUrl && (
                    <div
                        className="absolute inset-0 w-full h-full border border-slate-200 shadow-xl rounded-sm overflow-hidden"
                        style={{
                            backgroundImage: `url(${canvasDataUrl})`,
                            backgroundSize: `${displayDims.width / 3}px ${displayDims.height / 3}px`,
                            backgroundRepeat: 'repeat'
                        }}
                    >
                        {/* Grid Overlay to show seams */}
                        <div className="w-full h-full grid grid-cols-3 grid-rows-3 pointer-events-none">
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className="border border-indigo-500/20"></div>
                            ))}
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-[10px] font-mono">
                            3x3 Tiling Check
                        </div>
                    </div>
                )}

                {/* Guides */}
                {!isEditMode && activeGuides.x && viewMode === 'single' && (
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-indigo-500 z-10 border-l border-dashed border-indigo-400"></div>
                )}
                {!isEditMode && activeGuides.y && viewMode === 'single' && (
                    <div className="absolute left-0 right-0 top-1/2 h-px bg-indigo-500 z-10 border-t border-dashed border-indigo-400"></div>
                )}

                {/* Text Gizmo - Now uses active layer text */}
                {!isRecording && !isEditMode && activeText.enabled && updateText && viewMode === 'single' && (
                    <div
                        style={{
                            position: 'absolute',
                            left: `${activeText.x}%`,
                            top: `${activeText.y}%`,
                            width: textBounds.width,
                            height: textBounds.height,
                            transform: 'translate(-50%, -50%)',
                            cursor: 'grab',
                            touchAction: 'none'
                        }}
                        className="group/gizmo"
                        onPointerDown={(e) => handlePointerDownText(e, 'move')}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`absolute inset-0 border transition-all rounded-sm ${activeGuides.x || activeGuides.y ? 'border-indigo-500/50' : 'border-indigo-500/0 group-hover/gizmo:border-indigo-500 group-hover/gizmo:bg-indigo-500/5'}`}>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/gizmo:opacity-100 transition-opacity bg-indigo-500 text-white p-1 rounded-full shadow-sm">
                                <Move size={12} />
                            </div>
                            <div
                                className="absolute -bottom-6 -right-6 w-12 h-12 flex items-center justify-center cursor-nwse-resize opacity-0 group-hover/gizmo:opacity-100 hover:!opacity-100 transition-opacity z-20"
                                onPointerDown={(e) => handlePointerDownText(e, 'resize')}
                            >
                                <div className="w-6 h-6 bg-white border border-slate-200 shadow-md rounded-full flex items-center justify-center text-indigo-600 hover:scale-110">
                                    <Scaling size={12} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Shape Gizmo */}
                {!isRecording && isEditMode && selectedShape && updateShapeOverride && viewMode === 'single' && (
                    <div
                        style={{
                            position: 'absolute',
                            ...selectedShapeStyle,
                            touchAction: 'none'
                        }}
                        className="z-20 pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute inset-0 border-2 border-indigo-500 cursor-move" onPointerDown={(e) => handlePointerDownShape(e, 'move')}>
                            <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                        </div>

                        <div
                            className="absolute -bottom-6 -right-6 w-12 h-12 flex items-center justify-center cursor-nwse-resize z-30"
                            onPointerDown={(e) => handlePointerDownShape(e, 'resize')}
                        >
                            <div className="w-6 h-6 bg-white border border-indigo-200 shadow-lg rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-50 hover:scale-110 transition-all">
                                <Scaling size={12} />
                            </div>
                        </div>

                        <div
                            className="absolute -top-10 left-1/2 -translate-x-1/2 w-12 h-12 flex items-center justify-center cursor-ew-resize z-30"
                            onPointerDown={(e) => handlePointerDownShape(e, 'rotate')}
                        >
                            <div className="w-6 h-6 bg-white border border-indigo-200 shadow-lg rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-50 hover:scale-110 transition-all">
                                <RotateCw size={12} />
                            </div>
                        </div>
                        <div className="absolute -top-5 left-1/2 w-px h-5 bg-indigo-500 -translate-x-1/2 pointer-events-none"></div>

                        <button
                            className="absolute -top-6 -right-6 w-8 h-8 flex items-center justify-center z-30"
                            onClick={() => {
                                updateShapeOverride(selectedShape.index, { hidden: true }, selectedShape.layerId);
                                setSelectedShape(null);
                            }}
                            title="Delete Shape (Backspace)"
                        >
                            <div className="w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
                                <Trash2 size={10} />
                            </div>
                        </button>
                    </div>
                )}
            </div>

            {/* Floating View Control Toolbar */}
            {!isRecording && (
                <div className="absolute bottom-6 z-30 flex gap-2 bg-white/90 backdrop-blur border border-slate-200 p-1.5 rounded-xl shadow-lg animate-in slide-in-from-bottom-6 duration-500">
                    <button
                        onClick={() => setViewMode('single')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'single' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                        title="Standard View (Edit)"
                    >
                        <Square size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('tile')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'tile' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                        title="Tile View (Check Seams)"
                    >
                        <Grid3x3 size={18} />
                    </button>

                    {/* New Tiled Download Button */}
                    {viewMode === 'tile' && (
                        <div className="w-px h-8 bg-slate-200 mx-1 self-center"></div>
                    )}
                    {viewMode === 'tile' && (
                        <button
                            onClick={handleDownloadTile}
                            disabled={isExportingTile}
                            className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all shadow-md flex items-center gap-1.5 animate-in slide-in-from-left-2 duration-300"
                            title="Download 3x3 Tiled Image (No Grid Lines)"
                        >
                            {isExportingTile ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Download size={16} />
                            )}
                            <span className="text-xs font-bold pr-1 hidden sm:inline">3x3 PNG</span>
                        </button>
                    )}
                </div>
            )}

            {/* Full Preview Overlay */}
            {showFullPreview && (
                <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-200">
                    <button
                        onClick={() => setShowFullPreview(false)}
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50"
                    >
                        <X size={24} />
                    </button>

                    <div
                        ref={fullScreenContainerRef}
                        className="relative flex items-center justify-center w-full h-full"
                    >
                        <div
                            className="absolute inset-0 opacity-20 pointer-events-none z-0"
                            style={{
                                backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                                backgroundSize: '20px 20px'
                            }}
                        ></div>

                        <canvas
                            ref={fullScreenCanvasRef}
                            style={{
                                width: fullScreenDims.width,
                                height: fullScreenDims.height,
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                maxWidth: '100%',
                                maxHeight: '100%'
                            }}
                            className="rounded-md relative z-10"
                        />
                    </div>
                </div>
            )}

        </div>
    );
};

export default CanvasArea;
