import { generateDocxFromReport } from "@/app/lib/generateDocx";

export async function POST(req: Request) {
  const { report } = await req.json();
  const buffer = await generateDocxFromReport(report);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="optimization-report-${Date.now()}.docx"`,
    },
  });
}