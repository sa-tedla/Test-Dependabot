import type { Prisma } from '@prisma/client';
import { buildThreadMessageFromModels } from '$lib/features/assistant/entities/threadMessage';
import type { Assistant } from '$lib/entities';
import {
  buildCompanyWideThreadList,
  buildCompanyWideThreadListItem,
  type CompanyWideThreadList,
} from '$lib/features/companyWide/entities/companyWideThreadList';
import {
  buildCompanyWideThread,
  type CompanyWideThread,
} from '$lib/features/companyWide/entities/companyWideThread';
import { COMPANY_WIDE_ASSISTANT_ID } from '$lib/features/companyWide/constant';

export function toFindCompanyWideThread(db: Prisma.TransactionClient) {
  return async (threadId: string, userId: string): Promise<CompanyWideThread> => {
    const thread = await db.thread.findUniqueOrThrow({
      where: {
        id: threadId,
        userId: userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            messageDocuments: true,
            messageReferences: true,
            messageFeedback: true,
          },
        },
      },
    });

    const assistant = (await db.assistant.findFirst({
      where: {
        id: thread.assistantId,
      },
    })) as Assistant;

    const messages = thread.messages.map((m) => {
      return buildThreadMessageFromModels(
        m,
        m.messageDocuments,
        m.messageReferences,
        m.messageFeedback ? m.messageFeedback.feedback : undefined
      );
    });

    return buildCompanyWideThread(thread, assistant, messages);
  };
}

export function toFindCompanyWideThreadList(db: Prisma.TransactionClient) {
  return async (userId: string): Promise<CompanyWideThreadList> => {
    const threads = await db.thread.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
    const assistants = await db.assistant.findMany();
    const assistantMap = new Map(assistants.map((a) => [a.id, a]));

    let items = threads.map((t) => {
      return buildCompanyWideThreadListItem(
        t,
        assistantMap.get(t.assistantId)!,
        t.messages[0].createdAt
      );
    });

    items = items.filter((item) => {
      if (!item.assistant) return false;
      return COMPANY_WIDE_ASSISTANT_ID.includes(item.assistant.id);
    });

    return buildCompanyWideThreadList(items);
  };
}
