import Barra_de_navegacion from '../Components/Barra_navegacion';
import MatchCard from '../Components/MatchCard';
import ModalCrearMatch from '../Components/Formulario_match';
import { Plus, Filter } from 'lucide-react';
import { useState } from 'react';

// --- DATOS DE PRUEBA (Simulando lo que vendría de una base de datos) ---
const partidosPendientes = [
    { id: 1, jugador: "Andrés Vidal", jugadores: 5, cancha: "El Cubo", fecha: "24 Feb 2026", hora: "06:00 PM", rating: 4.5 },
    { id: 2, jugador: "Cuadros Rodriguez", jugadores: 3, cancha: "El Templo", fecha: "25 Feb 2026", hora: "08:00 PM", rating: 4.2 },
    { id: 3, jugador: "Juan Moreno", jugadores: 4, cancha: "Kopana", fecha: "26 Feb 2026", hora: "07:00 PM", rating: 4.8 },
    { id: 4, jugador: "Jazmin Cuadros", jugadores: 6, cancha: "Cancha Marte", fecha: "27 Feb 2026", hora: "05:00 PM", rating: 3.9 },
];

export default function Match() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Barra_de_navegacion />

            <main className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-10">
                
                {/* Header de la sección */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-[#03292e]">Encuentra tu Rival</h1>
                        <p className="text-gray-500 font-medium mt-1">Partidos abiertos en Popayán</p>
                    </div>

                    <div className="flex gap-3">
                        {/* Botón Filtro */}
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl font-bold text-[#03292e] shadow-sm hover:shadow-md transition-all">
                            <Filter size={18} /> Filtros
                        </button>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-2 bg-[#0ed1e8] text-[#03292e] rounded-xl font-black shadow-md hover:bg-[#0cbcd1] transition-all"
                        >
                            <Plus size={18} /> Crear Reto
                        </button>
                        
                    </div>
                </div>

                {/* LISTADO DINÁMICO DE PARTIDOS */}
                <div className="space-y-6">
                    {partidosPendientes.length > 0 ? (
                        partidosPendientes.map((partido) => (
                            <MatchCard 
                                key={partido.id} // Identificador único indispensable en React
                                jugador={partido.jugador}
                                jugadores={partido.jugadores}
                                cancha={partido.cancha}
                                fecha={partido.fecha}
                                hora={partido.hora}
                                rating={partido.rating}
                            />
                        ))
                    ) : (
                        // Estado vacío por si no hay retos
                        <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
                            <p className="text-gray-400 font-bold">No hay partidos pendientes en este momento.</p>
                        </div>
                    )}
                </div>

                {/* Margen extra al final para scroll cómodo */}
                <div className="h-20" />
            </main>
            <ModalCrearMatch 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
}