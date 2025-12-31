import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function WelcomeView() {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">IDSE Developer Agency</CardTitle>
          <CardDescription className="text-lg">
            Welcome to your unified admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-slate-600">
              Get started by selecting a workspace from the left menu:
            </p>
            <div className="space-y-3">
              <div className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <h3 className="font-semibold text-slate-900">Puck Editor</h3>
                <p className="text-sm text-slate-600">
                  Build and manage visual pages with drag-and-drop components
                </p>
              </div>
              <div className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <h3 className="font-semibold text-slate-900">MD Editor</h3>
                <p className="text-sm text-slate-600">
                  Edit IDSE pipeline documents (intents, specs, plans, tasks)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
