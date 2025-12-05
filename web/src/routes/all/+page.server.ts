import { prisma } from '$lib/prisma';
import type { PageServerLoad } from './$types';
import { retrieveCompanyWideAssistantsWorkflow } from '$lib/features/companyWide/workflows/retrieveCompanyWideAssistants';
import { toFindCompanyWideAssistants } from '$lib/features/companyWide/repositories/companyWideAssistantQuery';
import { retrieveCompanyWideThreadListWorkflow } from '$lib/features/companyWide/workflows/retrieveCompanyWideThreadList';
import { toFindCompanyWideThreadList } from '$lib/features/companyWide/repositories/companyWideThreadQuery';
import { type Actions, fail } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { deleteThreadSchema } from '$lib/features/all/schema';

export const load = (async ({ locals }) => {
  const form = await superValidate(zod(deleteThreadSchema));
  const assistantsEvent = await retrieveCompanyWideAssistantsWorkflow(
    toFindCompanyWideAssistants(prisma)
  );
  const threadsEvents = await retrieveCompanyWideThreadListWorkflow(
    toFindCompanyWideThreadList(prisma),
    {
      userId: locals.userId,
    }
  );
  return {
    form: form,
    assistants: assistantsEvent.companyWideAssistants,
    threads: threadsEvents.companyWideThreads,
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await superValidate(request, zod(deleteThreadSchema));
    if (!form.valid) {
      return fail(400, { form });
    }

    await prisma.thread.deleteMany({
      where: {
        id: form.data.threadId,
        userId: locals.userId,
      },
    });
    return message(form, 'Form posted successfully!');
  },
};
