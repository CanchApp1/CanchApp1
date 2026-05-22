import { useState } from 'react';
import SidebarSuperAdmin from '../Components/SuperAdmin/SidebarSuperAdmin';
import VistaUsuariosAdmin from '../Components/SuperAdmin/VistaUsuariosAdmin';
import VistaComentariosAdmin from '../Components/SuperAdmin/VistaComentariosAdmin';
import VistaEstadisticasAdmin from '../Components/SuperAdmin/VistaEstadisticasAdmin';

export default function DashboardSuperAdmin() {
    const [seccionActiva, setSeccionActiva] = useState('estadisticas');

    return (
        <div className="flex min-h-screen bg-gray-50">
            <SidebarSuperAdmin seccionActiva={seccionActiva} onCambiarSeccion={setSeccionActiva} />

            <main className="flex-1 p-8 md:p-12 overflow-y-auto">
                <div className="max-w-5xl mx-auto">

                    {seccionActiva === 'estadisticas' && <VistaEstadisticasAdmin />}
                    {seccionActiva === 'usuarios' && <VistaUsuariosAdmin />}
                    {seccionActiva === 'comentarios' && <VistaComentariosAdmin />}

                </div>
            </main>
        </div>
    );
}
