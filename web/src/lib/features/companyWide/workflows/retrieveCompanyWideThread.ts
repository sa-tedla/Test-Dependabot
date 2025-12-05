import type { CompanyWideThread } from '$lib/features/companyWide/entities/companyWideThread';

// #####################################
// # DTO
// #####################################
export type RetrieveCompanyWideThreadCommand = {
  userId: string;
  threadId: string;
};
export type RetrieveCompanyWideThreadEvent = {
  companyWideThread: CompanyWideThread;
};

// #####################################
// # Types
// #####################################
export type FindCompanyWideThread = (
  threadId: string,
  userId: string
) => Promise<CompanyWideThread>;

// #####################################
// # Workflow
// #####################################
export const retrieveCompanyWideThreadWorkflow = async (
  findCompanyWideThread: FindCompanyWideThread,
  command: RetrieveCompanyWideThreadCommand
): Promise<RetrieveCompanyWideThreadEvent> => {
  const threads = await findCompanyWideThread(command.threadId, command.userId);
  return {
    companyWideThread: threads,
  };
};
