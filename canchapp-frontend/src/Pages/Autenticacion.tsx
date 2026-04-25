import { Outlet, useNavigate } from 'react-router-dom';

export default function Autenticacion() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-white overflow-hidden">
      {/* COLUMNA IZQUIERDA: Imagen de fondo azul y silueta que no se mueve*/}
      <div className="relative hidden md:flex md:w-1/2 h-screen sticky top-0 flex-col justify-between bg-[#03292e] overflow-hidden">
        <img src="/assets/fondo_login.jpg" alt="Fondo" className="absolute inset-0 h-full w-full object-cover z-0" />
        <img src="/assets/silueta.png" alt="Jugador" className="absolute bottom-0 left-0 w-full h-[90%] object-contain object-bottom z-10 mix-blend-luminosity opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#03292e] via-transparent to-transparent z-20 opacity-60" />
        
        <div className="relative z-30 p-16 flex flex-col h-full justify-between">
          <img 
            src="/Logo_solo.png" 
            alt="Logo" 
            className="h-12 w-12 object-contain cursor-pointer" 
            onClick={() => navigate('/')} 
          />
          <div className="max-w-xl mb-20 text-white">
            <h1 className="text-5xl lg:text-7xl font-black leading-tight">
              El fútbol de <span className="text-[#0ed1e8]">Popayán</span>
            </h1>
            <p className="mt-8 text-xl text-gray-300 font-medium">
              Organiza tu partido en segundos y encuentra rivales listos para competir
            </p>
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA: Zona de intercambio de formularios */}
        <div className="w-full md:w-1/2 bg-white flex flex-col items-center p-6 lg:p-12 overflow-y-auto h-screen">
            <div className="w-full max-w-md my-auto py-12"> 
                <Outlet /> 
            </div>
        </div>
    </div>
  );
}