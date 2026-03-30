"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useAutoRefresh } from "@/lib/use-refresh";
import { NavBar } from "@/components/nav-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  GraduationCap,
  MapPin,
  Phone,
  User,
  Calendar,
  Home,
  Loader2,
  ClipboardList,
} from "lucide-react";
import type { Student, Visit } from "@/lib/types";

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-base">{value}</p>
      </div>
    </div>
  );
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [student, setStudent] = useState<Student | null>(null);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const load = useCallback(async () => {
    const [sRes, vRes] = await Promise.all([
      supabase.from("students").select("*").eq("id", id).single(),
      supabase.from("visits").select("*").eq("student_id", id).maybeSingle(),
    ]);
    setStudent(sRes.data);
    setVisit(vRes.data);
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => { if (id) load(); }, [id, load]);
  useAutoRefresh(load);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p>Aluno não encontrado.</p>
        <Button variant="outline" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-teal-700 text-white px-5 py-5 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{student.name}</h1>
            <p className="text-sm text-teal-100 truncate">
              {student.course} — Turma {student.batch}
            </p>
          </div>
          {visit ? (
            <Badge className="bg-white/20 text-white border-0 text-[10px] gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Visitado
            </Badge>
          ) : (
            <Badge className="bg-orange-500/80 text-white border-0 text-[10px] gap-1">
              <Clock className="h-3 w-3" />
              Pendente
            </Badge>
          )}
        </div>
      </header>

      <main className="flex-1 px-5 py-5 max-w-lg mx-auto w-full space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Dados do Aluno</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0 divide-y">
            <InfoRow icon={User} label="Nome" value={student.name} />
            <InfoRow icon={GraduationCap} label="Curso" value={student.course} />
            <InfoRow icon={Calendar} label="Turno" value={student.shift} />
            <InfoRow
              icon={Calendar}
              label="Período"
              value={`${student.start_date} a ${student.end_date}`}
            />
            <InfoRow icon={User} label="Responsável" value={student.guardian} />
            <InfoRow icon={MapPin} label="Endereço" value={student.address} />
            <InfoRow icon={Home} label="Bairro" value={student.neighborhood} />
            <InfoRow icon={MapPin} label="Cidade" value={`${student.city} - ${student.state}`} />
            <InfoRow icon={Phone} label="Telefone" value={student.phone} />
          </CardContent>
        </Card>

        {visit ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-teal-700" />
                Respostas da Visita
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Realizada em{" "}
                {new Date(visit.visited_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <AnswerItem label="Situação ocupacional" value={visit.situacao_ocupacional} />
              <AnswerItem label="Renda mensal" value={visit.renda_mensal} />
              <AnswerItem label="Utiliza conhecimentos" value={visit.utiliza_conhecimentos} />
              <AnswerItem label="Outros cursos" value={visit.outros_cursos} />
              <AnswerItem label="Área do curso" value={visit.area_curso} />
              <AnswerItem label="Curso ajudou no trabalho" value={visit.ajudou_trabalho} />
              {visit.melhorias && visit.melhorias.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Melhorias</p>
                  <div className="flex flex-wrap gap-1">
                    {visit.melhorias.map((m, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {m}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <AnswerItem label="Maior transformação" value={visit.transformacao} />
              <Separator />
              <AnswerItem label="Faixa etária" value={visit.faixa_etaria} />
              <AnswerItem label="Gênero" value={visit.genero} />
              <AnswerItem label="Tem filhos" value={visit.tem_filhos} />
              {visit.notes && <AnswerItem label="Observações" value={visit.notes} />}
            </CardContent>
          </Card>
        ) : (
          <Link href={`/alunos/${student.id}/visita`}>
            <Button className="w-full bg-teal-700 hover:bg-teal-800 text-base h-14" size="lg">
              <ClipboardList className="mr-2 h-6 w-6" />
              Iniciar Visita
            </Button>
          </Link>
        )}

        {student.phone && (
          <a
            href={`https://wa.me/55${student.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="w-full text-base h-14" size="lg">
              <Phone className="mr-2 h-5 w-5" />
              Abrir WhatsApp
            </Button>
          </a>
        )}
      </main>

      <NavBar />
    </div>
  );
}

function AnswerItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="text-base">{value}</p>
    </div>
  );
}
