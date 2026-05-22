import { useState, useEffect } from 'react';
import { ShieldBan, CalendarX2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SuspensionData {
    tipoSuspension: string | null;
    fechaReactivacion: string | null;
}

export default function SuspensionOverlay() {
    const navigate = useNavigate();
    const [data, setData] = useState<SuspensionData | null>(null);

    useEffect(() => {
        const handler = (e: Event) => {
            const { tipoSuspension, fechaReactivacion } = (e as CustomEvent<SuspensionData>).detail;
            console.log('[SuspensionOverlay] Evento recibido:', { tipoSuspension, fechaReactivacion });
            setData({ tipoSuspension, fechaReactivacion });
        };
        window.addEventListener('cuenta-suspendida', handler);
        return () => window.removeEventListener('cuenta-suspendida', handler);
    }, []);

    if (!data) return null;

    const esTemporal = data.tipoSuspension === 'TEMPORAL';

    const handleCerrarSesion = () => {
        sessionStorage.clear();
        window.dispatchEvent(new Event('storage'));
        setData(null);
        navigate('/Login');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center w-full max-w-md text-center gap-5 animate-fade-in">
                <div className="bg-red-100 p-5 rounded-3xl">
                    <ShieldBan size={48} className="text-red-500" />
                </div>

                <div>
                    <h2 className="text-2xl font-extrabold text-[#03292e] mb-1">Cuenta Suspendida</h2>
                    <p className="text-gray-400 text-sm font-medium">
                        No puedes realizar acciones en la plataforma en este momento.
                    </p>
                </div>

                <div className={`w-full rounded-2xl px-5 py-4 text-sm font-bold ${esTemporal ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                    {esTemporal ? 'Suspensión Temporal' : 'Suspensión Permanente'}
                </div>

                {esTemporal && data.fechaReactivacion && (
                    <div className="w-full flex items-center gap-3 bg-blue-50 rounded-2xl px-5 py-4">
                        <CalendarX2 size={20} className="text-blue-500 shrink-0" />
                        <div className="text-left">
                            <p className="text-xs text-gray-400 font-medium">Reactivación automática el</p>
                            <p className="text-sm font-black text-[#03292e]">
                                {new Date(data.fechaReactivacion + 'T00:00:00').toLocaleDateString('es-CO', {
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
                    onClick={handleCerrarSesion}
                    className="w-full bg-[#03292e] text-white py-3.5 rounded-full font-bold hover:bg-[#0a4149] transition-all"
                >
                    Cerrar sesión
                </button>
            </div>
        </div>
    );
}
