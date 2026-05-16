import { useState, useEffect, useRef } from 'react';
import { X, Building2, MapPin, Phone, ImagePlus, Trash2 } from 'lucide-react';
import { actualizarEstablecimiento, subirImagenEstablecimiento } from '../../services/establecimientoService';

interface Props {
    visible: boolean;
    establecimiento: any;
    onCerrar: () => void;
    onExito: () => void;
}

export default function ModalEditarEstablecimiento({ visible, establecimiento, onCerrar, onExito }: Props) {
    const [form, setForm] = useState({ nombreEstablecimiento: '', direccion: '', numeroTelefono: '' });
    const [imagenActual, setImagenActual] = useState<string | null>(null);
    const [archivoNuevo, setArchivoNuevo] = useState<File | null>(null);
    const [previewNuevo, setPreviewNuevo] = useState<string | null>(null);
    const [eliminarFoto, setEliminarFoto] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!visible || !establecimiento) return;
        setForm({
            nombreEstablecimiento: establecimiento.nombreEstablecimiento || '',
            direccion: establecimiento.direccion || '',
            numeroTelefono: establecimiento.numeroTelefono || '',
        });
        setImagenActual(establecimiento.imagenUrl || null);
        setArchivoNuevo(null);
        setPreviewNuevo(null);
        setEliminarFoto(false);
        setError('');
    }, [visible, establecimiento]);

    const handleArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setArchivoNuevo(file);
        setEliminarFoto(false);
        setPreviewNuevo(URL.createObjectURL(file));
    };

    const handleEliminarFoto = () => {
        setArchivoNuevo(null);
        setPreviewNuevo(null);
        setEliminarFoto(true);
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardando(true);
        setError('');
        try {
            let imagenUrl: string | null | undefined = undefined;

            if (archivoNuevo) {
                imagenUrl = await subirImagenEstablecimiento(archivoNuevo);
            } else if (eliminarFoto) {
                imagenUrl = '';
            }

            await actualizarEstablecimiento(establecimiento.establecimientoId, {
                ...form,
                ...(imagenUrl !== undefined && { imagenUrl }),
            });

            onExito();
            onCerrar();
        } catch (err: any) {
            setError(err?.response?.data || 'Error al guardar los cambios.');
        } finally {
            setGuardando(false);
        }
    };

    if (!visible) return null;

    const fotoActiva = previewNuevo || (!eliminarFoto ? imagenActual : null);

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-lg p-8 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-[#03292e]">Editar establecimiento</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Actualiza los datos de tu local</p>
                    </div>
                    <button onClick={onCerrar} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-500 text-sm px-4 py-3 rounded-2xl font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleGuardar} className="flex flex-col gap-4">

                    {/* Foto */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            <ImagePlus size={13} /> Foto del establecimiento
                            <span className="text-gray-300 normal-case font-normal">(opcional)</span>
                        </label>

                        {fotoActiva ? (
                            <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-gray-100">
                                <img src={fotoActiva} alt="Establecimiento" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={handleEliminarFoto}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                className="w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#0ed1e8] hover:text-[#0ed1e8] transition-all"
                            >
                                <ImagePlus size={28} />
                                <span className="text-xs font-bold">Subir foto</span>
                            </button>
                        )}

                        {!fotoActiva && (
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                className="text-xs text-[#0ed1e8] font-bold hover:underline text-left"
                            >
                                Seleccionar archivo...
                            </button>
                        )}

                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleArchivo}
                            className="hidden"
                        />
                    </div>

                    {/* Nombre */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Building2 size={13} /> Nombre del local
                        </label>
                        <input
                            type="text"
                            value={form.nombreEstablecimiento}
                            onChange={(e) => setForm({ ...form, nombreEstablecimiento: e.target.value })}
                            required
                            className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium text-gray-700 border-none focus:ring-2 focus:ring-[#0ed1e8] transition-all outline-none"
                        />
                    </div>

                    {/* Dirección */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin size={13} /> Dirección
                        </label>
                        <input
                            type="text"
                            value={form.direccion}
                            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                            required
                            className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium text-gray-700 border-none focus:ring-2 focus:ring-[#0ed1e8] transition-all outline-none"
                        />
                    </div>

                    {/* Teléfono */}
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
            </div>
        </div>
    );
}
