import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificacao, setNotificacao] = useState({ tipo: '', mensagem: '' });

  // Busca a lista de usuários na API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/admin/users');
        setUsers(response.data);
      } catch (error) {
        console.error(error);
        if (error.response?.status === 403) {
          alert("Acesso negado. Você não é um administrador.");
          navigate('/dashboard');
        } else if (error.response?.status === 401) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [navigate]);


  // Função para atualizar o plano
   const handleUpdatePlan = async (id) => {
    const newPlan = prompt("Digite o novo plano (free, pro, premium):");
    if (!newPlan) return; // Se o admin cancelar, não faz nada

    try {
      await api.put(`/admin/users/${id}/plan`, { plan: newPlan });
      
      // Atualiza a lista visualmente sem recarregar a página
      setUsers(users.map(u => u.id === id ? { ...u, plan: newPlan } : u));
      
      setNotificacao({ tipo: 'sucesso', mensagem: 'Plano atualizado com sucesso!' });
      setTimeout(() => setNotificacao({ tipo: '', mensagem: '' }), 3000);
    } catch (error) {
      console.error(error);
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao atualizar plano.' });
    }
  };

  // Exclui um usuário
  const handleDeleteUser = async (id) => {
    if (!window.confirm("ATENÇÃO: Isso apagará o usuário e todas as transações dele. Continuar?")) return;

    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u.id !== id)); // Atualiza a tabela visual
      setNotificacao({ tipo: 'sucesso', mensagem: 'Usuário excluído com sucesso!' });
      setTimeout(() => setNotificacao({ tipo: '', mensagem: '' }), 3000);
    } catch (error) {
      console.error(error);
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao excluir usuário.' });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400">Carregando painel de admin...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">

        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-400">👑 Painel de Administração</h1>
          <button onClick={() => navigate('/dashboard')} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors">
            Voltar ao Dashboard
          </button>
        </div>

        {/* Notificação */}
        {notificacao.mensagem && (
          <div className={`p-3 rounded-lg mb-6 text-center border ${notificacao.tipo === 'sucesso' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-red-500/10 border-red-500/50 text-red-400'
            }`}>
            {notificacao.mensagem}
          </div>
        )}

        {/* Tabela de Usuários */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <h2 className="text-xl font-bold p-6 border-b border-slate-700">Usuários Cadastrados ({users.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900/50 text-slate-400 text-sm">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">E-mail</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Plano</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 text-slate-400">#{u.id}</td>
                    <td className="p-4 font-medium">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${u.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {u.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.is_admin ? <span className="text-yellow-400 font-bold">👑 Admin</span> : <span className="text-slate-400">Usuário</span>}
                    </td>
                    <td className="p-4">
                      <span className="uppercase font-bold text-blue-400">{u.plan || 'free'}</span>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleUpdatePlan(u.id)} className="text-blue-400 hover:text-blue-300 mr-3 transition-colors" title="Mudar Plano">💳</button>
                      <button onClick={() => handleDeleteUser(u.id)} className="text-red-400 hover:text-red-300 transition-colors" title="Excluir Usuário">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>

      </div>
    </div>
  );
}