import { Wallet } from "lucide-react";
import { WorkspaceStub } from "@/components/dashboard/workspace-stub";

export default function FinanceWorkspace() {
  return (
    <WorkspaceStub
      title="Finance"
      subtitle="Revenue recognition, billing health, and margin"
      icon={<Wallet className="h-6 w-6" />}
    />
  );
}
