import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BLOB_STORAGE, type IBlobStorage } from './blob-storage.interface';
import {
  contentTypeForExtension,
  extensionOf,
  isImageExtension,
  isStoredImagePath,
  matchesImageSignature,
} from './image-file';

const MAX_FILENAME_LENGTH = 255;

export interface UploadedImage {
  path: string;
  url: string;
  contentType: string;
}

@Injectable()
export class StorageService {
  constructor(
    @Inject(BLOB_STORAGE)
    private readonly blobStorage: IBlobStorage,
  ) {}

  async uploadImage(file: {
    originalname: string;
    buffer: Buffer;
  }): Promise<UploadedImage> {
    this.assertConfigured();
    const extension = this.validatedExtension(file.originalname, file.buffer);
    const contentType = contentTypeForExtension(extension);
    const path = `images/${randomUUID()}.${extension}`;
    await this.blobStorage.upload(path, file.buffer, contentType);
    return {
      path,
      url: `/files?fileName=${encodeURIComponent(path)}`,
      contentType,
    };
  }

  async readImage(
    fileName: string,
  ): Promise<{ bytes: Buffer; contentType: string }> {
    this.assertConfigured();
    if (!isStoredImagePath(fileName)) {
      throw new BadRequestException('FILE_PATH_INVALID');
    }
    const bytes = await this.blobStorage.download(fileName);
    if (!bytes) {
      throw new NotFoundException('FILE_NOT_FOUND');
    }
    const extension = extensionOf(fileName);
    if (!isImageExtension(extension)) {
      throw new BadRequestException('FILE_PATH_INVALID');
    }
    return { bytes, contentType: contentTypeForExtension(extension) };
  }

  private assertConfigured() {
    if (!this.blobStorage.isConfigured()) {
      throw new ServiceUnavailableException('STORAGE_NOT_CONFIGURED');
    }
  }

  private validatedExtension(originalName: string, bytes: Buffer) {
    const trimmed = originalName.trim();
    if (!trimmed || trimmed.length > MAX_FILENAME_LENGTH) {
      throw new BadRequestException('FILE_NAME_INVALID');
    }
    const extension = extensionOf(trimmed);
    if (
      !isImageExtension(extension) ||
      !matchesImageSignature(bytes, extension)
    ) {
      throw new BadRequestException('FILE_TYPE_NOT_ALLOWED');
    }
    return extension;
  }
}
