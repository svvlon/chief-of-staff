import { callAgent } from "@/app/lib/callAgent";
import { supabase } from "@/app/lib/supabase";

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    const step1 = await callAgent(process.env.CAPTURE_AGENT_NAME!, process.env.CAPTURE_AGENT_VERSION!, transcript);
    const step2 = await callAgent(process.env.DISCOVERY_AGENT_NAME!, process.env.DISCOVERY_AGENT_VERSION!, step1);

    // Fetch existing workflows from Supabase for the KM agent to compare against
    const { data: existingWorkflows, error: fetchError } = await supabase
      .from("workflows")
      .select("workflow_name, workflow_json");

    if (fetchError) {
      console.error("Supabase fetch error:", fetchError);
    }

    // No real KB yet — hardcode empty existing workflows for now
    const step3Input = JSON.stringify({ workflow: step2, existingWorkflows: [] });
    const step3 = await callAgent(process.env.KM_AGENT_NAME!, process.env.KM_AGENT_VERSION!, step3Input);
    console.log("=== KM AGENT RAW OUTPUT ===");
    console.log(step3);
    console.log("=== EXISTING WORKFLOWS SENT ===");
    console.log(JSON.stringify(existingWorkflows, null, 2));
    const step4 = await callAgent(process.env.REPORT_AGENT_NAME!, process.env.REPORT_AGENT_VERSION!, step3);

    // Parse step2 to get workflow name for storage (best-effort, won't break if parsing fails)
    let workflowName = "Untitled Workflow";
    try {
      const parsedStep2 = JSON.parse(step2);
      workflowName = parsedStep2.workflow_name || parsedStep2.workflowName || workflowName;
    } catch {
      // step2 might not be pure JSON (e.g. wrapped in markdown) — non-fatal, just use default name
    }

    // Save the new workflow
    // const { data: savedWorkflow, error: insertError } = await supabase
    //   .from("workflows")
    //   .insert({ workflow_name: workflowName, workflow_json: JSON.parse(step2 || "{}") })
    //   .select()
    //   .single();

    // if (insertError) {
    //   console.error("Supabase insert (workflow) error:", insertError);
    // }

    // // Save the report, linked to the workflow if we got an id back
    // const { error: reportError } = await supabase
    //   .from("reports")
    //   .insert({
    //     workflow_id: savedWorkflow?.id || null,
    //     report_markdown: step4,
    //   });

    // --------------------

    // let kmResult;
    // try {
    //   kmResult = JSON.parse(step3);
    // } catch {
    //   console.warn("step3 was not valid JSON, treating as new workflow");
    //   kmResult = { workflow_exists: false };
    // }

    // let savedWorkflow = null;

    // if (!kmResult.workflow_exists) {
    //   // Genuinely new — insert it
    //   let workflowJson = {};
    //   try {
    //     workflowJson = JSON.parse(step2);
    //   } catch {
    //     workflowJson = { raw: step2 };
    //   }

    //   const { data, error: insertError } = await supabase
    //     .from("workflows")
    //     .insert({ workflow_name: workflowName, workflow_json: workflowJson })
    //     .select()
    //     .single();

    //   if (insertError) console.error("Supabase insert (workflow) error:", insertError);
    //   savedWorkflow = data;
    // }
    let kmResult;
    try {
      kmResult = JSON.parse(step3);
    } catch {
      kmResult = { workflow_exists: false };
    }

    const { data: nameMatch } = await supabase
      .from("workflows")
      .select("id")
      .eq("workflow_name", workflowName)
      .maybeSingle();
    console.log("workflowName:", workflowName, "| nameMatch:", nameMatch, "| kmResult.workflow_exists:", kmResult.workflow_exists);
    const isDuplicate = kmResult.workflow_exists || !!nameMatch;
    
    let savedWorkflow = nameMatch;

    if (!isDuplicate) {
      let workflowJson = {};
      try {
        workflowJson = JSON.parse(step2);
      } catch {
        workflowJson = { raw: step2 };
      }

      const { data, error: insertError } = await supabase
        .from("workflows")
        .insert({ workflow_name: workflowName, workflow_json: workflowJson })
        .select()
        .single();

      if (insertError) console.error("Insert error:", insertError);
      savedWorkflow = data;
    }
     else {
      console.log(`Duplicate detected — matched existing workflow: ${kmResult.matched_workflow}`);
      // Optionally: look up the existing workflow's id here if you want to link the report to it
    }

    // Report gets saved regardless — always worth keeping a record of every run
    const { error: reportError } = await supabase
      .from("reports")
      .insert({
        workflow_id: savedWorkflow?.id || null,
        report_markdown: step4,
      });

    if (reportError) {
      console.error("Supabase insert (report) error:", reportError);
    }
    
    return Response.json({ step1, step2, step3, report: step4 });
  } catch (err: any) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}