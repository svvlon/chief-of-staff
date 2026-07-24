import { callAgent } from "@/app/lib/callAgent";

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    const step1 = await callAgent(process.env.CAPTURE_AGENT_NAME!, process.env.CAPTURE_AGENT_VERSION!, transcript);
    const step2 = await callAgent(process.env.DISCOVERY_AGENT_NAME!, process.env.DISCOVERY_AGENT_VERSION!, step1);

    // No real KB yet — hardcode empty existing workflows for now
    const step3Input = JSON.stringify({ workflow: step2, existingWorkflows: [] });
    const step3 = await callAgent(process.env.KM_AGENT_NAME!, process.env.KM_AGENT_VERSION!, step3Input);

    const step4 = await callAgent(process.env.REPORT_AGENT_NAME!, process.env.REPORT_AGENT_VERSION!, step3);

    return Response.json({ step1, step2, step3, report: step4 });
  } catch (err: any) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}