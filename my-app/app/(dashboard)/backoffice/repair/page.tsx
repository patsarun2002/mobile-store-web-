"use client";

import { useState, useEffect, } from "react";
import Swal from "sweetalert2";
import api from "@/app/_services/api/client";
import Modal from "../_components/Modal";
import dayjs from "dayjs";
import { getErrorMessage } from "@/app/_lib/utils/error";

export default function Page() {
    const [isOpenModal, setisOpenModal] = useState(false);
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [remark, setRemark] = useState('');
    const [id, setId] = useState('');
    const [repairs, setRepairs] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get("/v1/services");
            if (res.data && Array.isArray(res.data)) {
                setRepairs(res.data);
            }
        } catch (error: any) {
            console.error('Error fetching services:', error);
            const errorMessage = getErrorMessage(error);
            Swal.fire({
                icon: "error",
                title: "เกิดข้อผิดพลาด",
                text: errorMessage,
                timer: 2000,
            });
        }
    };

    const handleOpenModal = () => {
        setisOpenModal(true);
    };

    const handleCloseModal = () => {
        setisOpenModal(false);
    };

    const handleSave = async () => {
        try {
            const payload = {
                name: name,
                price: price,
                remark: remark,
            };

            if (id !== '') {
                await api.put(`/v1/services/${id}`, payload);
            } else {
                await api.post("/v1/services", payload);
            }
            Swal.fire({
                icon: "success",
                title: "บันทึกข้อมูลสำเร็จ",
                text: "ข้อมูลรายการซื้อได้ถูกบันทึกเรียบร้อยแล้ว",
                timer: 1500,
            });
            handleCloseModal();
            handleClear();
            fetchData();
        } catch (error) {
            const errorMessage = getErrorMessage(error);
            Swal.fire({
                icon: "error",
                title: "เกิดข้อผิดพลาด",
                text: errorMessage,
                timer: 2000,
            });
        }
    };

    const handleClear = () => {
        setName("");
        setPrice(0);
        setRemark("");
    }

    const handleDelete = async (id: number) => {
        try {
            const button = await Swal.fire({
                title: "คุณแน่ใจหรือไม่?",
                text: "คุณต้องการลบรายการนี้",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "ใช่",
                cancelButtonText: "ยกเลิก",
            })
            if (button.isConfirmed) {
                await api.delete(`/v1/services/${id}`);
                Swal.fire({
                    icon: "success",
                    title: "ลบข้อมูลสำเร็จ",
                    text: "ข้อมูลรายการซื้อได้ถูกลบเรียบร้อยแล้ว",
                    timer: 1500,
                });
                fetchData();
            }
        } catch (error: any) {
            const errorMessage = getErrorMessage(error);
            Swal.fire({
                icon: "error",
                title: "เกิดข้อผิดพลาด",
                text: errorMessage,
                timer: 2000,
            });
        }
    }

    const handleEdit = (id: number) => {
        const repair = repairs.find((repair: any) => repair.id === id) as any;
        if (repair) {
            setId(repair.id);
            setName(repair.name);
            setPrice(repair.price);
            setRemark(repair.remark);

            handleOpenModal();
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                <h1 className="container-header mb-0 border-none after:hidden">
                    <i className="fas fa-tools text-teal-500"></i> งานบริการ
                </h1>
                <button className="btn-plus" onClick={() => { handleOpenModal(); handleClear(); }}>
                    <i className="fas fa-plus text-xs"></i> เพิ่มงานบริการ
                </button>
            </div>

            <div className="overflow-y-auto max-h-[70vh] mt-4 rounded-md scrollbar-hide">
                <table>
                    <thead>
                        <tr>
                            <th>ชื่องานบริการ</th>
                            <th>ราคา</th>
                            <th>หมายเหตุ</th>
                            <th>วันที่ให้บริการ</th>
                            <th className="w-25 text-center">แก้ไข / ลบ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {repairs.map((repairs: any) => (
                            <tr key={repairs.id}>
                                <td>{repairs.name}</td>
                                <td>{repairs.price.toLocaleString()}</td>
                                <td>{repairs.remark || '-'}</td>
                                <td>{dayjs(repairs.payDate).format("DD/MM/YYYY")}</td>
                                <td className="text-center">
                                    <div className="flex justify-center space-x-2">
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleEdit(repairs.id)}
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(repairs.id)}
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                title="บันทึกงานบริการ"
                isOpen={isOpenModal}
                onClose={handleCloseModal}
            >
                <div>งานบริการ</div>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <div>ราคา</div>
                <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                />
                <div>หมายเหตุ</div>
                <input
                    type="text"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                />
                <div>
                    <button className="btn-save" onClick={handleSave}>
                        <i className="fas fa-save"></i>
                        บันทึก
                    </button>
                </div>
            </Modal>
        </div>
    );
}
