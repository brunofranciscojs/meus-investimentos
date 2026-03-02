import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const AssetTable = ({ investments }) => (
    <div className="bg-zinc-600/20 backdrop-blur-md border rounded-2xl border-zinc-500 transition-all overflow-hidden mt-8">
        <div className="p-6 border-b border-zinc-800">
            <h3 className="text-white font-semibold">Meus Ativos</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-zinc-950/50 text-zinc-400 text-xs uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-4 font-medium">Ativo</th>
                        <th className="px-6 py-4 font-medium text-right">Qtd</th>
                        <th className="px-6 py-4 font-medium text-right">Aplicado</th>
                        <th className="px-6 py-4 font-medium text-right">Bruto</th>
                        <th className="px-6 py-4 font-medium text-right">Líquido</th>
                        <th className="px-6 py-4 font-medium text-right">Lucro</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                    {investments.map((inv, i) => (
                        <tr key={`${inv.id}-${i}`} className="hover:bg-zinc-800/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col">
                                    <span className="text-white font-bold">{inv.ticker}</span>
                                    <span className="text-zinc-400 text-xs">{inv.name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right text-zinc-300 font-medium">{inv.quantity.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            <td className="px-6 py-4 text-right text-zinc-400">
                                R$ {inv.applied.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 text-right text-white font-bold">
                                R$ {inv.equity.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 text-right text-emerald-400 font-bold">
                                R$ {inv.net.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className={`flex flex-col items-end ${inv.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    <span className="font-bold">R$ {inv.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    <span className="text-xs">{inv.profitPercent.toFixed(2)}%</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);
