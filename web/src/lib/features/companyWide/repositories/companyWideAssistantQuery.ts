import type { Prisma } from '@prisma/client';
import {
  buildCompanyWideAssistant,
  type CompanyWideAssistant,
} from '$lib/features/companyWide/entities/companyWideAssistant';
import { COMPANY_WIDE_ASSISTANT_ID } from '$lib/features/companyWide/constant';

export function toFindCompanyWideAssistant(db: Prisma.TransactionClient) {
  return async (assistantId: string): Promise<CompanyWideAssistant> => {
    if (!COMPANY_WIDE_ASSISTANT_ID.includes(assistantId)) {
      throw new Error('Assistant is not found or not company wide assistant');
    }
    const assistant = await db.assistant.findUniqueOrThrow({
      where: {
        id: assistantId,
        assistantType: 'Q_AND_A',
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
      },
    });
    if (!assistant.qAndAAssistant) {
      throw new Error('Assistant is not valid');
    }

    return buildCompanyWideAssistant(
      assistant,
      assistant.qAndAAssistant.index,
      assistant.qAndAAssistant.index.indexSources
    );
  };
}

export function toFindCompanyWideAssistants(db: Prisma.TransactionClient) {
  return async (): Promise<CompanyWideAssistant[]> => {
    const assistants = await db.assistant.findMany({
      where: {
        assistantType: 'Q_AND_A',
        id: {
          in: COMPANY_WIDE_ASSISTANT_ID,
        },
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
      },
    });

    return assistants.map((assistant) => {
      if (!assistant.qAndAAssistant) {
        throw new Error('Assistant is not valid');
      }
      return buildCompanyWideAssistant(
        assistant,
        assistant.qAndAAssistant.index,
        assistant.qAndAAssistant.index.indexSources
      );
    });
  };
}
