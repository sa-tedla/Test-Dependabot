import type { MessageReference } from '$lib/entities';

/**
 * sourceが有効なhttp/https URLかどうかを判定
 */
export function isValidHttpUrl(value: string | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  try {
    const url = new URL(trimmed);
    return /^https?:$/.test(url.protocol.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * 参照がクリック可能かどうかを判定
 * - sourceがURLの場合のみtrue
 * - sourceが空またはファイル名等の場合はfalse
 * - nameが'crm_qa_document.pdf'の場合はfalse
 */
export function canOpenReference(ref: MessageReference): boolean {
  if (ref.name === 'crm_qa_document.pdf') return false;
  return isValidHttpUrl(ref.source);
}

/**
 * 参照の重複を削除
 * - source と name の組み合わせが同じものを一つにまとめる
 */
export function deduplicateReferences(refs: MessageReference[]): MessageReference[] {
  const seen = new Set<string>();
  return refs.filter((reference) => {
    const key = JSON.stringify([reference.source ?? null, reference.name ?? null]);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
