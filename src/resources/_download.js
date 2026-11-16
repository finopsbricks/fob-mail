// @ts-check
import { parseContentDispositionFilename } from '../http.js';

/**
 * GET a file endpoint and buffer it.
 * @param {import('../types/general/index.js').Transport} ctx
 * @param {string} path
 * @returns {Promise<import('../types/api/Mail.types.js').DownloadedFile>}
 */
export async function download(ctx, path) {
  const { response } = await ctx.getStream(path);
  const buffer = Buffer.from(await response.arrayBuffer());
  return {
    filename: parseContentDispositionFilename(response.headers.get('content-disposition')),
    content_type: response.headers.get('x-attachment-content-type') || response.headers.get('content-type') || 'application/octet-stream',
    buffer,
  };
}
