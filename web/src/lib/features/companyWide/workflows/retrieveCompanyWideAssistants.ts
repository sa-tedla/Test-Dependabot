import type { CompanyWideAssistant } from '$lib/features/companyWide/entities/companyWideAssistant';

// #####################################
// # DTO
// #####################################
export type RetrieveCompanyWideAssistantsEvent = {
  companyWideAssistants: CompanyWideAssistant[];
};

// #####################################
// # Types
// #####################################
export type FindCompanyWideAssistants = () => Promise<CompanyWideAssistant[]>;

// #####################################
// # Workflow
// #####################################
export const retrieveCompanyWideAssistantsWorkflow = async (
  findCompanyWideAssistants: FindCompanyWideAssistants
): Promise<RetrieveCompanyWideAssistantsEvent> => {
  const assistants = await findCompanyWideAssistants();
  return {
    companyWideAssistants: assistants,
  };
};
