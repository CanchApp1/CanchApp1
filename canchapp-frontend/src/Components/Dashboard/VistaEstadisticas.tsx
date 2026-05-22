import { useMemo, useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { obtenerIngresosMes, obtenerIngresosMesAnterior } from '../../services/metricasService';
import { fechaLocal } from '../../utils/fecha';

interface Props {
    reservas: any[];
    loading: boolean;
}

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const COLORES_TOP = ['#0ed1e8', '#03292e', '#10b981', '#f59e0b', '#8b5cf6'];

export default function VistaEstadisticas({ reservas, loading }: Props) {
    const [ingresosMes, setIngresosMes] = useState(0);
    const [ingresosMesAnterior, setIngresosMesAnterior] = useState(0);
    const [loadingIngresos, setLoadingIngresos] = useState(true);

    useEffect(() => {
        Promise.all([obtenerIngresosMes(), obtenerIngresosMesAnterior()])
            .then(([mes, anterior]) => {
                setIngresosMes(mes);
                setIngresosMesAnterior(anterior);
            })
            .finally(() => setLoadingIngresos(false));
    }, []);

    const reservasActivas = useMemo(
        () => reservas.filter(r => r.estadoReserva !== 'CANCELADA'),
        [reservas]
    );

    // Tendencias: últimas 8 semanas
    const tendenciasSemanas = useMemo(() => {
        const hoy = new Date();
        return Array.from({ length: 8 }, (_, i) => {
            const lunes = new Date(hoy);
            lunes.setDate(hoy.getDate() - (hoy.getDay() === 0 ? 6 : hoy.getDay() - 1) - (7 - i) * 7);
            const domingo = new Date(lunes);
            domingo.setDate(lunes.getDate() + 6);
            const lunesStr = fechaLocal(lunes);
            const domingoStr = fechaLocal(domingo);
            const count = reservasActivas.filter(r => r.fecha >= lunesStr && r.fecha <= domingoStr).length;
            return { semana: `${lunes.getDate()}/${lunes.getMonth() + 1}`, reservas: count };
        });
    }, [reservasActivas]);

    // Ocupación por día de semana
    const ocupacionPorDia = useMemo(() => {
        const conteo: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
        for (const r of reservasActivas) {
            if (!r.fecha) continue;
            const dia = new Date(r.fecha + 'T12:00:00').getDay();
            conteo[dia]++;
        }
        return DIAS.map((nombre, i) => ({ dia: nombre, reservas: conteo[i] }));
    }, [reservasActivas]);

    // Horarios pico y valle
    const horariosPico = useMemo(() => {
        const conteo: Record<number, number> = {};
        for (const r of reservasActivas) {
            if (!r.horaInicio) continue;
            const hora = parseInt(r.horaInicio.split(':')[0]);
            conteo[hora] = (conteo[hora] ?? 0) + 1;
        }
        return Object.entries(conteo)
            .map(([h, count]) => ({ hora: `${h}:00`, reservas: count, horaNum: parseInt(h) }))
            .sort((a, b) => a.horaNum - b.horaNum);
    }, [reservasActivas]);

    // Top 5 clientes
    const topClientes = useMemo(() => {
        const mapa: Record<number, { nombre: string; reservas: number }> = {};
        for (const r of reservasActivas) {
            const uid = r.usuario?.idUsuario ?? r.usuario?.usuarioId;
            if (!uid) continue;
            if (!mapa[uid]) mapa[uid] = { nombre: r.usuario?.nombre ?? 'Sin nombre', reservas: 0 };
            mapa[uid].reservas++;
        }
        return Object.values(mapa).sort((a, b) => b.reservas - a.reservas).slice(0, 5);
    }, [reservasActivas]);

    // Comparación de ingresos
    const now = new Date();
    const mesActual = now.toLocaleString('es-CO', { month: 'long' });
    const mesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleString('es-CO', { month: 'long' });
    const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    const comparacion = [
        { mes: capitalizar(mesAnterior), ingresos: ingresosMesAnterior },
        { mes: capitalizar(mesActual), ingresos: ingresosMes },
    ];

    const crecimiento = ingresosMesAnterior > 0
        ? ((ingresosMes - ingresosMesAnterior) / ingresosMesAnterior) * 100
        : ingresosMes > 0 ? 100 : 0;

    const fmt = (v: number) => '$' + new Intl.NumberFormat('de-DE').format(Math.round(v));
    const maxHorario = Math.max(...horariosPico.map(h => h.reservas), 0);

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0ed1e8]" />
        </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-black text-[#03292e]">Estadísticas</h2>
                <p className="text-sm text-gray-400 mt-1">Análisis detallado de tu establecimiento</p>
            </div>

            {/* Comparación de ingresos */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-black text-[#03292e]">Comparación de Ingresos</h3>
                        <p className="text-xs text-gray-400 mt-1">{capitalizar(mesAnterior)} vs {capitalizar(mesActual)}</p>
                    </div>
                    {!loadingIngresos && (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-black ${
                            crecimiento > 0 ? 'bg-green-50 text-green-600' :
                            crecimiento < 0 ? 'bg-red-50 text-red-500' :
                            'bg-gray-50 text-gray-500'
                        }`}>
                            {crecimiento > 0 ? <TrendingUp size={16} /> :
                             crecimiento < 0 ? <TrendingDown size={16} /> :
                             <Minus size={16} />}
                            {crecimiento > 0 ? '+' : ''}{crecimiento.toFixed(1)}%
                        </div>
                    )}
                </div>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={comparacion} barCategoryGap="40%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis dataKey="mes" tick={{ fontSize: 13, fontWeight: 700 }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(v) => '$' + new Intl.NumberFormat('de-DE').format(v)} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v: any) => [fmt(Number(v)), 'Ingresos']} cursor={{ fill: '#f8f9fa' }} />
                        <Bar dataKey="ingresos" radius={[10, 10, 0, 0]}>
                            {comparacion.map((_, i) => (
                                <Cell key={i} fill={i === 1 ? '#0ed1e8' : '#03292e'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Tendencias de reservas */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <h3 className="text-lg font-black text-[#03292e] mb-1">Tendencias de Reservas</h3>
                <p className="text-xs text-gray-400 mb-6">Últimas 8 semanas (excluye canceladas)</p>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={tendenciasSemanas}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis dataKey="semana" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v: any) => [v, 'Reservas']} cursor={{ stroke: '#0ed1e8', strokeWidth: 1 }} />
                        <Line
                            type="monotone"
                            dataKey="reservas"
                            stroke="#0ed1e8"
                            strokeWidth={3}
                            dot={{ fill: '#03292e', r: 5, strokeWidth: 0 }}
                            activeDot={{ r: 7, fill: '#0ed1e8' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Ocupación por día + Horarios pico */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                    <h3 className="text-lg font-black text-[#03292e] mb-1">Ocupación por Día</h3>
                    <p className="text-xs text-gray-400 mb-6">Reservas por día de la semana</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={ocupacionPorDia}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="dia" tick={{ fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip formatter={(v: any) => [v, 'Reservas']} cursor={{ fill: '#f8f9fa' }} />
                            <Bar dataKey="reservas" fill="#03292e" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                    <h3 className="text-lg font-black text-[#03292e] mb-1">Horarios Pico y Valle</h3>
                    <p className="text-xs text-gray-400 mb-6">
                        <span className="inline-flex items-center gap-1">
                            <span className="w-3 h-3 rounded-sm bg-[#0ed1e8] inline-block" /> Pico
                        </span>
                        {' · '}
                        <span className="inline-flex items-center gap-1">
                            <span className="w-3 h-3 rounded-sm bg-[#e2e8f0] inline-block" /> Valle
                        </span>
                    </p>
                    {horariosPico.length === 0 ? (
                        <div className="flex items-center justify-center h-[160px] text-gray-400 text-sm">
                            Sin datos suficientes
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={horariosPico}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="hora" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip formatter={(v: any) => [v, 'Reservas']} cursor={{ fill: '#f8f9fa' }} />
                                <Bar dataKey="reservas" radius={[6, 6, 0, 0]}>
                                    {horariosPico.map((entry, i) => (
                                        <Cell
                                            key={i}
                                            fill={
                                                entry.reservas === maxHorario ? '#0ed1e8' :
                                                entry.reservas <= 1 ? '#e2e8f0' : '#03292e'
                                            }
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Top 5 clientes */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <h3 className="text-lg font-black text-[#03292e] mb-1">Clientes Más Frecuentes</h3>
                <p className="text-xs text-gray-400 mb-6">Top 5 por número de reservas</p>
                {topClientes.length === 0 ? (
                    <div className="flex items-center justify-center h-[180px] text-gray-400 text-sm">
                        Sin datos suficientes
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={Math.max(180, topClientes.length * 48)}>
                        <BarChart data={topClientes} layout="vertical" margin={{ left: 16 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis
                                dataKey="nombre"
                                type="category"
                                tick={{ fontSize: 12, fontWeight: 700 }}
                                width={120}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip formatter={(v: any) => [v, 'Reservas']} cursor={{ fill: '#f8f9fa' }} />
                            <Bar dataKey="reservas" radius={[0, 6, 6, 0]}>
                                {topClientes.map((_, i) => (
                                    <Cell key={i} fill={COLORES_TOP[i % COLORES_TOP.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
