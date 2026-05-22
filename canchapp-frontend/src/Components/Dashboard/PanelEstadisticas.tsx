import { useMemo, useState, useEffect } from 'react';
import { fechaLocal } from '../../utils/fecha';
import { obtenerIngresosMes } from '../../services/metricasService';

interface Props {
    reservas: any[];
    canchas: any[];
}

export default function PanelEstadisticas({ reservas, canchas }: Props) {
    const hoy = fechaLocal();
    const [ingresosMes, setIngresosMes] = useState(0);

    useEffect(() => {
        obtenerIngresosMes().then(setIngresosMes);
    }, []);

    const reservasHoy = useMemo(() =>
        reservas.filter(r => r.fecha === hoy && r.estadoReserva !== 'CANCELADA').length,
        [reservas, hoy]
    );

    const canchasActivas = useMemo(() =>
        canchas.filter(c => {
            const e = c.estado;
            return e === true || e === 1 || (typeof e === 'string' && ['1', 'activo', 'activa'].includes(e.toLowerCase()));
        }).length,
        [canchas]
    );

    const formatCurrency = (val: number) => '$' + new Intl.NumberFormat('de-DE').format(Math.round(val));

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-[#0ed1e8]">
                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Reservas de Hoy</h3>
                <p className="text-3xl font-black text-[#03292e] mt-2">{reservasHoy}</p>
                <p className="text-xs text-gray-400 mt-1 font-medium">en todas las canchas</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-[#03292e]">
                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Ingresos del Mes</h3>
                <p className="text-3xl font-black text-[#03292e] mt-2">{formatCurrency(ingresosMes)}</p>
                <p className="text-xs text-gray-400 mt-1 font-medium">pagos completados</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Canchas Activas</h3>
                <p className="text-3xl font-black text-[#03292e] mt-2">{canchasActivas}</p>
                <p className="text-xs text-gray-400 mt-1 font-medium">de {canchas.length} en total</p>
            </div>
        </div>
    );
}
