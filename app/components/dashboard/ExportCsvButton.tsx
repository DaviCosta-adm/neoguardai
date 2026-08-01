"use client";

export default function ExportCsvButton({
  filename,
  content,
  label = "Exportar CSV",
}: {
  filename: string;
  content: string;
  label?: string;
}) {
  function handleExport() {
    const blob = new Blob(["\uFEFF" + content], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-200 transition hover:bg-cyan-400/15"
    >
      {label}
    </button>
  );
}
