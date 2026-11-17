import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    // Validação simples de senha
    if (password !== confirmPassword) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (password.length < 8) {
      setErro("A senha deve ter no mínimo 8 caracteres.");
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register', {
        email: email,
        password: password
      });

      setSucesso("Conta criada com sucesso! Redirecionando para o login...");
      
      // Redireciona para o login após 2 segundos
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error(error);
      // Pega a mensagem de erro da API (ex: "E-mail já cadastrado")
      const msg = error.response?.data?.detail || "Erro ao criar conta. Tente novamente.";
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
        
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">💰 Minhas Finanças</h1>
          <p className="text-slate-400 text-sm">Crie sua conta gratuitamente</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleRegister} className="space-y-5">
          
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">E-mail</label>
            <input 
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              placeholder="seu@email.com" required
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Senha</label>
            <input 
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              placeholder="Mínimo 8 caracteres" required
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Confirmar Senha</label>
            <input 
              type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              placeholder="Repita a senha" required
            />
          </div>

          {/* Mensagens de Erro/Sucesso */}
          {erro && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center p-3 rounded-lg">
              {erro}
            </div>
          )}
          {sucesso && (
            <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-sm text-center p-3 rounded-lg">
              {sucesso}
            </div>
          )}

          <button 
            type="submit" disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-lg shadow-emerald-900/30 mt-4 disabled:opacity-50"
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        {/* Link para Login */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Já tem uma conta?{' '}
            <Link to="/" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Faça login
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}