import { InteractiveBrowserCredential } from "@azure/identity";
import { AIProjectClient } from "@azure/ai-projects";

const endpoint = process.env.FOUNDRY_PROJECT_ENDPOINT!;
const MYTENANTID = '21834893-a042-48fe-93a2-1f77076d8e99'
const credential = new InteractiveBrowserCredential({ tenantId: MYTENANTID });
const projectClient = new AIProjectClient(endpoint, credential);

export async function callAgent(agentName: string, agentVersion: string, input: string) {
  const openAIClient = projectClient.getOpenAIClient();

  const conversation = await openAIClient.conversations.create({
    items: [{ type: "message", role: "user", content: input }],
  });

  const response = await openAIClient.responses.create(
    { conversation: conversation.id },
    { body: { agent_reference: { name: agentName, version: agentVersion, type: "agent_reference" } } }
  );

  return response.output_text;
}