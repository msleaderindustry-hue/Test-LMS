export class HttpError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}
export const fail = (status, code, message) => { throw new HttpError(status, code, message); };
export const DAY = 86_400_000;
export const OWNER_UID = '1qhlWSbqAxd1dAvo2Nw92gdJhNk1';
export const MODULES = ['tests', 'typing', 'hotkeys', 'excel', 'word', 'code', 'flashcards', 'chess'];
export const TASK_MODULES = ['typing', 'hotkeys', 'excel', 'word'];
export const WORD_LESSONS = ['memo','report','table','letter','resume','contract','announce','fonts','poster','quote','steps','menu','checklist','sources','schedule','tariffs','essay','final','links'];
export const identifier = value => typeof value === 'string' && /^[A-Za-z0-9_.:-]{1,128}$/.test(value);
export function requireId(value) { if (!identifier(value)) fail(400, 'invalid-id', 'Некорректный идентификатор.'); return value; }
export function text(value, max = 1000) { return typeof value === 'string' ? value.normalize('NFC').trim().slice(0, max) : ''; }
export function number(value, min, max, label = 'число') {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) fail(400, 'invalid-number', 'Некорректное поле: ' + label);
  return value;
}
export function integer(value, min, max, label) { number(value,min,max,label); if (!Number.isInteger(value)) fail(400,'invalid-integer','Ожидается целое число: '+label); return value; }
export function owner(actor, ownerUid = OWNER_UID) { if (!actor || actor.uid !== ownerUid) fail(403, 'owner-only', 'Эта команда доступна только владельцу.'); }
export function enabled(profile, module) { return !!profile && !profile.isBanned && (profile.allowedModules == null || Array.isArray(profile.allowedModules) && profile.allowedModules.includes(module)); }
export function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  return '{' + Object.keys(value).sort().filter(k => value[k] !== undefined).map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
}
export async function digest(value) {
  const bytes = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonical(value)));
  return Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');
}
export const freshId = () => crypto.randomUUID();
export const initialPolicy = () => ({ version: 1, pilotStartedAt: null, autoAssignments: false, proficiency: null, proficiencyApprovedAt: null, reports: { enabled: false, timezone: 'Asia/Tashkent', dailyHour: 20, weeklyDay: 0, weeklyMinute: 5 } });
export function setAutomatic(policy, actor, allow, now, ownerUid = OWNER_UID) {
  owner(actor,ownerUid);
  if (typeof allow !== 'boolean') fail(400,'invalid-policy','Укажите включение или отключение.');
  if (allow && (!Number.isFinite(policy.pilotStartedAt) || now < policy.pilotStartedAt + 14 * DAY)) fail(409,'pilot-active','Первые 14 дней доступны только предложения с подтверждением.');
  return { ...policy, autoAssignments: allow, updatedAt: now, updatedBy: actor.uid };
}
// Tashkent has UTC+05:00. Reporting boundaries are 20:00 local (15:00 UTC).
// A week is exactly seven daily reporting intervals, ending Sunday at 20:00.
export function reportWindow(kind, now) {
  if (!['daily','weekly'].includes(kind)) fail(400,'invalid-period','Неизвестный период отчёта.');
  const d = new Date(now); let end = Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate(),15);
  if (end > now) end -= DAY;
  if (kind === 'weekly') end -= new Date(end).getUTCDay() * DAY;
  return { start: end - (kind === 'weekly' ? 7 : 1) * DAY, end, timezone: 'Asia/Tashkent', kind };
}
export function scheduledKinds(now) {
  const d = new Date(now), result = [];
  if (d.getUTCHours() === 15 && d.getUTCMinutes() === 0) result.push('daily');
  if (d.getUTCDay() === 0 && d.getUTCHours() === 15 && d.getUTCMinutes() === 5) result.push('weekly');
  return result;
}
export function onDemandWindow(kind,now){reportWindow(kind,now);return {kind,start:now-(kind==='weekly'?7:1)*DAY,end:now,timezone:'Asia/Tashkent',onDemand:true};}
export function validateTask(input, now) {
  if (!input || !TASK_MODULES.includes(input.module)) fail(400,'invalid-task','Неизвестный раздел задания.');
  const title = text(input.title,180), body = text(input.text,1800), ids = input.studentIds;
  if (!title || !Array.isArray(ids) || ids.length < 1 || ids.length > 100 || new Set(ids).size !== ids.length || !ids.every(identifier)) fail(400,'invalid-task','Нужны название и от 1 до 100 разных учеников.');
  number(input.dueAt,now+60_000,now+366*DAY,'срок');
  const task = { version: 4, assessmentVersion: 3, module: input.module, title, text: body, studentIds: ids, dueAt: input.dueAt, target: 1, lang: ['ru','en'].includes(input.lang)?input.lang:'ru', minAccuracy: 95, hotkeyBank: 'any', wordLesson: null, excelSkill:input.module==='excel'?text(input.excelSkill,50).toUpperCase()||null:null, maxErrors:input.module==='hotkeys'&&input.maxErrors!=null?integer(input.maxErrors,0,1000,'ошибки серии'):null, reason: text(input.reason,1200) };
  if (task.module === 'typing') {
    if (body.length < 20 || [...body].some(c=>c.codePointAt(0)>65535) || /[\u200b-\u200f\u202a-\u202e]/.test(body)) fail(400,'invalid-text','Проверьте текст для печати.');
    task.minAccuracy = integer(input.minAccuracy ?? 95,50,100,'точность');
  } else if (task.module === 'word') {
    if (!WORD_LESSONS.includes(input.wordLesson)) fail(400,'invalid-lesson','Неизвестное упражнение Word.');
    task.wordLesson = input.wordLesson;
  } else {
    task.target = integer(input.target ?? 1,1,50,'количество');
    if (task.module === 'hotkeys') {
      if (!['any','windows','word','excel'].includes(input.hotkeyBank ?? 'any')) fail(400,'invalid-bank','Неизвестная категория сочетаний.');
      task.hotkeyBank = input.hotkeyBank ?? 'any';
    }
  }
  return task;
}
