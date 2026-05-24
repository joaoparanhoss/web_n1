import { useState } from 'react';
import { Edit2, Trash2, Plus, GripVertical } from 'lucide-react';
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
import { AppLayout } from '../components/AppLayout';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useLista } from '../hooks/useLista';
import { useTasks } from '../hooks/useTasks';
import { useColumns } from '../hooks/useColumns';
import { Tarefa, Prioridade, Coluna, TipoColuna } from '../types/database';
import { TaskModal } from '../components/modals/TaskModal';
import { ColumnModal } from '../components/modals/ColumnModal';
import { TaskViewModal } from '../components/modals/TaskViewModal';

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
    zIndex: isDragging ? 50 : 1,
  };
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={className} 
      onClick={onClick}
      {...listeners} 
      {...attributes}
    >
      <div className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 z-10" title="Arrastar">
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

  // Estados do modal de colunas
  const [modalColunaOpen, setModalColunaOpen] = useState(false);
  const [editandoColuna, setEditandoColuna] = useState<Coluna | null>(null);

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
    setModalOpen(true);
  };

  const abrirModalEditar = (e: React.MouseEvent | undefined, tarefa: Tarefa) => {
    if (e) e.stopPropagation();
    setVisualizando(null);
    setEditando(tarefa);
    setModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      await deleteTask(id);
    }
  };

  const handleTaskSubmit = async (data: { titulo: string; descricao: string; prioridade: Prioridade; dataLimite: string }) => {
    if (!user || !lista) return;

    try {
      if (editando) {
        await updateTask(editando.id, {
          titulo: data.titulo,
          descricao: data.descricao,
          prioridade: data.prioridade,
          data_limite: data.dataLimite || null
        });
      } else {
        await createTask({
          titulo: data.titulo,
          descricao: data.descricao,
          prioridade: data.prioridade,
          lista_id: lista.id,
          usuario_id: user.id,
          data_limite: data.dataLimite || null
        });
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar tarefa');
    }
  };

  const abrirModalColunaCriar = () => {
    setEditandoColuna(null);
    setModalColunaOpen(true);
  };

  const abrirModalColunaEditar = (coluna: Coluna) => {
    setEditandoColuna(coluna);
    setModalColunaOpen(true);
  };

  const handleColumnSubmit = async (data: { titulo: string; ordem: number; tipo: TipoColuna }) => {
    if (!lista) return;

    try {
      if (editandoColuna) {
        await updateColumn(editandoColuna.id, {
          titulo: data.titulo,
          ordem: data.ordem,
          tipo: data.tipo
        });
      } else {
        await createColumn(data.titulo, data.tipo);
      }
      setModalColunaOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar coluna');
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
    <AppLayout>
      <div className="text-slate-300 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
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

      <TaskViewModal
        tarefa={visualizando}
        onClose={() => setVisualizando(null)}
        onEdit={(tarefa) => abrirModalEditar(undefined, tarefa)}
        formatPriorityColor={formatPriorityColor}
        formatPriorityBadge={formatPriorityBadge}
        formatPriorityLabel={formatPriorityLabel}
      />

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleTaskSubmit}
        isEditing={!!editando}
        initialData={editando ? {
          titulo: editando.titulo,
          descricao: editando.descricao || '',
          prioridade: editando.prioridade || 'BAIXA',
          dataLimite: editando.data_limite || ''
        } : undefined}
      />

      <ColumnModal
        open={modalColunaOpen}
        onClose={() => setModalColunaOpen(false)}
        onSubmit={handleColumnSubmit}
        isEditing={!!editandoColuna}
        colunasExistentes={colunas}
        editandoId={editandoColuna?.id}
        initialData={editandoColuna ? {
          titulo: editandoColuna.titulo,
          ordem: editandoColuna.ordem,
          tipo: editandoColuna.tipo || 'padrao'
        } : undefined}
      />
      </div>
    </AppLayout>
  );
}
