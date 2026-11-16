import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notificacao, setNotificacao] = useState({ tipo: '', mensagem: '' });
  const [loading, setLoading] = useState(true);

  // Busca os dados do usuário ao carregar a página
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setEmail(response.data.email);
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  // Atualizar os dados
  const handleUpdate = async (e) => {
    e.preventDefault();
    setNotificacao({ tipo: '', mensagem: '' });

    try {
      const payload = {};
      if (email) payload.email = email;
      if (password) payload.password = password;

      await api.put('/auth/me', payload);
      
      setNotificacao({ tipo: 'sucesso', mensagem: 'Perfil atualizado com sucesso!' });
      setPassword(''); // Limpa a senha após salvar
      setTimeout(() => setNotificacao({ tipo: '', mensagem: '' }), 3000);
      
    } catch (error) {
      console.error(error);
      setNotificacao({ tipo: 'erro', mensagem: error.response?.data?.detail || 'Erro ao atualizar perfil.' });
    }
  };

  // Excluir a conta
  const handleDeleteAccount = async () => {
    if (!window.confirm("ATENÇÃO: Isso apagará TODAS as suas transações e sua conta permanentemente. Deseja continuar?")) {
      return;
    }

    try {
      await api.delete('/auth/me');
      localStorage.removeItem('token');
      alert("Sua conta foi excluída com sucesso.");
      navigate('/');
    } catch (error) {
      console.error(error);
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao excluir conta.' });
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 flex justify-center items-start">
      <div className="w-full max-w-2xl">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">⚙️ Meu Perfil</h1>
          <button onClick={() => navigate('/dashboard')} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors">
            Voltar ao Dashboard
          </button>
        </div>

        {/* Notificação */}
        {notificacao.mensagem && (
          <div className={`p-3 rounded-lg mb-6 text-center border ${
            notificacao.tipo === 'sucesso' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-red-500/10 border-red-500/50 text-red-400'
          }`}>
            {notificacao.mensagem}
          </div>
        )}

        {/* Formulário de Edição */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8">
          <h2 className="text-xl font-bold mb-4">Dados da Conta</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1">E-mail</label>
              <input 
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                required 
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Nova Senha (deixe em branco para não alterar)</label>
              <input 
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-lg transition-colors">
              Salvar Alterações
            </button>
          </form>
        </div>

        {/* Zona de Perigo (Excluir Conta) */}
        <div className="bg-red-500/5 p-6 rounded-xl border border-red-500/20">
          <h2 className="text-xl font-bold text-red-400 mb-2">Zona de Perigo</h2>
          <p className="text-slate-400 text-sm mb-4">Uma vez excluída, sua conta e todas as transações não poderão ser recuperadas.</p>
          <button onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-500 text-white font-semibold px-6 py-2 rounded-lg transition-colors">
            Excluir Minha Conta
          </button>
        </div>

      </div>
    </div>
  );
}