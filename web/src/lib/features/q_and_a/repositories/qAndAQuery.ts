import type { PrismaClient } from '@prisma/client';
import type { QAndAAssistant } from '$lib/features/q_and_a/entities/qAndAAssistant';
import { prisma } from '$lib/prisma';
import type { QAndAThread } from '$lib/features/q_and_a/entities/qAndAThread';

export async function findQAndAAssistantsById(
  db: PrismaClient,
  userId: string
): Promise<QAndAAssistant[]> {
  const userAssistantsResult = await db.assistant.findMany({
    where: {
      creatorId: userId,
      assistantType: {
        equals: 'Q_AND_A',
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      qAndAAssistant: {
        include: {
          index: {
            include: {
              indexSources: true,
            },
          },
        },
      },
      userFeedbacks: {
        include: {
          user: true,
        },
      },
    },
  });
  const userAssistants: QAndAAssistant[] = userAssistantsResult.map((assistant) => {
    if (!assistant.qAndAAssistant) {
      throw new Error('Assistant is not valid');
    }
    return {
      ...assistant,
      index: assistant.qAndAAssistant.index,
      indexSources: assistant.qAndAAssistant.index.indexSources,
      userFeedbacks: assistant.userFeedbacks.map((userFeedback) => {
        return {
          ...userFeedback,
          user: userFeedback.user,
        };
      }),
      systemPrompt: assistant.qAndAAssistant.systemPrompt ?? '',
      groups: [],
    };
  });

  const userGroupRelations = await db.userGroupRelation.findMany({
    where: {
      userId: userId,
      group: {
        groupAssistantRelations: {
          some: {
            assistant: {
              assistantType: {
                equals: 'Q_AND_A',
              },
            },
          },
        },
      },
    },
    include: {
      group: {
        include: {
          groupAssistantRelations: {
            where: {
              assistant: {
                assistantType: {
                  equals: 'Q_AND_A',
                },
              },
            },
            include: {
              assistant: {
                include: {
                  qAndAAssistant: {
                    include: {
                      index: {
                        include: {
                          indexSources: true,
                        },
                      },
                    },
                  },
                  userFeedbacks: {
                    include: {
                      user: true,
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
      if (!gar.assistant.qAndAAssistant) {
        throw new Error('Assistant is not valid');
      }
      if (assistantMap.has(gar.assistant.id)) {
        const assistant = assistantMap.get(gar.assistant.id)!;
        assistantMap.set(gar.assistant.id, {
          ...assistant,
          groups: [...assistant.groups, ug.group],
        });
      } else {
        const assistant: QAndAAssistant = {
          ...gar.assistant,
          systemPrompt: gar.assistant.qAndAAssistant.systemPrompt ?? '',
          index: gar.assistant.qAndAAssistant.index,
          indexSources: gar.assistant.qAndAAssistant.index.indexSources,
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

export async function findQAndAThreadById(
  db: PrismaClient,
  userId: string,
  threadId: string
): Promise<QAndAThread> {
  const thread = await db.thread.findUniqueOrThrow({
    where: {
      id: threadId,
      userId: userId,
    },
    include: {
      messages: {
        include: {
          messageReferences: true,
          messageDocuments: true,
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
      qAndAAssistant: {
        include: {
          index: {
            include: {
              indexSources: true,
            },
          },
        },
      },
      userFeedbacks: {
        include: {
          user: true,
        },
      },
      groupAssistantRelations: {
        include: {
          group: true,
        },
      },
    },
  });
  if (!assistant.qAndAAssistant) {
    throw new Error('Assistant is not valid');
  }
  return {
    ...thread,
    messages: thread.messages.map((m) => ({
      ...m,
      references: m.messageReferences,
      documents: m.messageDocuments,
    })),
    assistant: {
      ...assistant,
      systemPrompt: assistant.qAndAAssistant.systemPrompt ?? '',
      index: assistant.qAndAAssistant.index,
      indexSources: assistant.qAndAAssistant.index.indexSources,
      userFeedbacks: assistant.userFeedbacks.map((userFeedback) => {
        return {
          ...userFeedback,
          user: userFeedback.user,
        };
      }),
      groups: assistant.groupAssistantRelations.map((gar) => gar.group),
    },
  };
}
