import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { useLists } from '../hooks/useLists';
import { useDashboard } from '../hooks/useDashboard';
import { isSameMonth, parseISO, subMonths, format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const chartOptions = {
  plugins: { legend: { labels: { color: '#94a3b8' } } },
  scales: {
    x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
    y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
  },
  maintainAspectRatio: false,
};

const donutOptions = {
  plugins: { legend: { labels: { color: '#94a3b8' } } },
  maintainAspectRatio: false,
};

export function Dashboard() {
  const { listas, loading: loadingLists } = useLists();
  const [selectedListId, setSelectedListId] = useState<string>('all');
  
  const queryListaId = selectedListId === 'all' ? undefined : selectedListId;
  const { tarefas, loading: loadingDashboard, error } = useDashboard(queryListaId);

  const stats = useMemo(() => {
    const now = new Date();
    let concluidasMes = 0;
    let emAndamento = 0;
    let canceladas = 0;
    let concluidas = 0;
    
    let alta = 0;
    let media = 0;
    let baixa = 0;

    const concluidas6Meses: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      concluidas6Meses[format(d, 'MMM/yy', { locale: ptBR })] = 0;
    }

    const emAndamentoPorLista: Record<string, number> = {};

    const proximasTarefas: any[] = [];

    tarefas.forEach(t => {
      const tipo = t.colunas?.tipo;
      const dataAtualizacao = t.atualizado_em || t.criado_em;

      if (tipo === 'concluido') {
        concluidas++;
        if (dataAtualizacao && isSameMonth(parseISO(dataAtualizacao), now)) {
          concluidasMes++;
        }
        
        if (dataAtualizacao) {
          const date = parseISO(dataAtualizacao);
          const monthKey = format(date, 'MMM/yy', { locale: ptBR });
          if (concluidas6Meses[monthKey] !== undefined) {
            concluidas6Meses[monthKey]++;
          }
        }
      } else if (tipo === 'cancelado') {
        canceladas++;
      } else if (tipo === 'padrao') {
        emAndamento++;
        
        const listName = t.listas?.titulo || 'Sem Lista';
        emAndamentoPorLista[listName] = (emAndamentoPorLista[listName] || 0) + 1;

        if (t.prioridade === 'ALTA') alta++;
        else if (t.prioridade === 'MEDIA') media++;
        else if (t.prioridade === 'BAIXA') baixa++;

        if (t.data_limite) {
          proximasTarefas.push(t);
        }
      }
    });

    proximasTarefas.sort((a, b) => new Date(a.data_limite).getTime() - new Date(b.data_limite).getTime());

    return {
      total: tarefas.length,
      concluidasMes,
      emAndamento,
      canceladas,
      concluidas,
      alta,
      media,
      baixa,
      concluidas6Meses,
      emAndamentoPorLista,
      proximasTarefas: proximasTarefas.slice(0, 5)
    };
  }, [tarefas]);

  const donutData = {
    labels: ['Concluídas', 'Em andamento', 'Canceladas'],
    datasets: [
      {
        data: [stats.concluidas, stats.emAndamento, stats.canceladas],
        backgroundColor: ['#22c55e', '#3b82f6', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const barMesesData = {
    labels: Object.keys(stats.concluidas6Meses),
    datasets: [
      {
        label: 'Tarefas Concluídas',
        data: Object.values(stats.concluidas6Meses),
        backgroundColor: '#22c55e',
      },
    ],
  };

  const barListasData = {
    labels: Object.keys(stats.emAndamentoPorLista),
    datasets: [
      {
        label: 'Tarefas Abertas',
        data: Object.values(stats.emAndamentoPorLista),
        backgroundColor: '#3b82f6',
        indexAxis: 'y' as const,
      },
    ],
  };

  const horizontalChartOptions = {
    ...chartOptions,
    indexAxis: 'y' as const,
  };

  const isProximoVencimento = (dateStr: string) => {
    const diff = differenceInDays(parseISO(dateStr), new Date());
    return diff <= 3;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <Header hideListSelector={true} />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          
          <select
            value={selectedListId}
            onChange={(e) => setSelectedListId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 w-full sm:w-auto"
          >
            <option value="all">Todas as listas</option>
            {listas.map((l) => (
              <option key={l.id} value={l.id}>{l.titulo}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-800 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {(loadingDashboard || loadingLists) ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : tarefas.length === 0 && selectedListId !== 'all' ? (
          <div className="text-center py-12 bg-slate-900 rounded-xl border border-slate-800">
            <p className="text-slate-400 text-lg">Nenhuma tarefa encontrada para esta lista.</p>
          </div>
        ) : (
          <>
            {/* Métricas Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <p className="text-slate-400 text-sm font-medium mb-1">Total de Tarefas</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <p className="text-slate-400 text-sm font-medium mb-1">Concluídas este mês</p>
                <p className="text-3xl font-bold text-green-500">{stats.concluidasMes}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <p className="text-slate-400 text-sm font-medium mb-1">Em Andamento</p>
                <p className="text-3xl font-bold text-blue-500">{stats.emAndamento}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <p className="text-slate-400 text-sm font-medium mb-1">Canceladas</p>
                <p className="text-3xl font-bold text-red-500">{stats.canceladas}</p>
              </div>
            </div>

            {/* Gráficos 1 e 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4">Distribuição por Status</h3>
                <div className="h-64">
                  <Doughnut data={donutData} options={donutOptions} />
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4">Concluídas (6 Meses)</h3>
                <div className="h-64">
                  <Bar data={barMesesData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Gráfico 3 e Outras infos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4">Tarefas Abertas por Lista</h3>
                <div className="h-64">
                  <Bar data={barListasData} options={horizontalChartOptions} />
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex-1">
                  <h3 className="text-lg font-semibold text-white mb-4">Prioridades (Abertas)</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-red-900/50 border border-red-500 rounded-lg p-3">
                      <span className="font-medium text-red-400">ALTA</span>
                      <span className="text-xl font-bold text-red-400">{stats.alta}</span>
                    </div>
                    <div className="flex justify-between items-center bg-yellow-900/50 border border-yellow-500 rounded-lg p-3">
                      <span className="font-medium text-yellow-400">MÉDIA</span>
                      <span className="text-xl font-bold text-yellow-400">{stats.media}</span>
                    </div>
                    <div className="flex justify-between items-center bg-green-900/50 border border-green-500 rounded-lg p-3">
                      <span className="font-medium text-green-400">BAIXA</span>
                      <span className="text-xl font-bold text-green-400">{stats.baixa}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Próximas Tarefas */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Tarefas com Prazo Próximo</h3>
              {stats.proximasTarefas.length === 0 ? (
                <p className="text-slate-400 py-4 text-center">Nenhuma tarefa aberta com prazo definido.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-sm">
                        <th className="pb-3 font-medium">Título</th>
                        <th className="pb-3 font-medium">Lista</th>
                        <th className="pb-3 font-medium">Coluna</th>
                        <th className="pb-3 font-medium text-right">Prazo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.proximasTarefas.map(t => (
                        <tr key={t.id} className="border-b border-slate-800/50 last:border-0">
                          <td className="py-3 text-white font-medium">{t.titulo}</td>
                          <td className="py-3 text-slate-400">{t.listas?.titulo}</td>
                          <td className="py-3 text-slate-400">{t.colunas?.titulo}</td>
                          <td className={`py-3 text-right font-medium ${isProximoVencimento(t.data_limite) ? 'text-red-400' : 'text-slate-300'}`}>
                            {format(parseISO(t.data_limite), 'dd/MM/yyyy')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
