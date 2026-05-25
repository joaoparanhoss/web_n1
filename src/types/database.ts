export interface Usuario {
  id: string;
  nome: string;
  email: string;
  criado_em?: string;
}

export type Prioridade = 'ALTA' | 'MEDIA' | 'BAIXA';

export type StatusTarefa = 'pendente' | 'em andamento' | 'concluido';

export interface Lista {
  id: string;
  titulo: string;
  descricao: string | null;
  usuario_id: string;
  criado_em?: string;
}

export type TipoColuna = 'padrao' | 'concluido' | 'cancelado';

export interface Coluna {
  id: string;
  titulo: string;
  ordem: number;
  lista_id: string;
  tipo: TipoColuna;
  criado_em?: string;
  atualizado_em?: string;
}

export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string | null;
  prioridade: Prioridade | null;
  lista_id: string;
  coluna_id?: string;
  usuario_id?: string;
  data_limite?: string | null;
  criado_em?: string;
  atualizado_em?: string;
  concluido_em?: string | null;
}

export interface DashboardTarefa {
  id: string;
  titulo: string;
  descricao: string | null;
  prioridade: Prioridade | null;
  lista_id: string;
  coluna_id: string;
  data_limite: string | null;
  criado_em: string;
  atualizado_em: string;
  concluido_em?: string | null;
  colunas: {
    id: string;
    titulo: string;
    tipo: TipoColuna;
    ordem: number;
  } | null;
  listas: {
    id: string;
    titulo: string;
  } | null;
}
