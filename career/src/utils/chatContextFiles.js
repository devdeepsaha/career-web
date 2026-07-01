const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

export const uploadChatContextFile = async (file) => {
  if (!file) return null;
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('File must be 2 MB or smaller.');
  }

  const body = new FormData();
  body.append('file', file);
  const response = await fetch(`${API_URL}/chat-context-file`, {
    method: 'POST',
    credentials: 'include',
    body,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Could not read this file.');
  }
  return data;
};

export const fileContextSummary = (files = []) => (
  files.map((file) => ({
    name: file.name,
    text: file.text,
  }))
);
