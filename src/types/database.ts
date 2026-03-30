export interface Usuario {
  id: string;
  nome: string;
  email: string;
  criado_em?: string;
}

export type StatusTarefa = 'pendente' | 'em andamento' | 'concluido';

export interface Lista {
  id: string;
  titulo: string;
  descricao: string | null;
  usuario_id: string;
  criado_em?: string;
}

export interface Coluna {
  id: string;
  titulo: string;
  ordem: number;
  lista_id: string;
  criado_em?: string;
  atualizado_em?: string;
}

export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string | null;
  status: StatusTarefa;
  lista_id: string;
  coluna_id?: string;
  criado_em?: string;
  atualizado_em?: string;
}
