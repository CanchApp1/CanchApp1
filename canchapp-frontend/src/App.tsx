import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Autenticacion from './Pages/Autenticacion';
import LoginPage from './Pages/LoginPage';
import Home from './Pages/Home';
import Registro from './Pages/Registro';
import CanchasPage from './Pages/CanchasPage';
import Match from './Pages/Match';
import Reservar from './Pages/Reservar';
import DashboardPropietario from './Pages/DashboardPropietario';
import PagosPage from './Pages/Pagos';
import MisReservas from './Pages/MisReservas';
import MisPartidos from './Pages/MisPartidos';
import RecuperarPassword from './Pages/RecuperarPassword'; // <--- Importamos la nueva página

// --- COMPONENTE DE PROTECCIÓN DE RUTAS ---
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const token = sessionStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');

  if (!token) return <Navigate to="/Login" replace />;

  if (!allowedRoles.includes(userRole || '')) {
    alert("No tienes permiso para acceder a esta sección");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Home />} />

        {/* Rutas de Autenticación (Envueltas en el mismo layout) */}
        <Route element={<Autenticacion />}>
          <Route path="/Login" element={<LoginPage />} />
          <Route path="/Registro" element={<Registro />} />
          {/* NUEVA RUTA: Recuperar Password */}
          <Route path="/recuperar-password" element={<RecuperarPassword />} />
        </Route>

        {/* Rutas Públicas de Jugador (Temporalmente para test) */}
        <Route path="/CanchasPage" element={<CanchasPage />} />
        <Route path="/Match" element={<Match />} />

        {/* Rutas protegidas para JUGADORES */}
        <Route path="/MisReservas" element={
          <ProtectedRoute allowedRoles={['Jugador']}>
            <MisReservas />
          </ProtectedRoute>
        } />

        <Route path="/Pagos" element={
          <ProtectedRoute allowedRoles={['Jugador']}>
            <PagosPage />
          </ProtectedRoute>
        } />

        <Route path="/Reservar" element={
          <ProtectedRoute allowedRoles={['Jugador']}>
            <Reservar />
          </ProtectedRoute>
        } />

        <Route path="/MisPartidos" element={
          <ProtectedRoute allowedRoles={['Jugador']}>
            <MisPartidos />
          </ProtectedRoute>
        } />

        {/* Rutas protegidas para PROPIETARIOS */}
        <Route path="/DashboardPropietario" element={
          <ProtectedRoute allowedRoles={['Propietario', 'ROLE_PROPIETARIO']}>
            <DashboardPropietario />
          </ProtectedRoute>
        } />

      </Routes>
    </Router>
  );
}

export default App;