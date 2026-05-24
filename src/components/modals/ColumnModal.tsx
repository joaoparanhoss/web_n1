import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Coluna, TipoColuna } from '../../types/database';

interface ColumnModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { titulo: string; ordem: number; tipo: TipoColuna }) => Promise<void>;
  initialData?: { titulo: string; ordem: number; tipo: TipoColuna };
  isEditing: boolean;
  colunasExistentes: Coluna[];
  editandoId?: string;
}

export function ColumnModal({ open, onClose, onSubmit, initialData, isEditing, colunasExistentes, editandoId }: ColumnModalProps) {
  const [titulo, setTitulo] = useState('');
  const [ordem, setOrdem] = useState(0);
  const [tipo, setTipo] = useState<TipoColuna>('padrao');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setTitulo(initialData.titulo);
        setOrdem(initialData.ordem);
        setTipo(initialData.tipo);
      } else {
        setTitulo('');
        setOrdem(0);
        setTipo('padrao');
      }
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (tipo === 'concluido' || tipo === 'cancelado') {
      const existingColumn = colunasExistentes.find(c => c.tipo === tipo && c.id !== editandoId);
      if (existingColumn) {
        alert(`Esta lista já possui uma coluna do tipo ${tipo === 'concluido' ? 'Concluído' : 'Cancelado'}.`);
        return;
      }
    }

    setLoadingSubmit(true);
    try {
      await onSubmit({ titulo, ordem, tipo });
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-5 border-b border-slate-800">
          <h3 className="text-xl font-bold text-white">
            {isEditing ? 'Editar Coluna' : 'Nova Coluna'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            type="button"
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
              placeholder="Ex: A fazer"
            />
          </div>

          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Ordem
              </label>
              <input
                type="number"
                required
                min="1"
                value={ordem}
                onChange={(e) => setOrdem(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-800 border-slate-700 border rounded p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Tipo da coluna
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoColuna)}
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
