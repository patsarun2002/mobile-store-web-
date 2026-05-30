'use client';

interface ModalProps {
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
}

export default function Modal({ title, children, isOpen, onClose }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden flex flex-col max-h-[90vh] modal-animate-in"
                style={{ boxShadow: '0 25px 60px -12px rgba(13, 148, 136, 0.25), 0 0 0 1px rgba(13, 148, 136, 0.08)' }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-4 shrink-0"
                    style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' }}
                >
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                            <i className="fas fa-pen text-white text-xs"></i>
                        </div>
                        <h2 className="text-white font-semibold text-base" style={{ fontFamily: 'Syne, sans-serif' }}>
                            {title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 bg-white/15 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-all"
                    >
                        <i className="fas fa-xmark text-sm"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 overflow-y-auto flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}
