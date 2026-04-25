/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Mail, Lock, Eye, ArrowLeft, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { loginUsuario } from '../services/authService';

export default function LoginPage() {
  const navigate = useNavigate();

  // 1. ESTADO DEL FORMULARIO (Mantenemos correo y contrasena)
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: ''
  });

  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 2. FUNCIÓN DE LOGIN CORREGIDA
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const respuesta = await loginUsuario(formData);

      if (respuesta && respuesta.token) {
        const miToken = respuesta.token;
        sessionStorage.setItem('token', miToken);
        sessionStorage.setItem('userEmail', formData.correo);

        let rolFinal = 'Jugador'; // Por defecto

        try {
          // Decodificamos el Token
          const base64Url = miToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const dataToken = JSON.parse(window.atob(base64));

          // BUSCAMOS EL ROL EN TODAS PARTES:
          // 1. En la respuesta directa del servidor (respuesta.rol)
          // 2. En el token (dataToken.rol, dataToken.perfil, etc.)
          rolFinal = respuesta.rol || respuesta.nombrePerfil || dataToken.rol || dataToken.perfil || 'Jugador';

          sessionStorage.setItem('userName', dataToken.nombre_completo || 'Usuario');
          sessionStorage.setItem('userId', dataToken.userId?.toString());
          sessionStorage.setItem('userRole', rolFinal);

          console.log("LOGIN EXITOSO. Rol detectado:", rolFinal);
        } catch (decodError) {
          console.error("Error decodificando:", decodError);
        }

        window.dispatchEvent(new Event("storage"));
        alert("¡Login exitoso!");

        // REDIRECCIÓN ÚNICA (Solo una vez)
        if (rolFinal === 'Propietario' || rolFinal === 'ROLE_PROPIETARIO') {
          navigate('/DashboardPropietario');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error(error);
      alert("Credenciales incorrectas.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-gray-50 flex flex-col items-center w-full max-w-md relative transition-all duration-500">

        <button onClick={() => navigate('/')} className="absolute -top-12 left-0 text-[#03292e] flex items-center gap-2 font-bold hover:text-[#0ed1e8] transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Volver
        </button>

        <div className="mb-6">
          <img src="/assets/Logo_canchapp.png" alt="Logo" className="h-20 w-20 object-contain" />
        </div>

        <h2 className="text-4xl font-extrabold mb-2 text-[#03292e]">¡Bienvenido!</h2>
        <p className="text-gray-400 mb-8 font-medium text-center">Ingresa a tu cuenta para continuar</p>

        <form onSubmit={handleLogin} className="w-full space-y-5">
          {/* CAMPO CORREO */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-600 ml-1">Correo Electrónico</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0ed1e8]" />
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                required
                placeholder="ejemplo@correo.com"
                className="w-full pl-12 pr-4 py-3.5 bg-[#e6effc] rounded-2xl border-2 border-transparent focus:border-[#0ed1e8] outline-none transition-all"
              />
            </div>
          </div>

          {/* CAMPO CONTRASEÑA */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-600 ml-1">Contraseña</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0ed1e8]" />
              <input
                type={mostrarContrasena ? "text" : "password"}
                name="contrasena"
                value={formData.contrasena}
                onChange={handleChange}
                required
                placeholder="Tu contraseña"
                className="w-full pl-12 pr-12 py-3.5 bg-[#e6effc] rounded-2xl border-2 border-transparent focus:border-[#0ed1e8] outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setMostrarContrasena(!mostrarContrasena)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0ed1e8]"
              >
                {mostrarContrasena ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="w-full bg-[#03292e] text-white py-4 rounded-full font-bold hover:bg-[#0a4149] transition-all mt-4 shadow-lg active:scale-95">
            Entrar
          </button>
        </form>

        <div className="mt-8 text-center text-gray-500 font-medium">
          ¿No tienes cuenta? <button onClick={() => navigate('/Registro')} className="font-bold text-[#03292e] hover:underline">Regístrate</button>
        </div>
      </div>
    </div>
  );
}