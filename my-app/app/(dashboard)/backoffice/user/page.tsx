"use client";

import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import api from "@/app/_services/api/client";
import Modal from "../_components/Modal";
import { getErrorMessage } from "@/app/_lib/utils/error";

export default function Page() {
    const [users, setUsers] = useState<any[]>([]);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [level, setLevel] = useState("user");
    const levelList = ["admin", "manager", "staff", "user"];

    const LEVEL_COLORS: Record<string, { bg: string; text: string }> = useMemo(() => ({
        admin: { bg: '#fff1f2', text: '#ef4444' },
        manager: { bg: '#fdf2f8', text: '#ec4899' },
        staff: { bg: '#eff6ff', text: '#3b82f6' },
        user: { bg: '#f0fdf4', text: '#22c55e' },
    }), []);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const res = await api.get("/v1/users");
            if (res.data && Array.isArray(res.data)) {
                setUsers(res.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleOpenNew = () => {
        setId(""); setName(""); setUsername(""); setPassword(""); setPasswordConfirm(""); setLevel("user");
        setIsOpenModal(true);
    };

    const handleSave = async () => {
        if (password !== passwordConfirm) {
            Swal.fire({ icon: "error", title: "รหัสผ่านไม่ตรงกัน", timer: 1500 });
            return;
        }
        try {
            const payload = { name, username, password, level };
            if (id === '') await api.post("/v1/users", payload);
            else { await api.put(`/v1/users/${id}`, payload); setId(""); }
            Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1200, showConfirmButton: false });
            fetchData();
            setIsOpenModal(false);
        } catch (error) {
            console.error('Error saving user:', error);
            const errorMessage = getErrorMessage(error);
            Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: errorMessage, timer: 2000 });
        }
    };

    const handleEdit = (uid: string) => {
        const u = users.find((x: any) => x.id === uid) as any;
        if (!u) return;
        setId(u.id); setName(u.name); setUsername(u.username); setPassword(''); setPasswordConfirm(''); setLevel(u.level);
        setIsOpenModal(true);
    };

    const handleDelete = async (uid: string) => {
        const r = await Swal.fire({ title: "ลบผู้ใช้นี้?", icon: "warning", showCancelButton: true, confirmButtonText: "ลบ", cancelButtonText: "ยกเลิก" });
        if (r.isConfirmed) {
            await api.delete(`/v1/users/${uid}`);
            fetchData();
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                <h1 className="container-header mb-0 border-none after:hidden">
                    <i className="fas fa-users-gear text-teal-500"></i> ผู้ใช้งาน
                </h1>
                <button className="btn-plus" onClick={handleOpenNew}>
                    <i className="fas fa-plus text-xs"></i> เพิ่มผู้ใช้
                </button>
            </div>

            <div className="overflow-auto max-h-[65vh] rounded-xl border border-slate-200 scrollbar-hide">
                <table style={{ marginTop: 0, borderRadius: 0, border: 'none' }}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>ชื่อ</th>
                            <th>Username</th>
                            <th>ระดับ</th>
                            <th className="text-center" style={{ width: 90 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(users as any[]).map((u, i) => {
                            const lc = LEVEL_COLORS[u.level] || { bg: '#f1f5f9', text: '#64748b' };
                            return (
                                <tr key={u.id}>
                                    <td className="text-slate-400 text-sm">{i + 1}</td>
                                    <td>
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                                                style={{ background: lc.bg, color: lc.text }}>
                                                {u.name?.[0]?.toUpperCase()}
                                            </div>
                                            <span className="font-medium text-slate-700">{u.name}</span>
                                        </div>
                                    </td>
                                    <td><code className="text-xs text-slate-500">{u.username}</code></td>
                                    <td>
                                        <span className="badge text-xs font-semibold px-2.5 py-1 rounded-lg"
                                            style={{ background: lc.bg, color: lc.text }}>
                                            {u.level}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button className="btn-edit" onClick={() => handleEdit(u.id)}><i className="fas fa-pen text-[10px]"></i></button>
                                            <button className="btn-delete" onClick={() => handleDelete(u.id)}><i className="fas fa-trash text-[10px]"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {users.length === 0 && (
                            <tr><td colSpan={5} className="text-center py-10 text-slate-300">
                                <i className="fas fa-users text-2xl mb-2 block opacity-30"></i>ยังไม่มีผู้ใช้งาน
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal title={id ? "แก้ไขผู้ใช้งาน" : "เพิ่มผู้ใช้งาน"} isOpen={isOpenModal} onClose={() => setIsOpenModal(false)}>
                <div>
                    <label>ชื่อ-นามสกุล</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อผู้ใช้งาน" />
                    <label>Username</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
                    <label>{id ? 'รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)' : 'Password'}</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                    <label>ยืนยัน Password</label>
                    <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="••••••••" />
                    <label>ระดับผู้ใช้งาน</label>
                    <select value={level} onChange={(e) => setLevel(e.target.value)}>
                        {levelList.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <div className="pt-2">
                        <button className="btn-save w-full justify-center" onClick={handleSave}>
                            <i className="fas fa-check"></i> บันทึก
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
