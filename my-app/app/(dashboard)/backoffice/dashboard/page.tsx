"use client";

import { useState, useEffect, useMemo, memo } from "react";
import api from "@/app/_services/api/client";
import {
    AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function Page() {
    const [data, setData] = useState<any[]>([]);
    const [totalIncome, setTotalIncome] = useState(0);
    const [pendingIncome, setPendingIncome] = useState(0);
    const [totalRepair, setTotalRepair] = useState(0);
    const [totalSale, setTotalSale] = useState(0);
    const [pendingSale, setPendingSale] = useState(0);
    const [todayIncome, setTodayIncome] = useState(0);
    const [todayCount, setTodayCount] = useState(0);
    const [totalCost, setTotalCost] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);
    const [profitMargin, setProfitMargin] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [isLowStock, setIsLowStock] = useState(false);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [dash, chart, today, lowStock] = await Promise.allSettled([
                api.get("/v1/analytics/dashboard"),
                api.get("/v1/analytics/revenue-by-month"),
                api.get("/v1/analytics/today-sales"),
                api.get("/v1/products/low-stock-count"),
            ]);
            if (dash.status === 'fulfilled') {
                setTotalIncome(dash.value.data.totalIncome || 0);
                setPendingIncome(dash.value.data.pendingIncome || 0);
                setTotalRepair(dash.value.data.totalRepair || 0);
                setTotalSale(dash.value.data.totalSale || 0);
                setPendingSale(dash.value.data.pendingSale || 0);
                setTotalCost(dash.value.data.totalCost || 0);
                setTotalProfit(dash.value.data.totalProfit || 0);
                setProfitMargin(dash.value.data.profitMargin || 0);
            }
            if (chart.status === 'fulfilled') setData(chart.value.data);
            if (today.status === 'fulfilled') {
                setTodayIncome(today.value.data.income || 0);
                setTodayCount(today.value.data.count || 0);
            }
            if (lowStock.status === 'fulfilled') {
                setLowStockCount(lowStock.value.data.count || 0);
                setIsLowStock(lowStock.value.data.isLow || false);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const stats = useMemo(() => [
        { label: "ยอดขายทั้งหมด", value: totalIncome.toLocaleString(), unit: "บาท", icon: "fa-coins", color: "#0d9488", bg: "#f0fdfa", border: "#99f6e4" },
        { label: "กำไรสุทธิ", value: totalProfit.toLocaleString(), unit: "บาท", icon: "fa-chart-line", color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" },
        { label: "ต้นทุนรวม", value: totalCost.toLocaleString(), unit: "บาท", icon: "fa-tags", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
        { label: "อัตรากำไร", value: profitMargin.toFixed(1), unit: "%", icon: "fa-percent", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
        { label: "รายการขาย", value: totalSale.toLocaleString(), unit: "รายการ", icon: "fa-receipt", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
        { label: "งานรับซ่อม", value: totalRepair.toLocaleString(), unit: "งาน", icon: "fa-screwdriver-wrench", color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe" },
        { label: "ยอดขายวันนี้", value: todayIncome.toLocaleString(), unit: "บาท", icon: "fa-calendar-day", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
        { label: "รายได้รอดำเนินการ", value: pendingIncome.toLocaleString(), unit: "บาท", icon: "fa-hourglass-half", color: "#ef4444", bg: "#fff1f2", border: "#fecaca" },
        { label: "ขายรอดำเนินการ", value: pendingSale.toLocaleString(), unit: "รายการ", icon: "fa-clock", color: "#ec4899", bg: "#fdf2f8", border: "#f9a8d4" },
    ], [totalIncome, totalProfit, totalCost, profitMargin, totalSale, totalRepair, todayIncome, pendingIncome, pendingSale]);

    const CustomTooltip = memo(({ active, payload, label }: any) => {
        if (active && payload?.length) {
            return (
                <div className="bg-white rounded-xl px-4 py-3 shadow-lg border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
                    <p className="text-base font-bold" style={{ color: '#0d9488' }}>
                        {(payload[0].value || 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">บาท</span>
                    </p>
                </div>
            );
        }
        return null;
    });
    CustomTooltip.displayName = 'CustomTooltip';

    return (
        <div>
            <h1 className="container-header">
                <i className="fas fa-chart-pie text-teal-500"></i>
                Dashboard
                {isLowStock && (
                    <span className="ml-3 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold border border-red-200">
                        <i className="fas fa-exclamation-triangle mr-1"></i>
                        สต็อกต่ำ: {lowStockCount} ชิ้น
                    </span>
                )}
            </h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
                {stats.map((s, i) => (
                    <div key={i} className="rounded-2xl p-4 md:p-5 border transition-all hover:-translate-y-0.5 hover:shadow-md"
                        style={{ background: s.bg, borderColor: s.border }}>
                        <div className="flex items-start justify-between">
                            <div className="min-w-0">
                                <p className="text-slate-500 text-xs font-medium mb-2 truncate">{s.label}</p>
                                <p className="font-bold leading-none" style={{ color: s.color, fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontFamily: 'Syne, sans-serif' }}>
                                    {s.value}
                                </p>
                                <p className="text-slate-400 text-xs mt-1">{s.unit}</p>
                            </div>
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 ml-2"
                                style={{ background: `${s.color}18` }}>
                                <i className={`fas ${s.icon} text-sm`} style={{ color: s.color }}></i>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="font-bold text-slate-800 text-base" style={{ fontFamily: 'Syne, sans-serif' }}>
                            รายได้รายเดือน
                        </h2>
                        <p className="text-slate-400 text-xs mt-0.5">ข้อมูลยอดขายแต่ละเดือน</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                        <i className="fas fa-chart-area text-teal-500 text-sm"></i>
                    </div>
                </div>

                <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="income" stroke="#0d9488" strokeWidth={2.5} fill="url(#colorIncome)" dot={{ fill: '#0d9488', r: 3, strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 5, fill: '#0d9488' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
