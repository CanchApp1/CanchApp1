/* eslint-disable @typescript-eslint/no-explicit-any */
import { Calendar, Clock, MapPin, Star } from 'lucide-react';

interface CardPartidoProps {
  partido: any;
  esHistorial?: boolean;
  onCalificar?: (id: number) => void;
}

export function CardPartido({ partido, esHistorial, onCalificar }: CardPartidoProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 flex flex-col gap-4 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start">
        <div className="bg-[#e6effc] p-3 rounded-2xl text-[#03292e]">
          <MapPin size={24} />
        </div>
        <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${esHistorial ? 'bg-gray-100 text-gray-400' : 'bg-[#0ed1e8]/20 text-[#0ed1e8]'}`}>
          {esHistorial ? 'Finalizado' : 'Pendiente'}
        </div>
      </div>

      <div>
        <h4 className="text-lg font-black text-[#03292e] mb-1">Partido en {partido.nombreEstablecimiento}</h4>
        <p className="text-gray-500 text-sm font-medium line-clamp-2">{partido.descripcion}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar size={14} />
          <span className="text-xs font-bold">{partido.fecha_posible_partido}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Clock size={14} />
          <span className="text-xs font-bold">{partido.hora_posible_partido}</span>
        </div>
      </div>

      {esHistorial && (
        <button 
          onClick={() => onCalificar?.(partido.establecimiento_id)}
          className="w-full mt-2 py-3 bg-[#0ed1e8] text-[#03292e] rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#03292e] hover:text-white transition-all"
        >
          <Star size={14} /> Calificar Experiencia
        </button>
      )}
    </div>
  );
}