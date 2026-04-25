import { User, Mail, Lock, ArrowLeft, Calendar, Phone, MapPin, Building2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { registerUsuario, registerPropietario } from '../services/authService';

export default function Registro() {
  const navigate = useNavigate();

  const [role, setRole] = useState<'jugador' | 'propietario'>('jugador');

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    fechaNacimiento: '',
    numeroTelefono: '',
    contrasena: '',
    confirmarContrasena: '',
    // Campos extra para el Propietario
    nombreEstablecimiento: '',
    direccionEstablecimiento: '',
    telefonoEstablecimiento: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calcularEdad = (fechaNacimiento: string) => {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const cumpleanos = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - cumpleanos.getFullYear();
    const mes = hoy.getMonth() - cumpleanos.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < cumpleanos.getDate())) {
      edad--;
    }
    return edad;
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.correo.includes('@')) {
      alert("Por favor, ingresa una dirección de correo electrónico válida que contenga '@'.");
      return;
    }

    if (formData.contrasena !== formData.confirmarContrasena) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    try {
      if (role === 'jugador') {
        // LÓGICA 1: REGISTRO JUGADOR
        const datosJugador = {
          correo: formData.correo,
          contrasena: formData.contrasena,
          nombre: formData.nombre,
          fechaNacimiento: formData.fechaNacimiento,
          numeroTelefono: formData.numeroTelefono,
          edad: calcularEdad(formData.fechaNacimiento),
          nombrePerfil: 'Jugador'
        };
        await registerUsuario(datosJugador);

      } else {
        // LÓGICA 2: REGISTRO PROPIETARIO (JSON exacto del Backend)
        const datosPropietario = {
          nombreEstablecimiento: formData.nombreEstablecimiento,
          direccion: formData.direccionEstablecimiento,
          numeroTelefono: formData.telefonoEstablecimiento,
          usuario: {
            nombre: formData.nombre,
            correo: formData.correo,
            contrasena: formData.contrasena,
            fechaNacimiento: formData.fechaNacimiento,
            numeroTelefono: formData.numeroTelefono,
            edad: calcularEdad(formData.fechaNacimiento),
            perfil: {
              codigo: "ADMIN" // Como lo pidió el backend
            }
          }
        };
        await registerPropietario(datosPropietario);
      }

      alert("¡Cuenta creada exitosamente! Ahora inicia sesión.");
      navigate('/Login');

    } catch (error) {
      console.error("Error al registrar:", error);
      alert("Hubo un error al crear la cuenta. Intenta de nuevo.");
    }
  };

  return (
    <div className="relative">
      <button onClick={() => navigate('/Login')} className="absolute -top-12 left-0 text-[#03292e] flex items-center gap-2 font-bold hover:text-[#0ed1e8] transition-colors group">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Volver
      </button>

      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-50 flex flex-col items-center transition-all duration-500 animate-in fade-in slide-in-from-left-4">
        <div className="mb-6">
          <img src="/assets/Logo_canchapp.png" alt="Logo" className="h-20 w-20 object-contain" />
        </div>
        <h2 className="text-4xl font-extrabold mb-2 text-[#03292e]">Crea tu cuenta</h2>
        <p className="text-gray-400 mb-6 font-medium text-center">Selecciona tu tipo de perfil para continuar</p>

        {/* Selector de Rol */}
        <div className="flex w-full bg-[#e6effc] p-1.5 rounded-2xl mb-8">
          <button type="button" onClick={() => setRole('jugador')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ease-in-out ${role === 'jugador' ? 'bg-[#03292e] text-white shadow-md scale-100' : 'text-gray-500 hover:text-gray-700 scale-95 hover:bg-white/50'}`}>
            Jugador
          </button>
          <button type="button" onClick={() => setRole('propietario')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ease-in-out ${role === 'propietario' ? 'bg-[#03292e] text-white shadow-md scale-100' : 'text-gray-500 hover:text-gray-700 scale-95 hover:bg-white/50'}`}>
            Propietario
          </button>
        </div>

        <form onSubmit={handleRegistro} className="w-full space-y-4">

          {/* DATOS PERSONALES (Comunes para ambos) */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-600 ml-1">Nombre Completo</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0ed1e8] transition-colors" />
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Ingresar nombre completo" className="w-full pl-12 pr-4 py-3 bg-[#e6effc] rounded-2xl border-2 border-transparent focus:border-[#0ed1e8] outline-none transition-all text-gray-900 font-medium" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-600 ml-1">Correo</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0ed1e8] transition-colors" />
              <input type="email" name="correo" value={formData.correo} onChange={handleChange} required placeholder="ejemplo@correo.com" className="w-full pl-12 pr-4 py-3 bg-[#e6effc] rounded-2xl border-2 border-transparent focus:border-[#0ed1e8] outline-none transition-all text-gray-900 font-medium" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-600 ml-1">Nacimiento</label>
              <div className="relative group">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0ed1e8] transition-colors" />
                <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} required className="w-full pl-10 pr-2 py-3 bg-[#e6effc] rounded-2xl border-2 border-transparent focus:border-[#0ed1e8] outline-none transition-all text-gray-900 font-medium text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-600 ml-1">Teléfono</label>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0ed1e8] transition-colors" />
                <input type="tel" name="numeroTelefono" value={formData.numeroTelefono} onChange={handleChange} required placeholder="300 123 4567" className="w-full pl-10 pr-2 py-3 bg-[#e6effc] rounded-2xl border-2 border-transparent focus:border-[#0ed1e8] outline-none transition-all text-gray-900 font-medium text-sm" />
              </div>
            </div>
          </div>

          {/* SECCIÓN DINÁMICA: Solo se muestra si es Propietario */}
          {role === 'propietario' && (
            <div className="space-y-4 pt-4 mt-4 border-t-2 border-gray-100 animate-in fade-in slide-in-from-top-2">
              <h3 className="text-lg font-bold text-[#03292e] flex items-center gap-2">
                <Building2 size={20} className="text-[#0ed1e8]" />
                Datos de tu Establecimiento
              </h3>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-600 ml-1">Nombre de tu Establecimiento</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0ed1e8] transition-colors" />
                  <input type="text" name="nombreEstablecimiento" value={formData.nombreEstablecimiento} onChange={handleChange} required={role === 'propietario'} placeholder="Ej: Canchas El Golazo" className="w-full pl-12 pr-4 py-3 bg-[#e6effc] rounded-2xl border-2 border-transparent focus:border-[#0ed1e8] outline-none transition-all text-gray-900 font-medium" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-600 ml-1">Dirección</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0ed1e8] transition-colors" />
                  <input type="text" name="direccionEstablecimiento" value={formData.direccionEstablecimiento} onChange={handleChange} required={role === 'propietario'} placeholder="Ej: Calle 123 #45-67" className="w-full pl-12 pr-4 py-3 bg-[#e6effc] rounded-2xl border-2 border-transparent focus:border-[#0ed1e8] outline-none transition-all text-gray-900 font-medium" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-600 ml-1">Teléfono del lugar</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0ed1e8] transition-colors" />
                  <input type="tel" name="telefonoEstablecimiento" value={formData.telefonoEstablecimiento} onChange={handleChange} required={role === 'propietario'} placeholder="Ej: 310 987 6543" className="w-full pl-12 pr-4 py-3 bg-[#e6effc] rounded-2xl border-2 border-transparent focus:border-[#0ed1e8] outline-none transition-all text-gray-900 font-medium" />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-600 ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0ed1e8] transition-colors" />
                <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required placeholder="******" className="w-full pl-10 pr-2 py-3 bg-[#e6effc] rounded-2xl border-2 border-transparent focus:border-[#0ed1e8] outline-none transition-all text-gray-900 font-medium" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-600 ml-1">Confirmar</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0ed1e8] transition-colors" />
                <input type="password" name="confirmarContrasena" value={formData.confirmarContrasena} onChange={handleChange} required placeholder="******" className="w-full pl-10 pr-2 py-3 bg-[#e6effc] rounded-2xl border-2 border-transparent focus:border-[#0ed1e8] outline-none transition-all text-gray-900 font-medium" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-[#03292e] text-white py-4 rounded-full font-bold text-lg hover:bg-[#0a4149] transition-all shadow-xl shadow-[#03292e]/20 active:scale-95 mt-6">
            Crear cuenta
          </button>
        </form>
      </div>
    </div>
  )
}