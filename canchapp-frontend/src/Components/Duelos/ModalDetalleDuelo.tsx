import { X, Calendar, Clock, MapPin, DollarSign, User, Shield, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { aceptarDuelo, type DueloDTO } from '../../services/dueloService';
import { type CanchaInfo } from '../../hooks/useDuelos';

interface Props {
  duelo: DueloDTO | null;
  canchaInfo?: CanchaInfo;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  return `${day} de ${meses[month - 1]} de ${year}`;
}

function calcularMitad(precioPorHora: number, inicio: string, fin: string): number {
  const h1 = parseInt(inicio.split(':')[0], 10);
  const h2 = parseInt(fin.split(':')[0], 10);
  return Math.round((precioPorHora * (h2 - h1)) / 2);
}

export function ModalDetalleDuelo({ duelo, canchaInfo, isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState(false);

  if (!isOpen || !duelo) return null;

  const mitad = canchaInfo
    ? calcularMitad(canchaInfo.precioPorHora, duelo.horaInicio, duelo.horaFin)
    : null;

  const currentUserId = parseInt(sessionStorage.getItem('userId') ?? '0', 10);
  const esPropio = !!duelo.creadorId && duelo.creadorId === currentUserId;

  const handleAceptar = async () => {
    setLoading(true);
    setError(null);
    try {
      await aceptarDuelo(duelo.dueloId!);
      setConfirmado(true);
      setTimeout(() => {
        setConfirmado(false);
        onSuccess();
        onClose();
      }, 2200);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.response?.data;
      setError(typeof msg === 'string' ? msg : 'Error al aceptar el duelo. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (confirmado) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#03292e]/60 backdrop-blur-sm">
        <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-10 text-center">
          <div className="w-20 h-20 bg-[#0ed1e8]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield size={40} className="text-[#0ed1e8]" />
          </div>
          <h3 className="text-2xl font-black text-[#03292e] mb-2">¡Duelo Aceptado!</h3>
          <p className="text-gray-500 font-bold">El partido está confirmado. ¡Buena suerte!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#03292e]/60 backdrop-blur-sm">
      <div className="bg-[#e2e8f0] w-full max-w-lg rounded-[2.5rem] shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black text-[#03292e]">Detalle del Duelo</h2>
            <p className="text-gray-500 font-medium mt-1">Revisa todo antes de aceptar</p>
          </div>
          <button
            onClick={onClose}
            className="bg-white p-2 rounded-full text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 pt-4 space-y-4">

          {/* Creador */}
          <div className="bg-white rounded-[1.5rem] p-5 flex items-center gap-4">
            <img
              src={`https://i.pravatar.cc/150?u=${duelo.nombreCreador}`}
              className="w-14 h-14 rounded-2xl object-cover"
              alt={duelo.nombreCreador}
            />
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                <User size={10} /> Retador
              </p>
              <h3 className="font-black text-[#03292e] text-xl">{duelo.nombreCreador}</h3>
            </div>
          </div>

          {/* Cancha */}
          <div className="bg-white rounded-[1.5rem] p-5">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-3">
              <MapPin size={10} /> Cancha
            </p>
            <p className="font-black text-[#03292e] text-lg">
              {canchaInfo ? canchaInfo.nombreEstablecimiento : `Cancha #${duelo.canchaId}`}
            </p>
            {canchaInfo && (
              <p className="text-gray-500 text-sm font-medium mt-1">{canchaInfo.direccion}</p>
            )}
          </div>

          {/* Fecha y hora */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-[1.5rem] p-5">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                <Calendar size={10} /> Fecha
              </p>
              <p className="font-black text-[#03292e] text-sm">{formatearFecha(duelo.fecha)}</p>
            </div>
            <div className="bg-white rounded-[1.5rem] p-5">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                <Clock size={10} /> Horario
              </p>
              <p className="font-black text-[#03292e] text-sm">
                {formatearHora(duelo.horaInicio)} — {formatearHora(duelo.horaFin)}
              </p>
            </div>
          </div>

          {/* Descripción */}
          {duelo.descripcion && (
            <div className="bg-white rounded-[1.5rem] p-5">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Descripción
              </p>
              <p className="text-[#03292e] font-medium">{duelo.descripcion}</p>
            </div>
          )}

          {/* Precio */}
          {mitad !== null && (
            <div className="bg-[#03292e] rounded-[1.5rem] p-5 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-[#0ed1e8] uppercase tracking-widest flex items-center gap-1 mb-1">
                  <DollarSign size={10} /> Lo que pagarías
                </p>
                <p className="text-3xl font-black text-white">${mitad.toLocaleString('es-CO')}</p>
                <p className="text-gray-400 text-xs font-bold mt-1">50% del total del partido</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-xs font-bold">El otro 50%</p>
                <p className="text-[#0ed1e8] font-black text-lg">${mitad.toLocaleString('es-CO')}</p>
                <p className="text-gray-500 text-xs font-bold">ya fue pagado</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-500 text-sm font-bold">{error}</p>
            </div>
          )}

          {/* Acción */}
          {esPropio ? (
            <div className="bg-white rounded-2xl p-4 text-center">
              <p className="text-gray-400 font-bold text-sm">Este es tu propio duelo</p>
            </div>
          ) : (
            <button
              onClick={handleAceptar}
              disabled={loading}
              className="w-full py-5 bg-[#03292e] text-white rounded-[2rem] font-black text-lg shadow-xl hover:bg-[#0a4149] hover:-translate-y-1 transition-all active:scale-95 uppercase tracking-widest disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading
                ? 'Procesando pago...'
                : `Aceptar y Pagar $${mitad?.toLocaleString('es-CO') ?? '...'}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
