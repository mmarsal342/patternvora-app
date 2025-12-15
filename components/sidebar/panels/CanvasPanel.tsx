import React from 'react';
import { Layout } from 'lucide-react';
import { useSidebar } from '../SidebarContext';
import CollapsibleSection from '../../common/CollapsibleSection';
import { AspectRatio } from '../../../types';

const CanvasPanel: React.FC = () => {
    const { state, updateState } = useSidebar();
    
    return (
        <CollapsibleSection title="Canvas" icon={<Layout size={16} />}>
            <div className="grid grid-cols-3 gap-2">
                {(['1:1', '16:9', '9:16', '4:5', '3:4'] as AspectRatio[]).map((ratio) => (
                <button
                    key={ratio}
                    onClick={() => updateState({ aspectRatio: ratio }, true)}
                    className={`px-2 py-1.5 text-xs font-medium rounded-md border transition-all ${
                    state.aspectRatio === ratio
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
                    }`}
                >
                    {ratio}
                </button>
                ))}
            </div>
        </CollapsibleSection>
    );
};

export default CanvasPanel;