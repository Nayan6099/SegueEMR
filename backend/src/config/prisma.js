/**
 * Prisma Client singleton.
 *
 * Production behaviour: real PrismaClient only. If the DB is unavailable,
 * the error propagates to the controller which returns a proper error response.
 * We do NOT silently fall back to an in-memory mock — that would discard patient data.
 *
 * Test behaviour: if NODE_ENV=test and SKIP_REAL_DB=true, uses the in-memory mock.
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test' && process.env.SKIP_REAL_DB === 'true';

// ─── In-memory mock (test-only) ───────────────────────────────────────────────
function makeMockModel(name) {
  const store = [];
  return {
    create: async ({ data }) => {
      const item = {
        id: data.id || require('crypto').randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      if (data.medications?.create) {
        item.medications = data.medications.create.map(m => ({ id: require('crypto').randomUUID(), ...m }));
      }
      if (data.items?.create) {
        item.items = data.items.create.map(i => ({ id: require('crypto').randomUUID(), ...i }));
      }
      store.push(item);
      return item;
    },
    findUnique: async ({ where }) => {
      const [key, val] = Object.entries(where)[0];
      return store.find(item => item[key] === val) || null;
    },
    findFirst: async ({ where = {} } = {}) => {
      let result = [...store];
      for (const [key, filterVal] of Object.entries(where)) {
        if (filterVal?.OR) {
          result = result.filter(item => filterVal.OR.some(cond => {
            const [k, v] = Object.entries(cond)[0];
            return item[k] === v;
          }));
        } else {
          result = result.filter(item => item[key] === filterVal);
        }
      }
      return result[0] || null;
    },
    findMany: async ({ where = {}, orderBy, take, skip } = {}) => {
      let result = [...store];
      for (const [key, filterVal] of Object.entries(where)) {
        if (filterVal && typeof filterVal === 'object') {
          if (filterVal.contains) {
            result = result.filter(item => String(item[key] || '').toLowerCase().includes(filterVal.contains.toLowerCase()));
          } else if (filterVal.in) {
            result = result.filter(item => filterVal.in.includes(item[key]));
          } else if (filterVal.gte || filterVal.lte) {
            if (filterVal.gte) result = result.filter(item => new Date(item[key]) >= new Date(filterVal.gte));
            if (filterVal.lte) result = result.filter(item => new Date(item[key]) <= new Date(filterVal.lte));
          }
        } else if (filterVal !== undefined) {
          result = result.filter(item => item[key] === filterVal);
        }
      }
      if (take !== undefined) {
        const start = skip || 0;
        result = result.slice(start, start + take);
      }
      return result;
    },
    update: async ({ where, data }) => {
      const [key, val] = Object.entries(where)[0];
      const index = store.findIndex(item => item[key] === val);
      if (index === -1) throw new Error(`[Mock] ${name} record not found for update`);
      store[index] = { ...store[index], ...data, updatedAt: new Date() };
      return store[index];
    },
    upsert: async ({ where, update, create }) => {
      const [key, val] = Object.entries(where)[0];
      const index = store.findIndex(item => item[key] === val);
      if (index !== -1) {
        store[index] = { ...store[index], ...update, updatedAt: new Date() };
        return store[index];
      }
      const item = { id: require('crypto').randomUUID(), ...create, createdAt: new Date(), updatedAt: new Date() };
      store.push(item);
      return item;
    },
    delete: async ({ where }) => {
      const [key, val] = Object.entries(where)[0];
      const index = store.findIndex(item => item[key] === val);
      if (index === -1) throw new Error(`[Mock] ${name} record not found for delete`);
      const [deleted] = store.splice(index, 1);
      return deleted;
    },
    count: async ({ where = {} } = {}) => {
      let result = [...store];
      for (const [key, filterVal] of Object.entries(where)) {
        if (filterVal !== undefined) result = result.filter(item => item[key] === filterVal);
      }
      return result.length;
    },
    groupBy:   async () => [],
    aggregate: async () => ({ _sum: { totalAmount: 0 } }),
  };
}

const mockPrisma = {
  setting:      makeMockModel('Setting'),
  medicine:     makeMockModel('Medicine'),
  eHRMetadata:  makeMockModel('EHRMetadata'),
  activityLog:  makeMockModel('ActivityLog'),
  appointment:  makeMockModel('Appointment'),
  prescription: makeMockModel('Prescription'),
  medication:   makeMockModel('Medication'),
  labOrder:     makeMockModel('LabOrder'),
  invoice:      makeMockModel('Invoice'),
  lineItem:     makeMockModel('LineItem'),
  clinicalNote: makeMockModel('ClinicalNote'),
  vitals:       makeMockModel('Vitals'),
  user:         makeMockModel('User'),
  patient:      makeMockModel('Patient'),
  doctor:       makeMockModel('Doctor'),
  notification: makeMockModel('Notification'),
  $queryRaw:    async () => [{ 1: 1 }],
  $transaction: async (fn) => fn(mockPrisma),
};

// ─── Export ───────────────────────────────────────────────────────────────────
if (isTest) {
  module.exports = mockPrisma;
} else {
  // Production / Development: use real PrismaClient
  // Any connection failure propagates naturally — we do NOT silently swallow it.
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? [{ emit: 'event', level: 'query' }, 'warn', 'error']
      : ['warn', 'error'],
  });

  module.exports = prisma;
}
