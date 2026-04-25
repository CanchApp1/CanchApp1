import { LayoutDashboard, CalendarDays, MapPin, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarAdminProps {
    seccionActiva: string;
    onCambiarSeccion: (seccion: string) => void;
}

export default function SidebarAdmin({ seccionActiva, onCambiarSeccion }: SidebarAdminProps) {
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.clear();
        window.dispatchEvent(new Event("storage"));
        navigate('/Login');
    };

    const botones = [
        { id: 'inicio', label: 'Inicio', icono: LayoutDashboard },
        { id: 'reservas', label: 'Reservas', icono: CalendarDays },
        { id: 'canchas', label: 'Mi Cancha', icono: MapPin },
        { id: 'config', label: 'Configuración', icono: Settings },
    ];

    return (
        <div className="w-64 bg-[#03292e] min-h-screen text-white flex flex-col pt-4">
            <div className="p-6 border-b border-white/10 flex items-center gap-3 mb-4">
                <div className="bg-[#0ed1e8] p-2 rounded-xl text-[#03292e]">
                    <MapPin size={24} />
                </div>
                <h1 className="text-xl font-extrabold tracking-wide text-white">CanchApp</h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {botones.map((boton) => (
                    <button
                        key={boton.id}
                        onClick={() => onCambiarSeccion(boton.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${seccionActiva === boton.id
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
                <button onClick={handleLogout} className="w-full flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 px-4 py-3 rounded-xl font-medium transition-all">
                    <LogOut size={20} /> Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
