import { z } from 'zod';

export const uploadMessageDocumentResponse = z
  .object({
    blob_name: z.string(),
    filename: z.string(),
    source: z.string(),
  })
  .transform((data) => ({
    blobName: data.blob_name,
    filename: data.filename,
    source: data.source,
  }));

export const parseMessageDocumentResponse = z.object({
  content: z.string(),
});

export class FileProcessingSuccess {
  constructor(
    public data:
      | (z.infer<typeof uploadMessageDocumentResponse> &
          z.infer<typeof parseMessageDocumentResponse>)
      | undefined
  ) {}
}

export class FileProcessingFailure {
  constructor(public status: number) {}
}

export type FileProcessingResult = FileProcessingSuccess | FileProcessingFailure;
