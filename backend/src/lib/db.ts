import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/mindmesh';

const genericSchema = new mongoose.Schema({}, { strict: false, versionKey: false, timestamps: true });

const collectionMap: Record<string, string> = {
  User: 'users',
  OtpCode: 'otp_codes',
  Problem: 'problems',
  UserProblemStatus: 'user_problem_status',
  ProblemBookmark: 'problem_bookmarks',
  Submission: 'submissions',
  Note: 'notes',
  NoteTag: 'note_tags',
  DSASheet: 'dsa_sheets',
  SheetItem: 'sheet_items',
  SheetProgress: 'sheet_progress',
  ActivityLog: 'activity_logs',
  RevisionQueue: 'revision_queue',
  UserBadge: 'user_badges',
  CommunityPost: 'community_posts',
  PostLike: 'post_likes',
  PostReply: 'post_replies',
  StudyGroup: 'study_groups',
  GroupMember: 'group_members',
  GroupMessage: 'group_messages',
  ContestReminder: 'contest_reminders',
};

const modelRegistry = new Map<string, mongoose.Model<any>>();
let connectPromise: Promise<typeof mongoose> | null = null;

export async function connectMongo() {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!connectPromise) {
    mongoose.set('strictQuery', false);
    connectPromise = mongoose.connect(MONGODB_URI, { dbName: process.env.MONGODB_DB });
  }
  return connectPromise;
}

function getModel(modelName: string) {
  const collectionName = collectionMap[modelName] || modelName.toLowerCase();
  if (!modelRegistry.has(modelName)) {
    const existing = mongoose.models[modelName] as mongoose.Model<any> | undefined;
    modelRegistry.set(modelName, existing || mongoose.model(modelName, genericSchema, collectionName));
  }
  return modelRegistry.get(modelName)!;
}

function clone<T>(value: T): T {
  return value === undefined ? value : structuredClone(value);
}

function toPlain<T extends Record<string, any>>(doc: T | null | undefined): T | null {
  if (!doc) return null;
  const plain: Record<string, any> = { ...doc };
  if (plain._id !== undefined && plain.id === undefined) plain.id = String(plain._id);
  delete plain._id;
  delete plain.__v;
  return plain as T;
}

function normalizeWhere(where: Record<string, any> = {}) {
  const normalized: Record<string, any> = clone(where) || {};
  for (const key of ['userId_problemId', 'userId_sheetId_problemId', 'userId_dateStr', 'groupId_userId', 'postId_userId']) {
    if (normalized[key]) {
      Object.assign(normalized, normalized[key]);
      delete normalized[key];
    }
  }
  return normalized;
}

const relationModelMap: Record<string, string> = {
  problem: 'Problem',
  user: 'User',
  note: 'Note',
  sheet: 'DSASheet',
  post: 'CommunityPost',
  group: 'StudyGroup',
  badges: 'UserBadge',
  tags: 'NoteTag',
  likes: 'PostLike',
  replies: 'PostReply',
  members: 'GroupMember',
  items: 'SheetItem',
};

function getRelationModelName(parentModel: string, relationKey: string) {
  if (relationModelMap[relationKey]) return relationModelMap[relationKey];
  // fallback: singularize simple plurals and capitalize
  let candidate = relationKey;
  if (candidate.endsWith('s')) candidate = candidate.slice(0, -1);
  return candidate[0]?.toUpperCase() + candidate.slice(1);
}

function matchScalar(value: any, condition: any): boolean {
  if (condition && typeof condition === 'object' && !Array.isArray(condition) && !(condition instanceof Date)) {
    if ('equals' in condition) return matchScalar(value, condition.equals);
    if ('contains' in condition) {
      const haystack = String(value ?? '');
      const needle = String(condition.contains ?? '');
      return condition.mode === 'insensitive'
        ? haystack.toLowerCase().includes(needle.toLowerCase())
        : haystack.includes(needle);
    }
    if ('in' in condition) return Array.isArray(condition.in) ? condition.in.includes(value) : false;
    if ('gt' in condition) return value > condition.gt;
    if ('gte' in condition) return value >= condition.gte;
    if ('lt' in condition) return value < condition.lt;
    if ('lte' in condition) return value <= condition.lte;
    return Object.keys(condition).length === 0;
  }
  return value === condition;
}

