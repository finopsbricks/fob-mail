import { fobMail } from '../../index.js';
import { getProfileCredentials, setProfileIdentity } from '../config-store.js';

/**
 * Resolve a profile's firm (whoami) and cache it as non-secret metadata. Never throws: on failure
 * (offline, endpoint down) it warns on stderr and leaves the profile unchanged, so saving
 * credentials never depends on a network round-trip.
 *
 * @returns {Promise<boolean>} whether identity was resolved and stored.
 */
export async function refreshIdentity(name) {
  try {
    const id = await fobMail(getProfileCredentials(name)).whoami();
    if (!id?.org?.id) {
      console.error(`(could not resolve the firm for '${name}': empty response)`);
      return false;
    }
    setProfileIdentity(name, { org_id: id.org.id, org_slug: id.org.slug, org_name: id.org.name });
    return true;
  } catch (err) {
    console.error(`(could not resolve the firm for '${name}': ${err.message})`);
    return false;
  }
}
