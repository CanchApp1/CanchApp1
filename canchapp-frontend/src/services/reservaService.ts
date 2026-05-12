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
        // URL basada en tu Excel de Administrador
        const response = await api.get(`/reserva/establecimiento/${idEst}`);
        // Según el formato de salida de tu Excel, los datos vienen en objectResponse
        return response.data.objectResponse || [];
    } catch (error) {
        console.error("Error al obtener reservas del establecimiento:", error);
        return [];
    }
};