import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile'; // <-- Tem que ter essa linha
import Admin from './pages/Admin'; // <-- Importe

function App() {
  // Verifica se o usuário está logado
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/" />} /> {/* <-- Nova rota */}
        <Route path="/admin" element={isAuthenticated ? <Admin /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;