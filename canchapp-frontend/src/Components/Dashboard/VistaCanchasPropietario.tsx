import { useState } from 'react';
import { Plus } from 'lucide-react';
import TarjetaCancha from './TarjetaCancha';
import ModalCancha from './ModalCancha';

// ============================================
// VISTA CANCHAS PROPIETARIO
// Orquesta la lista, el modal y las acciones
// ============================================

interface Props {
    canchas: any[];
    loading: boolean;
    onCrear: (datos: { codigo: string; precioPorHora: number; estado: string }) => Promise<boolean | undefined>;
    onEditar: (id: number, datos: { codigo: string; precioPorHora: number; estado: string }) => Promise<boolean | undefined>;
    onEliminar: (id: number) => void;
}

export default function VistaCanchasPropietario({ canchas, loading, onCrear, onEditar, onEliminar }: Props) {
    // Estado del modal
    const [modalVisible, setModalVisible] = useState(false);
    const [canchaSeleccionada, setCanchaSeleccionada] = useState<any>(null);

    // Abrir modal para CREAR
    const abrirCrear = () => {
        setCanchaSeleccionada(null);
        setModalVisible(true);
    };

    // Abrir modal para EDITAR
    const abrirEditar = (cancha: any) => {
        setCanchaSeleccionada(cancha);
        setModalVisible(true);
    };

    // Cerrar modal
    const cerrarModal = () => {
        setModalVisible(false);
        setCanchaSeleccionada(null);
    };

    // Manejar el guardado (decide si es crear o editar)
    const handleGuardar = async (datos: { codigo: string; precioPorHora: number; estado: string }) => {
        if (canchaSeleccionada) {
            // MODO EDICIÓN
            return await onEditar(canchaSeleccionada.canchaId, datos);
        } else {
            // MODO CREACIÓN
            return await onCrear(datos);
        }
    };

    return (
        <div className="animate-in slide-in-from-right-4 duration-500">
            {/* Cabecera */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-black text-[#03292e] mb-2">Mis Canchas</h2>
                    <p className="text-gray-500">
                        Gestiona tus <span className="font-bold text-[#0ed1e8]">{canchas.length}</span> escenarios deportivos.
                    </p>
                </div>
                <button
                    onClick={abrirCrear}
                    className="flex items-center gap-2 bg-[#03292e] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#0a4149] transition-all shadow-lg active:scale-95"
                >
                    <Plus size={18} />
                    Agregar Cancha
                </button>
            </div>

            {/* Contenido */}
            {loading ? (
                <div className="flex flex-col items-center py-20">
                    <div className="w-14 h-14 border-4 border-[#0ed1e8]/30 border-t-[#0ed1e8] rounded-full animate-spin mb-4" />
                    <p className="text-gray-400 font-medium">Cargando inventario...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {canchas.map((cancha) => (
                        <TarjetaCancha
                            key={cancha.canchaId}
                            cancha={cancha}
                            onEditar={abrirEditar}
                            onEliminar={onEliminar}
                        />
                    ))}

                    {canchas.length === 0 && (
                        <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-200 rounded-[3rem]">
                            <p className="text-5xl mb-4">🏟️</p>
                            <p className="text-gray-400 font-bold text-lg">No tienes canchas registradas aún.</p>
                            <p className="text-gray-300 mt-1">Empieza agregando tu primera cancha arriba.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Crear / Editar */}
            <ModalCancha
                visible={modalVisible}
                onCerrar={cerrarModal}
                onGuardar={handleGuardar}
                canchaEditar={canchaSeleccionada}
            />
        </div>
    );
}
