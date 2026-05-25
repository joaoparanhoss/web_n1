import { useState, useMemo } from 'react';
import { AppLayout } from '../components/AppLayout';
import { useLists } from '../hooks/useLists';
import { useDashboard } from '../hooks/useDashboard';
import { DashboardTarefa } from '../types/database';
import { isSameMonth, parseISO, subMonths, addMonths, startOfMonth, format, differenceInDays } from 'date-fns';
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
  
  const [dataInicio, setDataInicio] = useState<Date>(() => subMonths(new Date(), 5));
  const [dataFim, setDataFim] = useState<Date>(() => new Date());
  
  const queryListaId = selectedListId === 'all' ? undefined : selectedListId;
  const { tarefas, loading: loadingDashboard, error } = useDashboard(queryListaId);

  const stats = useMemo(() => {
    const now = new Date();
    let concluidasMes = 0;
    let emAndamento = 0;
    let canceladas = 0;
    let concluidas = 0;
    
    const concluidas6Meses: Record<string, number> = {};
    const startDate = startOfMonth(dataInicio);
    const endDate = startOfMonth(dataFim);
    let cursor = startDate;
    while (cursor <= endDate) {
      concluidas6Meses[format(cursor, 'MMM/yy', { locale: ptBR })] = 0;
      cursor = addMonths(cursor, 1);
    }

    const emAndamentoPorLista: Record<string, number> = {};

    const proximasTarefas: DashboardTarefa[] = [];

    tarefas.forEach(t => {
      const tipo = t.colunas?.tipo;
      // Usa concluido_em como fonte de verdade; fallback para atualizado_em
      // para tarefas antigas que não têm o campo ainda
      const dataConclusao = t.concluido_em || t.atualizado_em || t.criado_em;

      if (tipo === 'concluido') {
        concluidas++;
        if (dataConclusao && isSameMonth(parseISO(dataConclusao), now)) {
          concluidasMes++;
        }
        
        if (dataConclusao) {
          const date = parseISO(dataConclusao);
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

        if (t.data_limite) {
          const diff = differenceInDays(parseISO(t.data_limite), now);
          if (diff <= 7) {
            proximasTarefas.push(t);
          }
        }
      }
    });

    proximasTarefas.sort((a, b) => new Date(a.data_limite!).getTime() - new Date(b.data_limite!).getTime());

    return {
      total: tarefas.length,
      concluidasMes,
      emAndamento,
      canceladas,
      concluidas,
      concluidas6Meses,
      emAndamentoPorLista,
      proximasTarefas: proximasTarefas.slice(0, 5)
    };
  }, [tarefas, dataInicio, dataFim]);

  const MESES = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  const anoAtual = new Date().getFullYear();
  const ANOS = Array.from({ length: 5 }, (_, i) => anoAtual - 4 + i);
  // Gera [anoAtual-4, ..., anoAtual] ex: [2022, 2023, 2024, 2025, 2026]

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
    <AppLayout hideListSelector={true}>
      <div className="text-slate-300 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h3 className="text-lg font-semibold text-white">Tarefas Concluídas</h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* De */}
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs text-slate-400 whitespace-nowrap">De</label>
                      <select
                        value={dataInicio.getMonth()}
                        onChange={(e) => {
                          const d = new Date(dataInicio);
                          d.setMonth(Number(e.target.value));
                          if (d <= dataFim) setDataInicio(d);
                        }}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                      >
                        {MESES.map((m, i) => (
                          <option key={i} value={i}>{m}</option>
                        ))}
                      </select>
                      <select
                        value={dataInicio.getFullYear()}
                        onChange={(e) => {
                          const d = new Date(dataInicio);
                          d.setFullYear(Number(e.target.value));
                          if (d <= dataFim) setDataInicio(d);
                        }}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                      >
                        {ANOS.map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>

                    <span className="text-slate-600 text-sm">→</span>

                    {/* Até */}
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs text-slate-400 whitespace-nowrap">Até</label>
                      <select
                        value={dataFim.getMonth()}
                        onChange={(e) => {
                          const d = new Date(dataFim);
                          d.setMonth(Number(e.target.value));
                          if (d >= dataInicio) setDataFim(d);
                        }}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                      >
                        {MESES.map((m, i) => (
                          <option key={i} value={i}>{m}</option>
                        ))}
                      </select>
                      <select
                        value={dataFim.getFullYear()}
                        onChange={(e) => {
                          const d = new Date(dataFim);
                          d.setFullYear(Number(e.target.value));
                          if (d >= dataInicio) setDataFim(d);
                        }}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                      >
                        {ANOS.map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="h-64">
                  <Bar data={barMesesData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Gráfico 3 */}
            <div className="grid grid-cols-1 gap-6 mb-8">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4">Tarefas Abertas por Lista</h3>
                <div className="h-64">
                  <Bar data={barListasData} options={horizontalChartOptions} />
                </div>
              </div>
            </div>

            {/* Próximas Tarefas */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Vencendo nos próximos 7 dias</h3>
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
                          <td className={`py-3 text-right font-medium ${isProximoVencimento(t.data_limite!) ? 'text-red-400' : 'text-slate-300'}`}>
                            {format(parseISO(t.data_limite!), 'dd/MM/yyyy')}
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
      </div>
    </AppLayout>
  );
}
