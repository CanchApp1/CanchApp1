import { useState } from 'react';
import { Building2, MapPin, Phone, Mail, User, Calendar, Shield, Pencil } from 'lucide-react';
import ModalEditarPerfil from '../ModalEditarPerfil';

// ============================================
// VISTA DE CONFIGURACIÓN — Perfil del local
// Muestra los datos del establecimiento y usuario
// ============================================

interface Props {
    establecimiento: any;
    loading: boolean;
    onPerfilActualizado?: () => void;
}

export default function VistaConfiguracion({ establecimiento, loading, onPerfilActualizado }: Props) {
    const [modalEditar, setModalEditar] = useState(false);
    if (loading) {
        return (
            <div className="flex flex-col items-center py-20 animate-in fade-in duration-500">
                <div className="w-14 h-14 border-4 border-[#0ed1e8]/30 border-t-[#0ed1e8] rounded-full animate-spin mb-4" />
                <p className="text-gray-400 font-medium">Cargando configuración...</p>
            </div>
        );
    }

    if (!establecimiento) {
        return (
            <div className="py-24 text-center border-2 border-dashed border-gray-200 rounded-[3rem] animate-in fade-in duration-500">
                <p className="text-5xl mb-4">⚠️</p>
                <p className="text-gray-400 font-bold text-lg">No se encontraron datos del establecimiento.</p>
            </div>
        );
    }

    const usuario = establecimiento.usuario;

    return (
        <div className="animate-in slide-in-from-right-4 duration-500 space-y-8">
            <ModalEditarPerfil
                visible={modalEditar}
                onCerrar={() => setModalEditar(false)}
                onExito={() => onPerfilActualizado?.()}
            />
            {/* Cabecera */}
            <div>
                <h2 className="text-3xl font-black text-[#03292e] mb-2">Configuración</h2>
                <p className="text-gray-500">Información de tu establecimiento y perfil.</p>
            </div>

            {/* Tarjeta del Establecimiento */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-[#0ed1e8]/10 p-3 rounded-2xl">
                        <Building2 size={24} className="text-[#0ed1e8]" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-[#03292e]">Mi Establecimiento</h3>
                        <p className="text-gray-400 text-sm">Datos de tu negocio</p>
                    </div>

                    {/* Badge de estado */}
                    <div className="ml-auto">
                        {establecimiento.estado ? (
                            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                ✅ Activo
                            </span>
                        ) : (
                            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-500 border border-red-200">
                                ⛔ Inactivo
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField
                        icono={<Building2 size={16} />}
                        etiqueta="Nombre del Local"
                        valor={establecimiento.nombreEstablecimiento}
                    />
                    <InfoField
                        icono={<MapPin size={16} />}
                        etiqueta="Dirección"
                        valor={establecimiento.direccion}
                    />
                    <InfoField
                        icono={<Phone size={16} />}
                        etiqueta="Teléfono"
                        valor={establecimiento.numeroTelefono}
                    />
                    <InfoField
                        icono={<Calendar size={16} />}
                        etiqueta="Fecha de Registro"
                        valor={establecimiento.fechaCreacion
                            ? new Date(establecimiento.fechaCreacion).toLocaleDateString('es-CO', {
                                year: 'numeric', month: 'long', day: 'numeric'
                            })
                            : 'No disponible'}
                    />
                </div>
            </div>

            {/* Tarjeta del Propietario */}
            {usuario && (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-[#03292e]/5 p-3 rounded-2xl">
                            <User size={24} className="text-[#03292e]" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-[#03292e]">Mi Perfil</h3>
                            <p className="text-gray-400 text-sm">Datos personales del propietario</p>
                        </div>
                        <button
                            onClick={() => setModalEditar(true)}
                            className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-[#03292e] text-white text-xs font-bold rounded-xl hover:bg-[#0ed1e8] hover:text-[#03292e] transition-all"
                        >
                            <Pencil size={13} />
                            Editar perfil
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoField
                            icono={<User size={16} />}
                            etiqueta="Nombre Completo"
                            valor={usuario.nombre}
                        />
                        <InfoField
                            icono={<Mail size={16} />}
                            etiqueta="Correo Electrónico"
                            valor={usuario.correo}
                        />
                        <InfoField
                            icono={<Phone size={16} />}
                            etiqueta="Teléfono Personal"
                            valor={usuario.numeroTelefono}
                        />
                        <InfoField
                            icono={<Shield size={16} />}
                            etiqueta="Rol"
                            valor={usuario.perfil?.nombre || 'Propietario'}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Componente auxiliar para cada campo ─────
function InfoField({ icono, etiqueta, valor }: { icono: React.ReactNode; etiqueta: string; valor: string }) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                {icono}
                {etiqueta}
            </label>
            <p className="text-[#03292e] font-semibold text-base bg-[#f3f6fb] px-4 py-3 rounded-2xl">
                {valor || '—'}
            </p>
        </div>
    );
}
