import { maskStorageAccount, matchesImageSignature } from './image-file';

describe('image-file', () => {
  it('masks the storage account name', () => {
    expect(
      maskStorageAccount(
        'DefaultEndpointsProtocol=https;AccountName=stjuspeacedev;AccountKey=secret',
      ),
    ).toBe('st***');
  });

  it('accepts a png signature', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(matchesImageSignature(png, 'png')).toBe(true);
    expect(matchesImageSignature(png, 'jpg')).toBe(false);
  });
});
