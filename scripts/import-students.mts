/**
 * Script para importar dados dos alunos da planilha Google Sheets para o Supabase.
 *
 * Uso:
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... npx tsx scripts/import-students.mts
 *
 * A SUPABASE_SERVICE_KEY é a chave "service_role" (não a anon key),
 * necessária para bypass de RLS durante a importação.
 */

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1WCYh_TfVgKcACxHmLPXEU9db6O6buHn3NqIo-3WBlxc/export?format=csv";

interface RawRow {
  [key: string]: string;
}

function parseCSV(text: string): RawRow[] {
  const lines = text.split("\n");
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: RawRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row: RawRow = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] || "").trim();
    });
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

function normalizeStatus(status: string): string {
  const s = status.toUpperCase().trim();
  if (s.includes("CONCLU")) return "CONCLUÍDO";
  if (s.includes("DESIST")) return "DESISTENTE";
  return s;
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Defina SUPABASE_URL e SUPABASE_SERVICE_KEY como variáveis de ambiente.");
    process.exit(1);
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Baixando planilha do Google Sheets...");
  const response = await fetch(SHEET_CSV_URL);
  if (!response.ok) {
    console.error(`Erro ao baixar planilha: ${response.status} ${response.statusText}`);
    process.exit(1);
  }

  const csvText = await response.text();
  const rows = parseCSV(csvText);
  console.log(`Total de linhas na planilha: ${rows.length}`);

  const students = rows
    .filter((r) => r["NOME"] && r["NOME"].trim().length > 0)
    .map((r) => ({
      batch: parseInt(r[""] || "1", 10) || 1,
      start_date: r["DATA INICIO"] || null,
      end_date: r["DATA FINAL"] || null,
      course: r["CURSO"] || "",
      shift: r["TURNO"] || "",
      location: r["LOCAL"] || "AGUAS EMENDADAS",
      educator: r["EDUCADOR"] || "",
      name: r["NOME"] || "",
      gender: r["SEXO"] || "",
      cpf: r["CPF"] || "",
      birth_date: r["DATA DE NASCIMENTO"] || "",
      guardian: r["RESPONSAVEL"] || "",
      address: r["ENDERECO"] || "",
      neighborhood: r["BAIRRO"] || "",
      phone: r["TELEFONE"] || "",
      city: r["CIDADE"] || "",
      state: r["UF"] || "",
      race: r["COMO VOCÊ SE AUTODECLARA SEGUNDO O CENSO DO IBGE?"] || "",
      family_income: r["QUAL A SUA RENDA MENSAL FAMILIAR?"] || "",
      family_members: r["QUANTAS PESSOAS VIVEM DA RENDA FAMILIAR?"] || "",
      residence_type: r["A RESIDÊNCIA EM QUE MORA É:"] || "",
      status: normalizeStatus(r["STATUS"] || ""),
    }));

  const concluidos = students.filter((s) => s.status === "CONCLUÍDO");
  console.log(`Alunos concluídos: ${concluidos.length}`);
  console.log(`Total de alunos (todos status): ${students.length}`);

  // Deduplica por CPF (mantém o mais recente / última batch)
  const seen = new Map<string, (typeof students)[0]>();
  for (const s of students) {
    const key = s.cpf || s.name;
    const existing = seen.get(key);
    if (!existing || s.batch > existing.batch) {
      seen.set(key, s);
    }
  }
  const deduped = Array.from(seen.values());
  console.log(`Após deduplicação por CPF: ${deduped.length}`);

  // Limpa tabela existente e insere novos dados
  console.log("Limpando tabela students...");
  const { error: delError } = await supabase.from("students").delete().gte("id", 0);
  if (delError) {
    console.error("Erro ao limpar tabela:", delError.message);
  }

  console.log("Inserindo alunos...");
  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < deduped.length; i += batchSize) {
    const chunk = deduped.slice(i, i + batchSize);
    const { error } = await supabase.from("students").insert(chunk);
    if (error) {
      console.error(`Erro ao inserir batch ${i}:`, error.message);
    } else {
      inserted += chunk.length;
    }
  }

  console.log(`Importação concluída: ${inserted} alunos inseridos.`);
}

main().catch(console.error);
