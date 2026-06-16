/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import Barra_de_navegacion from '../Components/Barra_navegacion';
import { obtenerMisReservas } from '../services/reservaService';
import { obtenerPagosPorUsuario } from '../services/pagoService';
import { getEstadoDisplay } from '../utils/reservaUtils';
import { useToast } from '../context/ToastContext';
import { SkeletonReservaCard } from '../Components/Dashboard/SkeletonCard';
import { Calendar, Clock, AlertCircle, MapPin, Clock3, CheckCircle2, CalendarDays } from 'lucide-react';


const formatHora = (hora: any) => {
    if (!hora) return "";
    if (typeof hora === 'string') return hora.slice(0, 5); 
    if (typeof hora === 'object') {
        
        const h = String(hora.hour ?? 0).padStart(2, '0');
        const m = String(hora.minute ?? 0).padStart(2, '0');
        return `${h}:${m}`;
    }
    return String(hora);
};

// Formateador estricto para dinero sin camuflajes artificiales
const formatCurrency = (value: any) => {
    if (value === undefined || value === null) return "0";
    return value.toLocaleString('es-CO');
};

export default function MisReservas() {
    const { toast } = useToast();
    const [reservas, setReservas] = useState<any[]>([]);
    const [pagos, setPagos] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            const token = sessionStorage.getItem('token');
            if (!token) return;
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userId = payload.userId;
                if (userId) {
                    const [dataReservas, dataPagos] = await Promise.all([
                        obtenerMisReservas(userId),
                        obtenerPagosPorUsuario(userId)
                    ]);
                    setReservas(dataReservas);
                    setPagos(dataPagos);
                }
            } catch {
                toast('No se pudieron cargar tus reservas. Intenta de nuevo.', 'error');
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, []);

    // 🛠️ Función limpia para renderizar el ícono correcto basado en el TEXTO del estado
    const renderIconoEstado = (estadoTexto: string) => {
        switch (estadoTexto) {
            case 'Confirmada': return <CheckCircle2 size={24} />;
            case 'Pendiente pago': return <Clock3 size={24} />;
            case 'Cancelada': return <AlertCircle size={24} />;
            case 'Jugada': return <CheckCircle2 size={24} />;
            case 'Hoy': return <CalendarDays size={24} />;
            default: return <AlertCircle size={24} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#021518] text-white font-sans antialiased selection:bg-[#0ed1e8] selection:text-[#03292e]">
            <Barra_de_navegacion />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
                {/* Cabecera Responsive */}
                <div className="mb-12 text-center sm:text-left">
                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                        Mis Reservas
                    </h1>
                    <p className="text-gray-400 text-sm mt-2 font-medium">
                        Historial completo y estados de tus canchas apartadas
                    </p>
                </div>

                {cargando ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => <SkeletonReservaCard key={i} />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reservas.map((reserva: any) => {
        
                            const estadoObjeto = getEstadoDisplay(reserva.estado, reserva.fecha);
                            
                        
                            const labelTexto: string = estadoObjeto?.label || 'Pendiente pago';
                            const clasesColorLabel: string = estadoObjeto?.colorDark || 'bg-white/5 text-gray-300';
                            
                            // Cruce con la base de datos de pagos reales
                            const pagoAsociado = pagos.find(
                                (p: any) => p.reservaId === reserva.reservaId || p.reserva?.reservaId === reserva.reservaId
                            );
                            const valorFinalPagado = pagoAsociado?.valorPago;

                            return (
                                <div 
                                    key={reserva.reservaId} 
                                    className="group relative bg-[#032429]/60 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl hover:border-[#0ed1e8]/30 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                                >
                                    {/* Contenido Principal */}
                                    <div className="z-10">
                                        {/* Badge de Estado Dinámico con Colores */}
                                        <div className="flex justify-between items-start mb-6">
                                            {/* Ícono dinámico pintado con el color del estado correspondiente */}
                                            <div className={`p-3 rounded-2xl bg-white/5 ${
                                                labelTexto === 'Confirmada' || labelTexto === 'Hoy' ? 'text-[#0ed1e8]' : 
                                                labelTexto === 'Cancelada' ? 'text-red-400' : 'text-orange-400'
                                            }`}>
                                                {renderIconoEstado(labelTexto)}
                                            </div>
                                            
                                            {/*El badge de texto usa las clases dinámicas que vienen de tu utils (colorDark) */}
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/5 ${clasesColorLabel}`}>
                                                {labelTexto}
                                            </span>
                                        </div>

                                        {/* Información del Partido */}
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-xl font-black tracking-tight text-white group-hover:text-[#0ed1e8] transition-colors">
                                                    {reserva.cancha?.establecimiento?.nombreEstablecimiento}
                                                </h3>
                                                <p className="text-xs text-gray-400 font-bold uppercase mt-1 tracking-wider">
                                                    Cancha: {reserva.cancha?.codigo}
                                                </p>
                                            </div>

                                            {/* Detalles: Fecha y Horas Corregidas */}
                                            <div className="space-y-2.5 bg-black/20 p-4 rounded-2xl border border-white/[0.02]">
                                                <div className="flex items-center gap-3 text-gray-300">
                                                    <Calendar size={16} className="text-[#0ed1e8]" />
                                                    <span className="text-xs font-semibold">{reserva.fecha}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-gray-300">
                                                    <Clock size={16} className="text-[#0ed1e8]" />
                                                    <span className="text-xs font-bold">
                                                        {formatHora(reserva.horaInicio)} - {formatHora(reserva.horaFin)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-gray-400 pt-1 border-t border-white/[0.03]">
                                                    <MapPin size={15} className="text-gray-500 shrink-0" />
                                                    <span className="text-xs truncate">
                                                        {reserva.cancha?.establecimiento?.direccion}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer: Visualización Estricta de la Data de Pago Real */}
                                    <div className="mt-8 pt-6 border-t border-white/10 z-10 flex flex-col gap-1">
                                        <p className="text-[10px] uppercase tracking-wider opacity-40 font-bold">Total Pagado</p>
                                        <p className="text-xl font-black text-white tracking-wide">
                                            {valorFinalPagado !== undefined && valorFinalPagado !== null 
                                                ? `$${formatCurrency(valorFinalPagado)} COP` 
                                                : '$0 COP'}
                                        </p>
                                    </div>

                                    {/* Efecto decorativo de fondo */}
                                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#0ed1e8] opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Grid Vacío */}
                {!cargando && reservas.length === 0 && (
                    <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-[#032429]/20">
                        <p className="text-4xl mb-4"></p>
                        <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">
                            No posees reservas registradas actualmente
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}