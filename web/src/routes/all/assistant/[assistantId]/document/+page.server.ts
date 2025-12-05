import { prisma } from '$lib/prisma';
import type { PageServerLoad } from './$types';
import { retrieveCompanyWideAssistantWorkflow } from '$lib/features/companyWide/workflows/retrieveCompanyWideAssistant';
import { toFindCompanyWideAssistant } from '$lib/features/companyWide/repositories/companyWideAssistantQuery';

export const load = (async ({ params }) => {
  const event = await retrieveCompanyWideAssistantWorkflow(toFindCompanyWideAssistant(prisma), {
    assistantId: params.assistantId,
  });
  return {
    assistant: event.companyWiddeAssistant,
  };
}) satisfies PageServerLoad;
