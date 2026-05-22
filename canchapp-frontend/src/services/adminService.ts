import api from './api';

export const listarUsuariosAdmin = async (rol?: string, busqueda?: string) => {
    const params: Record<string, string> = {};
    if (rol) params.rol = rol;
    if (busqueda) params.busqueda = busqueda;
    const res = await api.get('/admin/usuarios', { params });
    return res.data;
};

export const crearUsuarioAdmin = async (data: Record<string, unknown>) => {
    const res = await api.post('/admin/usuarios', data);
    return res.data;
};

export const editarUsuarioAdmin = async (id: number, data: Record<string, unknown>) => {
    const res = await api.put(`/admin/usuarios/${id}`, data);
    return res.data;
};

export const cambiarEstadoUsuario = async (id: number, data: Record<string, unknown>) => {
    const res = await api.put(`/admin/usuarios/${id}/estado`, data);
    return res.data;
};

export const eliminarUsuarioAdmin = async (id: number) => {
    const res = await api.delete(`/admin/usuarios/${id}`);
    return res.data;
};

export const listarComentariosAdmin = async () => {
    const res = await api.get('/admin/comentarios');
    return res.data;
};

export const eliminarComentarioAdmin = async (id: number) => {
    const res = await api.delete(`/admin/comentarios/${id}`);
    return res.data;
};
