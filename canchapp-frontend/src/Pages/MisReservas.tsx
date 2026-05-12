/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import Barra_de_navegacion from '../Components/Barra_navegacion';
import { obtenerMisReservas } from '../services/reservaService';
import { Calendar, Clock, CheckCircle2, AlertCircle, Trash2, MapPin } from 'lucide-react';

export default function MisReservas() {
    const [reservas, setReservas] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarDatos = async () => {
            const token = sessionStorage.getItem('token');
            if (!token) return;

            try {
                // 1. Decodificar el ID del usuario desde el token (usando userId según tu consola)
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userId = payload.userId;

                if (userId) {
                    const data = await obtenerMisReservas(userId);
                            
                    setReservas(data);
                    console.log("Reservas obtenidas para la UI:", data);
                }
            } catch (error) {
                console.error("Error al cargar reservas:", error);
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
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
                        {reservas.map((reserva) => (
                            <div key={reserva.reservaId} className="bg-[#03292e] text-white rounded-[2.5rem] p-7 shadow-xl relative overflow-hidden flex flex-col h-full border border-white/5 group">
                                
                                {/* Badge de Estado Dinámico */}
                                <div className="flex justify-between items-start mb-6 z-10">
                    
                                    <span className="text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg bg-[#0ed1e8] text-[#03292e] shadow-[#0ed1e8]/20">
                                        Confirmada
                                    </span>
                                    <CheckCircle2 className="text-[#0ed1e8] opacity-50 group-hover:opacity-100 transition-opacity" size={24} />
                                </div>

                                <div className="z-10 flex-1">
                                    {/* Ruta corregida: reserva.cancha.establecimiento.nombreEstablecimiento */}
                                    <h3 className="text-2xl font-black leading-tight mb-2 group-hover:text-[#0ed1e8] transition-colors">
                                        {reserva.cancha?.establecimiento?.nombreEstablecimiento || "Cancha Deportiva"}
                                    </h3>
                                    <p className="text-[#0ed1e8] text-xs font-bold mb-4 opacity-70 tracking-widest uppercase">
                                        Cancha: {reserva.cancha?.codigo || 'N/A'}
                                    </p>
                                    
                                    <div className="space-y-3 text-sm font-medium opacity-80">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                                <Calendar size={16} className="text-[#0ed1e8]" />
                                            </div>
                                            {/* Ruta corregida: reserva.fecha */}
                                            <span>{reserva.fecha}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                                <Clock size={16} className="text-[#0ed1e8]" />
                                            </div>
                                            {/* Formateo de horas quitando segundos */}
                                            <span>{reserva.horaInicio?.substring(0,5)} - {reserva.horaFin?.substring(0,5)}</span>
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

                                {/* Footer de la tarjeta */}
                                <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center z-10">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider opacity-40 font-bold">Total Pagado</p>
                                        {/* Usamos precioTotal o el de la cancha como respaldo */}
                                        <p className="text-xl font-black text-white">
                                            ${formatCurrency(reserva.precioTotal || reserva.cancha?.precioPorHora || 0)}
                                        </p>
                                    </div>
                                    <button className="p-3 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-all text-white/30 cursor-not-allowed" title="Cancelar reserva (Próximamente)">
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                {/* Efecto decorativo de fondo */}
                                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#0ed1e8] opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}