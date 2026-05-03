import { useEffect, useState, useRef } from 'react';
import { LogOut, ChevronDown, Plus, Edit2, Trash2, X } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { useLists } from '../hooks/useLists';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Lista } from '../types/database';

export function Header({ hideListSelector = false }: { hideListSelector?: boolean }) {
  const [hora, setHora] = useState(new Date());
  const { user, signOut } = useAuthContext();
  
  const { id: currentListaId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { listas, loading: loadingLists, createList, updateList, deleteList } = useLists();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Lista | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saudacao = () => {
    const atual = hora.getHours();
    if (atual < 12) return 'Bom dia';
    if (atual < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';

  const handleListaClick = (id: string) => {
    setDropdownOpen(false);
    navigate(`/lista/${id}`);
  };

  const abrirModalCriar = () => {
    setEditando(null);
    setTitulo('');
    setDescricao('');
    setModalOpen(true);
    setDropdownOpen(false);
  };

  const abrirModalEditar = (e: React.MouseEvent, listaObj: Lista) => {
    e.stopPropagation();
    setEditando(listaObj);
    setTitulo(listaObj.titulo);
    setDescricao(listaObj.descricao || '');
    setModalOpen(true);
    setDropdownOpen(false);
  };

  const handleDeletar = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (listas.length <= 1) {
      alert("Você precisa ter ao menos uma lista.");
      return;
    }
    if (confirm("Tem certeza que deseja excluir esta lista? Todas as tarefas e colunas nela serão perdidas.")) {
      try {
        await deleteList(id);
        if (currentListaId === id) {
          const remaining = listas.filter(l => l.id !== id);
          if (remaining.length > 0) {
            navigate(`/lista/${remaining[0].id}`);
          }
        }
      } catch (err: any) {
        alert(err.message || 'Erro ao deletar lista');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    try {
      if (editando) {
        await updateList(editando.id, { titulo, descricao });
      } else {
        const nova = await createList(titulo, descricao);
        if (nova) {
          navigate(`/lista/${nova.id}`);
        }
      }
      setModalOpen(false);
    } catch (err) {
      alert("Erro ao salvar lista");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const currentLista = listas.find(l => l.id === currentListaId);

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 relative" ref={dropdownRef}>
            <div className="flex items-center gap-3">
              <Link to="/" className="text-xl font-bold text-white leading-none hover:text-blue-400 transition-colors">Gestão de Tarefas</Link>
              
              {!hideListSelector && (
                <div className="relative z-40">
                   <button
                     onClick={() => setDropdownOpen(!dropdownOpen)}
                     className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors text-sm font-medium focus:outline-none focus:border-blue-500"
                   >
                     <span className="truncate max-w-[120px] sm:max-w-[200px]">
                        {loadingLists ? '...' : currentLista?.titulo || 'Selecione...'}
                     </span>
                     <ChevronDown size={16} />
                   </button>
                   
                   {dropdownOpen && (
                     <div className="absolute top-full left-0 mt-2 w-[280px] bg-slate-800 border border-slate-700 rounded-xl shadow-xl shadow-black/50 overflow-hidden">
                       <div className="max-h-64 overflow-y-auto scroll-container">
                         {listas.map(lista => (
                            <div 
                              key={lista.id}
                              onClick={() => handleListaClick(lista.id)}
                              className={`flex items-center justify-between p-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-0 transition-colors ${currentListaId === lista.id ? 'bg-slate-850 text-blue-400' : 'text-slate-300'}`}
                            >
                               <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                                 <span className="truncate font-medium text-sm">{lista.titulo}</span>
                                 {currentListaId === lista.id && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>}
                               </div>
                               <div className="flex items-center gap-1 shrink-0">
                                 <button onClick={(e) => abrirModalEditar(e, lista)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-600 rounded-md transition-colors"><Edit2 size={14}/></button>
                                 <button onClick={(e) => handleDeletar(e, lista.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded-md transition-colors"><Trash2 size={14}/></button>
                               </div>
                            </div>
                         ))}
                       </div>
                       <div className="border-t border-slate-700 p-2">
                         <button
                           onClick={abrirModalCriar}
                           className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                         >
                           <Plus size={16} /> Nova Lista
                         </button>
                       </div>
                     </div>
                   )}
                </div>
              )}
              
              {hideListSelector ? (
                <button
                  onClick={() => navigate('/')}
                  className="hidden sm:flex items-center gap-2 ml-2 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
                >
                  Tarefas
                </button>
              ) : (
                <button
                  onClick={() => { setDropdownOpen(false); navigate('/dashboard'); }}
                  className="hidden sm:flex items-center gap-2 ml-2 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
                >
                  Dashboard
                </button>
              )}
            </div>
            
            <div className="hidden sm:block">
              <p className="text-sm text-slate-400">
                {saudacao()}, {userName}
              </p>
            </div>
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
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 focus:outline-none focus:border-slate-500"
              title="Sair"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Modal de Lista (Criar/Editar) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full overflow-hidden shadow-2xl text-left">
            <div className="flex justify-between items-center p-5 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">
                {editando ? 'Editar Lista' : 'Nova Lista'}
              </h3>
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
                <button type="submit" disabled={loadingSubmit} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium disabled:opacity-50 transition-colors">
                  {loadingSubmit ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
