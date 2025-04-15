import { request } from '@/utils/request';

export async function getPortals(body, options) {
  return request('/api/portals/list', {
    method: 'GET',
    data: body,
    ...(options || {}),
  });
}
