import { Gauge } from "lucide-react";
import { WorkspaceStub } from "@/components/dashboard/workspace-stub";

export default function ProductivityWorkspace() {
  return (
    <WorkspaceStub
      title="Productivity"
      subtitle="Rep activity, workload balance, and coverage"
      icon={<Gauge className="h-6 w-6" />}
    />
  );
}
