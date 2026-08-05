"use client";

export default function ExportPdfButton({
  href,
  label = "Exportar PDF",
}: {
  href: string;
  label?: string;
}) {
  return (
    <a
      href={href}
      className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-200 transition hover:bg-cyan-400/15"
    >
      {label}
    </a>
  );
}
