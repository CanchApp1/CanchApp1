import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAvailability } from '../../hooks/useAvailability';
import { Calendar } from './Calendar';
import { TimeSlotGrid } from './Time';

interface ReservationModalProps {
    cancha: any;
    onClose: () => void;
}

export const ReservationModal = ({ cancha, onClose }: ReservationModalProps) => {
    const navigate = useNavigate();

    // Obtenemos el ID de la primera cancha disponible en ese establecimiento
    const firstCanchaId = cancha.canchas?.[0]?.canchaId;

    const {
        fechaSeleccionada,
        setFechaSeleccionada,
        horasDisponibles,
        buscando,
        horaSeleccionada,
        setHoraSeleccionada
    } = useAvailability(cancha.establecimientoId, firstCanchaId);

    const handleIrAReservar = () => {
        const token = sessionStorage.getItem('token');
        if (!token) return navigate('/login');
        if (!horaSeleccionada) return alert("Selecciona una hora primero");

        // Preparar info para la siguiente página
        const precioNumerico = cancha.canchas?.[0]?.precioPorHora || 0;
        const h = cancha.horarios?.[0];
        const horarioTexto = h?.cerradoTodoElDia ? "Cerrado" : `${h?.horaApertura?.substring(0, 5)} - ${h?.horaCierre?.substring(0, 5)}`;

        const canchaAdaptada = {
            ...cancha,
            precio: precioNumerico.toString(),
            horario: horarioTexto
        };

        navigate('/Reservar', {
            state: { cancha: canchaAdaptada, fecha: fechaSeleccionada, hora: horaSeleccionada }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03292e]/40 backdrop-blur-sm">
            <div className="bg-[#e2e8f0] w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative flex flex-col overflow-hidden">

                {/* Header */}
                <div className="p-8 pb-4 flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-black text-[#03292e]">Calendario</h2>
                        <p className="text-gray-500 font-medium">{cancha.nombreEstablecimiento}</p>
                    </div>
                    <button onClick={onClose} className="bg-white p-2 rounded-full text-gray-400 hover:text-red-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Contenido con Scroll */}
                <div className="flex-1 overflow-y-auto p-8 pt-0 space-y-6">
                    <Calendar value={fechaSeleccionada} onChange={setFechaSeleccionada} />

                    <TimeSlotGrid
                        horariosEstablecimiento={cancha.horarios}
                        horasDisponiblesBackend={horasDisponibles}
                        buscando={buscando}
                        seleccionada={horaSeleccionada}
                        onSelect={setHoraSeleccionada}
                        fechaSeleccionada={fechaSeleccionada}
                    />
                </div>

                {/* Footer */}
                <div className="p-8 pt-4 pb-8 bg-[#e2e8f0] flex justify-center">
                    <button
                        onClick={handleIrAReservar}
                        className="bg-[#03292e] text-white px-12 py-3 rounded-2xl font-bold text-lg hover:bg-[#0a4149] w-full max-w-sm"
                    >
                        Ir a reservar
                    </button>
                </div>
            </div>
        </div>
    );
};
