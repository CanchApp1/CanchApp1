import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserCircle } from 'lucide-react'
import Barra_perfil from './Barra_perfil'
import logo from '../assets/Logo_solo.png'

export default function Barra_de_navegacion() {

  const navigate = useNavigate()
  const [isPerfilOpen, setIsPerfilOpen] = useState(false)

  return (
    <>
      <nav className="bg-[#03292e] h-20 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">

        {/* LOGO COMO BOTÓN */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity active:scale-95"
        >
          <img
            src={logo}
            alt="Logo"
            className="h-10 w-10 object-contain"
          />
          <span className="text-white text-2xl font-bold tracking-tight">Canchapp</span>
        </button>

        {/* NAVEGACIÓN CENTRAL */}
        <div className="hidden md:flex items-center gap-8 text-white font-medium italic">

          <button
            onClick={() => navigate('/')}
            className="hover:text-[#0ed1e8] transition-colors"
          >
            Inicio
          </button>

          <span className="opacity-30">/</span>

          <button
            onClick={() => navigate('/CanchasPage')}
            className={`hover:text-[#0ed1e8] transition-all relative ${window.location.pathname === '/CanchasPage'
                ? 'underline decoration-[#0ed1e8] underline-offset-8 decoration-2'
                : ''
              }`}
          >
            Canchas
          </button>

          <span className="opacity-30">/</span>

          <button
            onClick={() => navigate('/Match')}
            className="hover:text-[#0ed1e8] transition-colors"
          >
            Match
          </button>
        </div>

        {/* PERFIL */}
        <button
          onClick={() => setIsPerfilOpen(true)}
          className="text-white hover:text-[#0ed1e8] transition-transform hover:scale-110"
        >
          <UserCircle size={36} strokeWidth={1.5} />
        </button>

      </nav>

      <Barra_perfil
        isOpen={isPerfilOpen}
        onClose={() => setIsPerfilOpen(false)}
      />
    </>
  )
}