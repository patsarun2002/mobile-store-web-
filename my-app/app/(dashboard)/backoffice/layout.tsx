import Sidebar from "./_components/Sidebar";

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-slate-100">
            {/* Sidebar - sticky on desktop */}
            <Sidebar />

            {/* Main content */}
            <main className="flex-1 min-w-0 flex flex-col">
                <div className="flex-1 p-4 md:p-6 lg:p-8 pt-16 md:pt-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[calc(100vh-6rem)] p-5 md:p-7">
                            {children}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
