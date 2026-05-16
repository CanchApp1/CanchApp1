import api from './api';

export const obtenerEstablecimientos = async () => {
    const response = await api.get('/establecimiento');
    return response.data;
};

export const obtenerMiEstablecimiento = async (userId: number) => {
    try {
        const response = await api.get('/establecimiento');
        const lista = response.data.objectResponse || [];
        return lista.find((est: any) => est.usuario?.idUsuario === userId);
    } catch (error) {
        console.error("Error al obtener mi local:", error);
        return null;
    }
};

export const actualizarEstablecimiento = async (id: number, data: {
    nombreEstablecimiento: string;
    direccion: string;
    numeroTelefono: string;
    imagenUrl?: string | null;
}) => {
    const response = await api.put(`/establecimiento/${id}`, data);
    return response.data;
};

export const subirImagenEstablecimiento = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
};
