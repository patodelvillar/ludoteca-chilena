"use client";

import { useState } from "react";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface RichTextEditorProps {
  name: string;
  initialContent?: string | null;
  placeholder?: string;
}

function normalizeContent(content?: string | null) {
  if (!content) return "";
  if (/<[a-z][\s\S]*>/i.test(content)) return content;
  return content
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph.trim())}</p>`)
    .join("");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function RichTextEditor({
  name,
  initialContent,
  placeholder = "Escribe el contenido...",
}: RichTextEditorProps) {
  const [html, setHtml] = useState(normalizeContent(initialContent));
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: normalizeContent(initialContent),
    editorProps: {
      attributes: {
        class:
          "min-h-56 rounded-b-md border-x border-b border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-sm leading-7 outline-none focus:border-[var(--color-brand-blue)]",
      },
    },
    onUpdate({ editor }) {
      setHtml(editor.isEmpty ? "" : editor.getHTML());
    },
  });

  return (
    <div>
      <input type="hidden" name={name} value={html} />
      <div className="flex flex-wrap gap-1 rounded-t-md border border-[var(--color-border)] bg-white p-2">
        <ToolbarButton active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}>
          B
        </ToolbarButton>
        <ToolbarButton active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          I
        </ToolbarButton>
        <ToolbarButton active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </ToolbarButton>
        <ToolbarButton active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </ToolbarButton>
        <ToolbarButton active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          Lista
        </ToolbarButton>
        <ToolbarButton active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          1.
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("link")}
          onClick={() => {
            const previousUrl = editor?.getAttributes("link").href || "";
            const url = window.prompt("URL", previousUrl);
            if (url === null) return;
            if (url === "") {
              editor?.chain().focus().unsetLink().run();
              return;
            }
            editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
        >
          Link
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded border px-2.5 py-1 text-xs font-bold transition ${
        active
          ? "border-[var(--color-brand-blue)] bg-[var(--color-brand-blue)] text-white"
          : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)]"
      }`}
    >
      {children}
    </button>
  );
}
