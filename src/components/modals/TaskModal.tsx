import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Prioridade } from '../../types/database';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { titulo: string; descricao: string; prioridade: Prioridade; dataLimite: string }) => Promise<void>;
  initialData?: { titulo: string; descricao: string; prioridade: Prioridade; dataLimite: string };
  isEditing: boolean;
}

export function TaskModal({ open, onClose, onSubmit, initialData, isEditing }: TaskModalProps) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState<Prioridade>('BAIXA');
  const [dataLimite, setDataLimite] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setTitulo(initialData.titulo);
        setDescricao(initialData.descricao);
        setPrioridade(initialData.prioridade);
        setDataLimite(initialData.dataLimite);
      } else {
        setTitulo('');
        setDescricao('');
        setPrioridade('BAIXA');
        setDataLimite('');
      }
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    try {
      await onSubmit({ titulo, descricao, prioridade, dataLimite });
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-5 border-b border-slate-800">
          <h3 className="text-xl font-bold text-white">
            {isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h3>
          <button
            onClick={onClose}
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
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full bg-slate-800 border-slate-700 border rounded p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Ex: Comprar leite"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Descrição
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full bg-slate-800 border-slate-700 border rounded p-3 text-white focus:outline-none focus:border-blue-500 transition-colors bg-transparent min-h-[100px] resize-y"
              placeholder="Detalhes adicionais (opcional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Prioridade
            </label>
            <select
              value={prioridade}
              onChange={(e) => setPrioridade(e.target.value as Prioridade)}
              className="w-full bg-slate-800 border-slate-700 border rounded p-3 text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 appearance-none"
            >
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA">Média</option>
              <option value="ALTA">Alta</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Prazo (opcional)
            </label>
            <input
              type="date"
              value={dataLimite}
              onChange={(e) => setDataLimite(e.target.value)}
              className="w-full bg-slate-800 border-slate-700 border rounded p-3 text-white focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
            />
          </div>

          <div className="pt-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
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
  );
}
