import { useState, useEffect } from 'react';
import SidebarAdmin from '../Components/SidebarAdmin';
import { useDashboardInfo } from '../hooks/useDashboardInfo';
import { useInventory } from '../hooks/useInventory';
import { obtenerMiEstablecimiento } from '../services/establecimientoService';

// IMPORTAMOS NUESTROS NUEVOS COMPONENTES
import CabeceraBienvenida from '../Components/Dashboard/CabeceraBienvenida';
import PanelEstadisticas from '../Components/Dashboard/PanelEstadisticas';
import VistaCanchasPropietario from '../Components/Dashboard/VistaCanchasPropietario';

export default function DashboardPropietario() {
    const { saludo, nombreUsuario } = useDashboardInfo();
    const userId = parseInt(sessionStorage.getItem('userId') || '0');
    const [seccionActiva, setSeccionActiva] = useState('inicio');
    const [realEstId, setRealEstId] = useState<number | null>(null);

    useEffect(() => {
        const cargarIDReal = async () => {
            const miLocal = await obtenerMiEstablecimiento(userId);
            if (miLocal) setRealEstId(miLocal.establecimientoId);
        };
        cargarIDReal();
    }, [userId]);

    const { canchas, loading, deleteCancha, refresh } = useInventory(realEstId);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <SidebarAdmin seccionActiva={seccionActiva} onCambiarSeccion={setSeccionActiva} />

            <main className="flex-1 p-8 md:p-12 overflow-y-auto">
                <div className="max-w-5xl mx-auto">

                    {/* SECCIÓN INICIO */}
                    {seccionActiva === 'inicio' && (
                        <div className="space-y-8">
                            <CabeceraBienvenida saludo={saludo} nombreUsuario={nombreUsuario} />
                            <PanelEstadisticas />
                        </div>
                    )}

                    {/* SECCIÓN CANCHAS */}
                    {seccionActiva === 'canchas' && (
                        <VistaCanchasPropietario
                            canchas={canchas}
                            loading={loading}
                            onEliminar={deleteCancha}
                            establecimientoId={realEstId}   
                            onCanchaCreada={refresh}
                        />
                    )}

                </div>
            </main>
        </div>
    );
}
