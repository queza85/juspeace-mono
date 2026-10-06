import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobServiceClient } from '@azure/storage-blob';
import type { IBlobStorage } from './blob-storage.interface';
import { maskStorageAccount } from './image-file';

@Injectable()
export class AzureBlobStorage implements IBlobStorage, OnModuleInit {
  private readonly logger = new Logger(AzureBlobStorage.name);
  private readonly connectionString: string;
  private readonly containerName: string;
  private containerReady: Promise<void> | null = null;

  constructor(configService: ConfigService) {
    this.connectionString =
      configService.get<string>('storage.connectionString') ?? '';
    this.containerName =
      configService.get<string>('storage.containerName') ?? '';
  }

  onModuleInit() {
    if (!this.isConfigured()) {
      this.logger.log('Upload storage is not configured');
      return;
    }
    this.logger.log(
      `Upload storage: provider=azure container=${this.containerName} account=${maskStorageAccount(this.connectionString)}`,
    );
  }

  isConfigured(): boolean {
    return this.connectionString.length > 0 && this.containerName.length > 0;
  }

  async upload(
    path: string,
    bytes: Buffer,
    contentType: string,
  ): Promise<void> {
    await this.ensureContainer();
    const blob = this.container().getBlockBlobClient(path);
    await blob.uploadData(bytes, {
      blobHTTPHeaders: { blobContentType: contentType },
    });
    if (!(await blob.exists())) {
      this.logger.error(`Uploaded blob is missing: ${path}`);
      throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
    }
  }

  async download(path: string): Promise<Buffer | null> {
    await this.ensureContainer();
    const blob = this.container().getBlockBlobClient(path);
    if (!(await blob.exists())) {
      return null;
    }
    return blob.downloadToBuffer();
  }

  private container() {
    return BlobServiceClient.fromConnectionString(
      this.connectionString,
    ).getContainerClient(this.containerName);
  }

  private ensureContainer(): Promise<void> {
    if (!this.containerReady) {
      this.containerReady = this.container()
        .createIfNotExists()
        .then(() => undefined)
        .catch((error: unknown) => {
          this.containerReady = null;
          throw error;
        });
    }
    return this.containerReady;
  }
}
