import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;