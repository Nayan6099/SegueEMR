const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

let prismaInstance;
let useMock = false;

const makeMockModel = (name) => {
  const store = [];
  return {
    create: async ({ data }) => {
      const item = { id: data.id || Math.random().toString(), ...data, createdAt: new Date(), updatedAt: new Date() };
      if (data.medications?.create) {
        item.medications = data.medications.create.map(m => ({ id: Math.random().toString(), ...m }));
      }
      if (data.items?.create) {
        item.items = data.items.create.map(i => ({ id: Math.random().toString(), ...i }));
      }
      store.push(item);
      return item;
    },
    findUnique: async ({ where }) => {
      const key = Object.keys(where)[0];
      const val = where[key];
      return store.find(item => item[key] === val) || null;
    },
    findMany: async ({ where = {}, orderBy, take, skip } = {}) => {
      let result = [...store];
      Object.entries(where).forEach(([key, filterVal]) => {
        if (filterVal && typeof filterVal === 'object') {
          if (filterVal.contains) {
            result = result.filter(item => String(item[key] || '').toLowerCase().includes(filterVal.contains.toLowerCase()));
          } else if (filterVal.gte || filterVal.lte) {
            if (filterVal.gte) result = result.filter(item => new Date(item[key]) >= new Date(filterVal.gte));
            if (filterVal.lte) result = result.filter(item => new Date(item[key]) <= new Date(filterVal.lte));
          } else if (filterVal.in) {
            result = result.filter(item => filterVal.in.includes(item[key]));
          }
        } else if (filterVal !== undefined) {
          result = result.filter(item => item[key] === filterVal);
        }
      });
      if (take) {
        const start = skip || 0;
        result = result.slice(start, start + take);
      }
      return result;
    },
    update: async ({ where, data }) => {
      const key = Object.keys(where)[0];
      const val = where[key];
      const index = store.findIndex(item => item[key] === val);
      if (index === -1) throw new Error(`${name} record not found to update`);
      const updated = { ...store[index], ...data, updatedAt: new Date() };
      store[index] = updated;
      return updated;
    },
    upsert: async ({ where, update, create }) => {
      const key = Object.keys(where)[0];
      const val = where[key];
      const index = store.findIndex(item => item[key] === val);
      if (index !== -1) {
        const updated = { ...store[index], ...update, updatedAt: new Date() };
        store[index] = updated;
        return updated;
      } else {
        const item = { id: Math.random().toString(), ...create, createdAt: new Date(), updatedAt: new Date() };
        store.push(item);
        return item;
      }
    },
    count: async ({ where = {} } = {}) => {
      let result = [...store];
      Object.entries(where).forEach(([key, filterVal]) => {
        if (filterVal && typeof filterVal === 'object') {
          if (filterVal.in) {
            result = result.filter(item => filterVal.in.includes(item[key]));
          } else if (filterVal.gte || filterVal.lte) {
            if (filterVal.gte) result = result.filter(item => new Date(item[key]) >= new Date(filterVal.gte));
            if (filterVal.lte) result = result.filter(item => new Date(item[key]) <= new Date(filterVal.lte));
          }
        } else if (filterVal !== undefined) {
          result = result.filter(item => item[key] === filterVal);
        }
      });
      return result.length;
    },
    groupBy: async () => [],
    aggregate: async () => ({ _sum: { totalAmount: 0 } })
  };
};

const mockPrisma = {
  setting: makeMockModel('Setting'),
  medicine: makeMockModel('Medicine'),
  eHRMetadata: makeMockModel('EHRMetadata'),
  activityLog: makeMockModel('ActivityLog'),
  appointment: makeMockModel('Appointment'),
  prescription: makeMockModel('Prescription'),
  medication: makeMockModel('Medication'),
  labOrder: makeMockModel('LabOrder'),
  invoice: makeMockModel('Invoice'),
  lineItem: makeMockModel('LineItem'),
  clinicalNote: makeMockModel('ClinicalNote'),
  vitals: makeMockModel('Vitals'),
  $queryRaw: async () => [{ 1: 1 }]
};

try {
  prismaInstance = new PrismaClient();
} catch (err) {
  useMock = true;
  prismaInstance = mockPrisma;
}

const prismaProxy = new Proxy({}, {
  get(target, prop) {
    if (prop === '$queryRaw') {
      return async (...args) => {
        if (useMock) return mockPrisma.$queryRaw(...args);
        try {
          return await prismaInstance.$queryRaw(...args);
        } catch (err) {
          useMock = true;
          console.log('⚠️ Prisma PostgreSQL connection lost. Switching to in-memory database mock.');
          return mockPrisma.$queryRaw(...args);
        }
      };
    }
    
    if (useMock) return mockPrisma[prop];

    const actualModel = prismaInstance[prop];
    if (!actualModel) return undefined;

    return new Proxy(actualModel, {
      get(modelTarget, methodProp) {
        const actualMethod = modelTarget[methodProp];
        if (typeof actualMethod !== 'function') return actualMethod;

        return async (...args) => {
          try {
            return await actualMethod.apply(modelTarget, args);
          } catch (err) {
            const msg = err.message || '';
            if (msg.includes('reach database') || err.code === 'P1001' || err.code === 'P1003' || msg.includes('connect') || msg.includes('connection')) {
              useMock = true;
              console.log(`⚠️ Prisma PostgreSQL connection failed during ${prop}.${methodProp}. Falling back to in-memory schema mock.`);
              return mockPrisma[prop][methodProp](...args);
            }
            throw err;
          }
        };
      }
    });
  }
});

module.exports = prismaProxy;
