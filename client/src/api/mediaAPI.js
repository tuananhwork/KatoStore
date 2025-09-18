import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({ baseURL: BASE_URL, withCredentials: true });

const authHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function uploadSingle(file, opts = {}) {
  const form = new FormData();
  form.append('file', file);
  if (opts.publicId) form.append('publicId', opts.publicId);
  const params = new URLSearchParams();
  if (opts.type) params.set('type', opts.type);
  if (opts.folder) params.set('folder', opts.folder);
  if (typeof opts.overwrite !== 'undefined') params.set('overwrite', String(!!opts.overwrite));
  const res = await client.post(`/media/upload?${params}`, form, { headers: { ...authHeader() } });
  return res.data;
}

export async function uploadMultiple(files, opts = {}) {
  const form = new FormData();
  for (const f of files) form.append('files', f);
  if (Array.isArray(opts.publicIds) && opts.publicIds.length) form.append('publicIds', JSON.stringify(opts.publicIds));
  const params = new URLSearchParams();
  if (opts.type) params.set('type', opts.type);
  if (opts.folder) params.set('folder', opts.folder);
  if (typeof opts.overwrite !== 'undefined') params.set('overwrite', String(!!opts.overwrite));
  const res = await client.post(`/media/uploads?${params}`, form, { headers: { ...authHeader() } });
  return res.data;
}

export default { uploadSingle, uploadMultiple };
