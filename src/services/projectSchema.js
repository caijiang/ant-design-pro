import { requestJson, postJsonForJson, classicRequest, trueOnSuccessful, postJson, onlyJson, parseJSON } from '../utils/request';

export async function getProjectSchema(id, branch) {
  return requestJson(`/projectSchema/${id}/${branch}`);
}

export async function addApi(id, branch, uri, method) {
  return postJsonForJson(`/projectSchema/${id}/${branch}/${method}`, { uri });
}

export async function watchApi({ id, branch, pathId, method }) {
  return classicRequest(`/projectSchema/${id}/${branch}/paths/${pathId}/${method}/watch`)
    .then(trueOnSuccessful);
}
export async function unwatchApi({ id, branch, pathId, method }) {
  return classicRequest(`/projectSchema/${id}/${branch}/paths/${pathId}/${method}/watch`, {
    method: 'delete',
  })
    .then(trueOnSuccessful);
}

export async function submitApi({ id, branch, pathId, method }) {
  return postJson(`/projectSchema/${id}/${branch}/paths/${pathId}/${method}/submit`)
    .then(trueOnSuccessful);
}
/**
 * @returns {boolean} 成功就设置为 editing 否者依然保持 recalling
 */
export async function unSubmitApi({ id, branch, pathId, method }) {
  return classicRequest(`/projectSchema/${id}/${branch}/paths/${pathId}/${method}/submit`, {
    method: 'delete',
  })
    .then(onlyJson)
    .then(parseJSON);
}
