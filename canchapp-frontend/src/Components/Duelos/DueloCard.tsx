import { Calendar, Clock, MapPin, Lock, Unlock, DollarSign } from 'lucide-react';
import { type DueloDTO } from '../../services/dueloService';
import { type CanchaInfo } from '../../hooks/useDuelos';

interface DueloCardProps {
  duelo: DueloDTO;
  canchaInfo?: CanchaInfo;
  onVerDetalle: (duelo: DueloDTO) => void;
  onAceptar: (duelo: DueloDTO) => void;
}

const ESTADO_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  PUBLICADO_BLOQUEADO: {
    label: 'Cancha Bloqueada',
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    dot: 'bg-orange-400',
  },
  PUBLICADO_LIBRE: {
    label: 'Disponible',
    bg: 'bg-[#0ed1e8]/10',
    text: 'text-[#007a7a]',
    dot: 'bg-green-400',
  },
};

function calcularMitad(precioPorHora: number, inicio: string, fin: string): number {
  const h1 = parseInt(inicio.split(':')[0], 10);
  const h2 = parseInt(fin.split(':')[0], 10);
  return Math.round((precioPorHora * (h2 - h1)) / 2);
}

function formatearHora(hora: string): string {
  const h = parseInt(hora.split(':')[0], 10);
  const m = hora.split(':')[1];
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${m} ${period}`;
}

function formatearFecha(fecha: string): string {
  const [year, month, day] = fecha.split('-').map(Number);
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${day} ${meses[month - 1]} ${year}`;
}

export function DueloCard({ duelo, canchaInfo, onVerDetalle, onAceptar }: DueloCardProps) {
  const estado = ESTADO_CONFIG[duelo.estadoDuelo ?? ''];
  const mitad = canchaInfo
    ? calcularMitad(canchaInfo.precioPorHora, duelo.horaInicio, duelo.horaFin)
    : null;

  const currentUserId = parseInt(sessionStorage.getItem('userId') ?? '0', 10);
  const esPropio = !!duelo.creadorId && duelo.creadorId === currentUserId;

  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all group">

      {/* Badges de estado */}
      <div className="flex justify-between items-start mb-4">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${estado?.bg ?? 'bg-gray-100'}`}>
          <span className={`w-2 h-2 rounded-full ${estado?.dot ?? 'bg-gray-400'}`} />
          <span className={`text-[10px] font-black uppercase tracking-wider ${estado?.text ?? 'text-gray-500'}`}>
            {estado?.label ?? duelo.estadoDuelo}
          </span>
        </div>
        {esPropio && (
          <span className="text-[10px] font-black px-3 py-1.5 bg-[#03292e]/5 text-[#03292e] rounded-full uppercase tracking-wider">
            Tu duelo
          </span>
        )}
      </div>

      {/* Cuerpo: creador | VS | detalles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">

        {/* Creador */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={`https://i.pravatar.cc/150?u=${duelo.nombreCreador}`}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-50 shadow-sm"
              alt={duelo.nombreCreador}
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white" />
          </div>
          <div>
            <h3 className="font-black text-[#03292e] text-lg leading-tight">
              {duelo.nombreCreador ?? 'Jugador'}
            </h3>
            <p className="text-gray-400 text-xs font-bold mt-1 uppercase">Busca rival</p>
          </div>
        </div>

        {/* VS + Cancha */}
        <div className="flex flex-col items-center justify-center border-y md:border-y-0 md:border-x border-gray-50 py-4 md:py-0">
          <span className="text-2xl font-black text-[#03292e] italic opacity-20 group-hover:opacity-100 transition-opacity">
            VS
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <MapPin size={14} className="text-[#0ed1e8] shrink-0" />
            <p className="text-[#03292e] font-bold text-sm text-center">
              {canchaInfo ? canchaInfo.nombreEstablecimiento : `Cancha #${duelo.canchaId}`}
            </p>
          </div>
          {canchaInfo && (
            <p className="text-gray-400 text-xs mt-0.5 text-center">{canchaInfo.direccion}</p>
          )}
        </div>

        {/* Fecha, hora y precio */}
        <div className="space-y-2 text-right">
          <div className="flex items-center justify-end gap-2 text-gray-500">
            <span className="text-xs font-bold">{formatearFecha(duelo.fecha)}</span>
            <Calendar size={14} className="text-gray-400 shrink-0" />
          </div>
          <div className="flex items-center justify-end gap-2 text-[#03292e]">
            <span className="text-sm font-black">
              {formatearHora(duelo.horaInicio)} — {formatearHora(duelo.horaFin)}
            </span>
            <Clock size={14} className="text-[#0ed1e8] shrink-0" />
          </div>
          {mitad !== null && (
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-xs font-black text-[#0ed1e8]">
                Tu mitad: ${mitad.toLocaleString('es-CO')}
              </span>
              <DollarSign size={12} className="text-[#0ed1e8] shrink-0" />
            </div>
          )}
          {duelo.estadoDuelo === 'PUBLICADO_BLOQUEADO' && (
            <div className="flex items-center justify-end gap-1 text-orange-400">
              <Lock size={10} />
              <span className="text-[10px] font-bold">Cancha reservada temporalmente</span>
            </div>
          )}
          {duelo.estadoDuelo === 'PUBLICADO_LIBRE' && (
            <div className="flex items-center justify-end gap-1 text-green-500">
              <Unlock size={10} />
              <span className="text-[10px] font-bold">Rival pendiente</span>
            </div>
          )}
        </div>
      </div>

      {/* Descripción */}
      {duelo.descripcion && (
        <p className="mt-4 text-sm text-gray-500 line-clamp-2 border-t border-gray-50 pt-4">
          {duelo.descripcion}
        </p>
      )}

      {/* Acciones */}
      <div className="flex justify-between items-center mt-5 pt-5 border-t border-gray-50">
        <button
          onClick={() => onVerDetalle(duelo)}
          className="text-[#03292e] font-black text-sm hover:text-[#0ed1e8] transition-colors flex items-center gap-2"
        >
          Ver detalles <span className="text-lg">→</span>
        </button>
        {!esPropio && (
          <button
            onClick={() => onAceptar(duelo)}
            className="bg-[#03292e] text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-[#0a4149] transition-all active:scale-95 shadow-lg shadow-[#03292e]/10"
          >
            Aceptar Desafío
          </button>
        )}
      </div>
    </div>
  );
}
