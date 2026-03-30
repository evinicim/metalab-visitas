"use client";

import { Suspense, useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useAutoRefresh } from "@/lib/use-refresh";
import { NavBar } from "@/components/nav-bar";
import { StudentCard } from "@/components/student-card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search } from "lucide-react";
import type { Student, Visit, StudentWithVisit } from "@/lib/types";

export default function AlunosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
        </div>
      }
    >
      <AlunosContent />
    </Suspense>
  );
}

function AlunosContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "pendentes";

  const [students, setStudents] = useState<Student[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  const load = useCallback(async () => {
    const [studentsRes, visitsRes] = await Promise.all([
      supabase
        .from("students")
        .select("*")
        .ilike("status", "%CONCLU%")
        .order("name"),
      supabase.from("visits").select("*"),
    ]);
    setStudents(studentsRes.data || []);
    setVisits(visitsRes.data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);
  useAutoRefresh(load);

  const visitMap = useMemo(() => {
    const map = new Map<number, Visit>();
    visits.forEach((v) => map.set(v.student_id, v));
    return map;
  }, [visits]);

  const studentsWithVisits: StudentWithVisit[] = useMemo(
    () =>
      students.map((s) => ({
        ...s,
        visit: visitMap.get(s.id) || null,
      })),
    [students, visitMap]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return studentsWithVisits;
    return studentsWithVisits.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.neighborhood?.toLowerCase().includes(q) ||
        s.course?.toLowerCase().includes(q)
    );
  }, [studentsWithVisits, search]);

  const pendentes = filtered.filter((s) => !s.visit);
  const visitados = filtered.filter((s) => !!s.visit);

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-teal-700 text-white px-5 py-5 shadow-md">
        <h1 className="text-xl font-bold">Alunos Concluídos</h1>
      </header>

      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, bairro ou curso..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-teal-700" />
          </div>
        ) : (
          <Tabs defaultValue={initialTab}>
            <TabsList className="w-full h-12">
              <TabsTrigger value="pendentes" className="flex-1 text-sm font-semibold">
                Pendentes ({pendentes.length})
              </TabsTrigger>
              <TabsTrigger value="visitados" className="flex-1 text-sm font-semibold">
                Visitados ({visitados.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pendentes" className="space-y-3 mt-3">
              {pendentes.length === 0 ? (
                <p className="text-center text-base text-muted-foreground py-10">
                  {search
                    ? "Nenhum aluno pendente encontrado."
                    : "Todos os alunos foram visitados!"}
                </p>
              ) : (
                pendentes.map((s) => <StudentCard key={s.id} student={s} />)
              )}
            </TabsContent>

            <TabsContent value="visitados" className="space-y-3 mt-3">
              {visitados.length === 0 ? (
                <p className="text-center text-base text-muted-foreground py-10">
                  {search
                    ? "Nenhum aluno visitado encontrado."
                    : "Nenhuma visita realizada ainda."}
                </p>
              ) : (
                visitados.map((s) => <StudentCard key={s.id} student={s} />)
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      <NavBar />
    </div>
  );
}
