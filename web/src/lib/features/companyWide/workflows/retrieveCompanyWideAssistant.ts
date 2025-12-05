import type { CompanyWideAssistant } from '$lib/features/companyWide/entities/companyWideAssistant';

// #####################################
// # DTO
// #####################################
export type RetrieveCompanyWideAssistantCommand = {
  assistantId: string;
};
export type RetrievedCompanyWideAssistantsEvent = {
  companyWiddeAssistant: CompanyWideAssistant;
};

// #####################################
// # Types
// #####################################
export type FindCompanyWideAssistant = (assistantId: string) => Promise<CompanyWideAssistant>;

// #####################################
// # Workflow
// #####################################
export const retrieveCompanyWideAssistantWorkflow = async (
  findCompanyWideAssistant: FindCompanyWideAssistant,
  command: RetrieveCompanyWideAssistantCommand
): Promise<RetrievedCompanyWideAssistantsEvent> => {
  const assistant = await findCompanyWideAssistant(command.assistantId);
  return {
    companyWiddeAssistant: assistant,
  };
};
