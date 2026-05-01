import { Pencil, Trash2, DollarSign } from 'lucide-react';

// ============================================
// TARJETA DE CANCHA — Componente visual individual
// Muestra la info de UNA cancha con acciones
// ============================================

interface Props {
    cancha: any;
    onEditar: (cancha: any) => void;
    onEliminar: (id: number) => void;
}

export default function TarjetaCancha({ cancha, onEditar, onEliminar }: Props) {
    return (
        <div className="group bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#0ed1e8]/30 transition-all duration-300 relative overflow-hidden">

            {/* Acento decorativo superior */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0ed1e8] to-[#03292e] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Cabecera: Código + Badge de estado */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h4 className="font-black text-xl text-[#03292e] uppercase tracking-wide">
                        {cancha.codigo}
                    </h4>
                    <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        Activa
                    </span>
                </div>

                <div className="flex items-center gap-1 bg-[#03292e]/5 px-3 py-1.5 rounded-xl">
                    <DollarSign size={14} className="text-[#0ed1e8]" />
                    <span className="text-[#03292e] font-black text-lg">
                        {Number(cancha.precioPorHora).toLocaleString('es-CO')}
                    </span>
                    <span className="text-gray-400 text-xs font-medium">/hr</span>
                </div>
            </div>

            {/* Info adicional */}
            {cancha.establecimiento?.nombreEstablecimiento && (
                <p className="text-gray-400 text-sm mb-4 truncate">
                    📍 {cancha.establecimiento.nombreEstablecimiento}
                </p>
            )}

            {/* Acciones */}
            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                    onClick={() => onEditar(cancha)}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#e6effc] py-3 rounded-2xl text-sm font-bold text-[#03292e] hover:bg-[#d0e2f7] active:scale-[0.97] transition-all"
                >
                    <Pencil size={15} />
                    Editar
                </button>
                <button
                    onClick={() => onEliminar(cancha.canchaId)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-100 active:scale-[0.97] transition-all"
                >
                    <Trash2 size={15} />
                    Eliminar
                </button>
            </div>
        </div>
    );
}
