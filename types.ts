
export type ResourceType = 'PDF' | 'Áudio' | 'Link';

export interface Deliverable {
  id: string;
  title: string;
  type: ResourceType;
  fileBase64?: string;
  externalLink?: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType; // Tipo principal para exibição de ícone
  lockDays: number;
  isManualLock: boolean;
  checkoutUrl?: string; // Link para Kirvano/Kiwify/etc
  unlockKey?: string;   // Chave que o cliente recebe após pagar
  previewCta?: string;  // Texto persuasivo para o Pop-up de prévia
  previewButtonLabel?: string; // Texto do botão no Pop-up (ex: "ADQUIRIR ACESSO AGORA")
  coverBase64: string;
  fileBase64?: string; // Legado (compatibilidade)
  externalLink?: string; // Legado (compatibilidade)
  deliverables?: Deliverable[]; // Nova lista de múltiplos arquivos/links
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
