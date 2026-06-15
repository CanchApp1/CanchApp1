import { useState } from 'react';
import { LayoutDashboard, CalendarDays, MapPin, Settings, LogOut, Clock, Users, BarChart2, MessageSquare, CreditCard, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarAdminProps {
    seccionActiva: string;
    onCambiarSeccion: (seccion: string) => void;
}

export default function SidebarAdmin({ seccionActiva, onCambiarSeccion }: SidebarAdminProps) {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        sessionStorage.clear();
        window.dispatchEvent(new Event("storage"));
        navigate('/Login');
    };

    const handleNavegar = (id: string) => {
        onCambiarSeccion(id);
        setMobileOpen(false);
    };

    const botones = [
        { id: 'inicio',        label: 'Inicio',        icono: LayoutDashboard },
        { id: 'estadisticas',  label: 'Estadísticas',  icono: BarChart2 },
        { id: 'reservas',      label: 'Reservas',      icono: CalendarDays },
        { id: 'jugadores',     label: 'Clientes',      icono: Users },
        { id: 'horarios',      label: 'Horarios',      icono: Clock },
        { id: 'canchas',       label: 'Mi Cancha',     icono: MapPin },
        { id: 'pagos',         label: 'Pagos',         icono: CreditCard },
        { id: 'comentarios',   label: 'Comentarios',   icono: MessageSquare },
        { id: 'config',        label: 'Configuración', icono: Settings },
    ];

    const SidebarContent = () => (
        <>
            <div className="p-6 border-b border-white/10 flex items-center gap-3 mb-4">
                <div className="bg-[#0ed1e8] p-2 rounded-xl text-[#03292e]">
                    <MapPin size={24} />
                </div>
                <h1 className="text-xl font-extrabold tracking-wide text-white">CanchApp</h1>
                {/* Cerrar en mobile */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="ml-auto p-1 text-white/50 hover:text-white transition-colors md:hidden"
                >
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {botones.map((boton) => (
                    <button
                        key={boton.id}
                        onClick={() => handleNavegar(boton.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                            seccionActiva === boton.id
                                ? 'bg-[#0ed1e8] text-[#03292e] shadow-lg shadow-[#0ed1e8]/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <boton.icono size={20} />
                        {boton.label}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 px-4 py-3 rounded-xl font-medium transition-all"
                >
                    <LogOut size={20} /> Cerrar Sesión
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Botón hamburger — solo visible en mobile cuando el sidebar está cerrado */}
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed top-4 left-4 z-40 p-2.5 bg-[#03292e] text-white rounded-xl shadow-lg md:hidden"
                aria-label="Abrir menú"
            >
                <Menu size={22} />
            </button>

            {/* Backdrop mobile */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar desktop — siempre visible */}
            <div className="hidden md:flex w-64 bg-[#03292e] min-h-screen text-white flex-col pt-4 shrink-0">
                <SidebarContent />
            </div>

            {/* Sidebar mobile — drawer deslizable */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-[#03292e] text-white flex flex-col pt-4
                transition-transform duration-300 ease-in-out md:hidden
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <SidebarContent />
            </div>
        </>
    );
}
