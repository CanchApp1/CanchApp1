import { useState } from 'react';
import { Mail, Lock, Key, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// Importamos el servicio centralizado
import { passwordService } from '../services/usuarioService'; 

export default function RecuperarPassword() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mostrarPass, setMostrarPass] = useState(false);
  
  const [formData, setFormData] = useState({
    correo: '',
    codigo: '',
    nuevaPassword: ''
  });

  // --- LÓGICA UTILIZANDO EL SERVICIO CENTRALIZADO ---

  const handleSolicitar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Usamos la función del servicio
      await passwordService.solicitar({ correo: formData.correo }); 
      setPaso(2);
    } catch (err) {
      alert("No pudimos enviar el código. Verifica que el correo sea correcto.");
    } finally {
      setLoading(false);
    }
  };

  const handleValidar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Usamos la función del servicio
      const esValido = await passwordService.validar({ 
        correo: formData.correo, 
        codigo: formData.codigo 
      });
      
      if (esValido) {
        setPaso(3);
      } else {
        alert("El código ingresado es incorrecto o ya expiró.");
      }
    } catch (err) {
      alert("Error al validar el código.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestablecer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        // IMPORTANTE: Enviamos los 3 campos que ahora espera el DTO
        await passwordService.restablecer({ 
        correo: formData.correo, 
        nuevaContrasena: formData.nuevaPassword,
        codigo: formData.codigo // <--- Incluimos el código aquí
        });
        setPaso(4);
    } catch (err) {
        console.error(err);
        alert("Error al restablecer la contraseña. Asegúrate de que el código siga siendo válido.");
    } finally {
        setLoading(false);
    }
    };

  return (
    <div className="w-full max-w-md animate-in fade-in duration-500">
      {paso < 4 && (
        <button 
          onClick={() => paso === 1 ? navigate('/Login') : setPaso(paso - 1)}
          className="flex items-center gap-2 text-gray-400 hover:text-[#03292e] mb-6 transition-colors font-bold group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          {paso === 1 ? 'Volver al Login' : 'Regresar'}
        </button>
      )}

      <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-gray-100">
        
        {paso === 1 && (
          <form onSubmit={handleSolicitar} className="animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black text-[#03292e] mb-2 tracking-tight">Recuperar Acceso</h2>
            <p className="text-gray-500 mb-8 text-sm">Ingresa tu correo para recibir un código de seguridad.</p>
            
            <div className="space-y-4">
              <div className="relative group text-left">
                <label className="text-xs font-bold text-gray-500 ml-1">Correo Electrónico</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0ed1e8]" />
                  <input 
                    type="email" 
                    required 
                    className="w-full pl-12 pr-4 py-4 bg-[#e6effc] rounded-2xl outline-none border-2 border-transparent focus:border-[#0ed1e8] transition-all"
                    onChange={(e) => setFormData({...formData, correo: e.target.value})} 
                  />
                </div>
              </div>
              <button disabled={loading} className="w-full bg-[#03292e] text-white py-4 rounded-full font-bold shadow-lg hover:bg-[#0a4149] transition-all active:scale-95">
                {loading ? "Enviando..." : "Enviar Código"}
              </button>
            </div>
          </form>
        )}

        {paso === 2 && (
          <form onSubmit={handleValidar} className="animate-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-black text-[#03292e] mb-2 tracking-tight">Verifica tu correo</h2>
            <p className="text-gray-500 mb-8 text-sm">Ingresa el código enviado a <span className="font-bold text-[#03292e]">{formData.correo}</span></p>
            
            <div className="space-y-4">
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0ed1e8]" />
                <input 
                  type="text" 
                  required 
                  maxLength={6}
                  className="w-full pl-12 pr-4 py-4 bg-[#e6effc] rounded-2xl outline-none border-2 border-transparent focus:border-[#0ed1e8] transition-all tracking-[0.5em] font-black text-center text-xl text-[#03292e]"
                  onChange={(e) => setFormData({...formData, codigo: e.target.value})} 
                />
              </div>
              <button disabled={loading} className="w-full bg-[#03292e] text-white py-4 rounded-full font-bold shadow-lg">
                {loading ? "Validando..." : "Validar Código"}
              </button>
            </div>
          </form>
        )}

        {paso === 3 && (
          <form onSubmit={handleRestablecer} className="animate-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-black text-[#03292e] mb-2 tracking-tight">Nueva Clave</h2>
            <p className="text-gray-500 mb-8 text-sm">Crea una nueva contraseña para tu cuenta.</p>
            
            <div className="space-y-4">
              <div className="relative group text-left">
                <label className="text-xs font-bold text-gray-500 ml-1">Contraseña</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0ed1e8]" />
                  <input 
                    type={mostrarPass ? "text" : "password"} 
                    required 
                    className="w-full pl-12 pr-12 py-4 bg-[#e6effc] rounded-2xl outline-none border-2 border-transparent focus:border-[#0ed1e8] transition-all"
                    onChange={(e) => setFormData({...formData, nuevaPassword: e.target.value})} 
                  />
                  <button type="button" onClick={() => setMostrarPass(!mostrarPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {mostrarPass ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <button disabled={loading} className="w-full bg-[#03292e] text-white py-4 rounded-full font-bold shadow-lg">
                {loading ? "Actualizando..." : "Restablecer Contraseña"}
              </button>
            </div>
          </form>
        )}

        {paso === 4 && (
          <div className="text-center animate-in zoom-in duration-500">
            <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-emerald-500" size={48} />
            </div>
            <h2 className="text-3xl font-black text-[#03292e] mb-2 tracking-tight">¡Éxito!</h2>
            <p className="text-gray-500 mb-8 text-sm font-medium">Contraseña actualizada. Ya puedes entrar.</p>
            <button onClick={() => navigate('/Login')} className="w-full bg-[#0ed1e8] text-[#03292e] py-4 rounded-full font-black shadow-lg">
              Ir al Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}