"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, Save, CheckCircle2 } from "lucide-react";
import type { Student } from "@/lib/types";

const MELHORIAS_OPTIONS = [
  "Mais confiança para buscar emprego",
  "Mais oportunidades de trabalho",
  "Melhoria na renda",
  "Conexão com pessoas e redes de apoio",
  "Outro",
];

export default function VisitaPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = Number(params.id);
  const supabase = createClient();

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [situacaoOcupacional, setSituacaoOcupacional] = useState("");
  const [rendaMensal, setRendaMensal] = useState("");
  const [utilizaConhecimentos, setUtilizaConhecimentos] = useState("");
  const [outrosCursos, setOutrosCursos] = useState("");
  const [areaCurso, setAreaCurso] = useState("");
  const [ajudouTrabalho, setAjudouTrabalho] = useState("");
  const [melhorias, setMelhorias] = useState<string[]>([]);
  const [transformacao, setTransformacao] = useState("");
  const [faixaEtaria, setFaixaEtaria] = useState("");
  const [genero, setGenero] = useState("");
  const [temFilhos, setTemFilhos] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .single();
      setStudent(data);
      setLoading(false);
    }
    if (studentId) load();
  }, [studentId, supabase]);

  function toggleMelhoria(option: string) {
    setMelhorias((prev) =>
      prev.includes(option)
        ? prev.filter((m) => m !== option)
        : [...prev, option]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Sessão expirada. Faça login novamente.");
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("visits").insert({
      student_id: studentId,
      user_id: user.id,
      situacao_ocupacional: situacaoOcupacional || null,
      renda_mensal: rendaMensal || null,
      utiliza_conhecimentos: utilizaConhecimentos || null,
      outros_cursos: outrosCursos || null,
      area_curso: areaCurso || null,
      ajudou_trabalho: ajudouTrabalho || null,
      melhorias: melhorias.length > 0 ? melhorias : null,
      transformacao: transformacao || null,
      faixa_etaria: faixaEtaria || null,
      genero: genero || null,
      tem_filhos: temFilhos || null,
      notes: notes || null,
    });

    if (error) {
      console.error(error);
      alert("Erro ao salvar visita. Tente novamente.");
      setSaving(false);
      return;
    }

    setSaved(true);
    setTimeout(() => {
      router.push(`/alunos/${studentId}`);
      router.refresh();
    }, 1500);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
      </div>
    );
  }

  if (saved) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4">
        <CheckCircle2 className="h-16 w-16 text-teal-700" />
        <h2 className="text-xl font-bold">Visita Registrada!</h2>
        <p className="text-sm text-muted-foreground text-center">
          A pesquisa de {student?.name} foi salva com sucesso.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 bg-teal-700 text-white px-4 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 -ml-1">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold truncate">Pesquisa de Visita</h1>
            <p className="text-xs text-teal-100 truncate">{student?.name}</p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 px-4 py-4 max-w-lg mx-auto w-full space-y-4 pb-8">
        {/* Seção 2 — Situação Atual */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-teal-700">
              2. Situação Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <RadioQuestion
              label="2.1 Hoje, qual é a sua situação ocupacional?"
              value={situacaoOcupacional}
              onChange={setSituacaoOcupacional}
              options={[
                "Empregado CLT",
                "Autônomo",
                "Empresário / MEI",
                "Desempregado",
                "Outro",
              ]}
            />
            <Separator />
            <RadioQuestion
              label="2.2 Hoje, qual é a sua renda mensal?"
              value={rendaMensal}
              onChange={setRendaMensal}
              options={[
                "Até 1 salário mínimo",
                "1 a 2 salários mínimos",
                "2 a 3 salários mínimos",
                "Mais de 3 salários mínimos",
              ]}
            />
            <Separator />
            <RadioQuestion
              label="2.3 Você utiliza os conhecimentos do curso no trabalho atual?"
              value={utilizaConhecimentos}
              onChange={setUtilizaConhecimentos}
              options={["Sim, diariamente", "Sim, às vezes", "Não utilizo"]}
            />
          </CardContent>
        </Card>

        {/* Seção 3 — Continuidade de Estudos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-teal-700">
              3. Continuidade de Estudos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <RadioQuestion
              label="3.1 Você fez outros cursos depois do MetaLAB?"
              value={outrosCursos}
              onChange={setOutrosCursos}
              options={[
                "Sim, na Programando o Futuro",
                "Sim, em outra instituição",
                "Não",
              ]}
            />
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                3.2 Se sim, qual área?
              </Label>
              <Input
                placeholder="Ex: Design gráfico, Marketing digital..."
                value={areaCurso}
                onChange={(e) => setAreaCurso(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Seção 4 — Impacto */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-teal-700">
              4. Impacto Pessoal e Profissional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <RadioQuestion
              label="4.1 O curso ajudou a conseguir trabalho ou empreender?"
              value={ajudouTrabalho}
              onChange={setAjudouTrabalho}
              options={["Sim", "Parcialmente", "Não"]}
            />
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                4.2 Quais foram as principais melhorias trazidas pelo curso?
              </Label>
              <p className="text-xs text-muted-foreground">
                Selecione uma ou mais opções
              </p>
              <div className="space-y-2">
                {MELHORIAS_OPTIONS.map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={melhorias.includes(opt)}
                      onChange={() => toggleMelhoria(opt)}
                      className="h-4 w-4 rounded border-input text-teal-700 focus:ring-teal-700"
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                4.3 Em uma frase, qual foi a maior transformação que você teve
                após o curso?
              </Label>
              <Input
                placeholder="Ex: Mais autoconfiança, Mudança profissional..."
                value={transformacao}
                onChange={(e) => setTransformacao(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Seção 6 — Perfil Socioeconômico */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-teal-700">
              6. Perfil Socioeconômico (opcional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <RadioQuestion
              label="6.1 Faixa etária"
              value={faixaEtaria}
              onChange={setFaixaEtaria}
              options={[
                "Até 18 anos",
                "19–24 anos",
                "25–30 anos",
                "31+ anos",
              ]}
            />
            <Separator />
            <RadioQuestion
              label="6.2 Gênero"
              value={genero}
              onChange={setGenero}
              options={["Homem", "Mulher", "Prefere não responder", "Outro"]}
            />
            <Separator />
            <RadioQuestion
              label="6.3 Você tem filhos?"
              value={temFilhos}
              onChange={setTemFilhos}
              options={["Sim", "Não"]}
            />
          </CardContent>
        </Card>

        {/* Observações */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-teal-700">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Anotações livres sobre a visita..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full bg-teal-700 hover:bg-teal-800"
          size="lg"
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Salvar Visita
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

function RadioQuestion({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      <RadioGroup value={value} onValueChange={onChange} className="space-y-2">
        {options.map((opt) => (
          <label
            key={opt}
            className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <RadioGroupItem value={opt} />
            <span className="text-sm">{opt}</span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}
