import { useState, useEffect } from 'react';
import SidebarAdmin from '../Components/SidebarAdmin';
import { useDashboardInfo } from '../hooks/useDashboardInfo';
import { useInventory } from '../hooks/useInventory';
import { useHorarios } from '../hooks/useHorarios';
import { useEstablecimiento } from '../hooks/useEstablecimiento';
import { obtenerMiEstablecimiento } from '../services/establecimientoService';
import { useReservasAdmin } from '../hooks/useReservaAdmin'; // Hook que creamos antes

// Componentes del Dashboard
import CabeceraBienvenida from '../Components/Dashboard/CabeceraBienvenida';
import PanelEstadisticas from '../Components/Dashboard/PanelEstadisticas';
import VistaCanchasPropietario from '../Components/Dashboard/VistaCanchasPropietario';
import VistaHorarios from '../Components/Dashboard/VistaHorarios';
import VistaConfiguracion from '../Components/Dashboard/VistaConfiguracion';
import VistaReservas from '../Components/Dashboard/VistaReservas';
import VistaJugadores from '../Components/Dashboard/VistaJugadores';
import VistaCalendario from '../Components/Dashboard/VistaCalendario';

// ============================================
// DASHBOARD PROPIETARIO — Página principal
// Solo orquesta: conecta Hooks con Vistas
// ============================================

export default function DashboardPropietario() {
    // ─── Datos de sesión ─────────────────────────
    const { saludo, nombreUsuario } = useDashboardInfo();
    const userId = parseInt(sessionStorage.getItem('userId') || '0');
    const [seccionActiva, setSeccionActiva] = useState('inicio');

    // ─── Resolver ID real del establecimiento ────
    const [realEstId, setRealEstId] = useState<number | null>(null);

    useEffect(() => {
        const cargarIDReal = async () => {
            const miLocal = await obtenerMiEstablecimiento(userId);
            if (miLocal) setRealEstId(miLocal.establecimientoId);
        };
        cargarIDReal();
    }, [userId]);

    // ─── Hooks de negocio ────────────────────────
    const { canchas, loading: loadingCanchas, addCancha, updateCancha, deleteCancha } = useInventory(realEstId);
    const { horarios, loading: loadingHorarios, diasSinHorario, addHorario, updateHorario, deleteHorario } = useHorarios(realEstId);
    const { establecimiento, loading: loadingConfig, refresh: refreshEstablecimiento } = useEstablecimiento(userId);
    const { reservas, pagos, loading: loadingResGlobal, cancelarReserva, crearReserva, editarReserva } = useReservasAdmin(realEstId);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <SidebarAdmin seccionActiva={seccionActiva} onCambiarSeccion={setSeccionActiva} />

            <main className="flex-1 p-8 md:p-12 overflow-y-auto">
                <div className="max-w-5xl mx-auto">

                    {/* ─── SECCIÓN INICIO ────────────────── */}
                    {seccionActiva === 'inicio' && (
                        <div className="space-y-8">
                            <CabeceraBienvenida saludo={saludo} nombreUsuario={nombreUsuario} />
                            <PanelEstadisticas
                                reservas={reservas}
                                canchas={canchas}
                            />
                            <VistaCalendario
                                reservas={reservas}
                                pagos={pagos}
                                canchas={canchas}
                                loading={loadingResGlobal}
                                adminUserId={userId}
                            />
                        </div>
                    )}

                    {/* ─── SECCIÓN CANCHAS (CRUD) ────────── */}
                    {seccionActiva === 'canchas' && (
                        <VistaCanchasPropietario
                            canchas={canchas}
                            loading={loadingCanchas}
                            onCrear={(datos) => addCancha(datos)}
                            onEditar={(id, datos) => updateCancha(id, datos)}
                            onEliminar={deleteCancha}
                        />
                    )}

                    {seccionActiva === 'reservas' && (
                        <VistaReservas
                            reservas={reservas}
                            pagos={pagos}
                            loading={loadingResGlobal}
                            adminUserId={userId}
                            canchas={canchas}
                            establecimientoId={realEstId ?? 0}
                            onCancelar={cancelarReserva}
                            onCrear={crearReserva}
                            onEditar={editarReserva}
                        />
                    )}

                    {seccionActiva === 'calendario' && (
                        <VistaCalendario
                            reservas={reservas}
                            pagos={pagos}
                            canchas={canchas}
                            loading={loadingResGlobal}
                            adminUserId={userId}
                        />
                    )}

                    {seccionActiva === 'jugadores' && (
                        <VistaJugadores
                            reservas={reservas}
                            loading={loadingResGlobal}
                        />
                    )}

                    {/* ─── SECCIÓN RESERVAS / HORARIOS ───── */}
                    {seccionActiva === 'horarios' && (
                        <VistaHorarios
                            horarios={horarios}
                            loading={loadingHorarios}
                            diasSinHorario={diasSinHorario}
                            onCrear={addHorario}
                            onEditar={updateHorario}
                            onEliminar={deleteHorario}
                        />
                    )}

                    {/* ─── SECCIÓN CONFIGURACIÓN ─────────── */}
                    {seccionActiva === 'config' && (
                        <VistaConfiguracion
                            establecimiento={establecimiento}
                            loading={loadingConfig}
                            onPerfilActualizado={refreshEstablecimiento}
                        />
                    )}

                </div>
            </main>
        </div>
    );
}
