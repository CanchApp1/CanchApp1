import { useMemo, useState } from 'react';
import { CreditCard, DollarSign, Clock, Download, Filter, TrendingUp } from 'lucide-react';
import { fechaLocal } from '../../utils/fecha';

interface Props {
    reservas: any[];
    pagos: any[];
    loading: boolean;
}

const FILTROS_TIEMPO = [
    { key: 'hoy',    label: 'Hoy' },
    { key: 'semana', label: 'Semana' },
    { key: 'mes',    label: 'Mes' },
    { key: 'todo',   label: 'Todo' },
];

const FILTROS_ESTADO = [
    { key: 'todos',     label: 'Todos' },
    { key: 'APROBADO',  label: 'Aprobado' },
    { key: 'PENDIENTE', label: 'Pendiente' },
    { key: 'RECHAZADO', label: 'Rechazado' },
];

const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
    APROBADO:  { label: 'Aprobado',  color: 'bg-green-50 text-green-600' },
    PENDIENTE: { label: 'Pendiente', color: 'bg-amber-50 text-amber-600' },
    RECHAZADO: { label: 'Rechazado', color: 'bg-red-50 text-red-500' },
    FALLIDO:   { label: 'Fallido',   color: 'bg-red-50 text-red-500' },
};

const fmt = (v: number) => '$' + new Intl.NumberFormat('de-DE').format(Math.round(v));

