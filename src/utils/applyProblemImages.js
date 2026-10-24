import { problemApi } from '../api/problemApi';

// images = { question: { file, removed }, explanation: { file, removed } }
// Returns a list of error messages (empty list = everything worked).
export async function applyProblemImages(problemId, images) {
  const failed = [];
  if (!images) return failed;

  const kinds = ['question', 'explanation'];
  for (const kind of kinds) {
    const change = images[kind];
    if (!change) continue;
    try {
      if (change.file) {
        await problemApi.uploadImage(problemId, kind, change.file);
      } else if (change.removed) {
        await problemApi.deleteImage(problemId, kind);
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'failed';
      failed.push(kind + ' image: ' + message);
    }
  }
  return failed;
}