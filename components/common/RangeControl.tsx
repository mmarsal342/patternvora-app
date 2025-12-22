import React from 'react';

interface RangeControlProps {
    label: string;
    value: number;
    onChange: (val: number) => void;
    min: number;
    max: number;
    step: number;
    displayValue: string;
    description?: string;
    tooltip?: string;
}

const RangeControl: React.FC<RangeControlProps> = ({ label, value, onChange, min, max, step, displayValue, description, tooltip }) => (
    <div>
        <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium text-slate-600" title={tooltip}>{label}</span>
            <span className="text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{displayValue}</span>
        </div>
        <input
            type="range"
            min={min} max={max} step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500"
        />
        {description && <p className="text-[10px] text-slate-500 mt-1">{description}</p>}
    </div>
);

export default RangeControl;