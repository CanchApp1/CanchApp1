import { Users, MessageSquare, LogOut, ShieldCheck, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
    seccionActiva: string;
    onCambiarSeccion: (s: string) => void;
}

export default function SidebarSuperAdmin({ seccionActiva, onCambiarSeccion }: Props) {
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.clear();
        window.dispatchEvent(new Event('storage'));
        navigate('/Login');
    };

    const botones = [
        { id: 'estadisticas', label: 'Estadísticas', icono: BarChart2 },
        { id: 'usuarios',     label: 'Usuarios',     icono: Users },
        { id: 'comentarios',  label: 'Comentarios',  icono: MessageSquare },
    ];

    return (
        <div className="w-64 bg-[#03292e] min-h-screen text-white flex flex-col pt-4 shrink-0">
            <div className="p-6 border-b border-white/10 flex items-center gap-3 mb-4">
                <div className="bg-[#0ed1e8] p-2 rounded-xl text-[#03292e]">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h1 className="text-lg font-extrabold tracking-wide text-white leading-tight">CanchApp</h1>
                    <p className="text-[10px] font-bold text-[#0ed1e8] uppercase tracking-widest">Super Admin</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {botones.map((b) => (
                    <button
                        key={b.id}
                        onClick={() => onCambiarSeccion(b.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                            seccionActiva === b.id
                                ? 'bg-[#0ed1e8] text-[#03292e] shadow-lg shadow-[#0ed1e8]/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <b.icono size={20} />
                        {b.label}
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
        </div>
    );
}
