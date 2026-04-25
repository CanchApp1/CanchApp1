// En: src/Components/CanchaCard.tsx
import { MapPin, Clock, Star } from 'lucide-react';

interface CanchaCardProps {
    cancha: any;
    onClick: () => void;
}

export const CanchaCard = ({ cancha, onClick }: CanchaCardProps) => {
    // Lógica de formateo (extraída de CanchasPage)
    const nombre = cancha.nombreEstablecimiento || "Cancha Sin Nombre";
    const ubicacion = cancha.direccion || "Ubicación no especificada";

    let horarioTexto = "Horario no definido";
    if (cancha.horarios?.length > 0) {
        const h = cancha.horarios[0];
        horarioTexto = h.cerradoTodoElDia ? "Cerrado" : `${h.horaApertura.substring(0, 5)} - ${h.horaCierre.substring(0, 5)}`;
    }

    let precioTexto = "Precio no disponible";
    if (cancha.canchas?.length > 0) {
        const p = cancha.canchas[0].precioPorHora;
        if (p > 0) precioTexto = `$${p.toLocaleString('es-CO')} COP/h`;
    }

    return (
        <div onClick={onClick} className="bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all cursor-pointer group">
            <div className="relative h-60 overflow-hidden bg-[#03292e]">
                <img src="/src/assets/fondo_default.jpg" alt={nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 right-4 bg-[#0ed1e8] text-[#03292e] px-4 py-1 rounded-full text-xs font-bold z-20">Disponible</div>
            </div>
            <div className="p-6 space-y-4 bg-white">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-[#03292e] truncate">{nombre}</h3>
                    <div className="flex items-center gap-1 text-[#0ed1e8]">
                        <Star size={18} fill="#0ed1e8" />
                        <span className="text-sm font-bold text-gray-600">4.5</span>
                    </div>
                </div>
                <div className="space-y-2 text-gray-500 text-sm">
                    <div className="flex items-center gap-2"><MapPin size={16} className="text-[#0ed1e8]" /> {ubicacion}</div>
                    <div className="flex items-center gap-2"><Clock size={16} className="text-[#0ed1e8]" /> {horarioTexto}</div>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <span className="text-[#03292e] font-black text-sm italic">{precioTexto}</span>
                </div>
            </div>
        </div>
    );
};
