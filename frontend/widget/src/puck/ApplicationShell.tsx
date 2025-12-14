import { useState, ReactNode } from "react";
import { ShellHeader } from "./components/Header";
import { PagesDialog } from "./components/PagesDialog";

export interface ApplicationShellProps {
  title: string;
  slug: string;
  status: string | null;
  saving: boolean;
  pages: Array<{ id: string; title: string; slug?: string }>;
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onPublish: () => void;
  onCopyLink: () => void;
  onLoadPage: (id: string) => void;
  onCreateNewPage: () => void;
  onOpenPagesModal: () => void;
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
  onCopyLink,
  onLoadPage,
  onCreateNewPage,
  onOpenPagesModal,
  children,
}: ApplicationShellProps) {
  const [showPagesModal, setShowPagesModal] = useState(false);

  const handleOpenModal = () => {
    setShowPagesModal(true);
    onOpenPagesModal();
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
        onCopyLink={onCopyLink}
      />

      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      <PagesDialog
        isOpen={showPagesModal}
        pages={pages}
        onClose={() => setShowPagesModal(false)}
        onLoad={(id) => {
          onLoadPage(id);
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
