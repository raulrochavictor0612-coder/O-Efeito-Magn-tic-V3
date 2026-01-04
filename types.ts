
export type ResourceType = 'PDF' | 'Áudio' | 'Link';
export type DeliveryMode = 'download' | 'viewer';

export interface Deliverable {
  id: string;
  title: string;
  type: ResourceType;
  fileBase64?: string;
  externalLink?: string;
  deliveryMode?: DeliveryMode;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  lockDays: number;
  isManualLock: boolean;
  checkoutUrl?: string;
  unlockKey?: string;
  previewCta?: string;
  previewButtonLabel?: string;
  coverBase64: string;
  fileBase64?: string;
  externalLink?: string;
  deliveryMode?: DeliveryMode; // Modo de entrega preferencial
  deliverables?: Deliverable[];
  createdAt: number;
  module?: string; 
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'user';
  joinedAt: number;
  magneticPower: number;
}

export enum ViewMode {
  LIBRARY = 'LIBRARY',
  ADMIN = 'ADMIN',
  PROFILE = 'PROFILE'
}
