'use client';

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Swal from "sweetalert2";
import axios from "axios";
import { appConfig } from "@/app/_lib/config/app.config";
import Link from "next/link";
import Modal from "./Modal";
import Cookies from 'js-cookie';

export default function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [name, setName] = useState("");
    const [level, setLevel] = useState("");
    const [isOpenModal, setisOpenModal] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmpassword, setConfirmPassword] = useState("");

    const toggleSidebar = () => setIsExpanded(!isExpanded);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        fatchData();
        // Close mobile menu on route change
        setIsMobileOpen(false);
    }, [pathname]);

    // Close mobile sidebar when clicking outside
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setIsMobileOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fatchData = async () => {
        try {
            const token = Cookies.get("token");
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.get(`${appConfig.apiUrl}/v1/users/me`, { headers });
            if (res.data) {
                setName(res.data.name);
                setUsername(res.data.username);
                setLevel(res.data.level);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const handleLogout = () => {
        Cookies.remove("token");
        Swal.fire({
            icon: "success",
            title: "ออกจากระบบแล้ว",
            timer: 1200,
            showConfirmButton: false,
        });
        router.push("/");
    };

    const handleSave = async () => {
        if (password !== confirmpassword) {
            Swal.fire({ icon: "error", title: "รหัสผ่านไม่ตรงกัน", timer: 2000 });
            return;
        }
        try {
            const token = Cookies.get("token");
            const headers = { Authorization: `Bearer ${token}` };
            await axios.put(`${appConfig.apiUrl}/v1/users/me`,
                { name, username, password: password || "", level },
                { headers }
            );
            Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1500, showConfirmButton: false });
            fatchData();
            setisOpenModal(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", timer: 2000 });
        }
    };

    const menuItems = [
        { href: "/backoffice/dashboard", icon: "fa-chart-pie", label: "Dashboard" },
        { href: "/backoffice/buy", icon: "fa-box-open", label: "ซื้อสินค้า" },
        { href: "/backoffice/sell", icon: "fa-cash-register", label: "ขายสินค้า" },
        { href: "/backoffice/repair", icon: "fa-screwdriver-wrench", label: "รับซ่อม" },
        { href: "/backoffice/company", icon: "fa-building", label: "ข้อมูลร้าน" },
        { href: "/backoffice/user", icon: "fa-users-gear", label: "ผู้ใช้งาน" },
    ];

    const SidebarContent = () => (
        <div className={`flex flex-col h-full transition-all duration-300 ${isExpanded ? 'w-64' : 'w-20'}`}>
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
                <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center text-lg shrink-0">
                    📱
                </div>
                {isExpanded && (
                    <div className="min-w-0">
                        <div className="font-display font-700 text-white text-base leading-tight truncate">Mobile Store</div>
                        <div className="text-white/50 text-xs">Management</div>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-3 overflow-y-auto scrollbar-hide space-y-1">
                {isExpanded && (
                    <div className="text-white/30 text-[10px] font-semibold uppercase tracking-widest px-3 pb-1 pt-2">เมนูหลัก</div>
                )}
                {menuItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group
                                ${active
                                    ? 'bg-white text-teal-700 shadow-md font-semibold'
                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                                }
                                ${!isExpanded && 'justify-center'}
                            `}
                                title={!isExpanded ? item.label : ""}
                            >
                                <i className={`fas ${item.icon} text-base ${active ? 'text-teal-600' : ''}`}></i>
                                {isExpanded && <span className="text-sm">{item.label}</span>}
                                {isExpanded && active && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>
            {/* Bottom user bar */}
            <div className={`border-t border-white/15 px-3 py-3 flex items-center shrink-0 ${isExpanded ? 'gap-2.5' : 'justify-center'}`}>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <i className="fas fa-user text-white text-sm"></i>
                </div>
                {isExpanded && (
                    <>
                        <div className="flex-1 min-w-0">
                            <div className="text-white text-xs font-semibold truncate">{name || "ผู้ใช้งาน"}</div>
                            <div className="text-white/50 text-[10px] uppercase tracking-wide">{level || "user"}</div>
                        </div>
                        <button
                            onClick={() => setisOpenModal(true)}
                            className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all shrink-0"
                            title="แก้ไขโปรไฟล์"
                        >
                            <i className="fas fa-pen text-[11px]"></i>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-300 hover:text-white transition-all shrink-0"
                            title="ออกจากระบบ"
                        >
                            <i className="fas fa-arrow-right-from-bracket text-[11px]"></i>
                        </button>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile hamburger */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-teal-600 text-white rounded-xl shadow-lg flex items-center justify-center"
            >
                <i className="fas fa-bars text-sm"></i>
            </button>

            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Mobile drawer */}
            <div className={`md:hidden fixed top-0 left-0 h-full z-50 transition-transform duration-300
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
                style={{ background: 'linear-gradient(160deg, #0d9488 0%, #0f766e 40%, #134e4a 100%)' }}
            >
                <div className="w-72 h-full">
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="absolute top-4 right-4 w-8 h-8 bg-white/15 hover:bg-white/25 rounded-lg flex items-center justify-center text-white transition-all"
                    >
                        <i className="fas fa-xmark text-sm"></i>
                    </button>
                    <div style={{ width: '18rem' }}>
                        <SidebarContent />
                    </div>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div
                className="hidden md:flex flex-col h-screen sticky top-0 shrink-0 transition-all duration-300"
                style={{
                    background: 'linear-gradient(160deg, #0d9488 0%, #0f766e 40%, #134e4a 100%)',
                    width: isExpanded ? '16rem' : '5rem'
                }}
            >
                <SidebarContent />
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-6 w-6 h-6 bg-teal-600 hover:bg-teal-500 border-2 border-white rounded-full flex items-center justify-center text-white shadow-md transition-all z-10"                >
                    <i className={`fas fa-angles-${isExpanded ? 'left' : 'right'} text-[10px]`}></i>
                </button>
            </div>

            {/* Edit profile modal */}
            <Modal title="แก้ไขข้อมูลผู้ใช้งาน" isOpen={isOpenModal} onClose={() => setisOpenModal(false)}>
                <div className="space-y-1">
                    <label>ชื่อ</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    <label>Username</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <label>รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)</label>
                    <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                    <label>ยืนยันรหัสผ่าน</label>
                    <input type="password" onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
                    <div className="pt-2">
                        <button className="btn-save w-full justify-center" onClick={handleSave}>
                            <i className="fas fa-check"></i> บันทึกข้อมูล
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
