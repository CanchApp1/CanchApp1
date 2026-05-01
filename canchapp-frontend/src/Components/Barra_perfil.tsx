/* eslint-disable react-hooks/set-state-in-effect */
import { X, LogOut, Calendar, Trophy } from 'lucide-react' // Importamos Trophy
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface BarraPerfilProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Barra_perfil({ isOpen, onClose }: BarraPerfilProps) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({
    nombre: 'Usuario',
    rol: 'Invitado',
    correo: ''
  });

  useEffect(() => {
    if (!isOpen) return;

    const token = sessionStorage.getItem('token');
    
    let nombreObtenido = 'Usuario';
    let rolObtenido = 'Invitado';
    let correoObtenido = '';

    if (token) {
      setIsLoggedIn(true);
      try {
        const payloadStr = atob(token.split('.')[1]);
        const payload = JSON.parse(payloadStr);

        nombreObtenido = payload.nombre_completo || 'Usuario';
        rolObtenido = payload.perfil || 'Jugador';
        correoObtenido = payload.sub || '';

        sessionStorage.setItem('userName', nombreObtenido);
        sessionStorage.setItem('userRole', rolObtenido);

      } catch (error) {
        console.error("Error decodificando el token:", error);
      }
    } else {
      setIsLoggedIn(false);
    }

    setUserInfo({
      nombre: nombreObtenido,
      correo: correoObtenido,
      rol: rolObtenido
    });
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] transition-opacity"
          onClick={onClose}
        />
      )}

      <div className={`fixed top-0 right-0 h-full w-80 bg-[#03292e] z-[70] transition-transform duration-300 shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white hover:rotate-90 transition-all cursor-pointer"
        >
          <X size={28} />
        </button>

        <div className="p-8 text-white mt-8 flex flex-col h-full text-center">
          <div className="flex flex-col items-center mb-10">
            <div className="relative">
               <img src="/src/assets/perfil_icono.png" alt="Perfil" className="h-32 w-32 rounded-full border-4 border-[#0ed1e8] shadow-[0_0_15px_rgba(14,209,232,0.3)] object-cover" />
               <div className="absolute bottom-1 right-1 bg-[#0ed1e8] h-6 w-6 rounded-full border-2 border-[#03292e]"></div>
            </div>

            <h3 className="text-xl font-bold mt-4 break-words w-full uppercase tracking-tight">
              {isLoggedIn ? userInfo.nombre : 'Invitado'}
            </h3>
            
            {isLoggedIn && (
              <>
                <div className="mt-2 px-4 py-1 bg-[#0ed1e8]/20 border border-[#0ed1e8]/30 rounded-full">
                   <span className="text-[#0ed1e8] text-xs font-bold uppercase tracking-widest">
                    {userInfo.rol}
                   </span>
                </div>
                
                {userInfo.correo && (
                  <span className="text-sm text-gray-400 mt-3 truncate max-w-full opacity-60 italic" title={userInfo.correo}>
                    {userInfo.correo}
                  </span>
                )}
              </>
            )}
          </div>

          {/* SECCIÓN DE BOTONES DE ACCIÓN */}
          <div className="flex-1 space-y-3">
            <hr className="border-white/10 my-6" />
            
            {isLoggedIn && (
              <>
                {/* Botón: Mis Reservas */}
                <button
                  onClick={() => {
                    navigate('/MisReservas');
                    onClose();
                  }}
                  className="w-full flex items-center gap-4 bg-white/5 hover:bg-[#0ed1e8] hover:text-[#03292e] p-4 rounded-2xl transition-all group font-semibold border border-white/5"
                >
                  <div className="bg-[#0ed1e8]/10 group-hover:bg-white/20 p-2 rounded-lg">
                    <Calendar size={22} className="text-[#0ed1e8] group-hover:text-[#03292e]" />
                  </div>
                  Mis Reservas
                </button>

                {/* NUEVO Botón: Mis Partidos */}
                <button
                  onClick={() => {
                    navigate('/MisPartidos'); // Navega a la ruta de partidos
                    onClose();
                  }}
                  className="w-full flex items-center gap-4 bg-white/5 hover:bg-[#0ed1e8] hover:text-[#03292e] p-4 rounded-2xl transition-all group font-semibold border border-white/5"
                >
                  <div className="bg-[#0ed1e8]/10 group-hover:bg-white/20 p-2 rounded-lg">
                    <Trophy size={22} className="text-[#0ed1e8] group-hover:text-[#03292e]" />
                  </div>
                  Mis Partidos
                </button>
              </>
            )}
          </div>

          <div className="pb-8">
            {isLoggedIn ? (
              <button
                onClick={() => {
                  sessionStorage.clear();
                  window.dispatchEvent(new Event("storage"));
                  navigate('/');
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white py-3 rounded-xl transition-all font-bold border border-red-500/20 active:scale-95"
              >
                <LogOut size={20} />
                Cerrar Sesión
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate('/Login');
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#0ed1e8] text-[#03292e] hover:bg-white py-3 rounded-xl transition-all font-bold active:scale-95"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}