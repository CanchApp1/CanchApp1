import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, X, ShieldBan, CalendarX2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginUsuario } from '../services/authService';
import { useToast } from '../context/ToastContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    /** Se llama solo si el login fue exitoso Y el rol es Jugador (Propietario redirige al dashboard). */
    onSuccess: () => void;
}

interface SuspensionData {
    tipoSuspension: string | null;
    fechaReactivacion: string | null;
}

export default function ModalLoginAuth({ isOpen, onClose, onSuccess }: Props) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [formData, setFormData] = useState({ correo: '', contrasena: '' });
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [suspension, setSuspension] = useState<SuspensionData | null>(null);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCerrar = () => {
        setSuspension(null);
        setFormData({ correo: '', contrasena: '' });
        onClose();
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargando(true);
        try {
            const respuesta = await loginUsuario(formData);

            if (respuesta?.error === 'CUENTA_SUSPENDIDA') {
                setSuspension({
                    tipoSuspension: respuesta.tipoSuspension ?? null,
                    fechaReactivacion: respuesta.fechaReactivacion ?? null,
                });
                return;
            }

            if (respuesta?.token) {
                const miToken = respuesta.token;
                sessionStorage.setItem('token', miToken);
                sessionStorage.setItem('userEmail', formData.correo);

                let rolFinal = 'Jugador';
                try {
                    const base64Url = miToken.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const dataToken = JSON.parse(window.atob(base64));
                    rolFinal = respuesta.rol || respuesta.nombrePerfil || dataToken.rol || dataToken.perfil || 'Jugador';
                    sessionStorage.setItem('userName', dataToken.nombre_completo || 'Usuario');
                    sessionStorage.setItem('userId', dataToken.userId?.toString());
                    sessionStorage.setItem('userRole', rolFinal);
                } catch { /* token decode failure — rol stays Jugador */ }

                window.dispatchEvent(new Event('storage'));
                toast('¡Login exitoso!', 'success');
                onClose();

                if (rolFinal === 'Propietario' || rolFinal === 'ROLE_PROPIETARIO') {
                    navigate('/DashboardPropietario');
                } else {
                    onSuccess();
                }
            }
        } catch {
            toast('Credenciales incorrectas.', 'error');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#03292e]/60 backdrop-blur-sm">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-gray-50 flex flex-col items-center w-full max-w-md relative">

                <button
                    onClick={handleCerrar}
                    className="absolute top-5 right-5 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
                >
                    <X size={18} className="text-gray-500" />
                </button>

                {suspension ? (
                    /* ── VISTA DE SUSPENSIÓN ── */
                    <div className="w-full flex flex-col items-center text-center gap-5 pt-4">
                        <div className="bg-red-100 p-5 rounded-3xl">
                            <ShieldBan size={48} className="text-red-500" />
                        </div>

                        <div>
                            <h2 className="text-2xl font-extrabold text-[#03292e] mb-1">Cuenta Suspendida</h2>
                            <p className="text-gray-400 text-sm font-medium">
                                No puedes acceder a la plataforma en este momento.
                            </p>
                        </div>

                        <div className={`w-full rounded-2xl px-5 py-4 text-sm font-bold ${
                            suspension.tipoSuspension === 'TEMPORAL'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-red-50 text-red-700'
                        }`}>
                            {suspension.tipoSuspension === 'TEMPORAL' ? 'Suspensión Temporal' : 'Suspensión Permanente'}
                        </div>

                        {suspension.tipoSuspension === 'TEMPORAL' && suspension.fechaReactivacion && (
                            <div className="w-full flex items-center gap-3 bg-blue-50 rounded-2xl px-5 py-4">
                                <CalendarX2 size={20} className="text-blue-500 shrink-0" />
                                <div className="text-left">
                                    <p className="text-xs text-gray-400 font-medium">Reactivación automática el</p>
                                    <p className="text-sm font-black text-[#03292e]">
                                        {new Date(suspension.fechaReactivacion + 'T00:00:00').toLocaleDateString('es-CO', {
                                            day: 'numeric', month: 'long', year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}

                        <p className="text-xs text-gray-400">
                            Si consideras que esto es un error, contacta a soporte en{' '}
                            <span className="font-bold text-[#0ed1e8]">soporte@canchapp.com</span>
                        </p>

                        <button
                            onClick={handleCerrar}
                            className="w-full bg-[#03292e] text-white py-3.5 rounded-full font-bold hover:bg-[#0a4149] transition-all"
                        >
                            Entendido
                        </button>
                    </div>
                ) : (
                    /* ── VISTA DE LOGIN ── */
                    <>
                        <div className="mb-6">
                            <img src="/assets/Logo_canchapp.png" alt="Logo" className="h-20 w-20 object-contain" />
                        </div>

                        <h2 className="text-4xl font-extrabold mb-2 text-[#03292e]">¡Bienvenido!</h2>
                        <p className="text-gray-400 mb-8 font-medium text-center">Ingresa a tu cuenta para continuar</p>

                        <form onSubmit={handleLogin} className="w-full space-y-5">
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

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-600 ml-1">Contraseña</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0ed1e8]" />
                                    <input
                                        type={mostrarContrasena ? 'text' : 'password'}
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

                            <div className="w-full flex justify-end px-2">
                                <button
                                    type="button"
                                    onClick={() => { onClose(); navigate('/recuperar-password'); }}
                                    className="text-sm font-bold text-[#0ed1e8] hover:text-[#03292e] transition-colors"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={cargando}
                                className="w-full bg-[#03292e] text-white py-4 rounded-full font-bold hover:bg-[#0a4149] transition-all mt-4 shadow-lg active:scale-95 disabled:opacity-60"
                            >
                                {cargando ? 'Entrando...' : 'Entrar'}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-gray-500 font-medium">
                            ¿No tienes cuenta?{' '}
                            <button
                                onClick={() => { onClose(); navigate('/Registro'); }}
                                className="font-bold text-[#03292e] hover:underline"
                            >
                                Regístrate
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
