import { requestJson, postJsonForJson } from '../utils/request';

export async function getProjectSchema(id, branch) {
  return requestJson(`/projectSchema/${id}/${branch}`);
}

export async function addApi(id, branch, uri, method) {
  return postJsonForJson(`/projectSchema/${id}/${branch}/${method}`, { uri });
}
