import { Document, Paragraph, Table, TableRow, TableCell, HeadingLevel, Packer, TextRun } from "docx";

// Basic Markdown table parser tailored to your report's pipe-table format
function parseMarkdownTable(lines: string[]): string[][] {
  return lines
    .filter((l) => l.trim().startsWith("|") && !l.includes("---"))
    .map((l) => l.split("|").map((c) => c.trim()).filter((c) => c.length > 0));
}

export async function generateDocxFromReport(markdown: string): Promise<Buffer> {
  const lines = markdown.split("\n");
  const children: (Paragraph | Table)[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("| ")) {
      // Collect the whole table block
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = parseMarkdownTable(tableLines);
      if (rows.length > 0) {
        children.push(
          new Table({
            rows: rows.map(
              (row, rowIndex) =>
                new TableRow({
                  children: row.map(
                    (cell) =>
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: cell, bold: rowIndex === 0 })] })],
                      })
                  ),
                })
            ),
          })
        );
        children.push(new Paragraph({ text: "" })); // spacing after table
      }
      continue;
    }

    if (line.startsWith("```")) {
      // Skip code fences (appendix JSON) — include as plain text instead
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      children.push(
        new Paragraph({
          children: [new TextRun({ text: codeLines.join("\n"), font: "Courier New", size: 18 })],
        })
      );
      continue;
    }

    if (line.startsWith("# ")) {
      children.push(new Paragraph({ text: line.replace("# ", ""), heading: HeadingLevel.HEADING_1 }));
    } else if (line.startsWith("## ")) {
      children.push(new Paragraph({ text: line.replace("## ", ""), heading: HeadingLevel.HEADING_2 }));
    } else if (line.trim().length > 0) {
      children.push(new Paragraph({ text: line }));
    } else {
      children.push(new Paragraph({ text: "" }));
    }
    i++;
  }

  const doc = new Document({ sections: [{ children }] });
  return await Packer.toBuffer(doc);
}