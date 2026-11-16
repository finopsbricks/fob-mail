// @ts-check
import { download } from './_download.js';

/**
 * @typedef {Object} AttachmentsApi
 * @property {(id: string) => Promise<import('../types/api/Mail.types.js').DownloadedFile>} content - Ids come from a thread's or message's `attachments`
 */

/**
 * @param {import('../types/general/index.js').Transport} ctx
 * @returns {AttachmentsApi}
 */
export function buildAttachments(ctx) {
  return {
    content: (id) => download(ctx, `/api/v1/attachments/${encodeURIComponent(id)}/content`),
  };
}
