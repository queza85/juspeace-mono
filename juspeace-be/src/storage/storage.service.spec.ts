import {
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import type { IBlobStorage } from './blob-storage.interface';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);

describe('StorageService', () => {
  let blobs: jest.Mocked<IBlobStorage>;
  let service: StorageService;

  beforeEach(() => {
    blobs = {
      isConfigured: jest.fn().mockReturnValue(true),
      upload: jest.fn().mockResolvedValue(undefined),
      download: jest.fn().mockResolvedValue(PNG),
    };
    service = new StorageService(blobs);
  });

  it('stores an image under images/{uuid}.ext', async () => {
    const uploaded = await service.uploadImage({
      originalname: 'hero.png',
      buffer: PNG,
    });

    expect(uploaded.path).toMatch(/^images\/[0-9a-f-]{36}\.png$/);
    expect(uploaded.url).toBe(
      `/files?fileName=${encodeURIComponent(uploaded.path)}`,
    );
    expect(blobs.upload.mock.calls[0]).toEqual([
      uploaded.path,
      PNG,
      'image/png',
    ]);
  });

  it('rejects a file whose bytes do not match the extension', async () => {
    await expect(
      service.uploadImage({
        originalname: 'hero.png',
        buffer: Buffer.from('not-a-png'),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(blobs.upload.mock.calls).toHaveLength(0);
  });

  it('rejects path traversal on download', async () => {
    await expect(service.readImage('../secrets.png')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(blobs.download.mock.calls).toHaveLength(0);
  });

  it('returns not found when the blob is missing', async () => {
    blobs.download.mockResolvedValue(null);
    await expect(
      service.readImage('images/00000000-0000-4000-8000-000000000000.png'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('refuses uploads until Azure is configured', async () => {
    blobs.isConfigured.mockReturnValue(false);
    await expect(
      service.uploadImage({ originalname: 'hero.png', buffer: PNG }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
