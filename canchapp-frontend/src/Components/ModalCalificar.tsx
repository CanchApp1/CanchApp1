/* eslint-disable @typescript-eslint/no-explicit-any */
import { X, Send } from 'lucide-react';
import { useState } from 'react';
import { guardarComentario } from '../services/comentarioService';

interface ModalCalificarProps {
  isOpen: boolean;
  onClose: () => void;
  establecimientoId: number | null;
  onSuccess: (texto: string) => void; // Recibe el disparador de la viñeta
}

export default function ModalCalificar({ isOpen, onClose, establecimientoId, onSuccess }: ModalCalificarProps) {
  const [comentario, setComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comentario.trim()) {
      return;
    }

    try {
      setSubmitting(true);

      const dataComentario = {
        establecimientoId: Number(establecimientoId),
        comentario: comentario.trim()
      };

      await guardarComentario(dataComentario);
      
      // Notificamos al componente padre enviando el texto para el historial
      onSuccess(comentario.trim());
      
      setComentario('');
      onClose();
    } catch (error) {
      console.error("Error al guardar el comentario en el servidor:", error);
      alert("Hubo un problema al guardar tu comentario.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#03292e]/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl">
        
        {/* HEADER */}
        <div className="bg-[#03292e] p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black tracking-tight">Comentar Cancha</h3>
            <p className="text-xs text-[#0ed1e8] font-bold uppercase tracking-wider mt-0.5">Cuéntanos tu experiencia</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Tu opinión o reseña</label>
            <textarea 
              required
              disabled={submitting}
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#0ed1e8] font-semibold text-[#03292e] resize-none text-sm transition-colors"
              rows={5}
              placeholder="Escribe tu reseña aquí sobre la iluminación, el estado de la grama o la atención recibida..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full py-4 bg-[#03292e] text-white font-black text-sm uppercase tracking-wider rounded-2xl hover:bg-[#0a4149] transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando opinión...
              </>
            ) : (
              <>
                Enviar Comentario <Send size={15} className="text-[#0ed1e8]" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}