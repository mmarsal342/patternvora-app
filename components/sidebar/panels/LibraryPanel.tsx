import React, { useState, useRef } from 'react';
import { FolderOpen, Save, Import, Download } from 'lucide-react';
import { useSidebar } from '../SidebarContext';
import CollapsibleSection from '../../common/CollapsibleSection';
import { Preset } from '../../../types';

const LibraryPanel: React.FC = () => {
    const { onSavePreset, onLoadPreset, presets, onImportPreset } = useSidebar();
    const [presetName, setPresetName] = useState('');
    const importInputRef = useRef<HTMLInputElement>(null);

    const handleExportPreset = (preset: Preset) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(preset));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", preset.name + ".json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <CollapsibleSection title="Library & Presets" icon={<FolderOpen size={16} />} defaultOpen={false}>
            <div className="space-y-4">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Preset Name..." 
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:border-indigo-500 outline-none"
                    />
                    <button 
                        onClick={() => { if(presetName) { onSavePreset(presetName); setPresetName(''); } }}
                        disabled={!presetName}
                        className="px-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50 hover:bg-indigo-700"
                    >
                        <Save size={14} />
                    </button>
                </div>
                
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>Saved Presets</span>
                    <button 
                        onClick={() => importInputRef.current?.click()}
                        className="text-indigo-600 hover:underline flex items-center gap-1"
                    >
                        <Import size={10} /> Import JSON
                    </button>
                    <input type="file" ref={importInputRef} className="hidden" accept=".json" onChange={onImportPreset} />
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                    {presets.length === 0 && <p className="text-[10px] text-slate-400 italic text-center py-4">No presets saved yet.</p>}
                    {presets.map(p => (
                        <div key={p.id} className="group flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-colors">
                            <button onClick={() => onLoadPreset(p)} className="text-xs font-medium text-slate-700 hover:text-indigo-600 text-left flex-1">
                                {p.name}
                            </button>
                            <button 
                                onClick={() => handleExportPreset(p)} 
                                className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Export JSON"
                            >
                                <Download size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </CollapsibleSection>
    );
};

export default LibraryPanel;