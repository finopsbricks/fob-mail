// @ts-check
/**
 * @typedef {import('../types/api/Mail.types.js').Label} Label
 */

/**
 * @typedef {Object} LabelsApi
 * @property {() => Promise<import('../types/api/Mail.types.js').ListEnvelope<Label>>} list
 * @property {(label: { name: string, color?: string }) => Promise<Label>} create - Returns the existing label of that name if there is one
 */

/**
 * @param {import('../types/general/index.js').Transport} ctx
 * @returns {LabelsApi}
 */
export function buildLabels(ctx) {
  return {
    list: () => ctx.get('/api/v1/labels'),
    create: ({ name, color }) => ctx.post('/api/v1/labels', { name, color }).then((r) => r?.data),
  };
}
