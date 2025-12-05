import type { PrismaClient } from '@prisma/client';
import type { Assistant } from '$lib/entities';

export async function findConversationAssistants(
  db: PrismaClient,
  userId: string
): Promise<Assistant[]> {
  const userGroupRelations = await db.userGroupRelation.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      group: {
        include: {
          groupAssistantRelations: {
            where: {
              assistant: {
                assistantType: {
                  equals: 'CONVERSATION',
                },
              },
            },
            include: {
              assistant: true,
            },
          },
        },
      },
    },
  });
  const groupAssistants = userGroupRelations.flatMap((ug) =>
    ug.group.groupAssistantRelations.map((gar) => gar.assistant)
  );
  const userAssistants = await db.assistant.findMany({
    where: {
      creatorId: userId,
      assistantType: {
        equals: 'CONVERSATION',
      },
    },
  });

  return [...groupAssistants, ...userAssistants]
    .filter((assistant, index, self) => {
      return index === self.findIndex((a) => a.id === assistant.id);
    })
    .sort((a, b) => {
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
}
