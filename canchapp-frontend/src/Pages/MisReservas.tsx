/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import Barra_de_navegacion from '../Components/Barra_navegacion';
import { obtenerMisReservas } from '../services/reservaService';
import { getEstadoDisplay } from '../utils/reservaUtils';
import { Calendar, Clock, AlertCircle, MapPin, Clock3, CheckCircle2, CalendarDays } from 'lucide-react';

const ICONO_LABEL: Record<string, React.ReactElement> = {
    'Confirmada': <CheckCircle2 size={24} />,
    'Pendiente pago': <Clock3 size={24} />,
    'Cancelada': <AlertCircle size={24} />,
    'Jugada': <CheckCircle2 size={24} />,
    'Hoy': <CalendarDays size={24} />,
};

export default function MisReservas() {
    const [reservas, setReservas] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            const token = sessionStorage.getItem('token');
            if (!token) return;
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userId = payload.userId;
                if (userId) {
                    const data = await obtenerMisReservas(userId);
                    setReservas(data);
                }
            } catch (error) {
                console.error('Error al cargar reservas:', error);
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, []);

    const formatCurrency = (val: number) => new Intl.NumberFormat('de-DE').format(val);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Barra_de_navegacion />

            <main className="flex-1 p-6 md:p-12 max-w-6xl mx-auto w-full">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black text-[#03292e]">Mis Reservas</h1>
                        <p className="text-gray-500 mt-2">Historial completo de tus partidos.</p>
                    </div>
                    <div className="text-right hidden md:block">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Reservas</span>
                        <p className="text-2xl font-black text-[#0ed1e8]">{reservas.length}</p>
                    </div>
                </header>

                {cargando ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0ed1e8] border-t-transparent"></div>
                    </div>
                ) : reservas.length === 0 ? (
                    <div className="bg-white rounded-[3rem] p-20 text-center shadow-xl shadow-gray-200/50 border border-gray-100">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#03292e]">Aún no tienes reservas</h3>
                        <p className="text-gray-500 mt-2 max-w-xs mx-auto">Cuando realices tu primer pago, aparecerá aquí automáticamente.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reservas.map((reserva) => {
                            const id = reserva.reservaId ?? reserva.idReserva;
                            const estado = getEstadoDisplay(reserva.estadoReserva, reserva.fecha);

                            return (
                                <div key={id} className="bg-[#03292e] text-white rounded-[2.5rem] p-7 shadow-xl relative overflow-hidden flex flex-col h-full border border-white/5 group">

                                    {/* Badge de Estado */}
                                    <div className="flex justify-between items-start mb-6 z-10">
                                        <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg ${estado.colorDark}`}>
                                            {estado.label}
                                        </span>
                                        <span className={`opacity-50 group-hover:opacity-100 transition-opacity ${estado.colorDark.includes('text-[#03292e]') ? 'text-[#0ed1e8]' : 'text-white/50'}`}>
                                            {ICONO_LABEL[estado.label] ?? <CheckCircle2 size={24} />}
                                        </span>
                                    </div>

                                    <div className="z-10 flex-1">
                                        <h3 className="text-2xl font-black leading-tight mb-2 group-hover:text-[#0ed1e8] transition-colors">
                                            {reserva.cancha?.establecimiento?.nombreEstablecimiento || 'Cancha Deportiva'}
                                        </h3>
                                        <p className="text-[#0ed1e8] text-xs font-bold mb-4 opacity-70 tracking-widest uppercase">
                                            Cancha: {reserva.cancha?.codigo || 'N/A'}
                                        </p>

                                        <div className="space-y-3 text-sm font-medium opacity-80">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                                    <Calendar size={16} className="text-[#0ed1e8]" />
                                                </div>
                                                <span>{reserva.fecha}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                                    <Clock size={16} className="text-[#0ed1e8]" />
                                                </div>
                                                <span>{reserva.horaInicio?.substring(0, 5)} - {reserva.horaFin?.substring(0, 5)}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                                    <MapPin size={16} className="text-[#0ed1e8]" />
                                                </div>
                                                <span className="text-xs truncate">
                                                    {reserva.cancha?.establecimiento?.direccion || 'Ubicación'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-8 pt-6 border-t border-white/10 z-10">
                                        <p className="text-[10px] uppercase tracking-wider opacity-40 font-bold">Total Pagado</p>
                                        <p className="text-xl font-black text-white">
                                            ${formatCurrency(
                                                reserva.precioTotal ||
                                                (reserva.cancha?.precioPorHora ?? 0) * (reserva.duracionHoras || 1)
                                            )}
                                        </p>
                                    </div>

                                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#0ed1e8] opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
