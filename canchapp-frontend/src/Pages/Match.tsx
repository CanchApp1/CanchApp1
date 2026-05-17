import { useState } from 'react';
import { Plus, Swords } from 'lucide-react';
import Barra_de_navegacion from '../Components/Barra_navegacion';
import { DueloCard } from '../Components/Duelos/DueloCard';
import ModalPublicarDuelo from '../Components/Duelos/ModalPublicarDuelo';
import { ModalDetalleDuelo } from '../Components/Duelos/ModalDetalleDuelo';
import { useDuelos } from '../hooks/useDuelos';
import { type DueloDTO } from '../services/dueloService';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[2rem] p-6 animate-pulse">
      <div className="h-4 bg-gray-100 rounded-full w-1/4 mb-5" />
      <div className="grid grid-cols-3 gap-6 items-center">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-100 rounded-full w-28" />
            <div className="h-3 bg-gray-100 rounded-full w-16" />
          </div>
        </div>
        <div className="h-8 bg-gray-100 rounded-full mx-auto w-1/2" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded-full w-full" />
          <div className="h-4 bg-gray-100 rounded-full w-3/4 ml-auto" />
          <div className="h-3 bg-gray-100 rounded-full w-1/2 ml-auto" />
        </div>
      </div>
    </div>
  );
}

export default function Match() {
  const [modalPublicar, setModalPublicar] = useState(false);
  const [dueloSeleccionado, setDueloSeleccionado] = useState<DueloDTO | null>(null);
  const { duelos, canchas, loading, error, refetch, getCanchaInfo } = useDuelos();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Barra_de_navegacion />

      <main className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-[#03292e]">Encuentra tu Rival</h1>
            <p className="text-gray-500 font-medium mt-1">
              {loading
                ? 'Cargando duelos...'
                : `${duelos.length} duelo${duelos.length !== 1 ? 's' : ''} disponible${duelos.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          <button
            onClick={() => setModalPublicar(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#0ed1e8] text-[#03292e] rounded-xl font-black shadow-md hover:bg-[#0cbcd1] transition-all active:scale-95"
          >
            <Plus size={18} /> Publicar Duelo
          </button>
        </div>

        {/* Skeleton */}
        {loading && (
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-100 rounded-[2rem] p-8 text-center">
            <p className="text-red-500 font-bold mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-6 py-2 bg-[#03292e] text-white rounded-xl font-bold text-sm hover:bg-[#0a4149] transition-all"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Lista de duelos */}
        {!loading && !error && (
          <div className="space-y-6">
            {duelos.length > 0 ? (
              duelos.map(duelo => (
                <DueloCard
                  key={duelo.dueloId}
                  duelo={duelo}
                  canchaInfo={getCanchaInfo(duelo.canchaId)}
                  onVerDetalle={setDueloSeleccionado}
                  onAceptar={setDueloSeleccionado}
                />
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Swords size={28} className="text-gray-300" />
                </div>
                <p className="text-gray-400 font-black uppercase tracking-widest text-sm">
                  Sin duelos por ahora
                </p>
                <p className="text-gray-300 font-bold text-xs mt-2">
                  Sé el primero en publicar un reto
                </p>
                <button
                  onClick={() => setModalPublicar(true)}
                  className="mt-6 px-6 py-3 bg-[#03292e] text-white rounded-xl font-black text-sm hover:bg-[#0a4149] transition-all"
                >
                  Publicar Duelo
                </button>
              </div>
            )}
          </div>
        )}

        <div className="h-20" />
      </main>

      <ModalPublicarDuelo
        isOpen={modalPublicar}
        onClose={() => setModalPublicar(false)}
        canchas={canchas}
        onSuccess={refetch}
      />

      <ModalDetalleDuelo
        duelo={dueloSeleccionado}
        canchaInfo={dueloSeleccionado ? getCanchaInfo(dueloSeleccionado.canchaId) : undefined}
        isOpen={!!dueloSeleccionado}
        onClose={() => setDueloSeleccionado(null)}
        onSuccess={refetch}
      />
    </div>
  );
}
