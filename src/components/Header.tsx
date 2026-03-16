import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';

export function Header() {
  const [hora, setHora] = useState(new Date());
  const { user, signOut } = useAuthContext();

  useEffect(() => {
    const timer = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const saudacao = () => {
    const atual = hora.getHours();
    if (atual < 12) return 'Bom dia';
    if (atual < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';

  return (
    <header className="bg-slate-900 border-b border-slate-800 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">Gestão de Tarefas</h1>
          <p className="text-sm text-slate-400">
            {saudacao()}, {userName}
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-lg font-medium text-white">
              {hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-xs text-slate-400">
              {hora.toLocaleDateString('pt-BR', { dateStyle: 'long' })}
            </p>
          </div>
          
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Sair"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
