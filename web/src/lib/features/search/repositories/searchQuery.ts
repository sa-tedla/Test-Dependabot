import type { PrismaClient } from '@prisma/client';
import { prisma } from '$lib/prisma';
import type { SearchAssistant } from '$lib/features/search/entities/searchAssistant';
import type { SearchThread } from '$lib/features/search/entities/searchThread';

export async function findSearchAssistantsByUserId(
  db: PrismaClient,
  userId: string
): Promise<SearchAssistant[]> {
  const userAssistantsResult = await db.assistant.findMany({
    where: {
      creatorId: userId,
      assistantType: {
        equals: 'SEARCH',
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      searchAssistant: {
        include: {
          index: {
            include: {
              indexSources: true,
            },
          },
        },
      },
    },
  });
  const userAssistants: SearchAssistant[] = userAssistantsResult.map((assistant) => {
    if (!assistant.searchAssistant) {
      throw new Error('Assistant is not valid');
    }
    return {
      ...assistant,
      index: assistant.searchAssistant.index,
      indexSources: assistant.searchAssistant.index.indexSources,
      groups: [],
    };
  });

  const userGroupRelations = await db.userGroupRelation.findMany({
    where: {
      userId: userId,
    },
    include: {
      group: {
        include: {
          groupAssistantRelations: {
            where: {
              assistant: {
                assistantType: {
                  equals: 'SEARCH',
                },
              },
            },
            include: {
              assistant: {
                include: {
                  searchAssistant: {
                    include: {
                      index: {
                        include: {
                          indexSources: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const assistantMap = new Map(userAssistants.map((a) => [a.id, a]));
  for (const ug of userGroupRelations) {
    for (const gar of ug.group.groupAssistantRelations) {
      if (!gar.assistant.searchAssistant) {
        throw new Error('Assistant is not valid');
      }
      if (assistantMap.has(gar.assistant.id)) {
        const assistant = assistantMap.get(gar.assistant.id)!;
        assistantMap.set(gar.assistant.id, {
          ...assistant,
          groups: [...assistant.groups, ug.group],
        });
      } else {
        const assistant: SearchAssistant = {
          ...gar.assistant,
          index: gar.assistant.searchAssistant.index,
          indexSources: gar.assistant.searchAssistant.index.indexSources,
          groups: [ug.group],
        };
        assistantMap.set(gar.assistant.id, assistant);
      }
    }
  }

  return Array.from(assistantMap.values()).sort((a, b) => {
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });
}

export async function findSearchThreadById(
  db: PrismaClient,
  userId: string,
  threadId: string
): Promise<SearchThread> {
  const thread = await prisma.thread.findUniqueOrThrow({
    where: {
      id: threadId,
      userId: userId,
    },
    include: {
      messages: {
        include: {
          messageReferences: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });
  const assistant = await prisma.assistant.findUniqueOrThrow({
    where: {
      id: thread.assistantId,
    },
    include: {
      searchAssistant: {
        include: {
          index: {
            include: {
              indexSources: true,
            },
          },
        },
      },
      groupAssistantRelations: {
        include: {
          group: true,
        },
      },
    },
  });
  if (!assistant.searchAssistant) {
    throw new Error('Assistant is not valid');
  }
  return {
    ...thread,
    messages: thread.messages.map((m) => ({
      ...m,
      references: m.messageReferences,
    })),
    assistant: {
      ...assistant,
      index: assistant.searchAssistant.index,
      indexSources: assistant.searchAssistant.index.indexSources,
      groups: assistant.groupAssistantRelations.map((gar) => gar.group),
    },
  };
}
