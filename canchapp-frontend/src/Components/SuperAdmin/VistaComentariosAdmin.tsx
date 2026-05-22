import { useState, useEffect } from 'react';
import { Trash2, MessageSquare, Calendar, Building2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { listarComentariosAdmin, eliminarComentarioAdmin } from '../../services/adminService';

export default function VistaComentariosAdmin() {
    const { toast } = useToast();
    const [comentarios, setComentarios] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    const [eliminando, setEliminando] = useState<number | null>(null);

    const cargar = async () => {
        setCargando(true);
        try {
            const data = await listarComentariosAdmin();
            setComentarios(data);
        } catch {
            toast('Error al cargar comentarios.', 'error');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { cargar(); }, []);

    const handleEliminar = async (id: number) => {
        if (eliminando !== id) {
            setEliminando(id);
            return;
        }
        try {
            await eliminarComentarioAdmin(id);
            toast('Comentario eliminado.', 'success');
            setEliminando(null);
            cargar();
        } catch {
            toast('Error al eliminar comentario.', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black text-[#03292e]">Moderación de Comentarios</h2>
                <p className="text-sm text-gray-400 mt-1">
                    {comentarios.length} comentarios activos en la plataforma
                </p>
            </div>

            {cargando ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0ed1e8]" />
                </div>
            ) : comentarios.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                    <MessageSquare className="mx-auto text-gray-300 mb-3" size={40} />
                    <p className="text-gray-400 font-medium">No hay comentarios activos.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {comentarios.map((c: any) => (
                        <div key={c.comentarioId}
                            className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm space-y-3">
                            {/* Meta */}
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-xl bg-[#0ed1e8]/20 flex items-center justify-center text-[#03292e] font-black text-sm">
                                            {c.nombreUsuario?.[0]?.toUpperCase() ?? '?'}
                                        </div>
                                        <p className="font-black text-[#03292e] text-sm">{c.nombreUsuario}</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                                        <span className="flex items-center gap-1">
                                            <Building2 size={12} /> {c.nombreEstablecimiento}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} /> {c.fecha}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleEliminar(c.comentarioId)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all shrink-0 ${
                                        eliminando === c.comentarioId
                                            ? 'bg-red-500 text-white'
                                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                                    }`}
                                >
                                    <Trash2 size={14} />
                                    {eliminando === c.comentarioId ? '¿Confirmar?' : 'Eliminar'}
                                </button>
                            </div>

                            {/* Texto */}
                            <p className="text-sm text-gray-700 bg-gray-50 rounded-2xl p-4 leading-relaxed">
                                {c.comentario}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
