import { upsertMessageFeedbackRequest } from '$lib/features/all/request';
import { prisma } from '$lib/prisma';
import { json } from '@sveltejs/kit';

export const POST = async ({ request }) => {
  const reqJson = await request.json();
  const reqResult = upsertMessageFeedbackRequest.safeParse(reqJson);
  if (!reqResult.success) {
    throw new Error(`Invalid request data: ${reqResult.error.toString()}`);
  }

  await prisma.messageFeedback.upsert({
    where: {
      messageId: reqResult.data.messageId,
    },
    update: {
      feedback: reqResult.data.feedback,
    },
    create: {
      messageId: reqResult.data.messageId,
      feedback: reqResult.data.feedback,
    },
  });

  return json({ success: true });
};
