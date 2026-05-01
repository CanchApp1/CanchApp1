/* eslint-disable @typescript-eslint/no-explicit-any */
import { X, Trophy, Calendar, Clock, AlignLeft } from 'lucide-react';
import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalCrearMatch({ isOpen, onClose }: Props) {
  // 2. Estado local basado en las columnas de la tabla 'Publicacion'
  // Nota: usuario_id se sacará del token/sesión más adelante.
  const [formData, setFormData] = useState({
    establecimientoId: '',
    descripcion: '',
    fecha_posible_partido: '',
    hora_posible_partido: '',
  });

  if (!isOpen) return null;

  // Manejador de cambios genérico
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ 
        ...formData, 
        [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 3. Preparación del objeto final para el Backend
    const dataParaBackend = {
      ...formData,
      // Fecha y hora de creación del post (Auditoría visual para el feed)
      fecha: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      hora: new Date().toLocaleTimeString('it-IT'),   // HH:MM:SS
      // usuario_id: user.id (Se añade aquí cuando tengas el AuthContext)
    };

    console.log("Datos listos para enviar a la tabla Publicacion:", dataParaBackend);

    // =========================================================================
    // ESPACIO PARA CONEXIÓN CON SERVICIO (FRONTEND -> BACKEND)
    // try {
    //    await publicarReto(dataParaBackend);
    //    alert("¡Reto publicado con éxito!");
    //    onClose();
    // } catch(err) { console.error(err) }
    // =========================================================================
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#03292e]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 max-h-[95vh] overflow-y-auto">
        
        {/* HEADER: Identidad CanchAPP */}
        <div className="bg-[#03292e] p-6 text-white flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0ed1e8] rounded-lg text-[#03292e]">
              <Trophy size={20} />
            </div>
            <h3 className="text-xl font-black">Crear Publicación</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* CUERPO DEL FORMULARIO */}
        <form className="p-6 md:p-8 space-y-6" onSubmit={handleSubmit}>

          {/* GRID RESPONSIVE: FECHA Y HORA POSIBLE PARTIDO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-1">
                <Calendar size={12}/> Día Sugerido
              </label>
              <input 
                type="date" 
                name="fecha_posible_partido"
                required
                value={formData.fecha_posible_partido}
                onChange={handleChange}
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-[#03292e] focus:border-[#0ed1e8] outline-none transition-all" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-1">
                <Clock size={12}/> Hora Tentativa
              </label>
              <input 
                type="time" 
                name="hora_posible_partido"
                required
                value={formData.hora_posible_partido}
                onChange={handleChange}
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-[#03292e] focus:border-[#0ed1e8] outline-none transition-all" 
              />
            </div>
          </div>

          {/* DESCRIPCIÓN (Campo 'descripcion' de la tabla) */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-1">
              <AlignLeft size={12}/> Detalles del Reto
            </label>
            <textarea 
              name="descripcion"
              required
              rows={4}
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Ej: Jugamos 5vs5, nivel intermedio. Faltan 2 para completar el equipo. Solo gente seria"
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-[#03292e] focus:border-[#0ed1e8] outline-none transition-all resize-none placeholder:text-gray-300"
            />
          </div>

          {/* FOOTER: Botón de Publicar */}
          <div className="pt-2">
            <button 
              type="submit"
              className="w-full py-5 bg-[#03292e] text-white rounded-[2rem] font-black text-lg shadow-xl shadow-[#03292e]/20 hover:bg-[#0a4149] hover:-translate-y-1 transition-all transform active:scale-95 uppercase tracking-widest"
            >
              Publicar Reto
            </button>
            <p className="text-[9px] text-center text-gray-400 mt-4 font-bold uppercase tracking-tighter">
                Al publicar, tu reto será visible para todos los jugadores en la sección de Match
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}