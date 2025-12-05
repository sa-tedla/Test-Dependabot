import { env } from '$env/dynamic/private';

interface RouteParams {
  blobName: string;
}

export const GET = async ({ params }: { params: RouteParams }) => {
  const { messageDocumentId } = params;

  const response = await fetch(
    `${env.API_ENDPOINT}/v1/download_message_document/${messageDocumentId}`,
    {
      method: 'GET',
    }
  );

  if (!response.ok) {
    return new Response(JSON.stringify({ success: false, error: 'Failed to download file' }), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const blob = await response.blob();

  return new Response(blob, {
    headers: {
      'Content-Type': blob.type || 'application/octet-stream',
      'Content-Length': blob.size.toString(),
    },
  });
};