async function getRelatedDoc(modelName: string, doc: any, relationKey: string) {
  if (relationKey === 'problem' && doc.problemId) return mongoDb.problem.findUnique({ where: { id: doc.problemId } });
  if (relationKey === 'user' && doc.userId) return mongoDb.user.findUnique({ where: { id: doc.userId } });
  if (relationKey === 'note' && doc.noteId) return mongoDb.note.findUnique({ where: { id: doc.noteId } });
  if (relationKey === 'sheet' && doc.sheetId) return mongoDb.dSASheet.findUnique({ where: { id: doc.sheetId } });
  if (relationKey === 'post' && doc.postId) return mongoDb.communityPost.findUnique({ where: { id: doc.postId } });
  if (relationKey === 'group' && doc.groupId) return mongoDb.studyGroup.findUnique({ where: { id: doc.groupId } });
  if (modelName === 'User' && relationKey === 'badges') return mongoDb.userBadge.findMany({ where: { userId: doc.id } });
  if (modelName === 'Note' && relationKey === 'tags') return mongoDb.noteTag.findMany({ where: { noteId: doc.id } });
  if (modelName === 'CommunityPost' && relationKey === '_count') {
    return {
      likes: await mongoDb.postLike.count({ where: { postId: doc.id } }),
      replies: await mongoDb.postReply.count({ where: { postId: doc.id } }),
    };
  }
  if (modelName === 'StudyGroup' && relationKey === '_count') {
    return { members: await mongoDb.groupMember.count({ where: { groupId: doc.id } }) };
  }
  if (modelName === 'User' && relationKey === 'contestReminders') return mongoDb.contestReminder.findMany({ where: { userId: doc.id } });
  if (modelName === 'DSASheet' && relationKey === '_count') {
    return { items: await mongoDb.sheetItem.count({ where: { sheetId: doc.id } }) };
  }
  if (modelName === 'Submission' && relationKey === 'problem' && doc.problemId) return mongoDb.problem.findUnique({ where: { id: doc.problemId } });
  if (modelName === 'SheetItem' && relationKey === 'problem' && doc.problemId) return mongoDb.problem.findUnique({ where: { id: doc.problemId } });
  if (modelName === 'UserProblemStatus' && relationKey === 'problem' && doc.problemId) return mongoDb.problem.findUnique({ where: { id: doc.problemId } });
  return undefined;
}

async function matchesWhere(modelName: string, doc: any, where: Record<string, any> = {}): Promise<boolean> {
  const normalized = normalizeWhere(where);
  const entries = Object.entries(normalized);
  if (entries.length === 0) return true;

  for (const [key, condition] of entries) {
    if (key === 'OR' && Array.isArray(condition)) {
      if (!(await Promise.all(condition.map((item: any) => matchesWhere(modelName, doc, item)))).some(Boolean)) return false;
      continue;
    }
    if (key === 'AND' && Array.isArray(condition)) {
      if (!(await Promise.all(condition.map((item: any) => matchesWhere(modelName, doc, item)))).every(Boolean)) return false;
      continue;
    }

    if (condition && typeof condition === 'object' && !Array.isArray(condition) && !(condition instanceof Date) && !('equals' in condition) && !('contains' in condition) && !('in' in condition) && !('gt' in condition) && !('gte' in condition) && !('lt' in condition) && !('lte' in condition)) {
      const related = await getRelatedDoc(modelName, doc, key);
      if (related === undefined) {
        const docValue = doc[key] !== undefined ? doc[key] : (doc._id ? String(doc._id) : undefined);
        if (!matchScalar(docValue, condition)) return false;
      } else if (related === null) {
        return false;
      } else {
        const childModel = getRelationModelName(modelName, key);
        if (!(await matchesWhere(childModel, related, condition))) return false;
      }
      continue;
    }

    const docValue = doc[key] !== undefined ? doc[key] : (doc._id ? String(doc._id) : undefined);
    if (!matchScalar(docValue, condition)) return false;
  }

  return true;
}

function compareValues(a: any, b: any) {
  if (a === b) return 0;
  if (a === undefined || a === null) return 1;
  if (b === undefined || b === null) return -1;
  return a < b ? -1 : 1;
}

function applyOrderBy(docs: any[], orderBy: any) {
  if (!orderBy) return docs;
  const orderList = Array.isArray(orderBy) ? orderBy : [orderBy];
  return [...docs].sort((left, right) => {
    for (const order of orderList) {
      for (const [field, direction] of Object.entries(order)) {
        const comparison = compareValues(left[field], right[field]);
        if (comparison !== 0) return direction === 'desc' ? -comparison : comparison;
      }
    }
    return 0;
  });
}

function applySkipTake(docs: any[], skip?: number, take?: number) {
  const start = skip || 0;
  if (take === undefined) return docs.slice(start);
  return docs.slice(start, start + take);
}

