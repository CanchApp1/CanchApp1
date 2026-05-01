import { useState, useEffect } from 'react';
import { X, Save, Plus, AlertCircle } from 'lucide-react';

// ============================================
// MODAL DE CANCHA — Crear / Editar
// Un solo componente para ambas acciones
// ============================================

interface Props {
    visible: boolean;
    onCerrar: () => void;
    onGuardar: (datos: { codigo: string; precioPorHora: number; estado: string }) => Promise<boolean | undefined>;
    canchaEditar?: any; // Si viene, estamos en modo edición
}

export default function ModalCancha({ visible, onCerrar, onGuardar, canchaEditar }: Props) {
    const [codigo, setCodigo] = useState('');
    const [precio, setPrecio] = useState('');
    const [estado, setEstado] = useState('1');
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    const esEdicion = !!canchaEditar;

    // Precargar datos si estamos editando
    useEffect(() => {
        if (canchaEditar) {
            setCodigo(canchaEditar.codigo || '');
            setPrecio(canchaEditar.precioPorHora?.toString() || '');
            setEstado(canchaEditar.estado || '1');
        } else {
            setCodigo('');
            setPrecio('');
            setEstado('1');
        }
        setError('');
    }, [canchaEditar, visible]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validaciones
        if (!codigo.trim()) {
            setError('El código/nombre de la cancha es obligatorio.');
            return;
        }

        const precioNum = parseFloat(precio);
        if (isNaN(precioNum) || precioNum <= 0) {
            setError('El precio debe ser un número mayor a 0.');
            return;
        }

        setGuardando(true);
        try {
            const exito = await onGuardar({
                codigo: codigo.trim().toUpperCase(),
                precioPorHora: precioNum,
                estado,
            });

            if (exito) {
                onCerrar();
            } else {
                setError('Ocurrió un error al guardar. Intenta de nuevo.');
            }
        } catch {
            setError('Error de conexión con el servidor.');
        } finally {
            setGuardando(false);
        }
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onCerrar}
                style={{ animation: 'fadeIn 200ms ease-out' }}
            />

            {/* Modal */}
            <div
                className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 border border-gray-100"
                style={{ animation: 'slideUp 300ms ease-out' }}
            >
                {/* Botón X para cerrar */}
                <button
                    onClick={onCerrar}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-all"
                >
                    <X size={20} />
                </button>

                {/* Título */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2.5 rounded-2xl ${esEdicion ? 'bg-[#e6effc] text-[#03292e]' : 'bg-[#0ed1e8]/10 text-[#0ed1e8]'}`}>
                            {esEdicion ? <Save size={22} /> : <Plus size={22} />}
                        </div>
                        <h3 className="text-2xl font-black text-[#03292e]">
                            {esEdicion ? 'Editar Cancha' : 'Nueva Cancha'}
                        </h3>
                    </div>
                    <p className="text-gray-500 text-sm ml-1">
                        {esEdicion
                            ? 'Modifica los datos de tu escenario deportivo.'
                            : 'Registra un nuevo escenario deportivo en tu establecimiento.'}
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Campo: Código / Nombre */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-600 ml-1">
                            Código / Nombre
                        </label>
                        <input
                            type="text"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            placeholder="Ej: CANCHA-A1, FUTBOL-5, SINTETICA-1"
                            className="w-full px-5 py-3.5 bg-[#f3f6fb] rounded-2xl border-2 border-transparent focus:border-[#0ed1e8] outline-none transition-all font-medium text-[#03292e] placeholder:text-gray-400 uppercase"
                        />
                    </div>

                    {/* Campo: Precio por Hora */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-600 ml-1">
                            Precio por Hora (COP)
                        </label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                            <input
                                type="number"
                                value={precio}
                                onChange={(e) => setPrecio(e.target.value)}
                                placeholder="90000"
                                min="0"
                                step="1000"
                                className="w-full pl-10 pr-5 py-3.5 bg-[#f3f6fb] rounded-2xl border-2 border-transparent focus:border-[#0ed1e8] outline-none transition-all font-medium text-[#03292e] placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Campo: Estado (solo en modo edición) */}
                    {esEdicion && (
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-600 ml-1">
                                Estado
                            </label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEstado('1')}
                                    className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${estado === '1'
                                        ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300 shadow-sm'
                                        : 'bg-gray-100 text-gray-500 border-2 border-transparent hover:bg-gray-200'
                                        }`}
                                >
                                    ✅ Activa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEstado('0')}
                                    className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${estado === '0'
                                        ? 'bg-red-100 text-red-600 border-2 border-red-300 shadow-sm'
                                        : 'bg-gray-100 text-gray-500 border-2 border-transparent hover:bg-gray-200'
                                        }`}
                                >
                                    ⛔ Inactiva
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mensaje de Error */}
                    {error && (
                        <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-3 rounded-xl text-sm font-medium">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onCerrar}
                            className="flex-1 py-3.5 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all active:scale-[0.97]"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={guardando}
                            className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-[#03292e] hover:bg-[#0a4149] transition-all shadow-lg active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {guardando
                                ? 'Guardando...'
                                : esEdicion
                                    ? '💾 Guardar Cambios'
                                    : '🏟️ Crear Cancha'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Animaciones CSS inline */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
