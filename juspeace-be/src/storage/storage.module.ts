import { Module } from '@nestjs/common';
import { AzureBlobStorage } from './azure-blob.storage';
import { BLOB_STORAGE } from './blob-storage.interface';
import { AdminFilesController } from './controllers/admin-files.controller';
import { FilesController } from './controllers/files.controller';
import { StorageService } from './storage.service';

@Module({
  controllers: [FilesController, AdminFilesController],
  providers: [
    StorageService,
    {
      provide: BLOB_STORAGE,
      useClass: AzureBlobStorage,
    },
  ],
})
export class StorageModule {}
