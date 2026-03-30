"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { NavBar } from "@/components/nav-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle2, Clock, ArrowRight, Loader2 } from "lucide-react";

interface Stats {
  total: number;
  visited: number;
  pending: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadStats() {
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
    }
    loadStats();
  }, [supabase]);

  const pct = stats && stats.total > 0
    ? Math.round((stats.visited / stats.total) * 100)
    : 0;

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <header className="sticky top-0 z-40 bg-teal-700 text-white px-4 py-5 shadow-md">
        <h1 className="text-lg font-bold">MetaLAB Visitas</h1>
        <p className="text-teal-100 text-sm">Águas Emendadas</p>
      </header>

      <main className="flex-1 px-4 py-5 space-y-4 max-w-lg mx-auto w-full">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
          </div>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Progresso das Visitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-3xl font-bold text-teal-700">{pct}%</span>
                  <span className="text-sm text-muted-foreground mb-1">
                    concluído
                  </span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-700 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats?.visited} de {stats?.total} alunos visitados
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <Users className="h-5 w-5 mx-auto text-muted-foreground" />
                  <p className="text-2xl font-bold mt-1">{stats?.total}</p>
                  <p className="text-[10px] text-muted-foreground">Total</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <CheckCircle2 className="h-5 w-5 mx-auto text-teal-700" />
                  <p className="text-2xl font-bold mt-1 text-teal-700">
                    {stats?.visited}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Visitados</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <Clock className="h-5 w-5 mx-auto text-orange-500" />
                  <p className="text-2xl font-bold mt-1 text-orange-500">
                    {stats?.pending}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Pendentes</p>
                </CardContent>
              </Card>
            </div>

            <Link href="/alunos?tab=pendentes">
              <Button className="w-full bg-teal-700 hover:bg-teal-800 mt-2" size="lg">
                Ver Pendentes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/alunos?tab=visitados">
              <Button variant="outline" className="w-full" size="lg">
                Ver Visitados
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </>
        )}
      </main>

      <NavBar />
    </div>
  );
}
