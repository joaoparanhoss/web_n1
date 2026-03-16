import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';

export function Register() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: nome // Envia o nome para o metadata do supabase auth
          }
        }
      });

      if (error) throw error;
      
      // Auto-redireciona para o login ou avisa para confirmar e-mail
      // No Supabase, se não exigir confirmação de e-mail por default
      // ele já faz o login automaticamente.
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Gestão de Tarefas
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Crie sua conta para começar
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-800">
          <form className="space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="p-3 bg-red-900/50 border border-red-800 rounded text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300">
                Nome completo
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-700 bg-slate-800 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Seu nome"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300">
                E-mail
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-700 bg-slate-800 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">
                Senha
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-700 bg-slate-800 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-400">
                  Já possui uma conta?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="font-medium text-blue-500 hover:text-blue-400 transition-colors"
              >
                Fazer login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
