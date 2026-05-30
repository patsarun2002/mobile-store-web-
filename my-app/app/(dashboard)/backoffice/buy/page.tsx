"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Swal from "sweetalert2";
import api from "@/app/_services/api/client";
import Modal from "../_components/Modal";
import { getErrorMessage } from "@/app/_lib/utils/error";

export default function Page() {
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [serial, setSerial] = useState("");
    const [name, setName] = useState("");
    const [release, setRelease] = useState("");
    const [color, setColor] = useState("");
    const [price, setPrice] = useState(0);
    const [costPrice, setCostPrice] = useState(0);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const [remark, setRemark] = useState("");
    const [products, setProducts] = useState<any[]>([]);
    const [id, setId] = useState(0);
    const [qty, setQty] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterColor, setFilterColor] = useState("all");
    const [filterRelease, setFilterRelease] = useState("all");

    const COLOR_MAP: Record<string, { bg: string; text: string; dot: string }> = useMemo(() => ({
        Black: { bg: '#f1f5f9', text: '#334155', dot: '#334155' },
        White: { bg: '#f8fafc', text: '#64748b', dot: '#cbd5e1' },
        Blue: { bg: '#eff6ff', text: '#3b82f6', dot: '#3b82f6' },
        Pink: { bg: '#fdf2f8', text: '#ec4899', dot: '#ec4899' },
        Green: { bg: '#f0fdf4', text: '#22c55e', dot: '#22c55e' },
        Red: { bg: '#fff1f2', text: '#ef4444', dot: '#ef4444' },
        Purple: { bg: '#f5f3ff', text: '#8b5cf6', dot: '#8b5cf6' },
        Gold: { bg: '#fefce8', text: '#d97706', dot: '#d97706' },
        Silver: { bg: '#f8fafc', text: '#64748b', dot: '#94a3b8' },
    }), []);

    const fetchData = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append("search", searchTerm);
            if (filterStatus !== "all") params.append("status", filterStatus);
            if (filterColor !== "all") params.append("color", filterColor);
            if (filterRelease !== "all") params.append("release", filterRelease);
            const res = await api.get(`/v1/products?${params}`);
            if (res.data && Array.isArray(res.data)) {
                setProducts(res.data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }, [searchTerm, filterStatus, filterColor, filterRelease]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleClear = () => {
        setSerial(""); setName(""); setRelease(""); setColor("");
        setPrice(0); setCostPrice(0); setCustomerName("");
        setCustomerPhone(""); setCustomerAddress(""); setRemark(""); setQty(1);
    };

    const handleSave = async () => {
        try {
            const payload = { serial, name, release, color, price, costPrice, customerName, customerPhone, customerAddress, remark, qty };
            if (id === 0) await api.post("/v1/products", payload);
            else { await api.put(`/v1/products/${id}`, payload); setId(0); }
            Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1500, showConfirmButton: false });
            setIsOpenModal(false);
            handleClear();
            fetchData();
        } catch (error) {
            console.error('Error saving product:', error);
            const errorMessage = getErrorMessage(error);
            Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: errorMessage, timer: 2000 });
        }
    };

    const handleEdit = (pid: number) => {
        const p = products.find((x: any) => x.id === pid) as any;
        if (!p) return;
        setSerial(p.serial ?? ''); setName(p.name); setRelease(p.release);
        setColor(p.color); setPrice(p.price); setCostPrice(p.costPrice || 0);
        setCustomerName(p.customerName); setCustomerPhone(p.customerPhone);
        setCustomerAddress(p.customerAddress ?? ''); setRemark(p.remark); setId(p.id);
        setIsOpenModal(true);
    };

    const handleDelete = async (pid: number) => {
        const r = await Swal.fire({ title: "ลบรายการนี้?", icon: "warning", showCancelButton: true, confirmButtonText: "ลบ", cancelButtonText: "ยกเลิก" });
        if (r.isConfirmed) {
            await api.delete(`/v1/products/${pid}`);
            Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1200, showConfirmButton: false });
            fetchData();
        }
    };

    const colors = ["all", "Black", "White", "Blue", "Pink", "Green", "Red", "Purple", "Gold", "Silver"];
    const colorLabels: Record<string, string> = { all: "ทั้งหมด", Black: "ดำ", White: "ขาว", Blue: "น้ำเงิน", Pink: "ชมพู", Green: "เขียว", Red: "แดง", Purple: "ม่วง", Gold: "ทอง", Silver: "เงิน" };

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                <h1 className="container-header mb-0 border-none after:hidden">
                    <i className="fas fa-box-open text-teal-500"></i> รายการซื้อ
                </h1>
                <button className="btn-plus" onClick={() => { handleClear(); setId(0); setIsOpenModal(true); }}>
                    <i className="fas fa-plus text-xs"></i> เพิ่มรายการ
                </button>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div className="flex-1 min-w-45">
                    <label>ค้นหา</label>
                    <div className="relative">
                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" style={{ marginTop: '-8px' }}></i>
                        <input type="text" placeholder="serial, ชื่อ, ลูกค้า, เบอร์โทร" value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '2rem', marginBottom: 0 }} />
                    </div>
                </div>
                <div className="w-36">
                    <label>สถานะ</label>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ marginBottom: 0 }}>
                        <option value="all">ทั้งหมด</option>
                        <option value="instock">มีสินค้า</option>
                        <option value="sold">ขายแล้ว</option>
                    </select>
                </div>
                <div className="w-36">
                    <label>สี</label>
                    <select value={filterColor} onChange={(e) => setFilterColor(e.target.value)} style={{ marginBottom: 0 }}>
                        {colors.map(c => <option key={c} value={c}>{colorLabels[c]}</option>)}
                    </select>
                </div>
                <div className="w-36">
                    <label>รุ่น</label>
                    <select value={filterRelease} onChange={(e) => setFilterRelease(e.target.value)} style={{ marginBottom: 0 }}>
                        <option value="all">ทั้งหมด</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                        <option value="2021">2021</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-auto max-h-[60vh] rounded-xl scrollbar-hide border border-slate-200">
                <table style={{ marginTop: 0, borderRadius: 0, border: 'none' }}>
                    <thead>
                        <tr>
                            <th>Serial</th>
                            <th>ชื่อสินค้า</th>
                            <th>รุ่น</th>
                            <th>สี</th>
                            <th>ราคาขาย</th>
                            <th>ราคาทุน</th>
                            <th>กำไร</th>
                            <th>ลูกค้า</th>
                            <th>เบอร์โทร</th>
                            <th>หมายเหตุ</th>
                            <th className="text-center" style={{ width: 90 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(products as any[]).map((p) => {
                            const profit = p.price - (p.costPrice || 0);
                            const margin = p.price > 0 ? ((profit / p.price) * 100).toFixed(1) : 0;
                            const c = COLOR_MAP[p.color] || { bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8' };
                            return (
                                <tr key={p.id}>
                                    <td><code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono">{p.serial}</code></td>
                                    <td className="font-medium">{p.name}</td>
                                    <td><span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{p.release}</span></td>
                                    <td>
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md"
                                            style={{ background: c.bg, color: c.text }}>
                                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.dot }}></span>
                                            {p.color}
                                        </span>
                                    </td>
                                    <td className="font-semibold text-slate-700">{p.price.toLocaleString()}</td>
                                    <td className="text-slate-500">{(p.costPrice || 0).toLocaleString()}</td>
                                    <td>
                                        <span className={`text-xs font-semibold ${profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {profit >= 0 ? '+' : ''}{profit.toLocaleString()} <span className="opacity-60">({margin}%)</span>
                                        </span>
                                    </td>
                                    <td>{p.customerName}</td>
                                    <td className="text-slate-500">{p.customerPhone}</td>
                                    <td className="text-slate-400 text-xs max-w-30 truncate">{p.remark}</td>
                                    <td>
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button className="btn-edit" onClick={() => handleEdit(p.id)}><i className="fas fa-pen text-[10px]"></i></button>
                                            <button className="btn-delete" onClick={() => handleDelete(p.id)}><i className="fas fa-trash text-[10px]"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {products.length === 0 && (
                            <tr><td colSpan={11} className="text-center py-10 text-slate-400">
                                <i className="fas fa-box-open text-2xl mb-2 block opacity-30"></i>
                                ไม่พบรายการสินค้า
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal title={id === 0 ? "เพิ่มรายการซื้อ" : "แก้ไขรายการซื้อ"} isOpen={isOpenModal} onClose={() => setIsOpenModal(false)}>
                <div className="grid grid-cols-2 gap-x-4">
                    <div className="col-span-2"><label>Serial สินค้า</label><input type="text" value={serial} onChange={(e) => setSerial(e.target.value)} placeholder="IMEI / Serial number" /></div>
                    <div><label>ชื่อสินค้า</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="iPhone 15 Pro" /></div>
                    <div><label>รุ่นสินค้า (ปี)</label><input type="text" value={release} onChange={(e) => setRelease(e.target.value)} placeholder="2024" /></div>
                    <div><label>สีสินค้า</label><input type="text" value={color} onChange={(e) => setColor(e.target.value)} placeholder="Black" /></div>
                    <div><label>จำนวน</label><input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} /></div>
                    <div><label>ราคาทุน (บาท)</label><input type="number" value={costPrice} onChange={(e) => setCostPrice(Number(e.target.value))} /></div>
                    <div><label>ราคาขาย (บาท)</label><input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} /></div>
                    <div className="col-span-2 border-t border-slate-100 pt-3 mt-1">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">ข้อมูลลูกค้า (ถ้ามี)</p>
                    </div>
                    <div className="col-span-2"><label>ชื่อลูกค้า</label><input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} /></div>
                    <div><label>เบอร์โทร</label><input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} /></div>
                    <div><label>ที่อยู่</label><input type="text" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} /></div>
                    <div className="col-span-2"><label>หมายเหตุ</label><input type="text" value={remark} onChange={(e) => setRemark(e.target.value)} /></div>
                    <div className="col-span-2 pt-1">
                        <button className="btn-save w-full justify-center" onClick={handleSave}>
                            <i className="fas fa-check"></i> บันทึกรายการ
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
