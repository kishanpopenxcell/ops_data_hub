import { Settings2 } from "lucide-react";
import { WorkspaceStub } from "@/components/dashboard/workspace-stub";

export default function OperationsWorkspace() {
  return (
    <WorkspaceStub
      title="Operations"
      subtitle="Cross-functional operational health and capacity"
      icon={<Settings2 className="h-6 w-6" />}
    />
  );
}
