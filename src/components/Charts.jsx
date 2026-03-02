import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

export const EvolutionChart = ({ data }) => (
    <div className="bg-zinc-600/20 backdrop-blur-md border p-6 rounded-2xl border-zinc-500 transition-all h-[400px]">
        <h3 className="text-white font-semibold mb-6">Evolução do Patrimônio</h3>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                    dataKey="date"
                    stroke="#999"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                />
                <YAxis
                    stroke="#999"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$ ${value >= 1000 ? (value / 1000).toFixed(2) + 'k' : value.toFixed(2)}`}
                />
                <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#71717a', marginBottom: '4px' }}
                    formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Patrimônio']}
                />
                <Bar
                    dataKey="valor"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    barSize={80}
                />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const AllocationChart = ({ data }) => (
    <div className="bg-zinc-600/20 backdrop-blur-md border p-6 rounded-2xl border-zinc-500 transition-all h-[400px]">
        <h3 className="text-white font-semibold mb-6">Alocação por Ativo</h3>
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                />
            </PieChart>
        </ResponsiveContainer>
    </div>
);
