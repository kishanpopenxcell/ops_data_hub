import { Settings } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";

export default function AdminPage() {
  return (
    <>
      <Topbar title="Admin" subtitle="Connection, users, and workspace settings" />
      <div className="flex flex-col items-center justify-center gap-3 px-8 py-24 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-raised text-text-faint">
          <Settings className="h-5 w-5" />
        </div>
        <p className="text-sm text-text-muted">
          Admin console — connection management and user roles — is planned for the next
          iteration of this demo.
        </p>
      </div>
    </>
  );
}
