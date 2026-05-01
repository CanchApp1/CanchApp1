/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Barra_de_navegacion from '../Components/Barra_navegacion';
import { MapPin, Star, CheckCircle2, ChevronLeft, CalendarDays, Timer, User ,Users, ArrowRight} from 'lucide-react';

export default function ReservarPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // RECUPERAMOS LOS DATOS DE NAVEGACIÓN
  const { cancha, fecha, hora } = location.state || {
    cancha: null,
    fecha: new Date().toISOString().split('T')[0],
    hora: "18:00"
  };

  // --- ESTADOS ---
  const [canchaEspecifica, setCanchaEspecifica] = useState<number | null>(null);
  const [duracion, setDuracion] = useState<number>(1);
  const [descripcion, setDescripcion] = useState("");
  const [editFecha, setEditFecha] = useState(fecha);
  const [editHora, setEditHora] = useState(hora);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({ id: "", nombre: "", contacto: "" });

  // 2. CARGAR DATOS DEL USUARIO (Sincronizado con LoginPage)
  useEffect(() => {
    const id = sessionStorage.getItem('userId');
    const nombre = sessionStorage.getItem('userName'); 
    const email = sessionStorage.getItem('email');

    if (nombre) {
      setUserData({
        id: id || "",
        nombre: nombre,
        contacto: email || "Sin correo registrado"
      });
    }
  }, []);

  // --- LÓGICA DE PRECIO ---
  const precioFinal = useMemo(() => {
  if (!cancha || !cancha.precio) return 0;
  const precioLimpio = cancha.precio.toString().replace(/[$. ]/g, '');
  const precioBase = parseInt(precioLimpio) || 0;
  
  return precioBase * duracion;
}, [cancha, duracion]);

  // --- FUNCIÓN PARA CONFIRMAR RESERVA (USANDO EL SERVICIO) ---
  // --- FUNCIÓN PARA CONFIRMAR RESERVA (AHORA NAVEGA A PAGOS) ---
  const handleConfirmarReserva = () => {
    // 1. Recuperar datos de sesión
    const sUserId = sessionStorage.getItem('userId');
    const token = sessionStorage.getItem('token');

    // 2. Validaciones iniciales
    if (!sUserId || sUserId === "undefined") {
      alert("Error: No se encontró el ID de usuario. Por favor, cierra sesión y vuelve a entrar.");
      return;
    }

    if (!canchaEspecifica) {
      alert("Por favor, selecciona una cancha específica (ej: A1, B2).");
      return;
    }

    if (!token) {
      alert("Tu sesión ha expirado. Inicia sesión nuevamente.");
      navigate('/Login');
      return;
    }

    // 3. Preparar el DTO de la reserva para enviarlo a la pantalla de Pagos
    const [horas, minutos] = editHora.split(':').map(Number);
    const finH = horas + Number(duracion);
    
    const horaInicioFormateada = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:00`;
    const horaFinCalculada = `${finH.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:00`;

    const reservaDTO = {
      usuario: { idUsuario: Number(sUserId) },      
      cancha: { canchaId: Number(canchaEspecifica) },
      fecha: editFecha,                 
      horaInicio: horaInicioFormateada, 
      horaFin: horaFinCalculada,       
      duracionHoras: Number(duracion),
      precioTotal: Number(precioFinal),
      descripcion: descripcion || "Reserva desde CanchAPP",
      estadoReserva: "PENDIENTE",
      estadoActivo: true
      
    };
    
    // 4. Navegar a la pantalla de Pagos pasando el DTO y los datos de visualización
    // En Reservar.tsx
      navigate('/Pagos', { 
        state: { 
          reservaDTO, 
          cancha, 
          fecha: editFecha, 
          hora: editHora,
          precioAMostrar: precioFinal 
        } 
      });
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('de-DE').format(val);

  const getButtonClasses = (isSelected: boolean) => `
    p-4 rounded-2xl font-bold border-2 transition-all duration-300 w-full text-center
    ${isSelected 
      ? 'bg-[#03292e] text-white border-[#03292e] shadow-md scale-[1.02]' 
      : 'bg-white text-[#03292e] border-gray-100 hover:border-[#0ed1e8]'
    }
  `;

  if (!cancha) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Barra_de_navegacion />

      {/* HEADER */}
      <div className="relative h-60 w-full bg-[#03292e] shrink-0">
        <img src={cancha.imagen || "/src/assets/estadio_fondo.jpg"} className="w-full h-full object-cover opacity-30" alt="Fondo" />
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:px-16 text-white bg-gradient-to-t from-[#03292e] to-transparent">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm mb-4 hover:text-[#0ed1e8] w-fit">
            <ChevronLeft size={18} /> Volver
          </button>
          <h1 className="text-4xl font-black">{cancha.nombreEstablecimiento || cancha.nombre}</h1>
          <div className="flex gap-6 mt-2 text-sm opacity-90">
            <span className="flex items-center gap-1"><MapPin size={16} /> {cancha.direccion || cancha.ubicacion}</span>
            <span className="flex items-center gap-1"><Star size={16} fill="#0ed1e8" className="text-[#0ed1e8]" /> 4.5</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8 p-6 md:p-12 relative">
        <div className="flex-1 space-y-8">
          
          {/* SECCIÓN DATOS USUARIO */}
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-[#03292e] mb-6 flex items-center gap-2">
              <User className="text-[#0ed1e8]" size={22}/> Tus Datos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 ml-2 uppercase tracking-widest">Nombre</label>
                <div className="w-full mt-2 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm text-[#03292e] font-bold">
                  {userData.nombre || "No identificado"}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 ml-2 uppercase tracking-widest">Contacto</label>
                <div className="w-full mt-2 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm text-[#03292e] font-bold">
                  {userData.contacto}
                </div>
              </div>
            </div>
          </section>

          {/* HORARIO */}
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-[#03292e] mb-6 flex items-center gap-2">
                <CalendarDays className="text-[#0ed1e8]" size={22}/> Horario
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="date" value={editFecha} onChange={(e) => setEditFecha(e.target.value)} className="p-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-[#03292e] outline-none focus:border-[#0ed1e8]" />
              <input type="time" value={editHora} onChange={(e) => setEditHora(e.target.value)} className="p-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-[#03292e] outline-none focus:border-[#0ed1e8]" />
            </div>
          </section>

          {/* DURACIÓN */}
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-[#03292e] mb-6 flex items-center gap-2">
                <Timer className="text-[#0ed1e8]" size={22}/> Duración
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((num) => (
                <button key={num} onClick={() => setDuracion(num)} className={getButtonClasses(duracion === num)}>
                  {num} {num === 1 ? 'hora' : 'horas'}
                </button>
              ))}
            </div>
          </section>

          {/* CANCHAS ESPECÍFICAS */}
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-[#03292e] mb-6">Selecciona una cancha específica</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {cancha.canchas?.map((item: any) => (
                <button 
                  key={item.canchaId} 
                  onClick={() => setCanchaEspecifica(item.canchaId)} 
                  className={getButtonClasses(canchaEspecifica === item.canchaId)}
                >
                  {item.codigo}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-gradient-to-r from-[#03292e] to-[#0a4149] p-8 rounded-[2.5rem] shadow-xl text-white overflow-hidden relative group">
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
               <Users size={200} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#0ed1e8]/20 rounded-lg">
                  <Users className="text-[#0ed1e8]" size={24}/>
                </div>
                <h3 className="text-xl font-black tracking-tight">¿Te falta equipo o buscas un reto?</h3>
              </div>
              
              <p className="text-gray-300 text-sm max-w-md mb-6 font-medium">
                No dejes de jugar por falta de gente. Publica tu partido en la sección de Match y encuentra rivales o compañeros en segundos.
              </p>
              
              <button 
                onClick={() => navigate('/Match')}
                className="flex items-center gap-2 bg-[#0ed1e8] hover:bg-[#0bc0d5] text-[#03292e] px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95"
              >
                BUSCAR RIVAL AHORA <ArrowRight size={18} />
              </button>
            </div>
          </section>

          {/* BOTÓN FINAL */}
          <button 
            onClick={handleConfirmarReserva}
            disabled={!userData.nombre || !canchaEspecifica || loading}
            className={`w-full py-5 rounded-3xl font-black text-xl shadow-xl transition-all uppercase tracking-widest
              ${(!userData.nombre || !canchaEspecifica || loading) 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-[#03292e] text-white hover:bg-[#0a4149] hover:scale-[1.01]'}`}
          >
            Ir a pagar
          </button>
        </div>

        {/* RESUMEN */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-gray-100 lg:sticky lg:top-10">
            <h3 className="text-xl font-black text-[#03292e] mb-6">Resumen</h3>
            <div className="space-y-4 mb-8 text-gray-500 font-bold text-sm">
               <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#0ed1e8]"/> Pago en el sitio</p>
               <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#0ed1e8]"/> Cancelación permitida</p>
            </div>
            <div className="pt-6 border-t-2 border-gray-50">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total por {duracion} h</p>
              <p className="text-3xl font-black text-[#03292e] mt-1">
                {formatCurrency(precioFinal)} <span className="text-sm font-normal">COP</span>
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}