import { useState, useEffect, useMemo } from 'react';
import { Search, ChevronLeft, UserX, UserCheck, Trash2, Edit2, Save, X, Plus } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import {
    listarUsuariosAdmin, editarUsuarioAdmin,
    cambiarEstadoUsuario, eliminarUsuarioAdmin, crearUsuarioAdmin,
} from '../../services/adminService';

type Tab = 'TODOS' | 'JUGADOR' | 'PROPIETARIO';

const BADGE: Record<string, string> = {
    activo:    'bg-green-100 text-green-700',
    temporal:  'bg-yellow-100 text-yellow-700',
    permanente:'bg-red-100 text-red-600',
};

export default function VistaUsuariosAdmin() {
    const { toast } = useToast();
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    const [tab, setTab] = useState<Tab>('TODOS');
    const [busqueda, setBusqueda] = useState('');
    const [seleccionado, setSeleccionado] = useState<any | null>(null);

    // Estados para acciones
    const [editando, setEditando] = useState(false);
    const [formEdit, setFormEdit] = useState({ nombre: '', correo: '', numeroTelefono: '' });
    const [modalEstado, setModalEstado] = useState(false);
    const [tipoSuspension, setTipoSuspension] = useState<'TEMPORAL' | 'PERMANENTE'>('PERMANENTE');
    const [fechaReactivacion, setFechaReactivacion] = useState('');
    const [pasoEliminar, setPasoEliminar] = useState(0);
    const [modalCrear, setModalCrear] = useState(false);
    const [formCrear, setFormCrear] = useState({
        nombre: '', correo: '', contrasena: '', numeroTelefono: '',
        edad: '', fechaNacimiento: '', perfilCodigo: 'JUGADOR',
    });

    const cargar = async () => {
        setCargando(true);
        try {
            const data = await listarUsuariosAdmin(tab === 'TODOS' ? undefined : tab);
            setUsuarios(data);
        } catch {
            toast('Error al cargar usuarios.', 'error');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { cargar(); }, [tab]);

    const filtrados = useMemo(() =>
        usuarios.filter(u =>
            !busqueda ||
            u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            u.correo?.toLowerCase().includes(busqueda.toLowerCase()) ||
            u.numeroTelefono?.includes(busqueda)
        ), [usuarios, busqueda]);

    const estadoBadge = (u: any) => {
        if (u.estado === false || u.estado === 0) {
            return u.tipoSuspension === 'TEMPORAL' ? BADGE.temporal : BADGE.permanente;
        }
        return BADGE.activo;
    };

    const estadoLabel = (u: any) => {
        if (u.estado === false || u.estado === 0) {
            return u.tipoSuspension === 'TEMPORAL' ? 'Suspensión temporal' : 'Suspensión permanente';
        }
        return 'Activo';
    };

    // ── Guardar edición ───────────────────────────────────────────────
    const guardarEdicion = async () => {
        try {
            await editarUsuarioAdmin(seleccionado.idUsuario, formEdit);
            toast('Usuario actualizado.', 'success');
            setEditando(false);
            const actualizado = { ...seleccionado, ...formEdit };
            setSeleccionado(actualizado);
            cargar();
        } catch {
            toast('Error al actualizar.', 'error');
        }
    };

    // ── Cambiar estado ────────────────────────────────────────────────
    const aplicarCambioEstado = async (activar: boolean) => {
        try {
            const body: any = { estado: activar };
            if (!activar) {
                body.tipoSuspension = tipoSuspension;
                if (tipoSuspension === 'TEMPORAL' && fechaReactivacion) {
                    body.fechaReactivacion = fechaReactivacion;
                }
            }
            const actualizado = await cambiarEstadoUsuario(seleccionado.idUsuario, body);
            setSeleccionado(actualizado);
            setModalEstado(false);
            toast(activar ? 'Usuario reactivado.' : 'Usuario suspendido.', 'success');
            cargar();
        } catch {
            toast('Error al cambiar estado.', 'error');
        }
    };

    // ── Eliminar (triple confirmación) ────────────────────────────────
    const avanzarEliminar = async () => {
        if (pasoEliminar < 2) {
            setPasoEliminar(p => p + 1);
        } else {
            try {
                await eliminarUsuarioAdmin(seleccionado.idUsuario);
                toast('Usuario eliminado.', 'success');
                setSeleccionado(null);
                setPasoEliminar(0);
                cargar();
            } catch {
                toast('Error al eliminar.', 'error');
            }
        }
    };

    // ── Crear usuario ─────────────────────────────────────────────────
    const crearUsuario = async () => {
        try {
            await crearUsuarioAdmin({ ...formCrear, edad: Number(formCrear.edad) });
            toast('Usuario creado exitosamente.', 'success');
            setModalCrear(false);
            setFormCrear({ nombre: '', correo: '', contrasena: '', numeroTelefono: '', edad: '', fechaNacimiento: '', perfilCodigo: 'JUGADOR' });
            cargar();
        } catch {
            toast('Error al crear usuario.', 'error');
        }
    };

    // ── Vista detalle ─────────────────────────────────────────────────
    if (seleccionado) {
        const activo = seleccionado.estado !== false && seleccionado.estado !== 0;
        return (
            <div className="space-y-6">
                <button onClick={() => { setSeleccionado(null); setEditando(false); setPasoEliminar(0); }}
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#03292e] transition-colors">
                    <ChevronLeft size={18} /> Volver a usuarios
                </button>

                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
                    {/* Cabecera */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-2xl bg-[#0ed1e8]/20 flex items-center justify-center text-[#03292e] text-2xl font-black">
                                {seleccionado.nombre?.[0]?.toUpperCase() ?? '?'}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-[#03292e]">{seleccionado.nombre}</h2>
                                <span className={`text-xs font-black px-3 py-1 rounded-full ${estadoBadge(seleccionado)}`}>
                                    {estadoLabel(seleccionado)}
                                </span>
                            </div>
                        </div>
                        <span className="text-xs font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full uppercase tracking-wider">
                            {seleccionado.perfil?.nombre ?? '—'}
                        </span>
                    </div>

                    {/* Campos */}
                    {editando ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { label: 'Nombre', key: 'nombre' },
                                { label: 'Correo', key: 'correo' },
                                { label: 'Teléfono', key: 'numeroTelefono' },
                            ].map(({ label, key }) => (
                                <div key={key}>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                                    <input
                                        value={(formEdit as any)[key]}
                                        onChange={e => setFormEdit(f => ({ ...f, [key]: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0ed1e8] outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { label: 'Correo', value: seleccionado.correo },
                                { label: 'Teléfono', value: seleccionado.numeroTelefono ?? '—' },
                                { label: 'Miembro desde', value: seleccionado.fechaCreacion?.slice(0, 10) ?? '—' },
                            ].map(({ label, value }) => (
                                <div key={label} className="bg-gray-50 rounded-2xl p-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                                    <p className="text-sm font-bold text-[#03292e] mt-1 truncate">{value}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Acciones */}
                    <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
                        {editando ? (
                            <>
                                <button onClick={guardarEdicion}
                                    className="flex items-center gap-2 bg-[#0ed1e8] text-[#03292e] px-5 py-2.5 rounded-xl text-sm font-black hover:bg-[#0bb8cc] transition-colors">
                                    <Save size={16} /> Guardar cambios
                                </button>
                                <button onClick={() => setEditando(false)}
                                    className="flex items-center gap-2 bg-gray-100 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-black hover:bg-gray-200 transition-colors">
                                    <X size={16} /> Cancelar
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => { setFormEdit({ nombre: seleccionado.nombre, correo: seleccionado.correo, numeroTelefono: seleccionado.numeroTelefono ?? '' }); setEditando(true); }}
                                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-black hover:bg-gray-200 transition-colors">
                                    <Edit2 size={16} /> Editar
                                </button>
                                <button onClick={() => setModalEstado(true)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-colors ${activo ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                                    {activo ? <UserX size={16} /> : <UserCheck size={16} />}
                                    {activo ? 'Suspender' : 'Reactivar'}
                                </button>
                                <button onClick={() => { setPasoEliminar(0); avanzarEliminar(); }}
                                    className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-xl text-sm font-black hover:bg-red-100 transition-colors ml-auto">
                                    <Trash2 size={16} />
                                    {pasoEliminar === 0 ? 'Eliminar' : pasoEliminar === 1 ? '¿Seguro?' : '¡Confirmar eliminación!'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Modal estado */}
                {modalEstado && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl space-y-5">
                            {activo ? (
                                <>
                                    <h3 className="text-xl font-black text-[#03292e]">Suspender usuario</h3>
                                    <div className="space-y-3">
                                        {(['TEMPORAL', 'PERMANENTE'] as const).map(tipo => (
                                            <button key={tipo} onClick={() => setTipoSuspension(tipo)}
                                                className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 font-bold text-sm transition-all ${tipoSuspension === tipo ? 'border-[#0ed1e8] bg-[#0ed1e8]/10' : 'border-gray-100 hover:border-gray-200'}`}>
                                                <div className={`h-4 w-4 rounded-full border-2 ${tipoSuspension === tipo ? 'border-[#0ed1e8] bg-[#0ed1e8]' : 'border-gray-300'}`} />
                                                {tipo === 'TEMPORAL' ? 'Suspensión temporal' : 'Suspensión permanente'}
                                            </button>
                                        ))}
                                    </div>
                                    {tipoSuspension === 'TEMPORAL' && (
                                        <div>
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Fecha de reactivación</label>
                                            <input type="date" value={fechaReactivacion}
                                                onChange={e => setFechaReactivacion(e.target.value)}
                                                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0ed1e8] outline-none" />
                                        </div>
                                    )}
                                    <div className="flex gap-3">
                                        <button onClick={() => aplicarCambioEstado(false)}
                                            className="flex-1 bg-yellow-500 text-white py-3 rounded-xl font-black text-sm hover:bg-yellow-600 transition-colors">
                                            Confirmar suspensión
                                        </button>
                                        <button onClick={() => setModalEstado(false)}
                                            className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-black text-sm hover:bg-gray-200 transition-colors">
                                            Cancelar
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-xl font-black text-[#03292e]">Reactivar usuario</h3>
                                    <p className="text-sm text-gray-500">El usuario podrá acceder a la plataforma nuevamente.</p>
                                    <div className="flex gap-3">
                                        <button onClick={() => aplicarCambioEstado(true)}
                                            className="flex-1 bg-green-500 text-white py-3 rounded-xl font-black text-sm hover:bg-green-600 transition-colors">
                                            Confirmar reactivación
                                        </button>
                                        <button onClick={() => setModalEstado(false)}
                                            className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-black text-sm hover:bg-gray-200 transition-colors">
                                            Cancelar
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ── Lista de usuarios ─────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Cabecera */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[#03292e]">Gestión de Usuarios</h2>
                    <p className="text-sm text-gray-400 mt-1">{filtrados.length} usuarios encontrados</p>
                </div>
                <button onClick={() => setModalCrear(true)}
                    className="flex items-center gap-2 bg-[#0ed1e8] text-[#03292e] px-5 py-3 rounded-xl font-black text-sm hover:bg-[#0bb8cc] transition-colors shadow-sm">
                    <Plus size={18} /> Crear usuario
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
                {([['TODOS', 'Todos'], ['JUGADOR', 'Jugadores'], ['PROPIETARIO', 'Propietarios']] as [Tab, string][]).map(([id, label]) => (
                    <button key={id} onClick={() => setTab(id)}
                        className={`px-5 py-2 rounded-xl text-sm font-black transition-all ${tab === id ? 'bg-white text-[#03292e] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Búsqueda */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Buscar por nombre, correo o teléfono..."
                    value={busqueda} onChange={e => setBusqueda(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#0ed1e8] outline-none text-sm" />
            </div>

            {/* Lista */}
            {cargando ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0ed1e8]" />
                </div>
            ) : filtrados.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium">No se encontraron usuarios.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {filtrados.map((u: any) => (
                        <button key={u.idUsuario} onClick={() => setSeleccionado(u)}
                            className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md hover:border-[#0ed1e8]/40 transition-all flex items-center justify-between gap-4 text-left w-full group">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-[#0ed1e8]/10 flex items-center justify-center text-[#03292e] font-black text-lg group-hover:bg-[#0ed1e8]/20 transition-colors">
                                    {u.nombre?.[0]?.toUpperCase() ?? '?'}
                                </div>
                                <div>
                                    <p className="font-black text-[#03292e]">{u.nombre}</p>
                                    <p className="text-xs text-gray-400">{u.correo}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="hidden sm:block text-xs font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full uppercase">
                                    {u.perfil?.nombre ?? '—'}
                                </span>
                                <span className={`text-xs font-black px-3 py-1 rounded-full ${estadoBadge(u)}`}>
                                    {estadoLabel(u)}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Modal crear usuario */}
            {modalCrear && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl space-y-5">
                        <h3 className="text-xl font-black text-[#03292e]">Crear nuevo usuario</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { label: 'Nombre', key: 'nombre', type: 'text' },
                                { label: 'Correo', key: 'correo', type: 'email' },
                                { label: 'Contraseña', key: 'contrasena', type: 'password' },
                                { label: 'Teléfono', key: 'numeroTelefono', type: 'text' },
                                { label: 'Edad', key: 'edad', type: 'number' },
                                { label: 'Fecha nacimiento', key: 'fechaNacimiento', type: 'date' },
                            ].map(({ label, key, type }) => (
                                <div key={key}>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{label}</label>
                                    <input type={type} value={(formCrear as any)[key]}
                                        onChange={e => setFormCrear(f => ({ ...f, [key]: e.target.value }))}
                                        className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0ed1e8] outline-none" />
                                </div>
                            ))}
                            <div className="sm:col-span-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Rol</label>
                                <div className="flex gap-3 mt-2">
                                    {[['JUGADOR', 'Jugador'], ['PROPIETARIO', 'Propietario']].map(([val, label]) => (
                                        <button key={val} type="button" onClick={() => setFormCrear(f => ({ ...f, perfilCodigo: val }))}
                                            className={`flex-1 py-3 rounded-xl text-sm font-black border-2 transition-all ${formCrear.perfilCodigo === val ? 'border-[#0ed1e8] bg-[#0ed1e8]/10 text-[#03292e]' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={crearUsuario}
                                className="flex-1 bg-[#03292e] text-white py-3 rounded-xl font-black text-sm hover:bg-[#0a4149] transition-colors">
                                Crear usuario
                            </button>
                            <button onClick={() => setModalCrear(false)}
                                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-black text-sm hover:bg-gray-200 transition-colors">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
