import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
    // 1. Buscamos el token en la memoria de la sesión
    const token = sessionStorage.getItem('token');

    // 2. Si NO hay token, lo redirigimos al Login inmediatamente
    if (!token) {
        return <Navigate to="/Login" replace />;
    }

    // 3. Si SÍ hay token, le permitimos ver el componente que solicitó (Outlet)
    return <Outlet />;
}