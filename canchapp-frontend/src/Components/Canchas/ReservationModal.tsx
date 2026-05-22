import { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAvailability } from '../../hooks/useAvailability';
import { Calendar } from './Calendar';
import { TimeSlotGrid } from './Time';
import { useToast } from '../../context/ToastContext';
import ModalLoginAuth from '../ModalLoginAuth';

interface ReservationModalProps {
    cancha: any;
    onClose: () => void;
}

export const ReservationModal = ({ cancha, onClose }: ReservationModalProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [showLogin, setShowLogin] = useState(false);

    const canchaIds: number[] = cancha.canchas?.map((c: any) => c.canchaId as number) ?? [];

    const {
        fechaSeleccionada,
        setFechaSeleccionada,
        horasDisponibles,
        buscando,
        horaSeleccionada,
        setHoraSeleccionada
    } = useAvailability(cancha.establecimientoId, canchaIds);

    const doNavegar = () => {
        const precioNumerico = cancha.canchas?.[0]?.precioPorHora || 0;
        const h = cancha.horarios?.[0];
        const horarioTexto = h?.cerradoTodoElDia
            ? 'Cerrado'
            : `${h?.horaApertura?.substring(0, 5)} - ${h?.horaCierre?.substring(0, 5)}`;

        navigate('/Reservar', {
            state: {
                cancha: { ...cancha, precio: precioNumerico.toString(), horario: horarioTexto },
                fecha: fechaSeleccionada,
                hora: horaSeleccionada
            }
        });
    };

    const handleIrAReservar = () => {
        if (!horaSeleccionada) { toast('Selecciona una hora primero', 'warning'); return; }
        const token = sessionStorage.getItem('token');
        if (!token) { setShowLogin(true); return; }
        doNavegar();
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03292e]/40 backdrop-blur-sm">
                <div className="bg-[#e2e8f0] w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative flex flex-col overflow-hidden">

                    <div className="p-8 pb-4 flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-black text-[#03292e]">Calendario</h2>
                            <p className="text-gray-500 font-medium">{cancha.nombreEstablecimiento}</p>
                        </div>
                        <button onClick={onClose} className="bg-white p-2 rounded-full text-gray-400 hover:text-red-500">
                            <X size={20} />
                        </button>
                    </div>

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

            <ModalLoginAuth
                isOpen={showLogin}
                onClose={() => setShowLogin(false)}
                onSuccess={doNavegar}
            />
        </>
    );
};
