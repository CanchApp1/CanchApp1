import api from './api';

export interface PagoDueloDTO {
  pagoDueloId?: number;
  dueloId?: number;
  usuarioId?: number;
  nombreUsuario?: string;
  valorPago?: number;
  conceptoPago?: string;
  estadoPago?: string;
}

export interface DueloDTO {
  dueloId?: number;
  canchaId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  descripcion: string;
  stripePaymentId?: string;
  creadorId?: number;
  nombreCreador?: string;
  estadoDuelo?: string;
  fechaFinBloqueoCancha?: string;
  fechaExpiracionDuelo?: string;
  pagosAsociados?: PagoDueloDTO[];
}

export const listarDuelosDisponibles = async (): Promise<DueloDTO[]> => {
  const response = await api.get('/duelos/disponibles');
  return response.data.objectResponse ?? response.data ?? [];
};

export const obtenerDetalleDuelo = async (id: number): Promise<DueloDTO> => {
  const response = await api.get(`/duelos/${id}`);
  return response.data.objectResponse ?? response.data;
};

export const publicarDuelo = async (data: {
  canchaId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  descripcion: string;
}): Promise<DueloDTO> => {
  const response = await api.post('/duelos/publicar', {
    ...data,
    stripePaymentId: 'pm_card_visa',
  });
  return response.data.objectResponse ?? response.data;
};

export const aceptarDuelo = async (id: number): Promise<DueloDTO> => {
  const response = await api.post(`/duelos/${id}/aceptar`, null, {
    params: { stripePaymentId: 'pm_card_visa' },
  });
  return response.data.objectResponse ?? response.data;
};
