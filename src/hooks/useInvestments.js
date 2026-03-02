import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import axios from 'axios';

const BRAPI_KEY = import.meta.env.VITE_BRAPI_KEY;

export function useInvestments() {
    const [data, setData] = useState({
        investments: [],
        loading: true,
        error: null,
        totals: {
            equity: 0,
            netEquity: 0,
            applied: 0,
            profit: 0,
            dividends12m: 0,
            profitabilityYear: 0,
            profitabilityMonth: 0
        },
        evolutionData: []
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const now = new Date();

                // 1. Fetch from Supabase
                const { data: allRecords, error: supabaseError } = await supabase
                    .from('investimentos')
                    .select('*');

                if (supabaseError) throw supabaseError;

                const parseDate = (dateStr) => {
                    if (!dateStr) return new Date();
                    // Handle ISO strings (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)
                    if (dateStr.includes('-')) return new Date(dateStr);

                    const parts = dateStr.split('/');
                    if (parts.length === 3) {
                        const d = parseInt(parts[0]);
                        const m = parseInt(parts[1]);
                        const y = parseInt(parts[2]);
                        if (m > 12) return new Date(y, d - 1, m);
                        if (d > 12) return new Date(y, m - 1, d);
                        return new Date(y, m - 1, d);
                    }
                    return new Date(dateStr);
                };

                const processedRecords = allRecords.map(r => ({
                    ...r,
                    id: r.id?.trim(),
                    date: parseDate(r.created_at),
                    quantity: parseFloat(r.quantity) || 0,
                    unitPriceStored: parseFloat(r.price) || 0,
                    appliedValueStored: parseFloat(r.valor) || 0
                })).sort((a, b) => a.date - b.date);

                // Precise Treasury Data (keep as requested)
                const TREASURY_DATA = {
                    'IPCA2035': {
                        applied: 14674.33,
                        gross: 18805.99,
                        net: 18129.00,
                        unitPrice: 18805.99 / 7.78
                    }
                };

                // Group into holdings
                const currentHoldingsMap = processedRecords.reduce((acc, rec) => {
                    if (!acc[rec.id]) {
                        acc[rec.id] = {
                            ticker: rec.id,
                            name: rec.name || rec.id, // Fallback if name is null
                            totalQuantity: 0,
                            totalApplied: 0,
                            records: []
                        };
                    }
                    acc[rec.id].totalQuantity += rec.quantity;
                    acc[rec.id].totalApplied += rec.appliedValueStored;
                    acc[rec.id].records.push(rec);
                    return acc;
                }, {});

                const holdingsList = Object.values(currentHoldingsMap);

                // 2. Fetch prices/info from BrAPI
                const symbols = holdingsList
                    .map(h => h.ticker)
                    .filter(s => !!s && !TREASURY_DATA[s] && !s.includes('IPCA') && !s.includes('SELIC'))
                    .join(',');

                let quotes = {};
                let tickerNames = {};
                let dividendsByTicker = {};
                let sparklines = {};

                if (symbols) {
                    try {
                        const brapiResponse = await axios.get(`https://api.brapi.dev/api/quote/${symbols}?dividends=true&range=1y&interval=1mo&token=${BRAPI_KEY}`);
                        (brapiResponse.data.results || []).forEach(result => {
                            quotes[result.symbol] = result.regularMarketPrice;
                            tickerNames[result.symbol] = result.longName || result.shortName;
                            dividendsByTicker[result.symbol] = result.dividendsData?.cashDividends || [];
                            sparklines[result.symbol] = result.historicalDataPrice || [];
                        });
                    } catch (apiErr) {
                        console.error('BrAPI Error:', apiErr);
                    }
                }

                const getPrice = (ticker) => quotes[ticker] || TREASURY_DATA[ticker]?.unitPrice || (ticker.includes('IPCA') ? 2417.22 : 0);
                const getName = (holding) => tickerNames[holding.ticker] || holding.name;

                // 3. Dividends (12M)
                const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                let totalDividends12m = 0;

                holdingsList.forEach(holding => {
                    const tickerDivs = dividendsByTicker[holding.ticker] || [];
                    tickerDivs.forEach(div => {
                        const paymentDate = new Date(div.paymentDate);
                        if (paymentDate >= twelveMonthsAgo && paymentDate <= now) {
                            const qtyAtTime = holding.records.filter(r => r.date <= paymentDate).reduce((sum, r) => sum + r.quantity, 0);
                            if (qtyAtTime > 0) totalDividends12m += qtyAtTime * div.rate;
                        }
                    });
                });

                // 4. Evolution Data
                const monthsNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                let evolutionData = [];

                for (let i = 5; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const endOfM = new Date(d.getFullYear(), d.getMonth() + 1, 0);

                    let monthlyVal = 0;
                    holdingsList.forEach(holding => {
                        const qtyAtMonthEnd = holding.records.filter(r => r.date <= endOfM).reduce((sum, r) => sum + r.quantity, 0);
                        if (qtyAtMonthEnd <= 0) return;

                        if (i === 0) {
                            monthlyVal += qtyAtMonthEnd * getPrice(holding.ticker);
                        } else {
                            const hist = sparklines[holding.ticker] || [];
                            const match = hist.find(h => {
                                const hd = new Date(h.date * 1000);
                                return hd.getMonth() === d.getMonth() && hd.getFullYear() === d.getFullYear();
                            });
                            const p = match ? match.close : getPrice(holding.ticker);
                            monthlyVal += qtyAtMonthEnd * p;
                        }
                    });
                    evolutionData.push({ date: monthsNames[d.getMonth()], valor: monthlyVal });
                }

                // 5. Final Calculations
                let finalEquity = 0;
                let totalApplied = 0;
                let finalNetEquity = 0;

                const enrichedInv = holdingsList.map(h => {
                    const price = getPrice(h.ticker);
                    const equity = h.totalQuantity * price;

                    const applied = TREASURY_DATA[h.ticker]?.applied || h.totalApplied;
                    const net = TREASURY_DATA[h.ticker]?.net || equity;

                    finalEquity += equity;
                    totalApplied += applied;
                    finalNetEquity += net;

                    const profit = equity - applied;

                    return {
                        id: h.ticker,
                        name: getName(h),
                        quantity: h.totalQuantity,
                        ticker: h.ticker,
                        currentPrice: price,
                        equity,
                        applied,
                        net,
                        profit,
                        profitPercent: applied > 0 ? (profit / applied) * 100 : 0
                    };
                });

                const totalProfit = finalEquity - totalApplied;
                const currentV = finalEquity;
                const startOfJanV = evolutionData.find(e => e.date === 'Jan')?.valor || evolutionData[0]?.valor || currentV;
                const lastMonthV = evolutionData[evolutionData.length - 2]?.valor || currentV;

                const profYear = startOfJanV > 0 ? ((currentV - startOfJanV) / startOfJanV) : 0;
                const profMonth = lastMonthV > 0 ? ((currentV - lastMonthV) / lastMonthV) : 0;

                setData({
                    investments: enrichedInv,
                    loading: false,
                    error: null,
                    totals: {
                        equity: finalEquity,
                        netEquity: finalNetEquity,
                        applied: totalApplied,
                        profit: totalProfit,
                        dividends12m: totalDividends12m,
                        profitabilityYear: profYear * 100,
                        profitabilityMonth: profMonth * 100
                    },
                    evolutionData
                });

            } catch (err) {
                console.error('Fetch Error:', err);
                setData(prev => ({ ...prev, loading: false, error: err.message }));
            }
        }
        fetchData();
    }, []);

    return data;
}
