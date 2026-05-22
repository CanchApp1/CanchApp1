import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { fechaLocal } from '../../utils/fecha';
import ModalDetalleReserva from './ModalDetalleReserva';

interface Props {
    reservas: any[];
    pagos: any[];
    canchas: any[];
    loading: boolean;
    adminUserId: number;
}

const DIAS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const HORAS = Array.from({ length: 14 }, (_, i) => i + 8); // 08:00 a 21:00

const getLunesDe = (ref: Date): Date => {
    const d = new Date(ref);
    d.setHours(0, 0, 0, 0);
    const dia = d.getDay();
    d.setDate(d.getDate() - (dia === 0 ? 6 : dia - 1));
    return d;
};

const addDias = (base: Date, n: number): Date => {
    const d = new Date(base);
    d.setDate(d.getDate() + n);
    return d;
};

export default function VistaCalendario({ reservas, pagos, canchas, loading, adminUserId }: Props) {
    const [semanaRef, setSemanaRef] = useState(new Date());
    const [canchaId, setCanchaId] = useState<number | null>(canchas[0]?.canchaId ?? null);
    const [reservaDetalle, setReservaDetalle] = useState<any | null>(null);

    const lunes = useMemo(() => getLunesDe(semanaRef), [semanaRef]);
    const diasSemana = useMemo(() => Array.from({ length: 7 }, (_, i) => addDias(lunes, i)), [lunes]);

    const semanaLabel = useMemo(() => {
        const ini = fechaLocal(lunes);
        const fin = fechaLocal(addDias(lunes, 6));
        return `${ini} — ${fin}`;
    }, [lunes]);

    const hoy = fechaLocal();

    // Reservas de la semana para la cancha seleccionada (no canceladas)
    const reservasSemana = useMemo(() => {
        if (!canchaId) return [];
        const ini = fechaLocal(lunes);
        const fin = fechaLocal(addDias(lunes, 6));
        return reservas.filter(r =>
            r.fecha >= ini &&
            r.fecha <= fin &&
            r.estadoReserva !== 'CANCELADA' &&
            (r.cancha?.canchaId === canchaId || r.cancha?.id === canchaId)
        );
    }, [reservas, canchaId, lunes]);

    const getReservaEnSlot = (dia: Date, hora: number) => {
        const fechaStr = fechaLocal(dia);
        return reservasSemana.find(r => {
            const h1 = parseInt(r.horaInicio?.split(':')[0] ?? '0');
            const h2 = parseInt(r.horaFin?.split(':')[0] ?? '0');
            return r.fecha === fechaStr && h1 <= hora && h2 > hora;
        });
    };

    // Métricas de ocupación calculadas desde las reservas
    const calcularOcupacion = (desde: Date, hasta: Date): number => {
        const dStr = fechaLocal(desde);
        const hStr = fechaLocal(hasta);
        const enRango = reservas.filter(r =>
            r.fecha >= dStr && r.fecha <= hStr && r.estadoReserva !== 'CANCELADA'
        );
        const dias = Math.round((hasta.getTime() - desde.getTime()) / 86400000) + 1;
        const totalHoras = canchas.length * dias * HORAS.length;
        const reservadas = enRango.reduce((sum, r) => {
            const h1 = parseInt(r.horaInicio?.split(':')[0] ?? '0');
            const h2 = parseInt(r.horaFin?.split(':')[0] ?? '0');
            return sum + Math.max(0, h2 - h1);
        }, 0);
        return totalHoras > 0 ? Math.min(100, Math.round((reservadas / totalHoras) * 100)) : 0;
    };

    const hoyDate = new Date(); hoyDate.setHours(0, 0, 0, 0);
    const lunesMes = new Date(hoyDate.getFullYear(), hoyDate.getMonth(), 1);
    const finMes = new Date(hoyDate.getFullYear(), hoyDate.getMonth() + 1, 0);
    const lunesSemana = getLunesDe(hoyDate);

    const ocHoy = calcularOcupacion(hoyDate, hoyDate);
    const ocSemana = calcularOcupacion(lunesSemana, addDias(lunesSemana, 6));
    const ocMes = calcularOcupacion(lunesMes, finMes);

    const OcupBar = ({ pct, label }: { pct: number; label: string }) => (
        <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>{label}</span><span className="text-[#03292e]">{pct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#0ed1e8] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );

    const getPago = (res: any) => {
        const id = res.reservaId ?? res.idReserva;
        return pagos.find(p => p.reservaId === id) ?? null;
    };

    const esDeAdmin = (res: any) => {
        const uid = res.usuario?.usuarioId ?? res.usuario?.idUsuario ?? res.usuario?.id;
        return Number(uid) === adminUserId;
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0ed1e8]" />
        </div>
    );

    return (
        <div className="space-y-6">
            <ModalDetalleReserva
                visible={reservaDetalle !== null}
                reserva={reservaDetalle}
                pago={reservaDetalle ? getPago(reservaDetalle) : null}
                esDeAdmin={reservaDetalle ? esDeAdmin(reservaDetalle) : false}
                onCerrar={() => setReservaDetalle(null)}
                onEditar={() => {}}
                onCancelar={async () => {}}
            />

            {/* Métricas de ocupación */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <h3 className="text-lg font-black text-[#03292e] mb-4">Ocupación del establecimiento</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <OcupBar pct={ocHoy} label="Hoy" />
                    <OcupBar pct={ocSemana} label="Esta semana" />
                    <OcupBar pct={ocMes} label="Este mes" />
                </div>
            </div>

            {/* Controles */}
            <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                {/* Selector de cancha */}
                <div className="flex gap-2 flex-wrap">
                    {canchas.map(c => (
                        <button key={c.canchaId}
                            onClick={() => setCanchaId(c.canchaId)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${canchaId === c.canchaId ? 'bg-[#03292e] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                            {c.codigo}
                        </button>
                    ))}
                </div>

                {/* Navegación semana */}
                <div className="flex items-center gap-3">
                    <button onClick={() => setSemanaRef(d => addDias(d, -7))}
                        className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all">
                        <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm font-bold text-[#03292e] min-w-[200px] text-center">{semanaLabel}</span>
                    <button onClick={() => setSemanaRef(d => addDias(d, 7))}
                        className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all">
                        <ChevronRight size={18} />
                    </button>
                    <button onClick={() => setSemanaRef(new Date())}
                        className="px-3 py-2 rounded-xl bg-[#0ed1e8]/10 text-[#03292e] text-xs font-bold hover:bg-[#0ed1e8]/20 transition-all">
                        Hoy
                    </button>
                </div>
            </div>

            {/* Grilla del calendario */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-auto">
                <div className="min-w-[640px]">
                    {/* Header días */}
                    <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
                        <div className="p-3" />
                        {diasSemana.map((dia, i) => {
                            const fechaStr = fechaLocal(dia);
                            const esHoy = fechaStr === hoy;
                            return (
                                <div key={i} className={`p-3 text-center border-l border-gray-50 ${esHoy ? 'bg-[#0ed1e8]/10' : ''}`}>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${esHoy ? 'text-[#0ed1e8]' : 'text-gray-400'}`}>{DIAS_ES[i]}</p>
                                    <p className={`text-base font-black ${esHoy ? 'text-[#03292e]' : 'text-gray-600'}`}>{dia.getDate()}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Filas de horas */}
                    {HORAS.map(hora => (
                        <div key={hora} className="grid border-b border-gray-50 last:border-0" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
                            <div className="p-2 text-[10px] font-bold text-gray-400 flex items-start pt-3 justify-end pr-3">
                                {String(hora).padStart(2, '0')}:00
                            </div>
                            {diasSemana.map((dia, i) => {
                                const reserva = getReservaEnSlot(dia, hora);
                                const fechaStr = fechaLocal(dia);
                                const esHoyCol = fechaStr === hoy;

                                return (
                                    <div key={i}
                                        onClick={() => reserva && setReservaDetalle(reserva)}
                                        className={`border-l border-gray-50 h-10 transition-all relative
                                            ${reserva
                                                ? 'bg-red-100 hover:bg-red-200 cursor-pointer'
                                                : `${esHoyCol ? 'bg-[#0ed1e8]/5' : 'bg-white'} hover:bg-green-50`
                                            }`}>
                                        {reserva && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Calendar size={12} className="text-red-400" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    {/* Leyenda */}
                    <div className="flex gap-4 p-4 border-t border-gray-100 justify-end">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                            <div className="w-4 h-4 bg-green-50 border border-green-100 rounded" /> Libre
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded" /> Reservado
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
