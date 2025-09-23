import apiClient from './client';

export async function uploadSingle(file, opts = {}) {
  const form = new FormData();
  form.append('file', file);
  if (opts.publicId) form.append('publicId', opts.publicId);

  const params = new URLSearchParams();
  if (opts.type) params.set('type', opts.type);
  if (opts.folder) params.set('folder', opts.folder);
  if (typeof opts.overwrite !== 'undefined') params.set('overwrite', String(!!opts.overwrite));

  const res = await apiClient.post(`/media/upload?${params}`, form);
  return res.data;
}

export async function uploadMultiple(files, opts = {}) {
  const form = new FormData();
  for (const f of files) form.append('files', f);
  if (Array.isArray(opts.publicIds) && opts.publicIds.length) {
    form.append('publicIds', JSON.stringify(opts.publicIds));
  }

  const params = new URLSearchParams();
  if (opts.type) params.set('type', opts.type);
  if (opts.folder) params.set('folder', opts.folder);
  if (typeof opts.overwrite !== 'undefined') params.set('overwrite', String(!!opts.overwrite));

  const res = await apiClient.post(`/media/uploads?${params}`, form);
  return res.data;
}

export async function uploadAvatarSingle(file, opts = {}) {
  const form = new FormData();
  form.append('file', file);
  if (opts.publicId) form.append('publicId', opts.publicId);

  const params = new URLSearchParams();
  if (opts.type) params.set('type', opts.type);
  if (opts.folder) params.set('folder', opts.folder);
  if (typeof opts.overwrite !== 'undefined') params.set('overwrite', String(!!opts.overwrite));

  const res = await apiClient.post(`/media/avatar?${params}`, form);
  return res.data;
}

export async function uploadAvatarMultiple(files, opts = {}) {
  const form = new FormData();
  for (const f of files) form.append('files', f);
  if (Array.isArray(opts.publicIds) && opts.publicIds.length) {
    form.append('publicIds', JSON.stringify(opts.publicIds));
  }

  const params = new URLSearchParams();
  if (opts.type) params.set('type', opts.type);
  if (opts.folder) params.set('folder', opts.folder);
  if (typeof opts.overwrite !== 'undefined') params.set('overwrite', String(!!opts.overwrite));

  const res = await apiClient.post(`/media/avatars?${params}`, form);
  return res.data;
}

export default { uploadSingle, uploadMultiple, uploadAvatarSingle, uploadAvatarMultiple };
