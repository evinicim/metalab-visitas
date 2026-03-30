-- Tabela de alunos importados da planilha
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  batch INTEGER NOT NULL,
  start_date TEXT,
  end_date TEXT,
  course TEXT NOT NULL,
  shift TEXT,
  location TEXT DEFAULT 'AGUAS EMENDADAS',
  educator TEXT,
  name TEXT NOT NULL,
  gender TEXT,
  cpf TEXT,
  birth_date TEXT,
  guardian TEXT,
  address TEXT,
  neighborhood TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,
  race TEXT,
  family_income TEXT,
  family_members TEXT,
  residence_type TEXT,
  status TEXT NOT NULL DEFAULT 'CONCLUÍDO'
);

-- Tabela de visitas com respostas da pesquisa
CREATE TABLE IF NOT EXISTS visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  situacao_ocupacional TEXT,
  renda_mensal TEXT,
  utiliza_conhecimentos TEXT,
  outros_cursos TEXT,
  area_curso TEXT,
  ajudou_trabalho TEXT,
  melhorias JSONB DEFAULT '[]'::jsonb,
  transformacao TEXT,
  faixa_etaria TEXT,
  genero TEXT,
  tem_filhos TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indice para busca rapida de visitas por aluno
CREATE INDEX IF NOT EXISTS idx_visits_student_id ON visits(student_id);
CREATE INDEX IF NOT EXISTS idx_visits_user_id ON visits(user_id);

-- Unique constraint: um aluno so pode ter uma visita
CREATE UNIQUE INDEX IF NOT EXISTS idx_visits_student_unique ON visits(student_id);

-- Indice para busca de alunos concluidos
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);

-- RLS (Row Level Security)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Politicas: usuarios autenticados podem ler todos os alunos
CREATE POLICY "Authenticated users can read students"
  ON students FOR SELECT
  TO authenticated
  USING (true);

-- Politicas: usuarios autenticados podem ler e escrever visitas
CREATE POLICY "Authenticated users can read visits"
  ON visits FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert visits"
  ON visits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own visits"
  ON visits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own visits"
  ON visits FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
