import { env } from '$env/dynamic/private';
import {
  uploadMessageDocumentResponse,
  parseMessageDocumentResponse,
  FileProcessingSuccess,
  FileProcessingFailure,
  type FileProcessingResult,
} from '../messageDocumentDto';

export class FileProcessingService {
  /**
   * 単一ファイルのアップロードとパース処理
   */
  static async processFile(file: File, shouldParse: boolean = true): Promise<FileProcessingResult> {
    const formData = new FormData();
    formData.append('uploadFile', file);

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.API_AUTH_TOKEN}`,
      },
      body: formData,
    };

    // アップロード処理
    const uploadRes = await fetch(`${env.API_ENDPOINT}/v1/upload_message_document`, options);
    if (uploadRes.status !== 200) {
      return new FileProcessingFailure(uploadRes.status);
    }

    const uploadResJson = await uploadRes.json();
    const uploadResResult = uploadMessageDocumentResponse.safeParse(uploadResJson);
    if (!uploadResResult.success) {
      return new FileProcessingFailure(500);
    }

    // パース処理が必要ない場合はここで終了
    if (!shouldParse) {
      return new FileProcessingSuccess({
        ...uploadResResult.data,
        content: '', // パース対象でない場合は空のコンテンツ
      });
    }

    // パース処理
    const parseRes = await fetch(`${env.API_ENDPOINT}/v1/parse_message_document`, options);
    if (parseRes.status !== 200) {
      return new FileProcessingFailure(parseRes.status);
    }

    const parseResJson = await parseRes.json();
    const parseResResult = parseMessageDocumentResponse.safeParse(parseResJson);
    if (!parseResResult.success) {
      return new FileProcessingFailure(500);
    }

    return new FileProcessingSuccess({
      ...uploadResResult.data,
      ...parseResResult.data,
    });
  }

  /**
   * ファイル拡張子に基づいてパース処理が必要かどうかを判定
   */
  static shouldParseFile(file: File): boolean {
    const allowedExtensions = ['.pdf', '.docx', '.xlsx'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    return allowedExtensions.includes(fileExtension);
  }

  /**
   * ファイル処理結果のエラーハンドリング
   */
  static handleFileProcessingErrors(
    results: FileProcessingResult[],
    form: { data: { files?: File[] } }
  ): { hasError: boolean; status?: number } {
    for (const result of results) {
      if (result instanceof FileProcessingFailure) {
        const status = 400 <= result.status && result.status <= 599 ? result.status : 500;
        form.data.files = undefined; // 返却時のエラー回避（"Cannot stringify arbitrary non-POJOs"）
        return { hasError: true, status };
      }
    }
    return { hasError: false };
  }

  /**
   * 成功したファイル処理結果からメッセージドキュメントの入力データを生成
   */
  static createMessageDocumentInputs(results: FileProcessingResult[], messageId: string) {
    return results
      .filter(
        (result): result is FileProcessingSuccess =>
          result instanceof FileProcessingSuccess && result.data !== undefined
      )
      .map((success) => {
        return {
          messageId,
          blobName: success.data!.blobName,
          filename: success.data!.filename,
          content: success.data!.content,
          source: success.data!.source,
        };
      });
  }
}
