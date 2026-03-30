import { useState } from 'react';
import { Edit2, Trash2, Plus, X } from 'lucide-react';
import { Header } from '../components/Header';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useLista } from '../hooks/useLista';
import { useTasks } from '../hooks/useTasks';
import { useColumns } from '../hooks/useColumns';
import { Tarefa, StatusTarefa, Coluna } from '../types/database';

export function Home() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const { lista, loading: loadingLista, error: errorLista } = useLista(id);
  const { tarefas, loading: loadingTasks, error: errorTasks, createTask, updateTask, deleteTask } = useTasks(lista?.id);
  const { colunas, loading: loadingColunas, error: errorColunas, createColumn, updateColumn, deleteColumn } = useColumns(lista?.id);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Tarefa | null>(null);
  
  const [tituloForm, setTituloForm] = useState('');
  const [descricaoForm, setDescricaoForm] = useState('');
  const [statusForm, setStatusForm] = useState<StatusTarefa>('pendente');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Estados do modal de colunas
  const [modalColunaOpen, setModalColunaOpen] = useState(false);
  const [editandoColuna, setEditandoColuna] = useState<Coluna | null>(null);
  const [tituloColunaForm, setTituloColunaForm] = useState('');
  const [ordemColunaForm, setOrdemColunaForm] = useState(0);
  const [loadingColunaSubmit, setLoadingColunaSubmit] = useState(false);

  const abrirModalCriar = () => {
    setEditando(null);
    setTituloForm('');
    setDescricaoForm('');
    setStatusForm('pendente');
    setModalOpen(true);
  };

  const abrirModalEditar = (e: React.MouseEvent, tarefa: Tarefa) => {
    e.stopPropagation();
    setEditando(tarefa);
    setTituloForm(tarefa.titulo);
    setDescricaoForm(tarefa.descricao || '');
    setStatusForm(tarefa.status);
    setModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      await deleteTask(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !lista) return;
    
    setLoadingSubmit(true);
    try {
      if (editando) {
        await updateTask(editando.id, { 
          titulo: tituloForm, 
          descricao: descricaoForm,
          status: statusForm
        });
      } else {
        await createTask({ 
          titulo: tituloForm, 
          descricao: descricaoForm,
          status: statusForm,
          lista_id: lista.id
        });
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar tarefa');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const abrirModalColunaCriar = () => {
    setEditandoColuna(null);
    setTituloColunaForm('');
    setOrdemColunaForm(0);
    setModalColunaOpen(true);
  };

  const abrirModalColunaEditar = (coluna: Coluna) => {
    setEditandoColuna(coluna);
    setTituloColunaForm(coluna.titulo);
    setOrdemColunaForm(coluna.ordem);
    setModalColunaOpen(true);
  };

  const handleColunaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lista) return;
    
    setLoadingColunaSubmit(true);
    try {
      if (editandoColuna) {
        await updateColumn(editandoColuna.id, {
          titulo: tituloColunaForm,
          ordem: ordemColunaForm
        });
      } else {
        await createColumn(tituloColunaForm);
      }
      setModalColunaOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar coluna');
    } finally {
      setLoadingColunaSubmit(false);
    }
  };

  const handleDeletarColuna = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir esta coluna? Todas as tarefas nela também podem ser perdidas.')) {
      try {
        await deleteColumn(id);
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir coluna');
      }
    }
  };

  const formatStatus = (status: StatusTarefa) => {
    switch(status) {
      case 'pendente': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'em andamento': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'concluido': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <Header />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* User Profile Section */}
        <div className="mb-10 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Olá, {user?.user_metadata?.nome || user?.email}</h2>
            <p className="text-slate-400">{user?.email}</p>
          </div>
        </div>

        {/* Tasks Section */}
        {loadingLista ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : errorLista ? (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-800 text-red-400 rounded-lg">
            {errorLista}
          </div>
        ) : !lista ? (
          <div className="text-center py-12 bg-slate-900 rounded-lg border border-slate-800">
            <p className="text-slate-400 text-lg">Nenhuma lista encontrada.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Minhas Tarefas</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={abrirModalColunaCriar}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-slate-700"
                >
                  <Plus size={20} />
                  Nova Coluna
                </button>
                <button
                  onClick={abrirModalCriar}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus size={20} />
                  Nova Tarefa
                </button>
              </div>
            </div>

            {errorTasks && (
              <div className="mb-4 p-4 bg-red-900/50 border border-red-800 text-red-400 rounded-lg">
                {errorTasks}
              </div>
            )}

            {errorColunas && (
              <div className="mb-4 p-4 bg-red-900/50 border border-red-800 text-red-400 rounded-lg">
                {errorColunas}
              </div>
            )}

            {loadingColunas || loadingTasks ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : colunas.length === 0 ? (
              <div className="text-center py-12 bg-slate-900 rounded-lg border border-slate-800">
                <p className="text-slate-400 text-lg">Nenhuma coluna criada.</p>
                <button
                  onClick={abrirModalColunaCriar}
                  className="mt-4 text-blue-500 hover:text-blue-400 font-medium"
                >
                  Crie sua primeira coluna
                </button>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-6 mb-6 min-h-[500px] items-start scroll-container">
                {colunas.map((coluna) => (
                  <div key={coluna.id} className="flex-1 min-w-[280px] bg-slate-800/50 border border-slate-800 rounded-xl p-4 flex flex-col group/col shrink-0">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-slate-100">{coluna.titulo}</h4>
                      <div className="flex items-center gap-1 opacity-0 group-hover/col:opacity-100 transition-all">
                        <button
                          onClick={() => abrirModalColunaEditar(coluna)}
                          className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-md"
                          title="Editar coluna"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => handleDeletarColuna(e, coluna.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-md"
                          title="Excluir coluna"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      {tarefas.filter(t => t.coluna_id === coluna.id).map((tarefa) => (
                        <div
                          key={tarefa.id}
                          className="group/task bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all hover:shadow-lg flex flex-col"
                        >
                          <div className="flex flex-col gap-2 mb-3">
                            <div className="flex justify-between items-start gap-3">
                              <h4 className="text-base font-semibold text-white break-words flex-1" title={tarefa.titulo}>
                                {tarefa.titulo}
                              </h4>
                              <span className={`text-[10px] px-2 py-0.5 uppercase font-bold rounded-full border whitespace-nowrap ${formatStatus(tarefa.status)}`}>
                                {tarefa.status}
                              </span>
                            </div>
                            {tarefa.descricao && (
                              <p className="text-xs text-slate-400 line-clamp-2" title={tarefa.descricao}>
                                {tarefa.descricao}
                              </p>
                            )}
                          </div>
                          
                          <div className="mt-auto pt-3 border-t border-slate-800 flex justify-between items-center gap-2">
                            <select
                              value={tarefa.coluna_id || ''}
                              onChange={(e) => updateTask(tarefa.id, { coluna_id: e.target.value })}
                              className="bg-slate-950 border border-slate-700 rounded p-1 text-xs text-slate-300 focus:outline-none focus:border-blue-500 w-full max-w-[130px] cursor-pointer"
                              title="Mover de coluna"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="" disabled>Coluna...</option>
                              {colunas.map(c => (
                                <option key={c.id} value={c.id}>{c.titulo}</option>
                              ))}
                            </select>
                            
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => abrirModalEditar(e, tarefa)}
                                className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded-md transition-colors opacity-0 group-hover/task:opacity-100"
                                title="Editar tarefa"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={(e) => handleDelete(e, tarefa.id)}
                                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors opacity-0 group-hover/task:opacity-100"
                                title="Excluir tarefa"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de Tarefa */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">
                {editando ? 'Editar Tarefa' : 'Nova Tarefa'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={tituloForm}
                  onChange={(e) => setTituloForm(e.target.value)}
                  className="w-full bg-slate-800 border-slate-700 border rounded p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Ex: Comprar leite"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Descrição
                </label>
                <textarea
                  value={descricaoForm}
                  onChange={(e) => setDescricaoForm(e.target.value)}
                  className="w-full bg-slate-800 border-slate-700 border rounded p-3 text-white focus:outline-none focus:border-blue-500 transition-colors bg-transparent min-h-[100px] resize-y"
                  placeholder="Detalhes adicionais (opcional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={statusForm}
                  onChange={(e) => setStatusForm(e.target.value as StatusTarefa)}
                  className="w-full bg-slate-800 border-slate-700 border rounded p-3 text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 appearance-none"
                >
                  <option value="pendente">Pendente</option>
                  <option value="em andamento">Em Andamento</option>
                  <option value="concluido">Concluído</option>
                </select>
              </div>
              
              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingSubmit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                >
                  {loadingSubmit ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Coluna */}
      {modalColunaOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">
                {editandoColuna ? 'Editar Coluna' : 'Nova Coluna'}
              </h3>
              <button
                onClick={() => setModalColunaOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
                type="button"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleColunaSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={tituloColunaForm}
                  onChange={(e) => setTituloColunaForm(e.target.value)}
                  className="w-full bg-slate-800 border-slate-700 border rounded p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Ex: A fazer"
                />
              </div>

              {editandoColuna && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Ordem
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={ordemColunaForm}
                    onChange={(e) => setOrdemColunaForm(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-800 border-slate-700 border rounded p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              )}
              
              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setModalColunaOpen(false)}
                  className="px-4 py-2 font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingColunaSubmit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                >
                  {loadingColunaSubmit ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
