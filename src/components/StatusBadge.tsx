import { StatusTarefa } from '../types/database';

interface StatusBadgeProps {
  status: StatusTarefa;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    'pendente': {
      label: 'Pendente',
      className: 'border-slate-500 text-slate-400 bg-slate-500/10'
    },
    'em andamento': {
      label: 'Em andamento',
      className: 'border-yellow-500 text-yellow-500 bg-yellow-500/10'
    },
    'concluido': {
      label: 'Concluído',
      className: 'border-green-500 text-green-500 bg-green-500/10'
    }
  };

  const config = statusConfig[status];

  return (
    <span className={`px-2 py-1 text-xs font-medium border rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}
