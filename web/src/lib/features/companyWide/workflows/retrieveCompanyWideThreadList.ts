import type { CompanyWideThreadList } from '$lib/features/companyWide/entities/companyWideThreadList';

// #####################################
// # DTO
// #####################################

export type RetrieveCompanyWideThreadsCommand = {
  userId: string;
};
export type RetrieveCompanyWideThreadsEvent = {
  companyWideThreads: CompanyWideThreadList;
};

// #####################################
// # Types
// #####################################
export type FindCompanyWideThreads = (userId: string) => Promise<CompanyWideThreadList>;

// #####################################
// # Implementation
// #####################################

// #####################################
// # Workflow
// #####################################
export const retrieveCompanyWideThreadListWorkflow = async (
  findCompanyWideThreads: FindCompanyWideThreads,
  command: RetrieveCompanyWideThreadsCommand
): Promise<RetrieveCompanyWideThreadsEvent> => {
  const threads = await findCompanyWideThreads(command.userId);

  const oderedThreads = threads.sort((a, b) => {
    return a.lastEditedAt > b.lastEditedAt ? -1 : 1;
  });
  return {
    companyWideThreads: oderedThreads,
  };
};
