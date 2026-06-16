import { useState } from 'react';
import Barra_de_navegacion from '../Components/Barra_navegacion';
import { CanchaCard } from '../Components/Canchas/CanchaCard';
import { ReservationModal } from '../Components/Canchas/ReservationModal';
import { useCanchas } from '../hooks/useCanchas';
import { SkeletonCard } from '../Components/Dashboard/SkeletonCard';

export default function CanchasPage() {
    const { canchas, loading, error, refrescar } = useCanchas();
    const [selectedCancha, setSelectedCancha] = useState<any | null>(null);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative">
            <Barra_de_navegacion />

            <main className="flex-1 p-6 md:p-12">
                <h1 className="text-3xl font-black text-[#03292e] mb-10 ml-2">
                    Canchas para reservar
                </h1>

                {error ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <p className="text-4xl mb-4">⚠️</p>
                        <p className="text-gray-600 font-bold text-lg">No se pudieron cargar las canchas</p>
                        <p className="text-gray-400 text-sm mt-1 mb-6">Revisa tu conexión e intenta de nuevo.</p>
                        <button
                            onClick={refrescar}
                            className="px-6 py-3 bg-[#03292e] text-white font-bold rounded-2xl hover:bg-[#0ed1e8] hover:text-[#03292e] transition-all"
                        >
                            Reintentar
                        </button>
                    </div>
                ) : loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} className="h-80" />)}
                    </div>
                ) : canchas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <p className="text-5xl mb-4">🏟️</p>
                        <p className="text-gray-600 font-bold text-lg">No hay canchas disponibles por el momento</p>
                        <p className="text-gray-400 text-sm mt-1">Vuelve pronto, estamos incorporando nuevos establecimientos.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                        {canchas.map((cancha) => (
                            <CanchaCard
                                key={cancha.establecimientoId}
                                cancha={cancha}
                                onClick={() => setSelectedCancha(cancha)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {selectedCancha && (
                <ReservationModal
                    cancha={selectedCancha}
                    onClose={() => setSelectedCancha(null)}
                />
            )}
        </div>
    );
}
