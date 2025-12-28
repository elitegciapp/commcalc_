export type CsvRow = Record<string, string | number | boolean | null | undefined>;

function escapeCsvCell(value: string): string {
  if (/[\n\r\t",]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsv(rows: CsvRow[], headers?: string[]): string {
  const headerList = headers ?? Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const lines: string[] = [];

  lines.push(headerList.map(escapeCsvCell).join(","));
  for (const row of rows) {
    const line = headerList
      .map((h) => {
        const cell = row[h];
        if (cell === null || cell === undefined) return "";
        return escapeCsvCell(String(cell));
      })
      .join(",");
    lines.push(line);
  }

  return lines.join("\n") + "\n";
}

export function downloadTextFile(filename: string, contents: string, mimeType = "text/plain;charset=utf-8"): void {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

export function downloadCsv(filename: string, rows: CsvRow[], headers?: string[]): void {
  downloadTextFile(filename, toCsv(rows, headers), "text/csv;charset=utf-8");
}
