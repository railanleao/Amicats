import type { CreateStockEntryRequest } from '../types/stock';
import type { Cat, CreateCatRequest } from '../types/cat';
import type { StoreOps } from './store';
import type { HttpRequest, OperationType } from './types';

export class UnresolvedReferenceError extends Error {
  constructor(public readonly reference: number) {
    super('Depende de um registro que não foi sincronizado.');
    this.name = 'UnresolvedReferenceError';
  }
}

export type IdResolver = (reference: number) => Promise<number>;

export interface OperationDefinition<P> {
  describe(payload: P): string;
  build(payload: P, resolveId: IdResolver): Promise<HttpRequest>;
  onSuccess?(payload: P, response: unknown, ops: StoreOps): Promise<void>;
  onDiscard?(payload: P, ops: StoreOps): Promise<void>;
}

export interface CreateCatPayload {
  localId: number;
  request: CreateCatRequest;
}

export interface UploadCatPhotoPayload {
  catId: number;
  catName: string;
  fileUri: string;
}


export interface CreateStockEntryPayload {
  itemName: string;
  request: CreateStockEntryRequest;
}

export interface PrescriptionMedicationRequest {
  medicationId: number | null;
  newMedicationName: string | null;
  newMedicationUnit: string | null;
  dosage: string;
  route: string;
  intervalHours: number;
  durationDays: number;
}

export interface PrescriptionRequest {
  title: string;
  notes: string | null;
  medication: PrescriptionMedicationRequest | null;
  recordedAt: string;
}

export interface CreateInternalPrescriptionPayload {
  catId: number;
  catName: string;
  request: PrescriptionRequest;
}

export interface OperationPayloads {
  CREATE_CAT: CreateCatPayload;
  UPLOAD_CAT_PHOTO: UploadCatPhotoPayload;
  CREATE_STOCK_ENTRY: CreateStockEntryPayload;
  CREATE_INTERNAL_PRESCRIPTION: CreateInternalPrescriptionPayload;
}

type Registry = { [K in OperationType]: OperationDefinition<OperationPayloads[K]> };

export const OPERATIONS: Registry = {
  CREATE_CAT: {
    describe: (payload) => `Novo gato — ${payload.request.name}`,
    build: async (payload) => ({ method: 'POST', path: '/cats', body: payload.request }),
    onSuccess: async (payload, response, ops) => {
      const cat = response as Cat;
      await ops.mapId(payload.localId, cat.id, 'cat');
      await ops.deleteEntity('cat', payload.localId);
      await ops.upsertEntity('cat', cat.id, cat);
    },
    onDiscard: async (payload, ops) => {
      await ops.deleteEntity('cat', payload.localId);
    },
  },

  UPLOAD_CAT_PHOTO: {
    describe: (payload) => `Nova foto — ${payload.catName}`,
    build: async (payload, resolveId) => ({
      method: 'PUT',
      path: `/cats/${await resolveId(payload.catId)}/photo`,
      multipart: {
        fieldName: 'file',
        uri: payload.fileUri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      },
    }),
    onSuccess: async (_payload, response, ops) => {
      const cat = response as Cat;
      await ops.upsertEntity('cat', cat.id, cat);
    },
  },

  CREATE_STOCK_ENTRY: {
    describe: (payload) => `Entrada de estoque — ${payload.itemName}`,
    build: async (payload, resolveId) => ({
      method: 'POST',
      path: '/stock/entries',
      body: {
        ...payload.request,
        stockItemId: await resolveId(payload.request.stockItemId),
      },
    }),
  },

  CREATE_INTERNAL_PRESCRIPTION: {
    describe: (payload) => `Prescrição — ${payload.catName}`,
    build: async (payload, resolveId) => ({
      method: 'POST',
      path: `/cats/${await resolveId(payload.catId)}/internal-medical-prescriptions`,
      body: payload.request,
    }),
  },
};

export function describeOperation(type: OperationType, payload: unknown): string {
  const definition = OPERATIONS[type] as OperationDefinition<unknown>;
  return definition.describe(payload);
}
