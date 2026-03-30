export interface Student {
  id: number;
  batch: number;
  start_date: string;
  end_date: string;
  course: string;
  shift: string;
  location: string;
  educator: string;
  name: string;
  gender: string;
  cpf: string;
  birth_date: string;
  guardian: string;
  address: string;
  neighborhood: string;
  phone: string;
  city: string;
  state: string;
  race: string;
  family_income: string;
  family_members: string;
  residence_type: string;
  status: string;
}

export interface Visit {
  id: string;
  student_id: number;
  user_id: string;
  visited_at: string;
  notes: string | null;
  situacao_ocupacional: string | null;
  renda_mensal: string | null;
  utiliza_conhecimentos: string | null;
  outros_cursos: string | null;
  area_curso: string | null;
  ajudou_trabalho: string | null;
  melhorias: string[] | null;
  transformacao: string | null;
  faixa_etaria: string | null;
  genero: string | null;
  tem_filhos: string | null;
}

export interface StudentWithVisit extends Student {
  visit?: Visit | null;
}
