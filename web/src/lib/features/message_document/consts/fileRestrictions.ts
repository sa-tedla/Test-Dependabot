export const MAX_FILE_SIZE_IN_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_FILE_COUNT = 5; // 添付可能な最大ファイル数
export const MAX_FILENAME_LENGTH = 200; // ファイル名の最大文字数
export const ACCEPTED_FILENAME_EXTENSION = ['.pdf', '.docx', '.xlsx'];
export const ACCEPTED_FILENAME_EXTENSION_FOR_ALL = ['.jpg', '.jpeg', '.png', '.webp'];

export function getSizeInMB(sizeInBytes: number): number {
  return sizeInBytes / (1024 * 1024);
}
