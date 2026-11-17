import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  // Todos os estados devem ficar aqui dentro do componente
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(''); // <-- Posicionado corretamente aqui dentro
  const navigate = useNavigate(); // Hook para navegar entre telas

  // O useEffect fica aqui, logo após os estados
  useEffect(() => {
    const msg = localStorage.getItem('mensagem_sucesso');
    if (msg) {
      setSucesso(msg);
      localStorage.removeItem('mensagem_sucesso'); // Limpa para não aparecer de novo
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    setErro('');
    setSucesso(''); // Limpa a mensagem de sucesso ao tentar logar

    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', senha);

      const response = await api.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      localStorage.setItem('user_email', email);
      localStorage.setItem('token', response.data.access_token);
      navigate('/dashboard'); // Redireciona para o Dashboard

    } catch (error) {
      console.error(error);
      setErro("E-mail ou senha incorretos. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">💰 Minhas Finanças</h1>
          <p className="text-slate-400 text-sm">Faça login para gerenciar suas contas</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">E-mail</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="seu@email.com" required
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Senha</label>
            <input
              type="password" value={senha} onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="••••••••" required
            />
          </div>

          {sucesso && (
            <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-sm text-center p-3 rounded-lg mb-4">
              {sucesso}
            </div>
          )}

          {erro && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center p-3 rounded-lg">
              {erro}
            </div>
          )}

          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-lg shadow-emerald-900/30 mt-4">
            Entrar
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}