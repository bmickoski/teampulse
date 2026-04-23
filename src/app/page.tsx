import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Zap, BarChart2 } from "lucide-react";

const features = [
  {
    title: "Teams",
    description: "Create organizations, invite teammates, and manage roles — all in one place.",
    icon: Users,
  },
  {
    title: "Pulses",
    description: "Track projects with tasks and time logs. Know what's moving and what's stuck.",
    icon: Zap,
  },
  {
    title: "Metrics",
    description: "Visualize team output over time. Spot trends before they become problems.",
    icon: BarChart2,
  },
];

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="px-6 py-4 border-b flex items-center justify-between">
        <span className="font-bold text-lg tracking-tight">TeamPulse</span>
        <div className="flex items-center gap-3">
          <a href="/sign-in">
            <Button variant="ghost" size="sm">Sign in</Button>
          </a>
          <a href="/sign-up">
            <Button size="sm">Get started</Button>
          </a>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-white to-white" />
          <div className="max-w-3xl mx-auto px-6 py-28 text-center">
            <Badge variant="secondary" className="mb-6">Now in beta</Badge>
            <h1 className="text-6xl font-extrabold tracking-tight text-gray-900 mb-5 leading-tight">
              Your team,{" "}
              <span className="text-indigo-600">in sync</span>
            </h1>
            <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto">
              TeamPulse gives your team a shared view of what matters — projects, progress, and people.
            </p>
            <div className="flex gap-3 justify-center">
              <a href="/sign-up">
                <Button size="lg" className="px-8">Get started for free</Button>
              </a>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-28">
          <p className="text-center text-sm font-medium text-gray-400 uppercase tracking-widest mb-10">
            Everything your team needs
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-gray-200 shadow-none hover:shadow-md transition-shadow">
                <CardHeader>
                  <feature.icon size={24} className="mb-2 text-indigo-600" />
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="px-6 py-5 border-t text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} TeamPulse — Built to ship
      </footer>
    </div>
  );
}
