import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({ baseURL: BASE_URL });

function audioForm(file, extra = {}) {
  const fd = new FormData();
  fd.append('audio', file);
  Object.entries(extra).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

export const recognizeSpeech   = (file)              => api.post('/api/recognize',              audioForm(file));
export const enrollSpeaker     = (file, name)        => api.post('/api/speaker-id/enroll',      audioForm(file, { speaker_name: name }));
export const identifySpeaker   = (file)              => api.post('/api/speaker-id/identify',    audioForm(file));
export const listSpeakers      = ()                  => api.get('/api/speaker-id/speakers');
export const removeSpeaker     = (name)              => api.delete(`/api/speaker-id/speakers/${name}`);
export const verifySpeaker     = (file, name)        => api.post('/api/verify',                 audioForm(file, { speaker_name: name }));
export const detectEmotion     = (file)              => api.post('/api/emotion',                audioForm(file));
