"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "@/app/_services/api/client";
import { getErrorMessage } from "@/app/_lib/utils/error";

export default function Page() {
    const [serial, setSerial] = useState('');
    const [price, setPrice] = useState(0);
    const [sells, setSells] = useState<any[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [searching, setSearching] = useState(false);
    const [productName, setProductName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleSerialChange = async (value: string) => {
        setSerial(value);
        setProductName('');
        setPrice(0);
        if (value.length > 0) {
            setSearching(true);
            setShowSuggestions(true);
            try {
                const searchValue = value.toUpperCase();
                const res = await api.get(`/v1/products?serial=${searchValue}&status=instock`);
                if (res.data && Array.isArray(res.data)) {
                    setSuggestions(res.data);
                    const exactMatch = res.data.find((p: any) => p.serial === searchValue);
                    if (exactMatch) {
                        setPrice(exactMatch.price);
                        setProductName(exactMatch.name);
                        setShowSuggestions(false);
                    }
                }
            } catch (error) {
                console.error('Error searching products:', error);
            } finally {
                setSearching(false);
            }
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSelectSuggestion = (product: any) => {
        setSerial(product.serial);
        setPrice(product.price);
        setProductName(product.name);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const handleSave = async () => {
        if (!serial) return;
        try {
            await api.post("/v1/sells", {
                serial,
                price,
                paymentMethod,
                customerName,
                customerPhone,
                customerAddress,
            });
            setSerial(''); setPrice(0); setProductName('');
            setCustomerName(''); setCustomerPhone(''); setCustomerAddress('');
            setSuggestions([]);
            setShowSuggestions(false);
            fetchData();
        } catch (error: any) {
            const errorMessage = getErrorMessage(error);
            Swal.fire({
                icon: "error",
                title: "เกิดข้อผิดพลาด",
                text: errorMessage,
                timer: 2000,
            });
        }
    };

    const fetchData = async () => {
        try {
            const res = await api.get("/v1/sells");
            if (res.data && Array.isArray(res.data)) {
                setSells(res.data);
                setTotalAmount(res.data.reduce((sum: number, s: any) => sum + s.price, 0));
            }
        } catch (error) {
            console.error('Error fetching sells:', error);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id: number) => {
        const r = await Swal.fire({ title: "ลบรายการนี้?", icon: "warning", showCancelButton: true, confirmButtonText: "ลบ", cancelButtonText: "ยกเลิก" });
        if (r.isConfirmed) {
            await api.delete(`/v1/sells/${id}`);
            fetchData();
        }
    };

    const handleConfirm = async () => {
        const r = await Swal.fire({ title: "ยืนยันการขาย?", text: `ยอดรวม ${totalAmount.toLocaleString()} บาท`, icon: "question", showCancelButton: true, confirmButtonText: "ยืนยัน", cancelButtonText: "ยกเลิก" });
        if (r.isConfirmed) {
            try {
                await api.put("/v1/sells/confirm");
                Swal.fire({ icon: "success", title: "ยืนยันการขายสำเร็จ", timer: 1500, showConfirmButton: false });
                fetchData();
            } catch (error) {
                console.error('Error confirming sells:', error);
                const errorMessage = getErrorMessage(error);
                Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: errorMessage, timer: 2000 });
            }
        }
    };

    return (
        <div>
            <h1 className="container-header">
                <i className="fas fa-cash-register text-teal-500"></i> ขายสินค้า
            </h1>

            {/* Input area */}
            <div className="bg-linear-to-br from-teal-50 to-white border border-teal-100 rounded-2xl p-5 mb-5">
                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="กรอก Serial / IMEI"
                                value={serial}
                                onChange={(e) => handleSerialChange(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                style={{ marginBottom: 0, paddingRight: searching ? '2.5rem' : '0.875rem' }}
                                className="font-mono"
                            />
                            {searching && (
                                <i className="fas fa-spinner fa-spin absolute right-3 top-1/2 -translate-y-1/2 text-teal-400 text-sm"></i>
                            )}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto z-50">
                                    {suggestions.map((product) => (
                                        <div
                                            key={product.id}
                                            onClick={() => handleSelectSuggestion(product)}
                                            className="px-3 py-2 hover:bg-teal-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                                        >
                                            <div className="flex items-center gap-2">
                                                <code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-600">{product.serial}</code>
                                                <span className="text-sm font-medium text-slate-700">{product.name}</span>
                                            </div>
                                            <div className="text-xs text-slate-400 mt-0.5">
                                                {product.color} • {product.release} • {product.price.toLocaleString()} บาท
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {productName && (
                            <div className="flex items-center gap-2 mt-1.5 px-1">
                                <i className="fas fa-check-circle text-emerald-500 text-xs"></i>
                                <span className="text-xs text-emerald-600 font-medium">{productName}</span>
                            </div>
                        )}
                    </div>
                    <div className="w-full sm:w-40">
                        <input
                            type="number"
                            placeholder="ราคาขาย"
                            value={price || ''}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            style={{ marginBottom: 0 }}
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            style={{ marginBottom: 0 }}
                        >
                            <option value="cash">เงินสด</option>
                            <option value="transfer">โอนเงิน</option>
                            <option value="credit_card">บัตรเครดิต</option>
                            <option value="installment">ผ่อนชำระ</option>
                        </select>
                    </div>
                    <div className="sm:shrink-0">
                        <button className="btn-save w-full sm:w-auto" onClick={handleSave}>
                            <i className="fas fa-plus"></i> เพิ่ม
                        </button>
                    </div>
                </div>

                {/* Customer info */}
                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-teal-200">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="ชื่อลูกค้า"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            style={{ marginBottom: 0 }}
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <input
                            type="number"
                            placeholder="เบอร์โทร"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            style={{ marginBottom: 0 }}
                        />
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="ที่อยู่"
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            style={{ marginBottom: 0 }}
                        />
                    </div>
                </div>
            </div>

            {/* Sell list */}
            {sells.length > 0 ? (
                <>
                    <div className="overflow-auto rounded-xl border border-slate-200 scrollbar-hide">
                        <table style={{ marginTop: 0, borderRadius: 0, border: 'none' }}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Serial</th>
                                    <th>สินค้า</th>
                                    <th>ชื่อลูกค้า</th>
                                    <th>เบอร์โทร</th>
                                    <th>ราคา</th>
                                    <th className="text-center" style={{ width: 60 }}>ลบ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(sells as any[]).map((s, i) => (
                                    <tr key={s.id}>
                                        <td className="text-slate-400 text-sm">{i + 1}</td>
                                        <td><code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono">{s.product?.serial}</code></td>
                                        <td className="font-medium">{s.product?.name}</td>
                                        <td className="text-sm text-slate-600">{s.customerName || '-'}</td>
                                        <td className="text-sm text-slate-600">{s.customerPhone || '-'}</td>
                                        <td className="font-semibold text-teal-700">{s.price.toLocaleString()} <span className="text-xs font-normal text-slate-400">บาท</span></td>
                                        <td className="text-center">
                                            <button className="btn-delete" onClick={() => handleDelete(s.id)}><i className="fas fa-trash text-[10px]"></i></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Total & confirm */}
                    <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-teal-50 border border-teal-100 rounded-2xl p-4">
                        <div>
                            <p className="text-xs text-teal-600 font-medium">{sells.length} รายการ</p>
                            <p className="text-2xl font-bold text-teal-800" style={{ fontFamily: 'Syne, sans-serif' }}>
                                {totalAmount.toLocaleString()} <span className="text-base font-normal text-teal-500">บาท</span>
                            </p>
                        </div>
                        <button
                            onClick={handleConfirm}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all"
                            style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', boxShadow: '0 4px 16px rgba(13,148,136,0.35)', fontFamily: 'Syne, sans-serif' }}
                        >
                            <i className="fas fa-circle-check"></i> ยืนยันการขาย
                        </button>
                    </div>
                </>
            ) : (
                <div className="text-center py-16 text-slate-300">
                    <i className="fas fa-cart-shopping text-4xl mb-3 block"></i>
                    <p className="text-sm">ยังไม่มีรายการขาย</p>
                    <p className="text-xs mt-1">กรอก Serial เพื่อเพิ่มสินค้า</p>
                </div>
            )}
        </div>
    );
}
