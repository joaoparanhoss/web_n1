import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { Header } from '../components/Header';
import { useLists } from '../hooks/useLists';

export function NoList() {
  const navigate = useNavigate();
  const { createList } = useLists();
  const [modalOpen, setModalOpen] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const novaLista = await createList(titulo, descricao);
      if (novaLista) {
        navigate(`/lista/${novaLista.id}`);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao criar lista.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 flex flex-col">
      <Header hideListSelector />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md w-full shadow-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo(a)!</h2>
            <p className="text-slate-400 text-lg">Você não possui nenhuma lista.</p>
          </div>
          
          <button
            onClick={() => setModalOpen(true)}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors text-lg"
          >
            <Plus size={24} />
            Criar primeira lista
          </button>
        </div>
      </main>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full overflow-hidden shadow-2xl text-left">
            <div className="flex justify-between items-center p-5 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">Nova Lista</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white transition-colors" type="button">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Título</label>
                <input
                  type="text" required value={titulo} onChange={e => setTitulo(e.target.value)}
                  className="w-full bg-slate-800 border-slate-700 border rounded p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Ex: Pessoal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Descrição (opcional)</label>
                <textarea
                  value={descricao} onChange={e => setDescricao(e.target.value)}
                  className="w-full bg-slate-800 border-slate-700 border rounded p-3 text-white focus:outline-none focus:border-blue-500 transition-colors bg-transparent min-h-[100px] resize-y"
                  placeholder="Detalhamento da lista"
                />
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 font-medium text-slate-300 hover:text-white transition-colors">Cancelar</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium disabled:opacity-50 transition-colors">
                  {loading ? 'Criando...' : 'Criar Lista'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