export default function VistaPagos({ reservas, pagos, loading }: Props) {
    const [filtroTiempo, setFiltroTiempo] = useState('mes');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const hoy = fechaLocal();

    const pagosEnriquecidos = useMemo(() =>
        pagos.map(p => ({
            ...p,
            reserva: reservas.find(r => (r.reservaId ?? r.idReserva) === p.reservaId),
        })),
        [pagos, reservas]
    );

    const reservasSinPago = useMemo(() => {
        const idsConPago = new Set(pagos.map(p => p.reservaId));
        return reservas.filter(r =>
            !idsConPago.has(r.reservaId ?? r.idReserva) &&
            r.estadoReserva !== 'CANCELADA'
        );
    }, [reservas, pagos]);

    const dentroDeRango = (fecha: string) => {
        if (!fecha) return filtroTiempo === 'todo';
        const d = new Date(fecha + 'T00:00:00');
        const ahora = new Date();
        if (filtroTiempo === 'hoy')    return fecha === hoy;
        if (filtroTiempo === 'semana') { const h7 = new Date(ahora); h7.setDate(ahora.getDate() - 7); return d >= h7; }
        if (filtroTiempo === 'mes')    return d.getMonth() === ahora.getMonth() && d.getFullYear() === ahora.getFullYear();
        return true;
    };

    const pagosFiltrados = useMemo(() =>
        pagosEnriquecidos.filter(p =>
            dentroDeRango(p.reserva?.fecha ?? '') &&
            (filtroEstado === 'todos' || p.estadoPago === filtroEstado)
        ),
        [pagosEnriquecidos, filtroTiempo, filtroEstado]
    );

    const totalCobrado     = useMemo(() => pagosFiltrados.filter(p => p.estadoPago === 'APROBADO').reduce((s, p) => s + (p.valorPago ?? 0), 0), [pagosFiltrados]);
    const totalPendientes  = useMemo(() => pagosFiltrados.filter(p => p.estadoPago === 'PENDIENTE').length, [pagosFiltrados]);

    const exportarCSV = () => {
        const headers = ['Fecha', 'Jugador', 'Cancha', 'Valor', 'Estado', 'Hora Pago'];
        const filas = pagosFiltrados.map(p => [
            p.reserva?.fecha ?? '—',
            p.reserva?.usuario?.nombre ?? '—',
            p.reserva?.cancha?.codigo ?? '—',
            p.valorPago ?? 0,
            p.estadoPago ?? '—',
            p.horaPago?.slice(0, 5) ?? '—',
        ]);
        const csv = [headers, ...filas].map(r => r.join(',')).join('\n');
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pagos_${hoy}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="h-8 w-32 bg-gray-100 rounded-2xl animate-pulse" />
                <div className="h-10 w-36 bg-gray-100 rounded-2xl animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
            <div className="h-16 bg-gray-100 rounded-[2rem] animate-pulse" />
            {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-[1.5rem] animate-pulse" />)}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-[#03292e]">Pagos</h2>
                    <p className="text-sm text-gray-400 mt-1">Historial de cobros de tu establecimiento</p>
                </div>
                <button
                    onClick={exportarCSV}
                    disabled={pagosFiltrados.length === 0}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#03292e] text-white text-sm font-bold rounded-2xl hover:bg-[#0ed1e8] hover:text-[#03292e] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Download size={16} /> Exportar CSV
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign size={16} className="text-green-500" />
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total cobrado</p>
                    </div>
                    <p className="text-2xl font-black text-[#03292e]">{fmt(totalCobrado)}</p>
                    <p className="text-xs text-gray-400 mt-1 font-medium">pagos aprobados</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-[#0ed1e8]">
                    <div className="flex items-center gap-2 mb-2">
                        <CreditCard size={16} className="text-[#0ed1e8]" />
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Transacciones</p>
                    </div>
                    <p className="text-2xl font-black text-[#03292e]">{pagosFiltrados.length}</p>
                    <p className="text-xs text-gray-400 mt-1 font-medium">en el período</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-amber-400">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} className="text-amber-400" />
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pendientes</p>
                    </div>
                    <p className="text-2xl font-black text-[#03292e]">{totalPendientes}</p>
                    <p className="text-xs text-gray-400 mt-1 font-medium">por confirmar</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter size={14} className="text-gray-400 shrink-0" />
                    {FILTROS_TIEMPO.map(f => (
                        <button key={f.key} onClick={() => setFiltroTiempo(f.key)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filtroTiempo === f.key ? 'bg-[#03292e] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                            {f.label}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                    {FILTROS_ESTADO.map(f => (
                        <button key={f.key} onClick={() => setFiltroEstado(f.key)}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${filtroEstado === f.key ? 'bg-[#0ed1e8] text-[#03292e]' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lista de pagos */}
            {pagosFiltrados.length > 0 ? (
                <div className="flex flex-col gap-3">
                    {pagosFiltrados.map((p, i) => {
                        const cfg = ESTADO_CONFIG[p.estadoPago] ?? { label: p.estadoPago ?? '—', color: 'bg-gray-50 text-gray-500' };
                        return (
                            <div key={p.pagoId ?? i} className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-11 w-11 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
                                        <CreditCard size={18} className="text-green-500" />
                                    </div>
                                    <div>
                                        <p className="font-black text-[#03292e] text-sm">{p.reserva?.usuario?.nombre ?? 'Cliente'}</p>
                                        <p className="text-xs text-gray-400 font-medium">
                                            {p.reserva?.cancha?.codigo ?? '—'} · {p.reserva?.fecha ?? '—'}
                                            {p.horaPago && <> · {p.horaPago.slice(0, 5)}</>}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 ml-auto sm:ml-0">
                                    <p className="text-lg font-black text-[#03292e]">{fmt(p.valorPago ?? 0)}</p>
                                    <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase ${cfg.color}`}>
                                        {cfg.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                    <TrendingUp className="mx-auto text-gray-300 mb-3" size={40} />
                    <p className="text-gray-500 font-bold">Sin pagos en este período</p>
                    <p className="text-gray-400 text-sm mt-1">Prueba cambiando el filtro de tiempo.</p>
                </div>
            )}

            {/* Reservas sin pago */}
            {reservasSinPago.length > 0 && filtroEstado === 'todos' && (
                <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-6">
                    <h3 className="font-black text-amber-700 mb-3 flex items-center gap-2">
                        <Clock size={16} />
                        {reservasSinPago.length} reserva{reservasSinPago.length > 1 ? 's' : ''} sin pago registrado
                    </h3>
                    <div className="flex flex-col gap-2">
                        {reservasSinPago.slice(0, 5).map((r, i) => (
                            <div key={r.reservaId ?? r.idReserva ?? i} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-2xl px-4 py-3 gap-2">
                                <p className="text-sm font-bold text-[#03292e]">
                                    {r.usuario?.nombre ?? 'Cliente'} · {r.cancha?.codigo ?? '—'} · {r.fecha}
                                </p>
                                <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full w-fit">
                                    Sin pago
                                </span>
                            </div>
                        ))}
                        {reservasSinPago.length > 5 && (
                            <p className="text-xs text-amber-600 font-bold text-center mt-1">
                                +{reservasSinPago.length - 5} más sin pago
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
