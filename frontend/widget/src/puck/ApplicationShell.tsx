import { useState, ReactNode } from "react";
import { ShellHeader } from "./components/Header";
import { PagesDialog } from "./components/PagesDialog";

export interface ApplicationShellProps {
  title: string;
  slug: string;
  status: string | null;
  saving: boolean;
  pages: Array<{ slug: string; title?: string }>;
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onPublish: () => void;
  onOpenPages: () => void;
  onCopyLink: () => void;
  onLoadPage: (slug: string) => void;
  onCreateNewPage: () => void;
  children: ReactNode;
}

export function ApplicationShell({
  title,
  slug,
  status,
  saving,
  pages,
  onTitleChange,
  onSlugChange,
  onPublish,
  onOpenPages,
  onCopyLink,
  onLoadPage,
  onCreateNewPage,
  children,
}: ApplicationShellProps) {
  const [showPagesModal, setShowPagesModal] = useState(false);

  const handleOpenModal = () => {
    setShowPagesModal(true);
    onOpenPages();
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <ShellHeader
        title={title}
        slug={slug}
        status={status}
        saving={saving}
        onTitleChange={onTitleChange}
        onSlugChange={onSlugChange}
        onPublish={onPublish}
        onOpenPages={handleOpenModal}
        onCopyLink={onCopyLink}
      />

      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      <PagesDialog
        isOpen={showPagesModal}
        pages={pages}
        onClose={() => setShowPagesModal(false)}
        onLoad={(slug) => {
          onLoadPage(slug);
          setShowPagesModal(false);
        }}
        onCreateNew={() => {
          onCreateNewPage();
          setShowPagesModal(false);
        }}
      />
    </div>
  );
}
