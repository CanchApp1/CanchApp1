import { useState } from 'react';
import { crearCancha } from '../../services/canchaService';

interface Props {
    canchas: any[];
    loading: boolean;
    onEliminar: (id: number) => void;
    establecimientoId: number | null;
    onCanchaCreada: () => void;
}

export default function VistaCanchasPropietario({ canchas, loading, onEliminar, establecimientoId, onCanchaCreada }: Props) {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [form, setForm] = useState({ codigo: '', precioPorHora: '' });

    const handleCrear = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!establecimientoId) return alert("No se encontró el establecimiento.");
        setGuardando(true);
        try {
            await crearCancha({
                codigo: form.codigo,
                precioPorHora: parseFloat(form.precioPorHora),
                establecimiento: { establecimientoId }
            });
            alert("¡Cancha creada exitosamente!");
            setMostrarModal(false);
            setForm({ codigo: '', precioPorHora: '' });
            onCanchaCreada();
        } catch (error) {
            alert("Error al crear la cancha. Intenta de nuevo.");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="animate-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-black text-[#03292e] mb-2">Mis Canchas</h2>
                    <p className="text-gray-500">Gestiona tus {canchas.length} escenarios deportivos.</p>
                </div>
                <button
                    onClick={() => setMostrarModal(true)}
                    className="bg-[#03292e] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#0a4149] transition-all shadow-lg active:scale-95">
                    + Agregar Cancha
                </button>
            </div>

            {/* MODAL */}
            {mostrarModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md">
                        <h3 className="text-2xl font-black text-[#03292e] mb-6">Nueva Cancha</h3>
                        <form onSubmit={handleCrear} className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-gray-600 ml-1">Código / Nombre</label>
                                <input
                                    type="text"
                                    value={form.codigo}
                                    onChange={e => setForm({ ...form, codigo: e.target.value })}
                                    required
                                    placeholder="Ej: CANCHA-A"
                                    className="w-full mt-1 px-4 py-3 bg-[#e6effc] rounded-2xl border-2 border-transparent focus:border-[#0ed1e8] outline-none font-medium"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-600 ml-1">Precio por hora</label>
                                <input
                                    type="number"
                                    value={form.precioPorHora}
                                    onChange={e => setForm({ ...form, precioPorHora: e.target.value })}
                                    required
                                    placeholder="Ej: 50000"
                                    className="w-full mt-1 px-4 py-3 bg-[#e6effc] rounded-2xl border-2 border-transparent focus:border-[#0ed1e8] outline-none font-medium"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setMostrarModal(false)}
                                    className="flex-1 bg-gray-100 py-3 rounded-2xl font-bold text-gray-600 hover:bg-gray-200">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={guardando}
                                    className="flex-1 bg-[#03292e] text-white py-3 rounded-2xl font-bold hover:bg-[#0a4149] disabled:opacity-50">
                                    {guardando ? 'Guardando...' : 'Crear Cancha'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center py-20 animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                    <p className="text-gray-400 font-medium">Cargando inventario...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {canchas.map((cancha) => (
                        <div key={cancha.canchaId} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <h4 className="font-black text-xl text-[#03292e] uppercase mb-1">{cancha.codigo}</h4>
                            <p className="text-[#0ed1e8] font-bold text-lg mb-4">${cancha.precioPorHora} / hora</p>
                            <div className="flex gap-3">
                                <button className="flex-1 bg-gray-100 py-3 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                                    Editar
                                </button>
                                <button onClick={() => onEliminar(cancha.canchaId)}
                                    className="flex-1 bg-red-50 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-100 transition-colors">
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                    {canchas.length === 0 && (
                        <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-200 rounded-[3rem]">
                            <p className="text-gray-400 font-bold text-lg">No tienes canchas registradas aún.</p>
                            <p className="text-gray-300">Empieza agregando tu primera cancha arriba.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}