// Presets Panel - Save and load pattern presets from cloud storage

import React, { useState, useEffect, useCallback } from 'react';
import { Bookmark, Save, Trash2, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { useSidebar } from '../SidebarContext';
import { useUser } from '../../UserContext';
import CollapsibleSection from '../../common/CollapsibleSection';
import { presetsApi, Preset } from '../../../services/api';

const PresetsPanel: React.FC = () => {
    const { state, activeLayerConfig, updateStateDirectly } = useSidebar();
    const { user, isGuest } = useUser();

    const [presets, setPresets] = useState<Preset[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newPresetName, setNewPresetName] = useState('');
    const [showSaveForm, setShowSaveForm] = useState(false);
    const [limit, setLimit] = useState(10);

    // Fetch presets on mount
    const fetchPresets = useCallback(async () => {
        if (isGuest || !user) return;

        setLoading(true);
        setError(null);
        try {
            const data = await presetsApi.list();
            setPresets(data.presets);
            setLimit(data.limit);
        } catch (err) {
            console.error('Failed to load presets:', err);
            setError('Failed to load presets');
        } finally {
            setLoading(false);
        }
    }, [user, isGuest]);

    useEffect(() => {
        fetchPresets();
    }, [fetchPresets]);

    // Save current config as preset
    const handleSavePreset = async () => {
        if (!newPresetName.trim()) return;

        setSaving(true);
        setError(null);
        try {
            const configJson = JSON.stringify(activeLayerConfig);
            await presetsApi.save(newPresetName.trim(), configJson);
            setNewPresetName('');
            setShowSaveForm(false);
            await fetchPresets();
        } catch (err: any) {
            setError(err.message || 'Failed to save preset');
        } finally {
            setSaving(false);
        }
    };

    // Load a preset - apply to active layer
    const handleLoadPreset = (preset: Preset) => {
        try {
            const config = JSON.parse(preset.config);

            // Update the active layer's config
            const newLayers = state.layers.map(layer => {
                if (layer.id === state.activeLayerId) {
                    return { ...layer, config: { ...layer.config, ...config } };
                }
                return layer;
            });

            updateStateDirectly({ layers: newLayers });
        } catch (err) {
            setError('Failed to load preset');
        }
    };

    // Delete a preset
    const handleDeletePreset = async (presetId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this preset?')) return;

        try {
            await presetsApi.delete(presetId);
            setPresets(prev => prev.filter(p => p.id !== presetId));
        } catch (err) {
            setError('Failed to delete preset');
        }
    };

    // Guest users can't save presets
    if (isGuest) {
        return (
            <CollapsibleSection title="Presets" icon={<Bookmark size={16} />} defaultOpen={false}>
                <div className="text-center py-4">
                    <AlertCircle size={24} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-xs text-slate-500">Sign in to save & load presets</p>
                </div>
            </CollapsibleSection>
        );
    }

    return (
        <CollapsibleSection title="Presets" icon={<Bookmark size={16} />} defaultOpen={false}>
            <div className="space-y-3">
                {/* Save Button / Form */}
                {!showSaveForm ? (
                    <button
                        onClick={() => setShowSaveForm(true)}
                        disabled={presets.length >= limit}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={14} />
                        Save Current as Preset
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                            placeholder="Preset name..."
                            maxLength={50}
                            className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            autoFocus
                        />
                        <button
                            onClick={handleSavePreset}
                            disabled={saving || !newPresetName.trim()}
                            className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
                        </button>
                        <button
                            onClick={() => { setShowSaveForm(false); setNewPresetName(''); }}
                            className="px-2 py-1.5 text-slate-500 text-xs hover:text-slate-700"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Usage indicator */}
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{presets.length}/{limit} presets used</span>
                    <button onClick={fetchPresets} className="hover:text-indigo-600 transition-colors">
                        <RefreshCw size={12} />
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-2 bg-red-50 border border-red-100 rounded text-xs text-red-600">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-4">
                        <Loader2 size={20} className="mx-auto animate-spin text-slate-400" />
                    </div>
                )}

                {/* Presets List */}
                {!loading && presets.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-400">
                        No saved presets yet
                    </div>
                )}

                {!loading && presets.length > 0 && (
                    <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                        {presets.map((preset) => (
                            <div
                                key={preset.id}
                                onClick={() => handleLoadPreset(preset)}
                                className="group flex items-center justify-between p-2 bg-slate-50 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-700 truncate">{preset.name}</p>
                                    <p className="text-[10px] text-slate-400">
                                        {new Date(preset.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => handleDeletePreset(preset.id, e)}
                                    className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    title="Delete preset"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </CollapsibleSection>
    );
};

export default PresetsPanel;
