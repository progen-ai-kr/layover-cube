import { collection } from '../data/collection.js';
import { gallery } from '../data/gallery.js';
import { questions } from '../data/taste.js';
import { stamps } from '../data/stamps.js';
export const STORAGE_KEY = 'lumino.journey.v1';
export const freshState = () => ({ version: 1, started: false, favorites: [], favoriteId: null, photoId: null, storyRead: false, ribbonFound: false, answers: {}, tasteComplete: false, traveler: '', earnedAt: {}, completionSeen: false });
const validAnswers = (answers) => Object.fromEntries(questions.filter(q => q.options.some(o => o.value === answers?.[q.id])).map(q => [q.id, answers[q.id]]));
export function normalizeState(value) {
  if (!value || typeof value !== 'object' || value.version !== 1) return freshState();
  const next = freshState();
  next.started = value.started === true;
  next.favorites = [...new Set(Array.isArray(value.favorites) ? value.favorites.filter(id => collection.some(c => c.id === id)) : [])];
  next.favoriteId = collection.some(c => c.id === value.favoriteId) ? value.favoriteId : null;
  next.photoId = gallery.some(g => g.id === value.photoId) ? value.photoId : null;
  next.storyRead = value.storyRead === true;
  next.ribbonFound = next.storyRead && value.ribbonFound === true;
  next.answers = validAnswers(value.answers);
  next.tasteComplete = value.tasteComplete === true && Object.keys(next.answers).length === questions.length;
  next.traveler = typeof value.traveler === 'string' ? value.traveler.slice(0, 24).trim() : '';
  next.completionSeen = value.completionSeen === true && earnedIds(next).length === 5;
  for (const id of earnedIds(next)) {
    const date = value.earnedAt?.[id];
    if (typeof date === 'string' && Number.isFinite(Date.parse(date))) next.earnedAt[id] = date;
  }
  return next;
}
export function earnedIds(state) {
  return [state.started && 'travel', state.favoriteId && 'romance', state.photoId && 'fantasy', state.storyRead && state.ribbonFound && 'cute', state.tasteComplete && Object.keys(validAnswers(state.answers)).length === 3 && 'luxury'].filter(Boolean);
}
export function stampData(state) { const ids = earnedIds(state); return stamps.map(s => ({ ...s, acquired: ids.includes(s.id) })); }
// 저장소를 주입할 수 있어 추후 계정/API 저장으로 확장할 수 있습니다.
export function createStore(storage, onStorageError = () => {}) {
  let current = freshState();
  const listeners = new Set();
  try { current = normalizeState(JSON.parse(storage.getItem(STORAGE_KEY))); } catch { onStorageError(); }
  function update(change) {
    const before = earnedIds(current);
    current = normalizeState({ ...current, ...change });
    const awarded = earnedIds(current).filter(id => !before.includes(id));
    awarded.forEach(id => { current.earnedAt[id] = new Date().toISOString(); });
    try { storage.setItem(STORAGE_KEY, JSON.stringify(current)); } catch { onStorageError(); }
    listeners.forEach(fn => fn(current, awarded));
    return awarded;
  }
  return { get: () => structuredClone(current), update, subscribe: fn => { listeners.add(fn); return () => listeners.delete(fn); }, sync: value => { current = normalizeState(value); listeners.forEach(fn => fn(current, [])); } };
}
