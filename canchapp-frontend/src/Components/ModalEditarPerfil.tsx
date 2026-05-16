import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Lock } from 'lucide-react';
import { obtenerMiPerfil, actualizarMiPerfil } from '../services/usuarioService';

interface Props {
    visible: boolean;
    onCerrar: () => void;
    onExito: () => void;
}

export default function ModalEditarPerfil({ visible, onCerrar, onExito }: Props) {
    const [form, setForm] = useState({ nombre: '', correo: '', numeroTelefono: '', contrasena: '' });
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!visible) return;
        setCargando(true);
        setError('');
        obtenerMiPerfil()
            .then((data) => {
                setForm({
                    nombre: data.nombre || '',
                    correo: data.correo || '',
                    numeroTelefono: data.numeroTelefono || '',
                    contrasena: '',
                });
            })
            .catch(() => setError('No se pudo cargar el perfil.'))
            .finally(() => setCargando(false));
    }, [visible]);

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardando(true);
        setError('');
        try {
            const payload: Parameters<typeof actualizarMiPerfil>[0] = {
                nombre: form.nombre,
                correo: form.correo,
                numeroTelefono: form.numeroTelefono,
            };
            if (form.contrasena.trim()) payload.contrasena = form.contrasena;
            await actualizarMiPerfil(payload);
            onExito();
            onCerrar();
        } catch (err: any) {
            setError(err?.response?.data || 'Error al guardar los cambios.');
        } finally {
            setGuardando(false);
        }
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
            <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-md p-8 flex flex-col gap-5">

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-[#03292e]">Editar perfil</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Actualiza tus datos personales</p>
                    </div>
                    <button onClick={onCerrar} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {cargando ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0ed1e8]" />
                    </div>
                ) : (
                    <form onSubmit={handleGuardar} className="flex flex-col gap-4">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-500 text-sm px-4 py-3 rounded-2xl font-medium">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                <User size={13} /> Nombre completo
                            </label>
                            <input
                                type="text"
                                value={form.nombre}
                                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                required
                                className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium text-gray-700 border-none focus:ring-2 focus:ring-[#0ed1e8] transition-all outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Mail size={13} /> Correo electrónico
                            </label>
                            <input
                                type="email"
                                value={form.correo}
                                onChange={(e) => setForm({ ...form, correo: e.target.value })}
                                required
                                className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium text-gray-700 border-none focus:ring-2 focus:ring-[#0ed1e8] transition-all outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Phone size={13} /> Teléfono
                            </label>
                            <input
                                type="tel"
                                value={form.numeroTelefono}
                                onChange={(e) => setForm({ ...form, numeroTelefono: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium text-gray-700 border-none focus:ring-2 focus:ring-[#0ed1e8] transition-all outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Lock size={13} /> Nueva contraseña
                                <span className="text-gray-300 normal-case font-normal">(opcional)</span>
                            </label>
                            <input
                                type="password"
                                value={form.contrasena}
                                onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
                                placeholder="Dejar vacío para no cambiar"
                                className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium text-gray-700 border-none focus:ring-2 focus:ring-[#0ed1e8] transition-all outline-none"
                            />
                        </div>

                        <div className="flex gap-3 pt-1">
                            <button
                                type="button"
                                onClick={onCerrar}
                                className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-500 text-sm font-bold hover:bg-gray-200 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={guardando}
                                className="flex-1 py-3 rounded-2xl bg-[#03292e] text-white text-sm font-bold hover:bg-[#0ed1e8] hover:text-[#03292e] transition-all disabled:opacity-60"
                            >
                                {guardando ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
