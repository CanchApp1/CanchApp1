import { useState, useMemo } from 'react';
import { Search, Filter, Calendar, User, Clock, CheckCircle2 } from 'lucide-react';

interface Props {
    reservas: any[];
    loading: boolean;
}

export default function VistaReservasEstablecimiento({ reservas, loading }: Props) {
    const [busqueda, setBusqueda] = useState('');
    const [filtroTiempo, setFiltroTiempo] = useState('todas'); // hoy, semana, mes, todas

    const reservasFiltradas = useMemo(() => {
        return reservas.filter(res => {
            // Filtro de búsqueda (Nombre cliente o código cancha)
            const matchBusqueda = 
                res.usuario?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                res.cancha?.codigo?.toLowerCase().includes(busqueda.toLowerCase());

            // Filtro de tiempo básico
            const fechaReserva = new Date(res.fecha);
            const hoy = new Date();
            let matchTiempo = true;

            if (filtroTiempo === 'hoy') {
                matchTiempo = fechaReserva.toDateString() === hoy.toDateString();
            } else if (filtroTiempo === 'semana') {
                const haceUnaSemana = new Date();
                haceUnaSemana.setDate(hoy.getDate() - 7);
                matchTiempo = fechaReserva >= haceUnaSemana;
            } else if (filtroTiempo === 'mes') {
                matchTiempo = fechaReserva.getMonth() === hoy.getMonth() && fechaReserva.getFullYear() === hoy.getFullYear();
            }

            return matchBusqueda && matchTiempo;
        });
    }, [reservas, busqueda, filtroTiempo]);

    return (
        <div className="space-y-6">
            {/* Header con Buscador y Filtros */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text"
                        placeholder="Buscar por cliente o cancha..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#0ed1e8] transition-all text-sm"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <Filter size={16} className="text-gray-400 mr-2" />
                    {['todas', 'hoy', 'semana', 'mes'].map((tipo) => (
                        <button
                            key={tipo}
                            onClick={() => setFiltroTiempo(tipo)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                                filtroTiempo === tipo 
                                ? 'bg-[#03292e] text-white' 
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                        >
                            {tipo}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lista de Reservas */}
            {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0ed1e8]"></div></div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {reservasFiltradas.length > 0 ? (
                        reservasFiltradas.map((res: any, index: number) => (
                            <div key={res.reservaId || res.idReserva || index} className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-[#e6effc] rounded-2xl flex items-center justify-center text-[#03292e]">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-[#03292e]">{res.usuario?.nombre || 'Cliente Anónimo'}</h4>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">{res.cancha?.codigo} • {res.fecha}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-6 items-center">
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-[#0ed1e8]" />
                                        <span className="text-sm font-bold text-gray-600">{res.horaInicio} - {res.horaFin}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                                            res.estadoReserva === 'CONFIRMADA' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                        }`}>
                                            {res.estadoReserva}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                            <p className="text-gray-400 font-medium">No se encontraron reservas con esos filtros.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}