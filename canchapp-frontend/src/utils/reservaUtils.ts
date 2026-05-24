export const esPasada = (fecha: string): boolean => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return new Date(fecha + 'T00:00:00') < hoy;
};

export const esHoy = (fecha: string): boolean => {
    return new Date(fecha + 'T00:00:00').toDateString() === new Date().toDateString();
};

export type EstadoDisplay = {
    nombre?: string;
    text?: string;
    label: string;
    colorLight: string;
    colorDark: string;
};

export const getEstadoDisplay = (estadoReserva: string, fecha: string): EstadoDisplay => {
    if (estadoReserva === 'CANCELADA') return {
        label: 'Cancelada',
        colorLight: 'bg-red-100 text-red-500',
        colorDark: 'bg-red-500/80 text-white',
    };
    if (esPasada(fecha)) return {
        label: 'Jugada',
        colorLight: 'bg-gray-100 text-gray-500',
        colorDark: 'bg-white/10 text-white/50',
    };
    if (esHoy(fecha)) return {
        label: 'Hoy',
        colorLight: 'bg-[#0ed1e8]/20 text-[#0a8f9c]',
        colorDark: 'bg-[#0ed1e8] text-[#03292e]',
    };
    if (estadoReserva === 'PENDIENTE_PAGO') return {
        label: 'Pendiente pago',
        colorLight: 'bg-orange-100 text-orange-600',
        colorDark: 'bg-orange-400 text-white',
    };
    return {
        label: 'Confirmada',
        colorLight: 'bg-green-100 text-green-600',
        colorDark: 'bg-[#0ed1e8] text-[#03292e]',
    };
};

// Una reserva se puede modificar solo si no está cancelada y su fecha no ha pasado
export const puedeModificar = (estadoReserva: string, fecha: string): boolean => {
    return estadoReserva !== 'CANCELADA' && !esPasada(fecha);
};
