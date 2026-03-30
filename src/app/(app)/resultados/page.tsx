"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { NavBar } from "@/components/nav-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  BarChart3,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Users,
} from "lucide-react";
import type { Visit } from "@/lib/types";

interface ChartBar {
  label: string;
  count: number;
  pct: number;
}

function countAnswers(visits: Visit[], field: keyof Visit): ChartBar[] {
  const counts = new Map<string, number>();
  for (const v of visits) {
    const val = v[field];
    if (val && typeof val === "string") {
      counts.set(val, (counts.get(val) || 0) + 1);
    }
  }
  const total = visits.length || 1;
  return Array.from(counts.entries())
    .map(([label, count]) => ({
      label,
      count,
      pct: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

function countMelhorias(visits: Visit[]): ChartBar[] {
  const counts = new Map<string, number>();
  for (const v of visits) {
    if (v.melhorias && Array.isArray(v.melhorias)) {
      for (const m of v.melhorias) {
        counts.set(m, (counts.get(m) || 0) + 1);
      }
    }
  }
  const total = visits.length || 1;
  return Array.from(counts.entries())
    .map(([label, count]) => ({
      label,
      count,
      pct: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

function HorizontalBars({ data, color }: { data: ChartBar[]; color: string }) {
  if (data.length === 0) {
    return (
      <p className="text-base text-muted-foreground italic">
        Nenhuma resposta ainda
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium leading-tight">
              {d.label}
            </span>
            <span className="text-sm font-bold ml-2 shrink-0">
              {d.count} ({d.pct}%)
            </span>
          </div>
          <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${color}`}
              style={{ width: `${Math.max(d.pct, 3)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function OpenAnswers({
  visits,
  field,
}: {
  visits: Visit[];
  field: keyof Visit;
}) {
  const answers = visits
    .map((v) => v[field])
    .filter((a): a is string => !!a && typeof a === "string");
  if (answers.length === 0) {
    return (
      <p className="text-base text-muted-foreground italic">
        Nenhuma resposta ainda
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {answers.map((a, i) => (
        <Badge key={i} variant="secondary" className="text-sm py-1 px-3">
          {a}
        </Badge>
      ))}
    </div>
  );
}

export default function ResultadosPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const [vRes, sRes] = await Promise.all([
        supabase.from("visits").select("*"),
        supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .ilike("status", "%CONCLU%"),
      ]);
      setVisits(vRes.data || []);
      setTotalStudents(sRes.count || 0);
      setLoading(false);
    }
    load();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal-700" />
      </div>
    );
  }

  const total = visits.length;
  const pctVisited =
    totalStudents > 0 ? Math.round((total / totalStudents) * 100) : 0;

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-teal-700 text-white px-5 py-5 shadow-md">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6" />
          <h1 className="text-xl font-bold">Resultados da Pesquisa</h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full space-y-5">
        {/* Resumo */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-teal-700">{total}</p>
                <p className="text-base text-muted-foreground">
                  visitas realizadas
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{pctVisited}%</p>
                <p className="text-base text-muted-foreground">
                  de {totalStudents} alunos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2.1 Situação Ocupacional */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-teal-700" />
              Situação Ocupacional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBars
              data={countAnswers(visits, "situacao_ocupacional")}
              color="bg-teal-600"
            />
          </CardContent>
        </Card>

        {/* 2.2 Renda Mensal */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-700" />
              Renda Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBars
              data={countAnswers(visits, "renda_mensal")}
              color="bg-emerald-500"
            />
          </CardContent>
        </Card>

        {/* 2.3 Utiliza Conhecimentos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-teal-700" />
              Utiliza Conhecimentos do Curso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBars
              data={countAnswers(visits, "utiliza_conhecimentos")}
              color="bg-sky-500"
            />
          </CardContent>
        </Card>

        {/* 3.1 Outros Cursos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-teal-700" />
              Fez Outros Cursos Depois?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBars
              data={countAnswers(visits, "outros_cursos")}
              color="bg-violet-500"
            />
          </CardContent>
        </Card>

        {/* 3.2 Área do Curso */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Áreas dos Outros Cursos</CardTitle>
          </CardHeader>
          <CardContent>
            <OpenAnswers visits={visits} field="area_curso" />
          </CardContent>
        </Card>

        <Separator className="my-2" />

        {/* 4.1 Ajudou no trabalho */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-teal-700" />
              O Curso Ajudou no Trabalho?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBars
              data={countAnswers(visits, "ajudou_trabalho")}
              color="bg-amber-500"
            />
          </CardContent>
        </Card>

        {/* 4.2 Melhorias */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-700" />
              Principais Melhorias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBars
              data={countMelhorias(visits)}
              color="bg-rose-500"
            />
          </CardContent>
        </Card>

        {/* 4.3 Transformação */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Maior Transformação</CardTitle>
          </CardHeader>
          <CardContent>
            <OpenAnswers visits={visits} field="transformacao" />
          </CardContent>
        </Card>

        <Separator className="my-2" />

        {/* 6.1 Faixa etária */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-700" />
              Faixa Etária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBars
              data={countAnswers(visits, "faixa_etaria")}
              color="bg-indigo-500"
            />
          </CardContent>
        </Card>

        {/* 6.2 Gênero */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-700" />
              Gênero
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBars
              data={countAnswers(visits, "genero")}
              color="bg-pink-500"
            />
          </CardContent>
        </Card>

        {/* 6.3 Filhos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tem Filhos?</CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBars
              data={countAnswers(visits, "tem_filhos")}
              color="bg-orange-500"
            />
          </CardContent>
        </Card>
      </main>

      <NavBar />
    </div>
  );
}
