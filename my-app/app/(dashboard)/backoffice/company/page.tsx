"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "@/app/_services/api/client";
import { getErrorMessage } from "@/app/_lib/utils/error";

export default function Page() {
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [taxCode, setTaxCode] = useState("");

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const res = await api.get("/v1/company");
            if (res.data) {
                setName(res.data.name || "");
                setAddress(res.data.address || "");
                setPhone(res.data.phone || "");
                setEmail(res.data.email || "");
                setTaxCode(res.data.taxCode || "");
            }
        } catch (error) {
            console.error('Error fetching company data:', error);
        }
    };

    const handleSave = async () => {
        try {
            await api.post("/v1/company", { name, address, phone, email, taxCode });
            Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1500, showConfirmButton: false });
        } catch (error) {
            console.error('Error saving company data:', error);
            const errorMessage = getErrorMessage(error);
            Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: errorMessage, timer: 2000 });
        }
    };

    const fields = [
        { label: "ชื่อร้าน", icon: "fa-store", value: name, setter: setName, placeholder: "Mobile Store" },
        { label: "ที่อยู่", icon: "fa-location-dot", value: address, setter: setAddress, placeholder: "123 ถนน..." },
        { label: "เบอร์โทรศัพท์", icon: "fa-phone", value: phone, setter: setPhone, placeholder: "0xx-xxx-xxxx" },
        { label: "อีเมล", icon: "fa-envelope", value: email, setter: setEmail, placeholder: "store@example.com" },
        { label: "เลขที่ผู้เสียภาษี", icon: "fa-file-invoice", value: taxCode, setter: setTaxCode, placeholder: "0-0000-00000-00-0" },
    ];

    return (
        <div>
            <h1 className="container-header">
                <i className="fas fa-building text-teal-500"></i> ข้อมูลร้านค้า
            </h1>

            <div className="max-w-xl">
                {/* Store avatar */}
                <div className="flex items-center gap-4 p-5 bg-linear-to-r from-teal-50 to-white border border-teal-100 rounded-2xl mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                        style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}>
                        📱
                    </div>
                    <div>
                        <p className="font-bold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>{name || "ชื่อร้านของคุณ"}</p>
                        <p className="text-slate-400 text-sm mt-0.5">{phone || "เบอร์โทรศัพท์"}</p>
                    </div>
                </div>

                {/* Form fields */}
                <div className="space-y-1">
                    {fields.map((f, i) => (
                        <div key={i}>
                            <label className="flex items-center gap-2">
                                <i className={`fas ${f.icon} text-teal-500 text-[11px]`}></i>
                                {f.label}
                            </label>
                            <input
                                type="text"
                                value={f.value}
                                onChange={(e) => f.setter(e.target.value)}
                                placeholder={f.placeholder}
                            />
                        </div>
                    ))}
                </div>

                <button className="btn-save w-full justify-center mt-2" onClick={handleSave}>
                    <i className="fas fa-check"></i> บันทึกข้อมูลร้านค้า
                </button>
            </div>
        </div>
    );
}
