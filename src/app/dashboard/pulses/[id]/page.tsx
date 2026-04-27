import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCurrentUserWithOrg } from "@/lib/organizations";
import { pulsesTable, usersTable } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { CalendarDays, User } from "lucide-react";
import Link from "next/link";

const statusColor = {
  active: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  archived: "bg-gray-100 text-gray-600",
} as const;

export default async function PulseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ctx = await getCurrentUserWithOrg();
  if (!ctx) notFound();

  const result = await db
    .select({
      id: pulsesTable.id,
      title: pulsesTable.title,
      description: pulsesTable.description,
      status: pulsesTable.status,
      createdAt: pulsesTable.createdAt,
      creatorName: usersTable.name,
      organizationId: pulsesTable.organizationId,
    })
    .from(pulsesTable)
    .leftJoin(usersTable, eq(pulsesTable.createdById, usersTable.id))
    .where(eq(pulsesTable.id, id))
    .then((r) => r[0]);

  if (!result || result.organizationId !== ctx?.orgId) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/pulses" className="text-sm text-gray-400 hover:text-gray-600">
          Pulses
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-600">{result.title}</span>
      </div>

      <Card className="shadow-none border-gray-200">
        <CardHeader className="space-y-3">
          <Badge className={statusColor[result.status as keyof typeof statusColor]}>
            {result.status}
          </Badge>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {result.title}
          </CardTitle>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <User size={12} />
              {result.creatorName ?? "Unknown"}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays size={12} />
              {new Date(result.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </CardHeader>

        {result.description && (
          <>
            <Separator />
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 leading-relaxed">
                {result.description}
              </p>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
