import { useMemo, useState, useEffect } from 'react';
import { fechaLocal } from '../../utils/fecha';
import {
    obtenerIngresosMes,
    obtenerIngresosDia,
    obtenerIngresosSemana,
} from '../../services/metricasService';

interface Props {
    reservas: any[];
    canchas: any[];
}

export default function PanelEstadisticas({ reservas, canchas }: Props) {
    const hoy = fechaLocal();
    const [ingresosDia, setIngresosDia] = useState(0);
    const [ingresosSemana, setIngresosSemana] = useState(0);
    const [ingresosMes, setIngresosMes] = useState(0);

    useEffect(() => {
        Promise.all([obtenerIngresosDia(), obtenerIngresosSemana(), obtenerIngresosMes()])
            .then(([dia, semana, mes]) => {
                setIngresosDia(dia);
                setIngresosSemana(semana);
                setIngresosMes(mes);
            });
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

    const fmt = (val: number) => '$' + new Intl.NumberFormat('de-DE').format(Math.round(val));

    const cards = [
        {
            label: 'Reservas de Hoy',
            value: String(reservasHoy),
            sub: 'en todas las canchas',
            accent: 'border-l-[#0ed1e8]',
        },
        {
            label: 'Ingresos del Día',
            value: fmt(ingresosDia),
            sub: 'pagos completados hoy',
            accent: 'border-l-[#0ed1e8]',
        },
        {
            label: 'Ingresos de la Semana',
            value: fmt(ingresosSemana),
            sub: 'lunes a hoy',
            accent: 'border-l-[#03292e]',
        },
        {
            label: 'Ingresos del Mes',
            value: fmt(ingresosMes),
            sub: 'mes actual',
            accent: 'border-l-[#03292e]',
        },
        {
            label: 'Canchas Activas',
            value: String(canchasActivas),
            sub: `de ${canchas.length} en total`,
            accent: 'border-l-green-500',
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-l-4 ${card.accent}`}
                >
                    <h3 className="text-gray-500 text-[11px] font-bold uppercase tracking-wider leading-tight">
                        {card.label}
                    </h3>
                    <p className="text-2xl font-black text-[#03292e] mt-2 truncate">{card.value}</p>
                    <p className="text-xs text-gray-400 mt-1 font-medium">{card.sub}</p>
                </div>
            ))}
        </div>
    );
}
