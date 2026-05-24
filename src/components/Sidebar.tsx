import { useEffect, useState, useRef } from 'react';
import {
  LogOut, Plus, Edit2, Trash2, X,
  LayoutDashboard, ListTodo, ChevronLeft, ChevronRight, Menu
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { useLists } from '../hooks/useLists';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Lista } from '../types/database';

interface SidebarProps {
  hideListSelector?: boolean;
}

export function Sidebar({ hideListSelector = false }: SidebarProps) {
  const [hora, setHora] = useState(new Date());
  const { user, signOut } = useAuthContext();
  const { id: currentListaId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { listas, loading: loadingLists, createList, updateList, deleteList } = useLists();

  // Sidebar collapsed state — persiste no localStorage
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  // Mobile overlay open
  const [mobileOpen, setMobileOpen] = useState(false);


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
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // ... handled inside component logic if needed
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fecha mobile ao navegar
  useEffect(() => {
    setMobileOpen(false);
  }, [currentListaId]);

  const saudacao = () => {
    const h = hora.getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';

  const handleListaClick = (id: string) => {
    navigate(`/lista/${id}`);
  };

  const abrirModalCriar = () => {
    setEditando(null);
    setTitulo('');
    setDescricao('');
    setModalOpen(true);
  };

  const abrirModalEditar = (e: React.MouseEvent, listaObj: Lista) => {
    e.stopPropagation();
    setEditando(listaObj);
    setTitulo(listaObj.titulo);
    setDescricao(listaObj.descricao || '');
    setModalOpen(true);
  };

  const handleDeletar = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (listas.length <= 1) {
      alert('Você precisa ter ao menos uma lista.');
      return;
    }
    if (confirm('Tem certeza que deseja excluir esta lista? Todas as tarefas e colunas nela serão perdidas.')) {
      try {
        await deleteList(id);
        if (currentListaId === id) {
          const remaining = listas.filter(l => l.id !== id);
          if (remaining.length > 0) navigate(`/lista/${remaining[0].id}`);
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
        if (nova) navigate(`/lista/${nova.id}`);
      }
      setModalOpen(false);
    } catch {
      alert('Erro ao salvar lista');
    } finally {
      setLoadingSubmit(false);
    }
  };



  // ─── Conteúdo interno da sidebar ───────────────────────────────────────────
  const sidebarContent = (
    <div className="flex flex-col h-full">

      {/* Topo: logo + toggle collapse (desktop) */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800 shrink-0">
        {!collapsed && (
          <Link
            to="/"
            className="text-base font-bold text-white hover:text-blue-400 transition-colors leading-none truncate"
          >
            Gestão de Tarefas
          </Link>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          title={collapsed ? 'Expandir' : 'Recolher'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Saudação + relógio */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-slate-800 shrink-0">
          <p className="text-xs text-slate-400 truncate">
            {saudacao()}, <span className="text-slate-200 font-medium">{userName}</span>
          </p>
          <p className="text-lg font-semibold text-white mt-0.5">
            {hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-xs text-slate-400">
            {hora.toLocaleDateString('pt-BR', { dateStyle: 'long' })}
          </p>
        </div>
      )}

      {/* Navegação principal */}
      <nav className="flex flex-col gap-1 px-2 py-3 shrink-0">
        {/* Tarefas (link para lista atual ou /) */}
        <button
          onClick={() => navigate(currentListaId ? `/lista/${currentListaId}` : '/')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left
            ${!hideListSelector
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          <ListTodo size={18} className="shrink-0" />
          {!collapsed && <span>Tarefas</span>}
        </button>

        {/* Dashboard */}
        <button
          onClick={() => navigate('/dashboard')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left
            ${hideListSelector
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          <LayoutDashboard size={18} className="shrink-0" />
          {!collapsed && <span>Dashboard</span>}
        </button>
      </nav>

      {/* Separador + seletor de listas */}
      {!hideListSelector && !collapsed && (
        <div className="px-2 flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Listas
            </span>
            <button
              onClick={abrirModalCriar}
              className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
              title="Nova lista"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 scroll-container space-y-0.5 pb-2" ref={dropdownRef}>
            {loadingLists ? (
              <p className="text-xs text-slate-500 px-2 py-2">Carregando...</p>
            ) : listas.length === 0 ? (
              <p className="text-xs text-slate-500 px-2 py-2">Nenhuma lista.</p>
            ) : (
              listas.map(lista => (
                <div
                  key={lista.id}
                  onClick={() => handleListaClick(lista.id)}
                  className={`group flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer transition-colors
                    ${currentListaId === lista.id
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {currentListaId === lista.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    )}
                    <span className="text-sm truncate">{lista.titulo}</span>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => abrirModalEditar(e, lista)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={(e) => handleDeletar(e, lista.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-600 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Ícone de lista quando collapsed */}
      {!hideListSelector && collapsed && (
        <div className="flex flex-col gap-0.5 px-2 flex-1 overflow-y-auto scroll-container py-1">
          {listas.map(lista => (
            <button
              key={lista.id}
              onClick={() => handleListaClick(lista.id)}
              title={lista.titulo}
              className={`w-full flex justify-center py-2 rounded-lg transition-colors
                ${currentListaId === lista.id ? 'bg-slate-700' : 'hover:bg-slate-800'}`}
            >
              <span className={`w-2 h-2 rounded-full ${currentListaId === lista.id ? 'bg-blue-500' : 'bg-slate-600'}`} />
            </button>
          ))}
        </div>
      )}

      {/* Rodapé: botão sair */}
      <div className="px-2 py-3 border-t border-slate-800 shrink-0 mt-auto">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors w-full"
          title="Sair"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Botão hamburguer mobile (fixo no topo) ────────────────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 hover:text-white"
      >
        <Menu size={20} />
      </button>

      {/* ── Overlay mobile ───────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar mobile (drawer) ───────────────────────────────────────── */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-50 flex flex-col transition-transform duration-200
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
          <Link to="/" className="text-base font-bold text-white hover:text-blue-400 transition-colors">
            Gestão de Tarefas
          </Link>
          <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* ── Sidebar desktop (fixa) ────────────────────────────────────────── */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-full bg-slate-900 border-r border-slate-800 z-30 transition-all duration-200
          ${collapsed ? 'w-16' : 'w-56'}`}
      >
        {sidebarContent}
      </aside>

      {/* Modal criar/editar lista */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]">
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
