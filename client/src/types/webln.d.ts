// WebLN Types

export interface RequestInvoiceArgs {
  amount?: number | string;
  defaultAmount?: number;
  minimumAmount?: number;
  maximumAmount?: number;
  defaultMemo?: string;
}

export interface KeysendArgs {
  destination: string;
  amount: number | string;
  customRecords?: {
    [key: string]: string;
  };
}

export interface SendPaymentResponse {
  preimage: string;
}

export interface MakeInvoiceResponse {
  paymentRequest: string;
}

export interface GetInfoResponse {
  alias?: string;
  pubkey?: string;
  color?: string;
  network?: string;
  chains?: string[];
  version?: string;
  blockHeight?: number;
  blockHash?: string;
  routes?: Array<{
    pubkey: string;
    alias?: string;
    color?: string;
  }>;
  numPeers?: number;
  syncedToChain?: boolean;
  nodeUri?: string;
}

export interface WebLNProvider {
  enable: () => Promise<void>;
  getInfo: () => Promise<GetInfoResponse>;
  sendPayment: (paymentRequest: string) => Promise<SendPaymentResponse>;
  makeInvoice: (args: RequestInvoiceArgs) => Promise<MakeInvoiceResponse>;
  keysend: (args: KeysendArgs) => Promise<SendPaymentResponse>;
  signMessage: (message: string) => Promise<{ signature: string; message: string }>;
  verifyMessage: (signature: string, message: string) => Promise<{ valid: boolean }>;
  isEnabled?: boolean;
}

declare global {
  interface Window {
    webln?: WebLNProvider;
  }
}
