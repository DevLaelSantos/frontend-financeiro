import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [transacoes, setTransacoes] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('');

  // * MENSAGENS FLASH DASHBOARD
  const [notificacao, setNotificacao] = useState({ tipo: '', mensagem: '' });

  // Função para buscar as transações da API
  const carregarTransacoes = async () => {
    try {
      const response = await api.get('/transactions/');
      setTransacoes(response.data);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      if (error.response?.status === 401) {
        navigate('/'); // Se o token expirou, volta pro login
      }
    }
  };

  // Busca as transações assim que a tela carrega
  useEffect(() => {
    carregarTransacoes();
  }, []);

  // Mensagem de boas-vindas
  useEffect(() => {
    const email = localStorage.getItem('user_email');
    if (email) {
      setNotificacao({ tipo: 'sucesso', mensagem: `Bem-vindo(a), ${email}!` });
      setTimeout(() => setNotificacao({ tipo: '', mensagem: '' }), 4000);
    }
  }, []);


  // Função para criar uma nova transação
  const handleCriarTransacao = async (e) => {
    e.preventDefault();

    try {
      await api.post('/transactions/', {
        description: descricao,
        amount: parseFloat(valor),
        category: categoria
      });

      // Limpa o formulário e recarrega a lista
      setDescricao('');
      setValor('');
      setCategoria('');
      carregarTransacoes();

      // * A MÁGICA ACONTECE AQUI:
      setNotificacao({ tipo: 'sucesso', mensagem: 'Transação salva com sucesso!' });
      setTimeout(() => setNotificacao({ tipo: '', mensagem: '' }), 3000);

    } catch (error) {
      console.error(error);
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao salvar transação.' });
    }
  };

  // Função para Deletar uma transação
  const handleDeletarTransacao = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta transação?")) {
      return;
    }

    try {
      await api.delete(`/transactions/${id}`);

      setNotificacao({ tipo: 'sucesso', mensagem: 'Transação excluída com sucesso!' });
      setTimeout(() => setNotificacao({ tipo: '', mensagem: '' }), 3000);

      carregarTransacoes(); // Recarrega a lista
    } catch (error) {
      console.error(error);
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao excluir transação.' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Cálculos para os cards de resumo
  const totalReceitas = transacoes.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const totalDespesas = transacoes.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);
  const saldo = totalReceitas + totalDespesas;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">

        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">💰 Minhas Finanças</h1>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg transition-colors">
            Sair
          </button>
        </div>

        {/* É AQUI QUE AS MENSAGENS DEVEM FICAR! */}
        {notificacao.mensagem && (
          <div className={`p-3 rounded-lg mb-4 text-center border ${notificacao.tipo === 'sucesso' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' :
            notificacao.tipo === 'erro' ? 'bg-red-500/10 border-red-500/50 text-red-400' :
              'bg-blue-500/10 border-blue-500/50 text-blue-400'
            }`}>
            {notificacao.mensagem}
          </div>
        )}
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">Total de Receitas</p>
            <p className="text-2xl font-bold text-emerald-400">R$ {totalReceitas.toFixed(2)}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">Total de Despesas</p>
            <p className="text-2xl font-bold text-red-400">R$ {Math.abs(totalDespesas).toFixed(2)}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">Saldo Atual</p>
            <p className="text-2xl font-bold text-white">R$ {saldo.toFixed(2)}</p>
          </div>
        </div>

        {/* Formulário de Nova Transação */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8">
          <h2 className="text-xl font-bold mb-4">Nova Transação</h2>
          <form onSubmit={handleCriarTransacao} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Descrição" required
            />
            <input
              type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Valor (ex: -150)" required
            />
            <input
              type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Categoria" required
            />
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg py-2 transition-colors">
              Salvar
            </button>
          </form>
        </div>

        {/* Lista de Transações */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <h2 className="text-xl font-bold p-6 border-b border-slate-700">Minhas Transações</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900/50 text-slate-400 text-sm">
                <tr>
                  <th className="p-4">Descrição</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4 text-right">Valor</th>
                  <th className="p-4 text-center">Ações</th> {/* <-- NOVA COLUNA */}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {transacoes.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-6 text-center text-slate-500">Nenhuma transação encontrada.</td>
                  </tr>
                ) : (
                  transacoes.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-4">{t.description}</td>
                      <td className="p-4 text-slate-400">{t.category}</td>
                      <td className={`p-4 text-right font-medium ${t.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        R$ {t.amount.toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <div className="relative group inline-block">
                          <button
                            onClick={() => handleDeletarTransacao(t.id)}
                            className="text-red-400 hover:text-red-300 transition-colors cursor-pointer text-lg"
                          >
                            🗑️
                          </button>
                          {/* Tooltip personalizado */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Excluir
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}