import { Oso } from 'oso-cloud';
import {
  getEphemeralOsoKey
} from '@osohq/dev-server';

let oso = null;

export default async function getOso() {
  if (!oso) {
    const { url, apiKey } = await getEphemeralOsoKey();
    oso = new Oso(url, apiKey);
  }
  return oso;
}
