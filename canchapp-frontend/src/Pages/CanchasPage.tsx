import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Barra_de_navegacion from '../Components/Barra_navegacion';
import { CanchaCard } from '../Components/Canchas/CanchaCard';
import { ReservationModal } from '../Components/Canchas/ReservationModal';
import { useCanchas } from '../hooks/useCanchas';

export default function CanchasPage() {
  // 1. Usamos nuestro Hook personalizado para los datos
  const { canchas, loading } = useCanchas();

  const navigate = useNavigate();
  // 2. Estado para el Modal (Solo necesitamos saber qué cancha se seleccionó)
  const [selectedCancha, setSelectedCancha] = useState<any | null>(null);

  const handleCanchaClick = (cancha: any) => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/Login');
    } else {
      setSelectedCancha(cancha);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <Barra_de_navegacion />

      <main className="flex-1 p-6 md:p-12">
        <h1 className="text-3xl font-black text-[#03292e] mb-10 ml-2">
          Canchas para reservar
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0ed1e8]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {canchas.map((cancha) => (
              <CanchaCard
                key={cancha.establecimientoId}
                cancha={cancha}
                onClick={() => handleCanchaClick(cancha)}
              />
            ))}
          </div>
        )}
      </main>

      {/* 3. El Modal ahora es un componente independiente */}
      {selectedCancha && (
        <ReservationModal
          cancha={selectedCancha}
          onClose={() => setSelectedCancha(null)}
        />
      )}
    </div>
  );
}
