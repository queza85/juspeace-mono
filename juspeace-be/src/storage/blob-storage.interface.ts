export const BLOB_STORAGE = Symbol('BLOB_STORAGE');

export interface IBlobStorage {
  isConfigured(): boolean;
  upload(path: string, bytes: Buffer, contentType: string): Promise<void>;
  download(path: string): Promise<Buffer | null>;
}
