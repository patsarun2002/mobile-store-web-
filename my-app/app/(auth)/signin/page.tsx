"use client";

import { useState } from "react";
import api from "@/app/_services/api/client";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
import { getErrorMessage } from "@/app/_lib/utils/error";

export default function SignIn() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignIn = async () => {
        if (!username || !password) {
            Swal.fire({ icon: 'warning', title: 'กรุณากรอกข้อมูลให้ครบถ้วน', timer: 1500 });
            return;
        }
        setLoading(true);
        try {
            const response = await api.post("/v1/auth/signin", { username, password });
            if (response.data.token) {
                Cookies.set('token', response.data.token);
                Swal.fire({ icon: 'success', title: 'เข้าสู่ระบบสำเร็จ', timer: 1200, showConfirmButton: false });
                setTimeout(() => router.push("/backoffice/dashboard"), 1200);
            } else {
                Swal.fire({ icon: 'warning', title: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', timer: 2000 });
            }
        } catch (error: any) {
            const errorMessage = getErrorMessage(error);
            Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: errorMessage, timer: 2000 });
        } finally {
            setLoading(false);
        }
    };

    const handleAutoFill = () => {
        setUsername("admin");
        setPassword("admin123");
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-linear-to-br from-teal-950 via-teal-900 to-teal-800">
            {/* Background decorations */}
            <div className="absolute top-[-10%] right-[-5%] w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.25) 0%, transparent 70%)' }}></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.2) 0%, transparent 70%)' }}></div>
            <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #5eead4 0%, transparent 70%)', transform: 'translateY(-50%)' }}></div>

            {/* Floating icons background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {['📱', '💻', '🔧', '📦', '💰'].map((icon, i) => (
                    <div key={i} className="absolute text-3xl opacity-5 select-none" style={{
                        top: `${15 + i * 17}%`,
                        left: `${5 + i * 18}%`,
                        transform: `rotate(${-15 + i * 8}deg)`,
                        fontSize: `${2 + (i % 3) * 0.5}rem`
                    }}>{icon}</div>
                ))}
            </div>

            <div className="relative w-full max-w-md mx-4">
                {/* Card */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-2xl" style={{ boxShadow: '0 30px 80px -10px rgba(0,0,0,0.4)' }}>
                    {/* Top gradient band */}
                    <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg, #0d9488, #14b8a6, #0d9488)' }}></div>

                    <div className="px-8 py-8">
                        {/* Logo */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}>
                                <span className="text-3xl">📱</span>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800 leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                                Mobile Store
                            </h1>
                            <p className="text-slate-400 text-sm mt-1">ระบบจัดการร้านมือถือ</p>
                        </div>

                        {/* Form */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-slate-600 text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                                    <i className="fas fa-user text-teal-500 text-xs"></i> Username
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                                        placeholder="กรอก username"
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all"
                                        style={{ marginBottom: 0, fontFamily: 'DM Sans, sans-serif' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-slate-600 text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                                    <i className="fas fa-lock text-teal-500 text-xs"></i> Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPass ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                                        placeholder="กรอก password"
                                        className="w-full px-4 py-3 pr-12 border-2 border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all"
                                        style={{ marginBottom: 0, fontFamily: 'DM Sans, sans-serif' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-500 transition-colors"
                                    >
                                        <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleAutoFill}
                                className="w-full py-2.5 rounded-xl text-teal-600 font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:bg-teal-50"
                                style={{
                                    fontFamily: 'DM Sans, sans-serif',
                                    border: '2px dashed #14b8a6'
                                }}
                            >
                                <i className="fas fa-magic"></i> กรอกข้อมูลทดสอบ (admin/admin123)
                            </button>

                            <button
                                onClick={handleSignIn}
                                disabled={loading}
                                className="w-full py-3 rounded-xl text-white font-semibold text-base transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                style={{
                                    background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                                    boxShadow: '0 4px 20px rgba(13,148,136,0.4)',
                                    fontFamily: 'Syne, sans-serif'
                                }}
                            >
                                {loading ? (
                                    <><i className="fas fa-spinner fa-spin"></i> กำลังเข้าสู่ระบบ...</>
                                ) : (
                                    <><i className="fas fa-arrow-right-to-bracket"></i> เข้าสู่ระบบ</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-center text-white/30 text-xs mt-5">© 2025 Mobile Store Management System</p>
            </div>
        </div>
    );
}
