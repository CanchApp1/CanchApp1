import { useState, useEffect } from 'react';
import { MessageSquare, Calendar, Clock, UserCircle2 } from 'lucide-react';
import { listarComentariosPorEstablecimiento } from '../../services/comentarioService';
import { useToast } from '../../context/ToastContext';
import { SkeletonComentarioItem } from './SkeletonCard';

interface Props {
    establecimientoId: number | null;
}

interface Comentario {
    comentarioId: number;
    comentario: string;
    fecha: string;
    hora: string;
    nombreUsuario: string;
    usuarioId: number;
}

export default function VistaComentariosPropietario({ establecimientoId }: Props) {
    const { toast } = useToast();
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        if (!establecimientoId) return;
        const cargar = async () => {
            setCargando(true);
            try {
                const data = await listarComentariosPorEstablecimiento(establecimientoId);
                setComentarios(data ?? []);
            } catch {
                toast('Error al cargar los comentarios.', 'error');
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, [establecimientoId]);

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div>
                <h2 className="text-2xl font-black text-[#03292e]">Comentarios de Jugadores</h2>
                <p className="text-sm text-gray-400 mt-1">
                    {cargando ? 'Cargando...' : `${comentarios.length} comentario${comentarios.length !== 1 ? 's' : ''} recibido${comentarios.length !== 1 ? 's' : ''}`}
                </p>
            </div>

            {cargando ? (
                <div className="grid gap-4">
                    {Array.from({ length: 4 }).map((_, i) => <SkeletonComentarioItem key={i} />)}
                </div>
            ) : comentarios.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                    <MessageSquare className="mx-auto text-gray-300 mb-3" size={40} />
                    <p className="text-gray-500 font-bold">Aún no hay comentarios</p>
                    <p className="text-gray-400 text-sm mt-1">Los jugadores dejan sus opiniones después de un partido.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {comentarios.map((c) => (
                        <div
                            key={c.comentarioId}
                            className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm space-y-3"
                        >
                            {/* Cabecera del comentario */}
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-[#0ed1e8]/20 flex items-center justify-center text-[#03292e] font-black text-sm shrink-0">
                                        {c.nombreUsuario?.[0]?.toUpperCase() ?? <UserCircle2 size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-black text-[#03292e] text-sm">{c.nombreUsuario}</p>
                                        <div className="flex items-center gap-3 text-xs text-gray-400 font-medium mt-0.5">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={11} />
                                                {c.fecha}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={11} />
                                                {c.hora?.slice(0, 5)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Texto del comentario */}
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
