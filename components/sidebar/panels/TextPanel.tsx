
import React, { useRef } from 'react';
import { Type, ChevronDown, Upload } from 'lucide-react';
import { useSidebar } from '../SidebarContext';
import CollapsibleSection from '../../common/CollapsibleSection';
import RangeControl from '../../common/RangeControl';
import { DEFAULT_FONTS } from '../../../types';

const TextPanel: React.FC = () => {
    // We now use activeLayerConfig.text from context
    const { activeLayerConfig, updateText, customFonts, onUploadFont } = useSidebar();
    const textConfig = activeLayerConfig.text;
    const fontInputRef = useRef<HTMLInputElement>(null);

    // Merge default fonts (from types) with any custom uploaded fonts
    const allFonts = [...DEFAULT_FONTS, ...customFonts];

    return (
        <CollapsibleSection title="Text Overlay" icon={<Type size={16} />} defaultOpen={false}>
            <div className="space-y-4">
                 <div className="flex items-center gap-2 mb-2">
                     <input 
                        type="checkbox" 
                        id="textEnabled" 
                        checked={textConfig.enabled}
                        onChange={(e) => updateText({ enabled: e.target.checked })}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                     />
                     <label htmlFor="textEnabled" className="text-sm font-medium text-slate-700">Enable Text (Current Layer)</label>
                 </div>

                 {textConfig.enabled && (
                     <>
                        <div className="space-y-1">
                             <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Content</label>
                             <textarea
                                value={textConfig.content}
                                onChange={(e) => updateText({ content: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                                rows={2}
                             />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                             <div>
                                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Font</label>
                                 <div className="relative">
                                     <select
                                        value={allFonts.find(f => f.value === textConfig.fontFamily)?.name || 'Custom'}
                                        onChange={(e) => {
                                            const font = allFonts.find(f => f.name === e.target.value);
                                            if (font) updateText({ fontFamily: font.value });
                                        }}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 appearance-none"
                                     >
                                         {allFonts.map((font, i) => (
                                             <option key={i} value={font.name}>{font.name}</option>
                                         ))}
                                     </select>
                                     <ChevronDown size={12} className="absolute right-2 top-2.5 text-slate-500 pointer-events-none"/>
                                 </div>
                             </div>
                             <div>
                                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Blend</label>
                                 <div className="relative">
                                     <select
                                        value={textConfig.blendMode}
                                        onChange={(e) => updateText({ blendMode: e.target.value as GlobalCompositeOperation })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 appearance-none"
                                     >
                                         <option value="source-over">Normal</option>
                                         <option value="overlay">Overlay</option>
                                         <option value="multiply">Multiply</option>
                                         <option value="screen">Screen</option>
                                         <option value="difference">Difference</option>
                                     </select>
                                     <ChevronDown size={12} className="absolute right-2 top-2.5 text-slate-500 pointer-events-none"/>
                                 </div>
                             </div>
                        </div>

                        {/* Font Upload */}
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={() => fontInputRef.current?.click()}
                                className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1"
                             >
                                <Upload size={10} /> Upload Font (WOFF/TTF)
                             </button>
                             <input type="file" ref={fontInputRef} className="hidden" accept=".woff,.woff2,.ttf,.otf" onChange={(e) => e.target.files?.[0] && onUploadFont(e.target.files[0])} />
                        </div>

                        <div className="space-y-3 pt-2">
                             <RangeControl 
                                label="Size" value={textConfig.fontSize} onChange={(v) => updateText({ fontSize: v })}
                                min={20} max={400} step={5} displayValue={textConfig.fontSize.toString()}
                             />
                             <RangeControl 
                                label="Opacity" value={textConfig.opacity} onChange={(v) => updateText({ opacity: v })}
                                min={0} max={1} step={0.05} displayValue={Math.round(textConfig.opacity * 100) + '%'}
                             />
                        </div>
                        
                        <div className="flex items-center gap-2 pt-1 bg-indigo-50 p-2 rounded-md border border-indigo-100">
                             <input 
                                type="checkbox" 
                                id="masking" 
                                checked={textConfig.masking}
                                onChange={(e) => updateText({ masking: e.target.checked })}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                             />
                             <label htmlFor="masking" className="text-xs text-indigo-800 font-medium cursor-pointer">Use as Mask (Pattern inside)</label>
                        </div>
                        
                        {!textConfig.masking && (
                             <div className="flex items-center justify-between pt-2">
                                 <span className="text-xs text-slate-500">Color</span>
                                 <div className="flex items-center gap-2">
                                     <input 
                                         type="text" 
                                         value={textConfig.color} 
                                         onChange={(e) => updateText({ color: e.target.value })}
                                         className="w-16 bg-white border border-slate-200 rounded p-1 text-[10px] font-mono text-center"
                                     />
                                     <div className="relative w-5 h-5 rounded overflow-hidden border border-slate-200" style={{ backgroundColor: textConfig.color }}>
                                         <input type="color" value={textConfig.color} onChange={(e) => updateText({ color: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer w-[150%] h-[150%] -left-1/4 -top-1/4"/>
                                     </div>
                                 </div>
                             </div>
                        )}
                     </>
                 )}
            </div>
        </CollapsibleSection>
    );
};

export default TextPanel;
