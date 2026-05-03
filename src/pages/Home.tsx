import { useState } from 'react';
import { Edit2, Trash2, Plus, X, GripVertical } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useDraggable
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Header } from '../components/Header';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useLista } from '../hooks/useLista';
import { useTasks } from '../hooks/useTasks';
import { useColumns } from '../hooks/useColumns';
import { Tarefa, Prioridade, Coluna, TipoColuna } from '../types/database';

function DroppableColumn({ id, children, className }: { id: string; children: React.ReactNode; className: string }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  const style = isOver ? { outline: '2px dashed #475569', outlineOffset: '-2px', backgroundColor: 'rgba(30, 41, 59, 0.5)' } : undefined;
  return (
    <div ref={setNodeRef} style={style} className={className}>
      {children}
    </div>
  );
}

function DraggableTask({ id, children, className, onClick }: { id: string; children: React.ReactNode; className?: string; onClick?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: 'auto',
    zIndex: isDragging ? 50 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className={className} onClick={onClick}>
      <div className="absolute top-3 right-3 text-slate-500 cursor-grab active:cursor-grabbing hover:text-slate-300 z-10" {...listeners} {...attributes} title="Arrastar">
        <GripVertical size={16} />
      </div>
      {children}
    </div>
  );
}

export function Home() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const { lista, loading: loadingLista, error: errorLista } = useLista(id);
  const { tarefas, loading: loadingTasks, error: errorTasks, createTask, updateTask, deleteTask } = useTasks(lista?.id);
  const { colunas, loading: loadingColunas, error: errorColunas, createColumn, updateColumn, deleteColumn } = useColumns(lista?.id);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Tarefa | null>(null);
  const [visualizando, setVisualizando] = useState<Tarefa | null>(null);

  const [tituloForm, setTituloForm] = useState('');
  const [descricaoForm, setDescricaoForm] = useState('');
  const [prioridadeForm, setPrioridadeForm] = useState<Prioridade>('BAIXA');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Estados do modal de colunas
  const [modalColunaOpen, setModalColunaOpen] = useState(false);
  const [editandoColuna, setEditandoColuna] = useState<Coluna | null>(null);
  const [tituloColunaForm, setTituloColunaForm] = useState('');
  const [ordemColunaForm, setOrdemColunaForm] = useState(0);
  const [tipoColunaForm, setTipoColunaForm] = useState<TipoColuna>('padrao');
  const [loadingColunaSubmit, setLoadingColunaSubmit] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const targetColumnId = over.id as string;
    const task = tarefas.find(t => t.id === taskId);

    if (task && task.coluna_id !== targetColumnId) {
      try {
        await updateTask(taskId, { coluna_id: targetColumnId });
      } catch (err) {
        console.error(err);
        alert('Erro ao mover tarefa');
      }
    }
  };

  const abrirModalCriar = () => {
    setEditando(null);
    setTituloForm('');
    setDescricaoForm('');
    setPrioridadeForm('BAIXA');
    setModalOpen(true);
  };

  const abrirModalEditar = (e: React.MouseEvent, tarefa: Tarefa) => {
    e.stopPropagation();
    setVisualizando(null);
    setEditando(tarefa);
    setTituloForm(tarefa.titulo);
    setDescricaoForm(tarefa.descricao || '');
    setPrioridadeForm(tarefa.prioridade || 'BAIXA');
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
          prioridade: prioridadeForm
        });
      } else {
        await createTask({
          titulo: tituloForm,
          descricao: descricaoForm,
          prioridade: prioridadeForm,
          lista_id: lista.id,
          usuario_id: user.id
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
    setTipoColunaForm('padrao');
    setModalColunaOpen(true);
  };

  const abrirModalColunaEditar = (coluna: Coluna) => {
    setEditandoColuna(coluna);
    setTituloColunaForm(coluna.titulo);
    setOrdemColunaForm(coluna.ordem);
    setTipoColunaForm(coluna.tipo || 'padrao');
    setModalColunaOpen(true);
  };

  const handleColunaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lista) return;

    if (tipoColunaForm === 'concluido' || tipoColunaForm === 'cancelado') {
      const existingColumn = colunas.find(c => c.tipo === tipoColunaForm && c.id !== editandoColuna?.id);
      if (existingColumn) {
        alert(`Esta lista já possui uma coluna do tipo ${tipoColunaForm === 'concluido' ? 'Concluído' : 'Cancelado'}.`);
        return;
      }
    }

    setLoadingColunaSubmit(true);
    try {
      if (editandoColuna) {
        await updateColumn(editandoColuna.id, {
          titulo: tituloColunaForm,
          ordem: ordemColunaForm,
          tipo: tipoColunaForm
        });
      } else {
        await createColumn(tituloColunaForm, tipoColunaForm);
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

  const formatPriorityColor = (prioridade: Prioridade | null | undefined) => {
    switch (prioridade) {
      case 'ALTA': return 'bg-red-500';
      case 'MEDIA': return 'bg-yellow-500';
      case 'BAIXA': return 'bg-green-500';
      default: return 'bg-slate-600';
    }
  };

  const formatPriorityBadge = (prioridade: Prioridade | null | undefined) => {
    switch (prioridade) {
      case 'ALTA': return 'bg-red-900/50 text-red-400 border-red-500';
      case 'MEDIA': return 'bg-yellow-900/50 text-yellow-400 border-yellow-500';
      case 'BAIXA': return 'bg-green-900/50 text-green-400 border-green-500';
      default: return 'bg-slate-800 text-slate-400 border-slate-600';
    }
  };

  const formatPriorityLabel = (prioridade: Prioridade | null | undefined) => {
    switch (prioridade) {
      case 'ALTA': return 'Alta';
      case 'MEDIA': return 'Média';
      case 'BAIXA': return 'Baixa';
      default: return 'Sem prioridade';
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
              <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div className="flex gap-4 overflow-x-auto pb-6 mb-6 min-h-[500px] items-start scroll-container">
                  {colunas.map((coluna) => (
                    <DroppableColumn key={coluna.id} id={coluna.id} className="flex-1 min-w-[280px] bg-slate-800/50 border border-slate-800 rounded-xl p-4 flex flex-col group/col shrink-0 transition-colors">
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

                      <div className="flex flex-col gap-3 min-h-[20px]">
                        {tarefas.filter(t => t.coluna_id === coluna.id).map((tarefa) => (
                          <DraggableTask
                            key={tarefa.id}
                            id={tarefa.id}
                            className="group/task bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors hover:shadow-lg flex flex-col relative overflow-hidden cursor-pointer"
                            onClick={() => setVisualizando(tarefa)}
                          >
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${formatPriorityColor(tarefa.prioridade)}`} />

                            <div className="p-4 pl-5">
                              <div className="flex flex-col gap-1 mb-2 pr-4">
                                <h4 className="text-base font-semibold text-white break-words" title={tarefa.titulo}>
                                  {tarefa.titulo}
                                </h4>
                                {tarefa.descricao && (
                                  <p className="text-xs text-slate-500 truncate" title={tarefa.descricao}>
                                    {tarefa.descricao}
                                  </p>
                                )}
                              </div>

                              <div className="mt-auto flex justify-end items-center gap-2">
                                <div className="flex gap-1 relative z-10">
                                  <button
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={(e) => abrirModalEditar(e, tarefa)}
                                    className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded-md transition-colors"
                                    title="Editar tarefa"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={(e) => handleDelete(e, tarefa.id)}
                                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
                                    title="Excluir tarefa"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </DraggableTask>
                        ))}
                      </div>
                    </DroppableColumn>
                  ))}
                </div>
              </DndContext>
            )}
          </>
        )}
      </main>

      {/* Modal de Visualizar Tarefa */}
      {visualizando && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setVisualizando(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className={`absolute top-0 left-0 right-0 h-2 ${formatPriorityColor(visualizando.prioridade)}`} />
            <div className="flex justify-between items-start p-5 border-b border-slate-800 mt-2">
              <h3 className="text-xl font-bold text-white break-words pr-8">
                {visualizando.titulo}
              </h3>
              <button
                onClick={() => setVisualizando(null)}
                className="text-slate-400 hover:text-white transition-colors shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-1">Prioridade</h4>
                <div className={`inline-block text-xs px-2.5 py-1 uppercase font-bold rounded-full border ${formatPriorityBadge(visualizando.prioridade)}`}>
                  {formatPriorityLabel(visualizando.prioridade)}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-1">Descrição</h4>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 min-h-[100px] text-slate-300 text-sm whitespace-pre-wrap break-words">
                  {visualizando.descricao || <span className="text-slate-500 italic">Nenhuma descrição.</span>}
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-800">
                <button
                  onClick={(e) => abrirModalEditar(e, visualizando)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  Prioridade
                </label>
                <select
                  value={prioridadeForm}
                  onChange={(e) => setPrioridadeForm(e.target.value as Prioridade)}
                  className="w-full bg-slate-800 border-slate-700 border rounded p-3 text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 appearance-none"
                >
                  <option value="BAIXA">Baixa</option>
                  <option value="MEDIA">Média</option>
                  <option value="ALTA">Alta</option>
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

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Tipo da coluna
                </label>
                <select
                  value={tipoColunaForm}
                  onChange={(e) => setTipoColunaForm(e.target.value as TipoColuna)}
                  className="w-full bg-slate-800 border-slate-700 border rounded p-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                >
                  <option value="padrao">Padrão</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

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
