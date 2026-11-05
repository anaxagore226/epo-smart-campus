import { ChatWindow } from "@/components/assistant/chat-window";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { PageHeader } from "@/components/layout/page-header";

export default function AssistantPage() {
  return (
    <div className="mx-auto flex max-w-[1500px] flex-col p-5 sm:p-8">
      <PageHeader
        eyebrow="Intelligence campus"
        title="Assistant IA"
        description="Interrogez les données du campus en langage naturel."
      >
        <StatusBadge label="Connecté aux données en direct" />
      </PageHeader>
      <ChatWindow />
    </div>
  );
}
