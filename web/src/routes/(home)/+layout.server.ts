import { prisma } from '$lib/prisma';
import type { LayoutServerLoad } from '../chat/$types';
import type { ThreadForSidebar } from '$lib/entities';

export const load = (async ({ params, locals }) => {
  const data = await prisma.user.findUniqueOrThrow({
    where: {
      id: locals.userId,
    },
    include: {
      threads: {
        orderBy: [
          {
            createdAt: 'desc',
          },
        ],
      },
      userGroups: {
        include: {
          group: true,
        },
      },
    },
  });

  const assistants = await prisma.assistant.findMany({
    where: {
      id: {
        in: data.threads.map((t) => t.assistantId),
      },
    },
  });
  const assistantMap = new Map(assistants.map((a) => [a.id, a]));

  const sidebarThreads: ThreadForSidebar[] = data.threads.map((t) => {
    return {
      ...t,
      assistant: assistantMap.get(t.assistantId),
    };
  });

  return {
    threadId: params.id,
    user: data,
    groups: data.userGroups.map((ug) => ug.group),
    threads: sidebarThreads,
  };
}) satisfies LayoutServerLoad;
