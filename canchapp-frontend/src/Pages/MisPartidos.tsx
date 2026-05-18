import { useState } from 'react';
import { ArrowLeft, Trophy, History, Swords } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CardPartido } from '../Components/CardPartido';
import ModalCalificar from '../Components/ModalCalificar';

type Tab = 'proximos' | 'jugados' | 'duelos';

export default function MisPartidos() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('proximos');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSede, setSelectedSede] = useState<number | null>(null);

  const partidosMock = [
    { id: 1, nombreEstablecimiento: 'Bernabéu 5', descripcion: 'Reto 5vs5 nivel pro', fecha_posible_partido: '2026-05-10', hora_posible_partido: '19:00', establecimiento_id: 101, estado: 'proximos' },
    { id: 2, nombreEstablecimiento: 'Camp Nou Popayán', descripcion: 'Faltan 2 defensas', fecha_posible_partido: '2026-04-20', hora_posible_partido: '21:00', establecimiento_id: 102, estado: 'jugados' },
  ];

  const handleCalificar = (id: number) => {
    setSelectedSede(id);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Header */}
      <div className="bg-[#03292e] pt-12 pb-8 px-6 rounded-b-[3rem] shadow-xl">
        <button onClick={() => navigate(-1)} className="text-[#0ed1e8] mb-6 flex items-center gap-2 font-bold">
          <ArrowLeft size={20} /> Volver
        </button>
        <h1 className="text-3xl font-black text-white italic">MIS PARTIDOS</h1>
        <p className="text-[#0ed1e8] text-xs font-bold uppercase tracking-[0.2em]">
          Gestiona tus retos y reputación
        </p>
      </div>

      {/* Tabs */}
      <div className="max-w-md mx-auto mt-[-25px] px-6">
        <div className="flex bg-white p-1.5 rounded-2xl shadow-lg border border-gray-100 gap-1">
          <button
            onClick={() => setTab('proximos')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase transition-all ${tab === 'proximos' ? 'bg-[#03292e] text-white shadow-md' : 'text-gray-400'}`}
          >
            <Trophy size={14} /> Próximos
          </button>
          <button
            onClick={() => setTab('jugados')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase transition-all ${tab === 'jugados' ? 'bg-[#03292e] text-white shadow-md' : 'text-gray-400'}`}
          >
            <History size={14} /> Historial
          </button>
          <button
            onClick={() => setTab('duelos')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase transition-all ${tab === 'duelos' ? 'bg-[#03292e] text-white shadow-md' : 'text-gray-400'}`}
          >
            <Swords size={14} /> Duelos
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-md mx-auto mt-8 px-6 space-y-4">

        {/* Tabs de partidos normales */}
        {(tab === 'proximos' || tab === 'jugados') && (
          <>
            {partidosMock
              .filter(p => p.estado === tab)
              .map(partido => (
                <CardPartido
                  key={partido.id}
                  partido={partido}
                  esHistorial={tab === 'jugados'}
                  onCalificar={handleCalificar}
                />
              ))}
            {partidosMock.filter(p => p.estado === tab).length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">
                  No hay partidos en esta sección
                </p>
              </div>
            )}
          </>
        )}

        {/* Tab de Duelos — placeholder hasta que el backend tenga el endpoint */}
        {tab === 'duelos' && (
          <div className="text-center py-16 bg-white rounded-[2rem] border border-gray-100 shadow-sm px-6">
            <div className="w-16 h-16 bg-[#0ed1e8]/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <Swords size={30} className="text-[#0ed1e8]" />
            </div>
            <h3 className="text-lg font-black text-[#03292e] mb-2">Mis Duelos</h3>
            <p className="text-gray-400 font-bold text-sm leading-relaxed">
              Aquí verás tus duelos confirmados como creador y como oponente.
            </p>
            <p className="text-gray-300 font-bold text-xs mt-3 uppercase tracking-widest">
              Disponible próximamente
            </p>
          </div>
        )}
      </div>

      <ModalCalificar
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        establecimientoId={selectedSede}
      />
    </div>
  );
}
