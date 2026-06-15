import { useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import TarjetaCancha from './TarjetaCancha';
import ModalCancha from './ModalCancha';
import { SkeletonCanchaItem } from './SkeletonCard';

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
    onReactivar: (id: number) => void;
}

export default function VistaCanchasPropietario({ canchas, loading, onCrear, onEditar, onEliminar, onReactivar }: Props) {
    // Estado del modal
    const [modalVisible, setModalVisible] = useState(false);
    const [canchaSeleccionada, setCanchaSeleccionada] = useState<any>(null);
    const [busqueda, setBusqueda] = useState(''); // Estado para el buscador

    // Filtrar canchas según la búsqueda
    const canchasFiltradas = canchas.filter(c => 
        c.codigo?.toLowerCase().includes(busqueda.toLowerCase())
    );

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

            {/* Barra de Búsqueda (CAN 34) */}
            <div className="relative mb-8 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0ed1e8] transition-colors" size={20} />
                <input 
                    type="text" 
                    id="input-busqueda-cancha"
                    placeholder="Buscar por código de cancha..." 
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    // 🚀 pr-14 aumentado para dar espacio al botón X y evitar solapamiento
                    className="w-full pl-14 pr-14 py-4 bg-white border-2 border-gray-100 rounded-[2rem] outline-none focus:border-[#0ed1e8] focus:shadow-lg transition-all font-medium text-[#03292e]"
                />
                
                {/* 🚀 BOTÓN 'X' PARA LIMPIAR EL BUSCADOR */}
                {busqueda.length > 0 && (
                    <button
                        type="button"
                        onClick={() => {
                            setBusqueda('');
                            document.getElementById('input-busqueda-cancha')?.focus();
                        }}
                        className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-[#03292e] transition-all active:scale-90"
                        title="Limpiar búsqueda"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Contenido */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => <SkeletonCanchaItem key={i} />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {canchasFiltradas.map((cancha) => (
                        <TarjetaCancha
                            key={cancha.canchaId}
                            cancha={cancha}
                            onEditar={abrirEditar}
                            onEliminar={onEliminar}
                            onReactivar={onReactivar}
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