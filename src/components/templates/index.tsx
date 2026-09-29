import { InlineCode, Lead, PageTitle } from "@/components/ui/typography";

import { getTemplateById } from "./registry";

export function TemplatePage({ id }: { id: string }) {
  const template = getTemplateById(id);
  if (!template) return null;

  const Template = template.component;

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">
        <header className="space-y-2">
          <PageTitle>{template.title}</PageTitle>
          <Lead>{template.description}</Lead>
          <p className="text-muted-foreground text-sm">
            Source: <InlineCode>{template.source}</InlineCode>
          </p>
        </header>
        <Template />
      </div>
    </main>
  );
}
