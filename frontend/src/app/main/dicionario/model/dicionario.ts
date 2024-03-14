export interface DicionarioGet {
  uuid: string;
  tabela: string;
  status: number;
  fields: Field[];
}

export interface DicionarioPost {}

export interface DicionarioEdit {}

export interface Field {
  label: string;
  diffs: [];
}

export interface DicionarioAPI {
  items: DicionarioGet[];
  hasNext: boolean;
}

export type Dicionarios = Array<DicionarioGet>;
