/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

// Usamos la instancia 'api' para que el interceptor inyecte el token automáticamente
export const crearReserva = async (reservaData: any, _token: string) => {
  try {
    const response = await api.post('/reserva', reservaData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const crearIntentPago = async (reservaId: number) => {
  try {
    const response = await api.post(`/pagos/intent/${reservaId}`);
    return response.data;
  } catch (error) {
    console.error("Error al crear intent de pago:", error);
    throw error;
  }
};

export const confirmarReserva = async (stripePaymentId: string) => {
  try {
    const response = await api.post('/pagos/confirmar', { stripePaymentId });
    return response.data;
  } catch (error) {
    console.error("Error al confirmar la reserva:", error);
    throw error;
  }
};


export const obtenerHorasDisponibles = async (establecimientoId: number, fecha: string, canchaId: number) => {
  try {
    const response = await api.get('/reserva/disponibles/inicio', {
      params: { establecimientoId, fecha, canchaId }
    });

    const data = response.data.objectResponse || [];

    // AÑADE ESTO PARA VER EL FORMATO REAL
    console.log("DATOS CRUDOS DEL SERVIDOR:", data[0]);

    return data.map((item: any) => {
      // Si el item ya es un texto (ej: "10:00:00"), lo devolvemos tal cual
      if (typeof item === 'string') return item;

      // Si es un objeto, usamos hour/minute
      const h = String(item.hour ?? '00').padStart(2, '0');
      const m = String(item.minute ?? '00').padStart(2, '0');
      const s = String(item.second ?? '00').padStart(2, '0');
      return `${h}:${m}:${s}`;
    });

  } catch (error: any) {
    console.error("Error obteniendo disponibilidad:", error);
    return [];
  }
};

export const obtenerMisReservas = async (userId: number) => {
  try {
    const response = await api.get(`/reserva/historial/usuario/${userId}`);

    return response.data.objectResponse || [];
  } catch (error) {
    console.error("Error al obtener historial de reservas:", error);
    throw error;
  }
};

export const obtenerReservasPorEstablecimiento = async (idEst: number) => {
    try {
        const response = await api.get(`/reserva/establecimiento/${idEst}`);
        return response.data.objectResponse || [];
    } catch (error) {
        console.error("Error al obtener reservas del establecimiento:", error);
        return [];
    }
};

export const cancelarReserva = async (id: number) => {
    try {
        const response = await api.put(`/reserva/${id}`, { estadoReserva: 'CANCELADA' });
        return response.data;
    } catch (error) {
        console.error("Error al cancelar la reserva:", error);
        throw error;
    }
};

export const obtenerHorasDisponiblesFin = async (canchaId: number, fecha: string, horaInicio: string) => {
    try {
        // Backend expects HH:mm format
        const horaInicioFmt = horaInicio.slice(0, 5);
        const response = await api.get('/reserva/disponibles/fin', {
            params: { canchaId, fecha, horaInicio: horaInicioFmt }
        });
        const data = response.data.objectResponse || [];
        return data.map((item: any) => {
            if (typeof item === 'string') return item;
            const h = String(item.hour ?? '00').padStart(2, '0');
            const m = String(item.minute ?? '00').padStart(2, '0');
            const s = String(item.second ?? '00').padStart(2, '0');
            return `${h}:${m}:${s}`;
        });
    } catch (error) {
        console.error("Error obteniendo horas fin:", error);
        return [];
    }
};

export const crearReservaAdmin = async (data: {
    canchaId: number;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    descripcion: string;
}) => {
    try {
        const response = await api.post('/reserva/admin', {
            cancha: { canchaId: data.canchaId },
            fecha: data.fecha,
            horaInicio: data.horaInicio,
            horaFin: data.horaFin,
            descripcion: data.descripcion,
        });
        return response.data;
    } catch (error) {
        console.error("Error al crear reserva admin:", error);
        throw error;
    }
};