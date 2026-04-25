import { Clock } from 'lucide-react';

interface TimeSlotGridProps {
    horariosEstablecimiento: any[];
    horasDisponiblesBackend: string[];
    buscando: boolean;
    seleccionada: string | null;
    onSelect: (hora: string) => void;
    fechaSeleccionada: string;
}

export const TimeSlotGrid = ({
    horariosEstablecimiento,
    horasDisponiblesBackend,
    buscando,
    seleccionada,
    onSelect,
    fechaSeleccionada
}: TimeSlotGridProps) => {

    const generarTodosLosBloques = (horarios: any[]) => {
        if (!horarios || horarios.length === 0) return [];
        const h = horarios[0];
        if (h.cerradoTodoElDia) return [];
        const bloques = [];
        const inicio = parseInt(h.horaApertura.split(':')[0]);
        const fin = parseInt(h.horaCierre.split(':')[0]);
        for (let i = inicio; i < fin; i++) {
            bloques.push(`${i < 10 ? '0' + i : i}:00:00`);
        }
        return bloques;
    };

    const bloques = generarTodosLosBloques(horariosEstablecimiento);

    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-inner">
            <h3 className="text-[#03292e] font-bold mb-4 flex items-center gap-2">
                <Clock size={18} /> Selecciona una hora:
            </h3>

            {buscando ? (
                <div className="text-center py-4 text-gray-500 animate-pulse">Buscando turnos...</div>
            ) : (
                <div className="grid grid-cols-3 gap-3">
                    {bloques.map((hora) => {

                        // AÑADE ESTO PARA DEBUGEAR:
                        console.log("Servidor devolvió:", horasDisponiblesBackend);
                        console.log("Estamos buscando:", hora);

                        // Si el servidor devuelve "08:00" y tú buscas "08:00:00", no habrá match.
                        // Vamos a intentar una comparación más flexible:

                        const estaDisponibleBackend = (horasDisponiblesBackend || []).includes(hora);
                        // Lógica de hora pasada
                        const ahora = new Date();
                        const hoyStr = ahora.toISOString().split('T')[0];
                        const [h, m] = hora.split(':');
                        const horaBloque = new Date();
                        horaBloque.setHours(parseInt(h), parseInt(m), 0);

                        const esPasada = (fechaSeleccionada === hoyStr) && (horaBloque < ahora);
                        const puedeSeleccionar = estaDisponibleBackend && !esPasada;

                        return (
                            <button
                                key={hora}
                                disabled={!puedeSeleccionar}
                                onClick={() => onSelect(hora)}
                                className={`py-2 rounded-xl font-bold text-xs border-2 transition-all ${!puedeSeleccionar
                                    ? 'bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed'
                                    : seleccionada === hora
                                        ? 'bg-[#0ed1e8] border-[#0ed1e8] text-[#03292e] shadow-md scale-105'
                                        : 'bg-white border-gray-100 text-[#03292e] hover:border-[#0ed1e8]'
                                    }`}
                            >
                                {hora.substring(0, 5)}
                                {!puedeSeleccionar && (
                                    <span className="block text-[8px] opacity-60">
                                        {esPasada ? 'Pasado' : 'Ocupado'}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
