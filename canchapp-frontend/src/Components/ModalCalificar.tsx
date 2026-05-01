/* eslint-disable @typescript-eslint/no-explicit-any */
import { X, Star, Send } from 'lucide-react';
import { useState } from 'react';

export default function ModalCalificar({ isOpen, onClose, establecimientoId }: any) {
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataComentario = {
      establecimiento_id: establecimientoId,
      comentario: comentario,
      calificacion: rating,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('it-IT'),
      // el usuario_id se enviaria desde el auth 
    };
    console.log("Enviando Comentario:", dataComentario);
    // Llamada de api cuando cuadriños la haga
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#03292e]/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="bg-[#03292e] p-6 text-white flex justify-between items-center">
          <h3 className="text-xl font-black italic">CALIFICAR SEDE</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">¿Qué te pareció la cancha?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button key={num} type="button" onClick={() => setRating(num)}>
                  <Star size={32} className={`${rating >= num ? 'fill-[#0ed1e8] text-[#0ed1e8]' : 'text-gray-200'} transition-colors`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Tu comentario</label>
            <textarea 
              required
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#0ed1e8] font-bold text-[#03292e] resize-none"
              rows={4}
              placeholder="Escribe tu reseña aquí..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>

          <button type="submit" className="w-full py-4 bg-[#03292e] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#0ed1e8] hover:text-[#03292e] transition-all flex items-center justify-center gap-2">
            <Send size={18} /> Enviar Calificación
          </button>
        </form>
      </div>
    </div>
  );
}