import React from 'react';
import { Wallet, TrendingUp, CircleDollarSign, Percent } from 'lucide-react';
import { useInvestments } from '../hooks/useInvestments';
import { StatCard } from './StatCard';
import { EvolutionChart, AllocationChart } from './Charts';
import { AssetTable } from './AssetTable';

export default function Dashboard() {
    const { investments, loading, error, totals, evolutionData } = useInvestments();

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-rose-500">
                Erro ao carregar dados: {error}
            </div>
        );
    }

    const allocationData = investments.map(inv => ({
        name: inv.ticker,
        value: inv.equity
    }));

    return (
        <div className="min-h-screen text-white p-4 md:p-8 selection:bg-blue-500/30 mx-auto max-w-full">
            <div className="max-w-420 mx-auto">
                <header className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-black bg-linear-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                            Investimentos
                        </h1>
                        <p className="text-zinc-300 mt-2 font-medium">Gerenciamento de Patrimônio e Ativos</p>
                    </div>
                </header>

                <div className="flex justify-between gap-6 mb-10 flex-wrap">
                    <StatCard
                        title="Patrimônio Bruto"
                        value={totals.equity}
                        icon={Wallet}
                        colorClass="bg-zinc-700"
                        subtitle={`Líquido: R$ ${totals.netEquity.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    />
                    <StatCard
                        title="Valor Aplicado"
                        value={totals.applied}
                        icon={TrendingUp}
                        colorClass="bg-zinc-700"
                        subtitle={`Lucro Bruto: R$ ${totals.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    />
                    <StatCard
                        title="Rentabilidade"
                        value={`${totals.profitabilityYear >= 0 ? '+' : ''}${totals.profitabilityYear.toFixed(2)}%`}
                        prefix=""
                        icon={Percent}
                        colorClass="bg-zinc-700"
                        subtitle={`Mês: ${totals.profitabilityMonth >= 0 ? '+' : ''}${totals.profitabilityMonth.toFixed(2)}%`}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <EvolutionChart data={evolutionData} />
                    <AllocationChart data={allocationData} />
                </div>
                <AssetTable investments={investments} />
            </div>
        </div>
    );
}
