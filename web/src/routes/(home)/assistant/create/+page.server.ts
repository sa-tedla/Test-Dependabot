import type { PageServerLoad } from './$types';
import { prisma } from '$lib/prisma';
import { type Actions, redirect } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import { createAssistantSchema } from '$lib/schema';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { newConversationAssistantCreateInput } from '$lib/features/assistant/assistantDto';

export const load = (async ({ locals }) => {
  const form = await superValidate(zod(createAssistantSchema));
  const userGroups = await prisma.userGroupRelation.findMany({
    where: {
      userId: locals.userId,
    },
    include: {
      group: true,
    },
  });
  return {
    groups: userGroups.map((ug) => ug.group),
    form: form,
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await superValidate(request, zod(createAssistantSchema));
    if (!form.valid) {
      return fail(400, { form });
    }

    const input = newConversationAssistantCreateInput(locals.userId, form.data);
    await prisma.$transaction(async (tx) => {
      await tx.assistant.create({
        data: input.assistant,
      });
      await tx.conversationAssistant.create({
        data: input.conversation,
      });

      const groupIds = form.data.groupIds;
      if (groupIds.length > 0) {
        await tx.groupAssistantRelation.createMany({
          data: groupIds.map((groupId) => ({
            assistantId: input.assistant.id,
            groupId: groupId,
          })),
        });
      }
    });

    redirect(302, '/assistant');
  },
};