async function projectDoc(modelName: string, doc: any, options: { select?: any; include?: any } = {}) {
  const plain = toPlain(clone(doc));
  if (!plain) return null;

  if (options.select) {
    const result: Record<string, any> = {};
    for (const [key, enabled] of Object.entries(options.select)) {
      if (!enabled) continue;
      if (enabled === true) {
        if (plain[key] !== undefined) result[key] = clone(plain[key]);
        continue;
      }
      const related = await getRelatedDoc(modelName, plain, key);
      if (related === undefined) continue;
      if (Array.isArray(related)) {
        const childModel = getRelationModelName(modelName, key);
        result[key] = await Promise.all(related.map(item => projectDoc(childModel, item, enabled as any)));
      } else if (related && typeof related === 'object' && key === '_count') {
        result[key] = related;
      } else {
        const childModel = getRelationModelName(modelName, key);
        result[key] = await projectDoc(childModel, related, enabled as any);
      }
    }
    return result;
  }

  const result: Record<string, any> = { ...plain };
  if (options.include) {
    for (const [key, enabled] of Object.entries(options.include)) {
      if (!enabled) continue;
      const related = await getRelatedDoc(modelName, plain, key);
      if (related === undefined) continue;
      const childModel = getRelationModelName(modelName, key);
      if (Array.isArray(related)) {
        result[key] = await Promise.all(related.map(item => projectDoc(childModel, item, {})));
      } else if (related && typeof related === 'object' && key === '_count') {
        result[key] = related;
      } else {
        result[key] = await projectDoc(childModel, related, {});
      }
    }
  }
  return result;
}

async function findMany(modelName: string, params: any = {}) {
  const collection = getModel(modelName);
  const rawDocs = (await collection.find({}).lean()) as any[];
  const filtered = [] as any[];
  for (const doc of rawDocs) {
    if (await matchesWhere(modelName, doc, params.where || {})) filtered.push(doc);
  }
  const ordered = applyOrderBy(filtered, params.orderBy);
  const paged = applySkipTake(ordered, params.skip, params.take);
  const projected = await Promise.all(paged.map(doc => projectDoc(modelName, doc, params)));
  return projected.filter(Boolean);
}

async function findFirst(modelName: string, params: any = {}) {
  const [first] = await findMany(modelName, { ...params, take: 1 });
  return first || null;
}

async function findUnique(modelName: string, params: any = {}) {
  return findFirst(modelName, params);
}

function mergeData(target: any, data: any) {
  const merged = { ...target };
  for (const [key, value] of Object.entries(data || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value) && 'increment' in value) {
      merged[key] = Number(merged[key] || 0) + Number((value as any).increment || 0);
    } else {
      merged[key] = value;
    }
  }
  return merged;
}

async function create(modelName: string, params: any = {}) {
  const collection = getModel(modelName);
  const data = clone(params.data || {});
  const relationPayload = { ...data };
  delete relationPayload.tags;
  delete relationPayload.members;
  if (!relationPayload.id) relationPayload.id = randomUUID();
  const created = await collection.create(relationPayload);
  const plain = toPlain(created.toObject())!;

  if (modelName === 'Note' && Array.isArray(data.tags?.create)) {
    for (const tag of data.tags.create) {
      await mongoDb.noteTag.create({ data: { noteId: plain.id, tag: tag.tag } });
    }
  }

  if (modelName === 'StudyGroup' && data.members?.create) {
    const members = Array.isArray(data.members.create) ? data.members.create : [data.members.create];
    for (const item of members) {
      await mongoDb.groupMember.create({ data: { groupId: plain.id, userId: item.userId, role: item.role || 'member' } });
    }
  }

  return params.include ? projectDoc(modelName, plain, { include: params.include }) : plain;
}

async function update(modelName: string, params: any = {}) {
  const collection = getModel(modelName);
  const doc = await findFirst(modelName, { where: params.where });
  if (!doc) throw new Error(`${modelName} not found`);

  const data = clone(params.data || {});
  if (modelName === 'Note' && data.tags?.create) {
    await mongoDb.noteTag.deleteMany({ where: { noteId: doc.id } });
  }
  const merged = mergeData(doc, data);
  delete merged.tags;
  delete merged.members;
  await collection.updateOne({ id: doc.id }, { $set: merged });

  if (modelName === 'Note' && Array.isArray(data.tags?.create)) {
    for (const tag of data.tags.create) {
      await mongoDb.noteTag.create({ data: { noteId: doc.id, tag: tag.tag } });
    }
  }

  const updated = await findUnique(modelName, { where: { id: doc.id } });
  return params.include ? projectDoc(modelName, updated, { include: params.include }) : updated;
}

async function updateMany(modelName: string, params: any = {}) {
  const docs = await findMany(modelName, { where: params.where });
  let count = 0;
  for (const doc of docs) {
    if (!doc) continue;
    await update(modelName, { where: { id: doc.id }, data: params.data });
    count += 1;
  }
  return { count };
}

