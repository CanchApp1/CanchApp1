/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, History, Swords, Calendar, Info, MapPin, Clock, DollarSign, MessageSquare, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CardPartido } from '../Components/CardPartido';
import { DueloCard } from '../Components/Duelos/DueloCard';
import ModalCalificar from '../Components/ModalCalificar';
import { obtenerHistorialUsuario } from '../services/reservaService';
import { listarDuelosDisponibles } from '../services/dueloService';
import { obtenerPagosPorUsuario } from '../services/pagoService';
import { useToast } from '../context/ToastContext';
import { SkeletonPartidoItem } from '../Components/Dashboard/SkeletonCard';

type Tab = 'proximos' | 'jugados' | 'duelos' | 'comentarios';

export default function MisPartidos() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('proximos');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSede, setSelectedSede] = useState<number | null>(null);
  const [selectedReservaId, setSelectedReservaId] = useState<number | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);

  const [notif, setNotif] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  const [partidosComentados, setPartidosComentados] = useState<Record<number, boolean>>(() => {
    const saved = localStorage.getItem('canchapp_partidos_comentados');
    return saved ? JSON.parse(saved) : {};
  });

  const [misComentariosHistoricos, setMisComentariosHistoricos] = useState<any[]>([]);

  // Estados de datos puros del Backend
  const [partidosProximos, setPartidosProximos] = useState<any[]>([]);
  const [partidosJugados, setPartidosJugados] = useState<any[]>([]);
  const [misDuelos, setMisDuelos] = useState<any[]>([]);
  const [misPagos, setMisPagos] = useState<any[]>([]); // 👈 Estado para guardar la lista de pagos reales
  const [loading, setLoading] = useState<boolean>(true);

  const currentUserId = parseInt(sessionStorage.getItem('userId') ?? '0', 10);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [resReservas, resPagos] = await Promise.all([
          obtenerHistorialUsuario(currentUserId),
          obtenerPagosPorUsuario(currentUserId)
        ]);

        const listaReservas = resReservas?.objectResponse ?? resReservas ?? [];
        const listaPagos = resPagos ?? [];
        
        setMisPagos(listaPagos);

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const proximos: any[] = [];
        const jugados: any[] = [];
        const comentariosDetectados: any[] = [];

        listaReservas.forEach((reserva: any) => {
          const fechaReserva = new Date(reserva.fecha + 'T00:00:00');

          if (fechaReserva >= hoy) {
            proximos.push(reserva);
          } else {
            jugados.push(reserva);
            
            if (reserva.comentarioTexto || partidosComentados[reserva.reservaId]) {
              comentariosDetectados.push({
                id: reserva.reservaId,
                establecimientoNombre: reserva.cancha?.establecimiento?.nombreEstablecimiento,
                fecha: reserva.fecha,
                texto: reserva.comentarioTexto
              });
            }
          }
        });
        
        setPartidosProximos(proximos);
        setPartidosJugados(jugados);
        setMisComentariosHistoricos(comentariosDetectados);

        // Obtener tablero de duelos
        const todosLosDuelos = await listarDuelosDisponibles();
        const filtradosPropios = todosLosDuelos.filter((duelo: any) => duelo.creadorId === currentUserId);
        setMisDuelos(filtradosPropios);

      } catch {
        toast('No se pudieron cargar tus partidos. Intenta de nuevo.', 'error');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [currentUserId, partidosComentados]);

  const mostrarNotificacion = (mensaje: string) => {
    setNotif({ show: true, message: mensaje });
    setTimeout(() => setNotif({ show: false, message: '' }), 4000);
  };

  const handleCalificar = (establecimientoId: number, reservaId: number) => {
    setSelectedSede(establecimientoId);
    setSelectedReservaId(reservaId);
    setModalOpen(true);
  };

  const handleComentarioGuardado = (textoComentario: string) => {
    if (selectedReservaId) {
      const nuevosComentados = { ...partidosComentados, [selectedReservaId]: true };
      setPartidosComentados(nuevosComentados);
      localStorage.setItem('canchapp_partidos_comentados', JSON.stringify(nuevosComentados));
      
      const partidoAsociado = partidosJugados.find(p => p.reservaId === selectedReservaId);

      setMisComentariosHistoricos([
        {
          id: selectedReservaId,
          establecimientoNombre: partidoAsociado?.cancha?.establecimiento?.nombreEstablecimiento,
          fecha: partidoAsociado?.fecha,
          texto: textoComentario
        },
        ...misComentariosHistoricos
      ]);
    }
    mostrarNotificacion("¡Tu comentario ha sido publicado en CanchAPP!");
  };

  const toggleDetalle = (id: number) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const calcularDuracion = (inicio?: string, fin?: string): string => {
    if (!inicio || !fin) return "";
    try {
      const [h1, m1] = inicio.split(':').map(Number);
      const [h2, m2] = fin.split(':').map(Number);
      const totalMinutos = (h2 * 60 + m2) - (h1 * 60 + m1);
      if (totalMinutos <= 0) return "";
      return `${Math.floor(totalMinutos / 60)} Horas`;
    } catch { return ""; }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12 relative overflow-x-hidden">
      
      {/* NOTIFICACIÓN LOCAL DE ÉXITO */}
      {notif.show && (
        <div className="fixed top-6 right-6 z-[200] bg-[#03292e] text-white px-6 py-4 rounded-2xl shadow-2xl border-l-4 border-[#0ed1e8] flex items-center gap-3 border border-white/10 max-w-sm">
          <CheckCircle className="text-[#0ed1e8] shrink-0" size={22} />
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-[#0ed1e8]">Proceso Exitoso</p>
            <p className="text-xs font-bold text-gray-200 mt-0.5">{notif.message}</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-[#03292e] text-white pt-8 pb-20 rounded-b-[2.5rem] px-4 md:px-8 shadow-lg">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-[#0ed1e8] hover:text-white transition-colors">
            <ArrowLeft size={18} /> Volver al inicio
          </button>
          <div className="text-right w-full sm:w-auto">
            <h1 className="text-3xl font-black tracking-tight flex items-center justify-end gap-3">
              Mis Partidos <Calendar className="text-[#0ed1e8]" size={28} />
            </h1>
            <p className="text-gray-300 text-xs font-bold mt-1 uppercase tracking-wider">Controla tus actividades y opiniones</p>
          </div>
        </div>
      </div>

      {/* CONTENEDOR CENTRAL */}
      <div className="max-w-5xl mx-auto px-4 -mt-12">
        {/* PESTAÑAS */}
        <div className="bg-white p-2 rounded-2xl md:rounded-full shadow-md flex flex-wrap md:flex-nowrap gap-1 border border-gray-100 mb-8">
          <button
            onClick={() => setTab('proximos')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl md:rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${tab === 'proximos' ? 'bg-[#03292e] text-white shadow-md' : 'text-gray-400 hover:text-[#03292e]'}`}
          >
            <Trophy size={15} /> Próximos ({partidosProximos.length})
          </button>
          <button
            onClick={() => setTab('jugados')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl md:rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${tab === 'jugados' ? 'bg-[#03292e] text-white shadow-md' : 'text-gray-400 hover:text-[#03292e]'}`}
          >
            <History size={15} /> Historial ({partidosJugados.length})
          </button>
          <button
            onClick={() => setTab('duelos')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl md:rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${tab === 'duelos' ? 'bg-[#03292e] text-white shadow-md' : 'text-gray-400 hover:text-[#03292e]'}`}
          >
            <Swords size={15} /> Mis Duelos ({misDuelos.length})
          </button>
          <button
            onClick={() => setTab('comentarios')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl md:rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${tab === 'comentarios' ? 'bg-[#02444d] text-white shadow-md' : 'text-gray-400 hover:text-[#03292e]'}`}
          >
            <MessageSquare size={15} /> Mis Comentarios ({misComentariosHistoricos.length})
          </button>
        </div>

        {/* FEED PRINCIPAL */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonPartidoItem key={i} />)}
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* VISTA DE PARTIDOS */}
            {(tab === 'proximos' || tab === 'jugados') && (tab === 'proximos' ? partidosProximos : partidosJugados).map((partido) => {
              const cardId = partido.reservaId || partido.id;
              const isOpen = expandedCardId === cardId;
              const yaComentado = partidosComentados[cardId] === true;

              // Extraídos directamente desde la relación de la base de datos
              const nombreSede = partido.cancha?.establecimiento?.nombreEstablecimiento;
              const idEstablecimiento = partido.cancha?.establecimiento?.idEstablecimiento;

              // 👈 CRUCE DE DATOS EN TIEMPO REAL: Buscamos el pago correspondiente a este reservaId
              const pagoAsociado = misPagos.find(
                (p: any) => p.reservaId === cardId || p.reserva?.reservaId === cardId
              );
              const totalPagadoReal = pagoAsociado?.valorPago;

              return (
                <div key={cardId} className="flex flex-col gap-2 bg-white rounded-[2rem] border border-gray-100 p-2 shadow-sm">
                  <CardPartido
                    partido={{
                      ...partido,
                      estado: tab === 'jugados' ? 'jugados' : 'proximos',
                      nombreEstablecimiento: nombreSede,
                      fecha_posible_partido: partido.fecha,
                      hora_posible_partido: partido.horaInicio
                    }}
                    onCalificar={() => handleCalificar(idEstablecimiento, cardId)}
                  />

                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 px-4 pb-3 pt-1 border-t border-gray-50">
                    <button onClick={() => toggleDetalle(cardId)} className="text-[#03292e] font-black text-xs uppercase tracking-wider hover:text-[#0ed1e8] flex items-center justify-center gap-1.5 py-2">
                      <Info size={14} className="text-[#0ed1e8]" />
                      {isOpen ? 'Ocultar detalles ↑' : 'Ver detalles e información ↓'}
                    </button>

                    {tab === 'jugados' && (
                      <button
                        disabled={yaComentado}
                        onClick={() => handleCalificar(idEstablecimiento, cardId)}
                        className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all text-center ${
                          yaComentado 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                            : 'bg-[#03292e] text-white hover:bg-[#0a4149] shadow-sm'
                        }`}
                      >
                        {yaComentado ? '✓ Partido Comentado' : 'Dejar Comentario 💬'}
                      </button>
                    )}
                  </div>

                  {isOpen && (
                    <div className="mx-2 mb-3 p-5 bg-gray-50 rounded-2xl border border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm">
                      <div className="flex gap-3 items-start">
                        <div className="p-2 bg-white rounded-xl shrink-0"><MapPin size={16} className="text-[#0ed1e8]" /></div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Lugar</p>
                          <p className="font-bold text-[#03292e]">{nombreSede}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <div className="p-2 bg-white rounded-xl shrink-0"><Clock size={16} className="text-[#0ed1e8]" /></div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Duración</p>
                          <p className="font-bold text-[#03292e]">{calcularDuracion(partido.horaInicio, partido.horaFin)}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <div className="p-2 bg-white rounded-xl shrink-0"><DollarSign size={16} className="text-green-500" /></div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Pagado</p>
                          <p className="font-black text-green-600">
                            {totalPagadoReal !== undefined && totalPagadoReal !== null 
                              ? `$${totalPagadoReal.toLocaleString('es-CO')} COP` 
                              : ''} 
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* VISTA DE DUELOS */}
            {tab === 'duelos' && misDuelos.map((duelo) => (
              <DueloCard key={duelo.dueloId || duelo.id} duelo={duelo} onVerDetalle={(d) => navigate(`/duelos/detalle/${d.dueloId}`)} onAceptar={(d) => navigate(`/duelos/detalle/${d.dueloId}`)} />
            ))}

            {/* APARTADO "MIS COMENTARIOS" */}
            {tab === 'comentarios' && (
              <div className="space-y-3">
                {misComentariosHistoricos.map((com) => (
                  <div key={com.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                      <div>
                        <h4 className="font-black text-[#03292e] text-base">{com.establecimientoNombre}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Partido jugado el: {com.fecha}</p>
                      </div>
                      <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
                        Publicado
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-semibold italic mt-2 bg-gray-50/60 p-4 rounded-xl border border-gray-50">
                      "{com.texto}"
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* FEED VACÍO */}
            {((tab === 'proximos' && partidosProximos.length === 0) ||
              (tab === 'jugados' && partidosJugados.length === 0) ||
              (tab === 'duelos' && misDuelos.length === 0) ||
              (tab === 'comentarios' && misComentariosHistoricos.length === 0)) && (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                <p className="text-gray-400 font-black uppercase text-xs tracking-widest">No registras datos en esta sección actualmente</p>
              </div>
            )}

          </div>
        )}
      </div>

      <ModalCalificar
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        establecimientoId={selectedSede}
        onSuccess={handleComentarioGuardado}
      />
    </div>
  );
}