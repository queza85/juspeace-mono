const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'] as const;

export type ImageExtension = (typeof IMAGE_EXTENSIONS)[number];

const STORED_IMAGE_PATH =
  /^images\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|jpeg|png|gif|webp)$/i;

export function isStoredImagePath(value: string): boolean {
  return STORED_IMAGE_PATH.test(value);
}

export function extensionOf(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? '';
  const dot = base.lastIndexOf('.');
  if (dot <= 0 || dot === base.length - 1) {
    return '';
  }
  return base.slice(dot + 1).toLowerCase();
}

export function isImageExtension(value: string): value is ImageExtension {
  return (IMAGE_EXTENSIONS as readonly string[]).includes(value);
}

export function contentTypeForExtension(extension: ImageExtension): string {
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default: {
      const unknown: never = extension;
      return unknown;
    }
  }
}

export function matchesImageSignature(
  bytes: Buffer,
  extension: ImageExtension,
): boolean {
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return (
        bytes.length >= 3 &&
        bytes[0] === 0xff &&
        bytes[1] === 0xd8 &&
        bytes[2] === 0xff
      );
    case 'png':
      return (
        bytes.length >= 8 &&
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47 &&
        bytes[4] === 0x0d &&
        bytes[5] === 0x0a &&
        bytes[6] === 0x1a &&
        bytes[7] === 0x0a
      );
    case 'gif':
      return (
        bytes.length >= 4 &&
        bytes[0] === 0x47 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x38
      );
    case 'webp':
      return (
        bytes.length >= 12 &&
        bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
        bytes.subarray(8, 12).toString('ascii') === 'WEBP'
      );
    default: {
      const unknown: never = extension;
      return unknown;
    }
  }
}

/** AccountName from a connection string, with the tail hidden. */
export function maskStorageAccount(connectionString: string): string {
  const match = /AccountName=([^;]+)/i.exec(connectionString);
  const name = match?.[1] ?? '';
  if (name.length <= 2) {
    return 'unknown';
  }
  return `${name.slice(0, 2)}***`;
}
