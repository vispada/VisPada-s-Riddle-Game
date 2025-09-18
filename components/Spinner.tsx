
import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
}

function Spinner({ size = 'md' }: SpinnerProps) {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };
    return (
        <div className={`animate-spin rounded-full border-4 border-slate-500 border-t-cyan-400 ${sizeClasses[size]}`}></div>
    );
}

export default Spinner;
