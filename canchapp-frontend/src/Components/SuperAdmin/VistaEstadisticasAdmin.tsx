import { useState, useEffect } from 'react';
import { Users, MessageSquare, ShieldOff, UserCheck, Building2, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { listarUsuariosAdmin, listarComentariosAdmin } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

const COLORS = ['#0ed1e8', '#03292e', '#f59e0b', '#ef4444'];

export default function VistaEstadisticasAdmin() {
    const { toast } = useToast();
    const [cargando, setCargando] = useState(true);
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [comentarios, setComentarios] = useState<any[]>([]);

    useEffect(() => {
        const cargar = async () => {
            try {
                const [u, c] = await Promise.all([
                    listarUsuariosAdmin(),
                    listarComentariosAdmin(),
                ]);
                setUsuarios(u ?? []);
                setComentarios(c ?? []);
            } catch {
                toast('Error al cargar estadísticas.', 'error');
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, []);

    if (cargando) {
        return (
            <div className="flex justify-center py-24">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0ed1e8]" />
            </div>
        );
    }

    // ── Cálculos de usuarios ─────────────────────────────────────────────
    const totalUsuarios   = usuarios.length;
    const jugadores       = usuarios.filter(u => u.perfil?.nombre === 'Jugador').length;
    const propietarios    = usuarios.filter(u => u.perfil?.nombre === 'Propietario').length;
    const suspendidos     = usuarios.filter(u => u.estado === false || u.estado === 0).length;
    const activos         = totalUsuarios - suspendidos;

    const pieData = [
        { name: 'Jugadores',    value: jugadores },
        { name: 'Propietarios', value: propietarios },
        { name: 'Suspendidos',  value: suspendidos },
    ].filter(d => d.value > 0);

    const ultimosUsuarios = [...usuarios]
        .sort((a, b) => new Date(b.fechaCreacion ?? 0).getTime() - new Date(a.fechaCreacion ?? 0).getTime())
        .slice(0, 5);

    // ── Cálculos de comentarios ──────────────────────────────────────────
    const totalComentarios = comentarios.length;

    const conteoEstab: Record<string, number> = {};
    comentarios.forEach(c => {
        const nombre = c.nombreEstablecimiento ?? 'Sin nombre';
        conteoEstab[nombre] = (conteoEstab[nombre] ?? 0) + 1;
    });
    const topEstab = Object.entries(conteoEstab)
        .map(([nombre, total]) => ({ nombre, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 6);

    return (
        <div className="space-y-8">
            {/* Encabezado */}
            <div>
                <h2 className="text-2xl font-black text-[#03292e]">Estadísticas de la Plataforma</h2>
                <p className="text-sm text-gray-400 mt-1">Resumen global en tiempo real</p>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard icono={<Users size={22} />}   label="Usuarios totales"  valor={totalUsuarios}  color="bg-[#0ed1e8]/10 text-[#0ed1e8]" />
                <KpiCard icono={<UserCheck size={22} />} label="Activos"         valor={activos}        color="bg-green-50 text-green-600" />
                <KpiCard icono={<ShieldOff size={22} />} label="Suspendidos"     valor={suspendidos}    color="bg-red-50 text-red-500" />
                <KpiCard icono={<MessageSquare size={22} />} label="Comentarios" valor={totalComentarios} color="bg-amber-50 text-amber-600" />
            </div>

            {/* ── Fila: Pie + Top Establecimientos ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Distribución de usuarios */}
                <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={18} className="text-[#0ed1e8]" />
                        <h3 className="font-black text-[#03292e] text-sm">Distribución de usuarios</h3>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">
                        {jugadores} jugadores · {propietarios} propietarios
                    </p>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Legend iconType="circle" iconSize={10} />
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-gray-400 text-sm py-10">Sin datos</p>
                    )}
                </div>

                {/* Top establecimientos por comentarios */}
                <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Building2 size={18} className="text-[#0ed1e8]" />
                        <h3 className="font-black text-[#03292e] text-sm">Establecimientos con más comentarios</h3>
                    </div>
                    {topEstab.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={topEstab} layout="vertical" margin={{ left: 0, right: 16 }}>
                                <XAxis type="number" tick={{ fontSize: 11 }} />
                                <YAxis type="category" dataKey="nombre" width={120} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                                    {topEstab.map((_, i) => <Cell key={i} fill={i === 0 ? '#0ed1e8' : '#03292e'} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-gray-400 text-sm py-10">Sin comentarios aún</p>
                    )}
                </div>
            </div>

            {/* ── Últimos usuarios registrados ── */}
            <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6">
                <h3 className="font-black text-[#03292e] text-sm mb-4">Últimos usuarios registrados</h3>
                {ultimosUsuarios.length === 0 ? (
                    <p className="text-gray-400 text-sm">Sin datos</p>
                ) : (
                    <div className="space-y-3">
                        {ultimosUsuarios.map((u, i) => (
                            <div key={i} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-xl bg-[#0ed1e8]/20 flex items-center justify-center text-[#03292e] font-black text-sm shrink-0">
                                        {(u.nombre ?? u.nombreCompleto ?? '?')[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#03292e]">{u.nombre}</p>
                                        <p className="text-xs text-gray-400">{u.correo}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                        u.perfil?.nombre === 'Jugador'
                                            ? 'bg-[#0ed1e8]/10 text-[#0a6b75]'
                                            : 'bg-amber-50 text-amber-700'
                                    }`}>
                                        {u.perfil?.nombre ?? 'N/A'}
                                    </span>
                                    {u.estado === false && (
                                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-50 text-red-500">Suspendido</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function KpiCard({ icono, label, valor, color }: { icono: React.ReactNode; label: string; valor: number; color: string }) {
    return (
        <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl shrink-0 ${color}`}>{icono}</div>
            <div>
                <p className="text-2xl font-black text-[#03292e]">{valor}</p>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
            </div>
        </div>
    );
}
