import { prisma } from '$lib/prisma';
import { type Actions, redirect } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { deleteAssistantSchema, updateAssistantSchema } from '$lib/schema';
import { zod } from 'sveltekit-superforms/adapters';
import { newConversationAssistantUpdateInput } from '$lib/features/assistant/assistantDto';
import { findGroupByUserID } from '$lib/features/group/repositories/groupQuery';

export const load = (async ({ params }) => {
  const assistant = await prisma.assistant.findUniqueOrThrow({
    where: {
      id: params.id,
    },
    include: {
      conversationAssistant: true,
      groupAssistantRelations: true,
    },
  });
  if (!assistant.conversationAssistant) {
    throw fail(404, { message: 'Assistant is not available' });
  }

  const updateAssistantForm = await superValidate(zod(updateAssistantSchema), {
    defaults: {
      assistantId: params.id,
      name: assistant.name,
      description: assistant.description,
      icon: assistant.icon,
      systemPrompt: assistant.conversationAssistant.systemPrompt,
      groupIds: assistant.groupAssistantRelations.map((gar) => gar.groupId),
    },
  });

  const deleteAssistantForm = await superValidate(zod(deleteAssistantSchema), {
    defaults: {
      assistantId: params.id,
    },
  });

  return {
    updateAssistantForm: updateAssistantForm,
    deleteAssistantForm: deleteAssistantForm,
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  updateAssistant: async ({ request, locals }) => {
    const form = await superValidate(request, zod(updateAssistantSchema));
    if (!form.valid) {
      return fail(400, { updateAssistantForm: form });
    }
    const input = newConversationAssistantUpdateInput(locals.userId, form.data);

    await prisma.$transaction(async (tx) => {
      // アシスタントの更新
      await tx.assistant.update({
        where: { id: form.data.assistantId },
        data: input.assistant,
      });
      await tx.conversationAssistant.update({
        where: { assistantId: form.data.assistantId },
        data: input.conversation,
      });
      // 公開範囲の更新
      const groups = await findGroupByUserID(tx, locals.userId);
      await tx.groupAssistantRelation.deleteMany({
        where: {
          assistantId: form.data.assistantId,
          groupId: {
            in: groups.map((group) => group.id),
          },
        },
      });
      if (form.data.groupIds.length > 0) {
        await tx.groupAssistantRelation.createMany({
          data: form.data.groupIds.map((groupId) => ({
            assistantId: form.data.assistantId,
            groupId: groupId,
          })),
        });
      }
    });

    redirect(302, `/assistant`);
  },
  deleteAssistant: async ({ request }) => {
    const form = await superValidate(request, zod(deleteAssistantSchema));
    if (!form.valid) {
      return fail(400, { deleteAssistantForm: form });
    }

    await prisma.$transaction(async (tx) => {
      await tx.groupAssistantRelation.deleteMany({
        where: {
          assistantId: form.data.assistantId,
        },
      });
      await tx.conversationAssistant.delete({
        where: {
          assistantId: form.data.assistantId,
        },
      });
      await tx.assistant.delete({
        where: {
          id: form.data.assistantId,
        },
      });
    });

    redirect(302, `/assistant`);
  },
};
