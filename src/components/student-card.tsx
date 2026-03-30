"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, GraduationCap, CheckCircle2, Clock } from "lucide-react";
import type { StudentWithVisit } from "@/lib/types";

export function StudentCard({ student }: { student: StudentWithVisit }) {
  const visited = !!student.visit;

  return (
    <Link href={`/alunos/${student.id}`}>
      <Card className="hover:shadow-md transition-shadow active:scale-[0.99]">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight truncate">
                {student.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {student.course} — Turma {student.batch}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{student.neighborhood || student.address}</span>
              </div>
              {student.phone && (
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span>{student.phone}</span>
                </div>
              )}
            </div>
            <div className="shrink-0">
              {visited ? (
                <Badge variant="default" className="bg-teal-700 text-white text-[10px] gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Visitado
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] gap-1">
                  <Clock className="h-3 w-3" />
                  Pendente
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
