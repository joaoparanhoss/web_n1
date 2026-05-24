import { X, Edit2 } from 'lucide-react';
import { Tarefa, Prioridade } from '../../types/database';

interface TaskViewModalProps {
  tarefa: Tarefa | null;
  onClose: () => void;
  onEdit: (tarefa: Tarefa) => void;
  formatPriorityColor: (p: Prioridade | null | undefined) => string;
  formatPriorityBadge: (p: Prioridade | null | undefined) => string;
  formatPriorityLabel: (p: Prioridade | null | undefined) => string;
}

export function TaskViewModal({
  tarefa,
  onClose,
  onEdit,
  formatPriorityColor,
  formatPriorityBadge,
  formatPriorityLabel
}: TaskViewModalProps) {
  if (!tarefa) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <div className={`absolute top-0 left-0 right-0 h-2 ${formatPriorityColor(tarefa.prioridade)}`} />
        <div className="flex justify-between items-start p-5 border-b border-slate-800 mt-2">
          <h3 className="text-xl font-bold text-white break-words pr-8">
            {tarefa.titulo}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors shrink-0"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-1">Prioridade</h4>
            <div className={`inline-block text-xs px-2.5 py-1 uppercase font-bold rounded-full border ${formatPriorityBadge(tarefa.prioridade)}`}>
              {formatPriorityLabel(tarefa.prioridade)}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-1">Descrição</h4>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 min-h-[100px] text-slate-300 text-sm whitespace-pre-wrap break-words">
              {tarefa.descricao || <span className="text-slate-500 italic">Nenhuma descrição.</span>}
            </div>
          </div>

          <div className="pt-4 flex gap-3 justify-end border-t border-slate-800">
            <button
              onClick={() => {
                onClose();
                onEdit(tarefa);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Edit2 size={16} />
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
