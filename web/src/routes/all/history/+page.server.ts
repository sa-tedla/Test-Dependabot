import { prisma } from '$lib/prisma';
import type { PageServerLoad } from './$types';
import { retrieveCompanyWideThreadListWorkflow } from '$lib/features/companyWide/workflows/retrieveCompanyWideThreadList';
import { toFindCompanyWideThreadList } from '$lib/features/companyWide/repositories/companyWideThreadQuery';
import { type Actions, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { deleteThreadSchema } from '$lib/features/all/schema';
import { zod } from 'sveltekit-superforms/adapters';
import { message } from 'sveltekit-superforms';

export const load = (async ({ locals }) => {
  const form = await superValidate(zod(deleteThreadSchema));
  const event = await retrieveCompanyWideThreadListWorkflow(toFindCompanyWideThreadList(prisma), {
    userId: locals.userId,
  });
  return {
    form: form,
    companyWideThreads: event.companyWideThreads,
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
