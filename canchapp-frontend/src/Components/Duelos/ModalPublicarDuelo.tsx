import { X, Trophy, Calendar, Clock, AlignLeft, MapPin } from 'lucide-react';
import { useState } from 'react';
import { publicarDuelo } from '../../services/dueloService';
import { type CanchaInfo } from '../../hooks/useDuelos';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  canchas: CanchaInfo[];
  onSuccess: () => void;
}

function getFechaLimites() {
  const hoy = new Date();
  const min = new Date(hoy);
  min.setDate(hoy.getDate() + 3);
  const max = new Date(hoy);
  max.setDate(hoy.getDate() + 7);
  return {
    min: min.toISOString().split('T')[0],
    max: max.toISOString().split('T')[0],
  };
}

export default function ModalPublicarDuelo({ isOpen, onClose, canchas, onSuccess }: Props) {
  const [form, setForm] = useState({
    canchaId: '',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    descripcion: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const { min: minFecha, max: maxFecha } = getFechaLimites();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const canchaSeleccionada = canchas.find(c => c.canchaId === parseInt(form.canchaId, 10));

  const calcularMitad = () => {
    if (!canchaSeleccionada || !form.horaInicio || !form.horaFin) return null;
    const h1 = parseInt(form.horaInicio.split(':')[0], 10);
    const h2 = parseInt(form.horaFin.split(':')[0], 10);
    if (h2 <= h1) return null;
    return Math.round((canchaSeleccionada.precioPorHora * (h2 - h1)) / 2);
  };

  const mitad = calcularMitad();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.canchaId || !form.fecha || !form.horaInicio || !form.horaFin) {
      setError('Completa todos los campos requeridos.');
      return;
    }
    if (form.horaFin <= form.horaInicio) {
      setError('La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await publicarDuelo({
        canchaId: parseInt(form.canchaId, 10),
        fecha: form.fecha,
        horaInicio: form.horaInicio + ':00',
        horaFin: form.horaFin + ':00',
        descripcion: form.descripcion,
      });
      setForm({ canchaId: '', fecha: '', horaInicio: '', horaFin: '', descripcion: '' });
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.response?.data;
      setError(typeof msg === 'string' ? msg : 'Error al publicar el duelo. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#03292e]/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-gray-100 max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-[#03292e] p-6 text-white flex justify-between items-center sticky top-0 z-10 rounded-t-[2.5rem]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0ed1e8] rounded-lg text-[#03292e]">
              <Trophy size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black">Publicar Duelo</h3>
              <p className="text-[#0ed1e8] text-xs font-bold">Cada equipo paga su mitad</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form className="p-6 md:p-8 space-y-5" onSubmit={handleSubmit}>

          {/* Cancha */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-1">
              <MapPin size={12} /> Cancha
            </label>
            <select
              name="canchaId"
              required
              value={form.canchaId}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-[#03292e] focus:border-[#0ed1e8] outline-none transition-all appearance-none"
            >
              <option value="">Selecciona una cancha...</option>
              {canchas.map(c => (
                <option key={c.canchaId} value={c.canchaId}>
                  {c.nombreEstablecimiento} — {c.codigo}
                </option>
              ))}
            </select>
            {canchaSeleccionada && (
              <p className="text-xs text-[#0ed1e8] font-bold ml-2">
                ${canchaSeleccionada.precioPorHora.toLocaleString('es-CO')}/hora · {canchaSeleccionada.direccion}
              </p>
            )}
          </div>

          {/* Fecha */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-1">
              <Calendar size={12} /> Fecha del partido
            </label>
            <input
              type="date"
              name="fecha"
              required
              min={minFecha}
              max={maxFecha}
              value={form.fecha}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-[#03292e] focus:border-[#0ed1e8] outline-none transition-all"
            />
            <p className="text-[10px] text-gray-400 ml-2 font-bold">
              Mínimo 3 días · Máximo 7 días desde hoy
            </p>
          </div>

          {/* Horas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-1">
                <Clock size={12} /> Hora inicio
              </label>
              <input
                type="time"
                name="horaInicio"
                required
                value={form.horaInicio}
                onChange={handleChange}
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-[#03292e] focus:border-[#0ed1e8] outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-1">
                <Clock size={12} /> Hora fin
              </label>
              <input
                type="time"
                name="horaFin"
                required
                value={form.horaFin}
                onChange={handleChange}
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-[#03292e] focus:border-[#0ed1e8] outline-none transition-all"
              />
            </div>
          </div>

          {/* Resumen de precio */}
          {mitad !== null && (
            <div className="bg-[#03292e]/5 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tu pago ahora</p>
                <p className="text-2xl font-black text-[#03292e]">
                  ${mitad.toLocaleString('es-CO')}
                </p>
                <p className="text-[10px] text-gray-400 font-bold mt-0.5">50% del total</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400">El rival paga la misma cantidad</p>
                <p className="text-xs font-bold text-[#0ed1e8] mt-1">Solo si acepta el desafío</p>
              </div>
            </div>
          )}

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-1">
              <AlignLeft size={12} /> Descripción del reto
            </label>
            <textarea
              name="descripcion"
              required
              rows={3}
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Ej: Equipo de 5vs5, nivel intermedio. Solo gente seria."
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-[#03292e] focus:border-[#0ed1e8] outline-none transition-all resize-none placeholder:text-gray-300"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
              <p className="text-red-500 text-sm font-bold">{error}</p>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-[#03292e] text-white rounded-[2rem] font-black text-lg shadow-xl shadow-[#03292e]/20 hover:bg-[#0a4149] hover:-translate-y-1 transition-all active:scale-95 uppercase tracking-widest disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? 'Publicando...' : 'Publicar y Pagar 50%'}
            </button>
            <p className="text-[9px] text-center text-gray-400 mt-4 font-bold uppercase tracking-tighter">
              Al publicar pagas tu mitad. El rival paga la suya al aceptar.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
