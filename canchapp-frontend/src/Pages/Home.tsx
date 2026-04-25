import Barra_de_navegacion from '../Components/Barra_navegacion'
import { useNavigate } from 'react-router-dom' 

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* COMPONENTE DE LA BARRA*/}
      <Barra_de_navegacion />

      {/* SECCIÓN HERO CON IMAGEN DE FONDO */}
      <main className="relative flex-1 flex items-center">
        {/* IMAGEN DE FONDO */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/estadio_fondo.jpg" 
            alt="Estadio" 
            className="w-full h-full object-cover"
          />
          {/* Capa oscura para que el texto resalte */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* CONTENIDO TEXTUAL */}
        <div className="relative z-10 px-6 md:px-20 max-w-4xl">
          {/* Badge de disponibilidad */}
          <div className="inline-flex items-center gap-2 bg-[#006070]/80 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-8 border border-[#0ed1e8]/30">
            <div className="w-3 h-3 bg-[#0ed1e8] rounded-full animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Disponible para Popayán</span>
          </div>

          <h1 className="text-white text-5xl md:text-7xl font-black leading-tight">
            Arma tu <span className="text-[#0ed1e8]">equipo</span>,
          </h1>
          <h1 className="text-white text-5xl md:text-7xl font-black leading-tight mt-2">
            encuentra un <span className="text-[#0ed1e8]">rival</span> y ¡A
          </h1>
          <h1 className="text-[#0ed1e8] text-5xl md:text-7xl font-black mt-2">
            JUGAR!
          </h1>

          {/* BOTÓN DE ACCIÓN */}
          <button 
            className="mt-12 bg-[#03292e] text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-[#064e57] transition-all shadow-2xl hover:translate-y-[-2px] active:scale-95"
            onClick={() => navigate('/CanchasPage')}
          >
            Realizar reserva
          </button>
        </div>
      </main>
    </div>
  )
}