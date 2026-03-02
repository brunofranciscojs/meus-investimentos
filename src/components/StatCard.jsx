import React from 'react';

export const StatCard = ({ title, value, icon: Icon, colorClass, prefix = "R$ ", subtitle }) => (
    <div className="bg-zinc-600/20 backdrop-blur-md border p-6 rounded-2xl border-zinc-500 transition-all group lg:w-[32%] w-[48%] grow">
        <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-400 font-medium">{title}</span>
            <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
            </div>
        </div>
        <div className={`text-2xl font-bold mb-1 ${parseInt(value) > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {typeof value === 'number' ? (
                <>
                    {prefix}{value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </>
            ) : value}
        </div>
        {subtitle && (
            <div className="text-xs font-medium text-zinc-400">
                {subtitle}
            </div>
        )}
    </div>
);
