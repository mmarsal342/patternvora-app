

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:5' | '3:4';

export type PatternStyle = 'geometric' | 'organic' | 'grid' | 'bauhaus' | 'confetti' | 'custom-image' | 'radial' | 'typo' | 'mosaic' | 'hex' | 'waves' | 'memphis' | 'isometric' | 'seasonal-cny' | 'seasonal-christmas' | 'seasonal-newyear' | 'seasonal-valentine';

export type CompositionType = 'random' | 'center' | 'frame' | 'diagonal' | 'thirds' | 'bottom' | 'cross' | 'ring' | 'x-shape' | 'split-v' | 'split-h' | 'corners';

export type Palette = {
  name: string;
  colors: string[];
  bg: string;
};

export type FontDef = {
  name: string;
  value: string;
  url: string | null;
  type: 'google' | 'custom' | 'system';
};

export type TextConfig = {
  enabled: boolean;
  content: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  x: number;
  y: number;
  opacity: number;
  blendMode: GlobalCompositeOperation;
  renderMode: 'font' | 'shape';
  masking: boolean; // Pattern inside text
};

export type CustomAsset = {
  id: string;
  src: string; // Base64 data URL
};

export type CustomImageConfig = {
  assets: CustomAsset[]; // Array of uploaded assets (Max 5)
  originalColors: boolean; // If true, render as-is. If false, recolor using palette.
};

export type PrimaryAnimationType = 'none' | 'orbit' | 'float' | 'scan';
export type SecondaryAnimationType = 'none' | 'pulse' | 'spin';

export type VideoResolution = 'SD' | 'HD' | '4K';

export type StrokeMode = 'random' | 'fill' | 'stroke';

export type AnimationDirection = 'normal' | 'reverse';

export type VideoExportMode = 'fast' | 'quality';

export type AnimationConfig = {
  enabled: boolean;
  primary: PrimaryAnimationType;
  secondary: SecondaryAnimationType;
  duration: number; // in seconds
  speed: number;
  resolution: VideoResolution;
  intensity: number; // 0.1 to 3.0
  direction: AnimationDirection;
  exportMode?: VideoExportMode; // Video export quality mode
};

export interface ShapeOverride {
  x?: number; // percentage 0-100
  y?: number; // percentage 0-100
  size?: number; // multiplier of original size (e.g., 1.0, 1.5)
  rotation?: number; // absolute degrees
  color?: string;
  hidden?: boolean;
}

export interface ShapeData {
  type: 'circle' | 'rect' | 'triangle' | 'arc' | 'line' | 'image' | 'star' | 'polygon' | 'blob' | 'char' | 'wave' | 'zigzag' | 'cross' | 'donut' | 'pill' | 'cube' | 'lantern' | 'dragon' | 'angpao' | 'cloud-cn' | 'firecracker' | 'fan' | 'xmas-tree' | 'gift' | 'snowflake' | 'bell' | 'candycane' | 'santa-hat' | 'firework' | 'champagne' | 'clock-ny' | 'balloon' | 'party-hat' | 'party-popper' | 'starburst' | 'heart' | 'rose' | 'love-letter' | 'cupid-arrow' | 'bow' | 'ring' | 'crescent' | 'star-islamic' | 'mosque' | 'lantern-ramadan' | 'ketupat' | 'dates';
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  stroke: boolean;
  speedFactor: number;
  phaseOffset: number;
  points?: number;
  seed?: number;
  char?: string;
  index: number;
  assetId?: string; // ID of the custom asset if type is 'image'
}

export type Preset = {
  id: string;
  name: string;
  createdAt: number;
  state: AppState;
};

export type HistoryItem = {
  id: string;
  state: AppState;
  thumbnail: string; // Base64 Data URL
  timestamp: number;
};

// --- LAYER SYSTEM TYPES ---

export interface StyleOptions {
  shapeTypes: string[]; // Specific shapes allowed for the current style (empty = all)
  gridGap: number; // Gap for grid/mosaic styles (0-100)
}

export interface CompositionOptions {
  direction: 'tl-br' | 'tr-bl'; // For diagonal
  margin: number; // For frame (0-50 percentage)
}

export interface LayerConfig {
  seed: number;
  style: PatternStyle;
  composition: CompositionType;
  complexity: number; // 10-200
  scale: number; // 0.5 - 3.0
  palette: Palette;
  strokeWidth: number;
  strokeMode: StrokeMode; // 'random' | 'fill' | 'stroke'
  texture: number; // 0 - 100 opacity of noise
  customImage: CustomImageConfig;
  animation: AnimationConfig;
  text: TextConfig; // Text is now per-layer
  transparentBackground: boolean; // Controls if bg color is rendered
  overrides: Record<number, ShapeOverride>; // Key is the shape index
  styleOptions: StyleOptions;
  compositionOptions: CompositionOptions;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  blendMode: GlobalCompositeOperation;
  opacity: number;
  config: LayerConfig;
}

export type AppState = {
  version: 2; // Schema version for migration
  aspectRatio: AspectRatio;
  layers: Layer[];
  activeLayerId: string;
};

// --- EXPORT CONFIG ---
export type ExportSize = 1000 | 2000 | 4096; // 720p(ish), 1080p(ish), 4K

export const EXPORT_SIZES: { label: string; value: ExportSize; badge?: string }[] = [
  { label: 'SD (1000px)', value: 1000 },
  { label: 'HD (2000px)', value: 2000 },
  { label: '4K (4096px)', value: 4096, badge: 'PRO' },
];

// Added direct URLs for opentype.js to parse
export const DEFAULT_FONTS: FontDef[] = [
  {
    name: 'Modern Sans',
    value: "'Inter', sans-serif",
    url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff",
    type: 'google'
  },
  {
    name: 'Montserrat',
    value: "'Montserrat', sans-serif",
    url: "https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCu17356.woff",
    type: 'google'
  },
  {
    name: 'Elegant Serif',
    value: "'Playfair Display', serif",
    url: "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.woff",
    type: 'google'
  },
  {
    name: 'Tech Mono',
    value: "'Space Mono', monospace",
    url: "https://fonts.gstatic.com/s/spacemono/v13/i7dPIFZifjKcF5tHCS8GS88.woff",
    type: 'google'
  },
  {
    name: 'Righteous',
    value: "'Righteous', cursive",
    url: "https://fonts.gstatic.com/s/righteous/v13/1cXxaUPXBpj2rGoU7C9WhnGFucE.woff",
    type: 'google'
  },
  {
    name: 'Perm Marker',
    value: "'Permanent Marker', cursive",
    url: "https://fonts.gstatic.com/s/permanentmarker/v16/Fh4uPib9Iyv2ucM6pGOQEimGtES02lP2s6Q.woff",
    type: 'google'
  },
  {
    name: 'System',
    value: "sans-serif",
    url: null, // Fallback to font mode for system fonts
    type: 'system'
  },
];