async function deleteOne(modelName: string, params: any = {}) {
  const collection = getModel(modelName);
  const doc = await findFirst(modelName, { where: params.where });
  if (!doc) return null;

  if (modelName === 'User') {
    await Promise.all([
      mongoDb.note.deleteMany({ where: { userId: doc.id } }),
      mongoDb.submission.deleteMany({ where: { userId: doc.id } }),
      mongoDb.sheetProgress.deleteMany({ where: { userId: doc.id } }),
      mongoDb.userProblemStatus.deleteMany({ where: { userId: doc.id } }),
      mongoDb.userBadge.deleteMany({ where: { userId: doc.id } }),
      mongoDb.communityPost.deleteMany({ where: { userId: doc.id } }),
      mongoDb.postLike.deleteMany({ where: { userId: doc.id } }),
      mongoDb.groupMember.deleteMany({ where: { userId: doc.id } }),
      mongoDb.contestReminder.deleteMany({ where: { userId: doc.id } }),
      mongoDb.activityLog.deleteMany({ where: { userId: doc.id } }),
      mongoDb.otpCode.deleteMany({ where: { userId: doc.id } }),
      mongoDb.problemBookmark.deleteMany({ where: { userId: doc.id } }),
      mongoDb.revisionQueue.deleteMany({ where: { userId: doc.id } }),
    ]);
  }

  if (modelName === 'Note') {
    await mongoDb.noteTag.deleteMany({ where: { noteId: doc.id } });
  }

  await collection.deleteOne({ id: doc.id });
  return doc;
}

async function deleteMany(modelName: string, params: any = {}) {
  const docs = await findMany(modelName, { where: params.where });
  for (const doc of docs) {
    if (!doc) continue;
    await deleteOne(modelName, { where: { id: doc.id } });
  }
  return { count: docs.length };
}

async function count(modelName: string, params: any = {}) {
  return (await findMany(modelName, params)).length;
}

async function upsert(modelName: string, params: any = {}) {
  const existing = await findUnique(modelName, { where: params.where });
  if (existing) return update(modelName, { where: { id: existing.id }, data: params.update, include: params.include });
  return create(modelName, { data: { ...(params.create || {}), ...(params.where || {}) }, include: params.include });
}

async function groupBy(modelName: string, params: any = {}) {
  const docs = await findMany(modelName, { where: params.where });
  const by = Array.isArray(params.by) ? params.by : [];
  const grouped = new Map<string, any>();
  for (const doc of docs) {
    if (!doc) continue;
    const key = by.map((field: string) => String(doc[field])).join('::');
    if (!grouped.has(key)) {
      const base: Record<string, any> = {};
      by.forEach((field: string) => { base[field] = doc[field]; });
      base._count = 0;
      grouped.set(key, base);
    }
    grouped.get(key)!._count += 1;
  }
  return [...grouped.values()];
}

function modelApi(modelName: string) {
  return {
    findMany: (params?: any) => findMany(modelName, params),
    findUnique: (params?: any) => findUnique(modelName, params),
    findFirst: (params?: any) => findFirst(modelName, params),
    create: (params?: any) => create(modelName, params),
    update: (params?: any) => update(modelName, params),
    updateMany: (params?: any) => updateMany(modelName, params),
    delete: (params?: any) => deleteOne(modelName, params),
    deleteMany: (params?: any) => deleteMany(modelName, params),
    count: (params?: any) => count(modelName, params),
    upsert: (params?: any) => upsert(modelName, params),
    groupBy: (params?: any) => groupBy(modelName, params),
  };
}

export const mongoDb = {
  user: modelApi('User'),
  otpCode: modelApi('OtpCode'),
  problem: modelApi('Problem'),
  userProblemStatus: modelApi('UserProblemStatus'),
  problemBookmark: modelApi('ProblemBookmark'),
  submission: modelApi('Submission'),
  note: modelApi('Note'),
  noteTag: modelApi('NoteTag'),
  dSASheet: modelApi('DSASheet'),
  sheetItem: modelApi('SheetItem'),
  sheetProgress: modelApi('SheetProgress'),
  activityLog: modelApi('ActivityLog'),
  revisionQueue: modelApi('RevisionQueue'),
  userBadge: modelApi('UserBadge'),
  communityPost: modelApi('CommunityPost'),
  postLike: modelApi('PostLike'),
  postReply: modelApi('PostReply'),
  studyGroup: modelApi('StudyGroup'),
  groupMember: modelApi('GroupMember'),
  groupMessage: modelApi('GroupMessage'),
  contestReminder: modelApi('ContestReminder'),
  $disconnect: async () => mongoose.disconnect(),
};
