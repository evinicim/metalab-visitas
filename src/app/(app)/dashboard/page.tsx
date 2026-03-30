"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useAutoRefresh } from "@/lib/use-refresh";
import { NavBar } from "@/components/nav-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle2, Clock, ArrowRight, Loader2, BarChart3 } from "lucide-react";

interface Stats {
  total: number;
  visited: number;
  pending: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadStats = useCallback(async () => {
    const { count: total } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .ilike("status", "%CONCLU%");

    const { count: visited } = await supabase
      .from("visits")
      .select("*", { count: "exact", head: true });

    setStats({
      total: total || 0,
      visited: visited || 0,
      pending: (total || 0) - (visited || 0),
    });
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useAutoRefresh(loadStats);

  const pct = stats && stats.total > 0
    ? Math.round((stats.visited / stats.total) * 100)
    : 0;

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-teal-700 text-white px-5 py-6 shadow-md">
        <h1 className="text-2xl font-bold">MetaLAB Visitas</h1>
        <p className="text-teal-100 text-base mt-0.5">Águas Emendadas</p>
      </header>

      <main className="flex-1 px-5 py-5 space-y-5 max-w-lg mx-auto w-full">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-teal-700" />
          </div>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Progresso das Visitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3 mb-3">
                  <span className="text-4xl font-bold text-teal-700">{pct}%</span>
                  <span className="text-base text-muted-foreground mb-1">
                    concluído
                  </span>
                </div>
                <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-700 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {stats?.visited} de {stats?.total} alunos visitados
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-7 w-7 mx-auto text-muted-foreground" />
                  <p className="text-3xl font-bold mt-1">{stats?.total}</p>
                  <p className="text-xs text-muted-foreground font-medium">Total</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle2 className="h-7 w-7 mx-auto text-teal-700" />
                  <p className="text-3xl font-bold mt-1 text-teal-700">
                    {stats?.visited}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">Visitados</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-7 w-7 mx-auto text-orange-500" />
                  <p className="text-3xl font-bold mt-1 text-orange-500">
                    {stats?.pending}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">Pendentes</p>
                </CardContent>
              </Card>
            </div>

            <Link href="/alunos?tab=pendentes">
              <Button className="w-full bg-teal-700 hover:bg-teal-800 mt-2 text-base h-14" size="lg">
                Ver Pendentes
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/alunos?tab=visitados">
              <Button variant="outline" className="w-full text-base h-14" size="lg">
                Ver Visitados
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/resultados">
              <Button variant="outline" className="w-full text-base h-14 border-teal-700 text-teal-700 hover:bg-teal-50" size="lg">
                <BarChart3 className="mr-2 h-5 w-5" />
                Ver Resultados
              </Button>
            </Link>
          </>
        )}
      </main>

      <NavBar />
    </div>
  );
}
