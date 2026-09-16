import { SetMetadata } from '@nestjs/common';

export const API_MESSAGE_KEY = 'apiMessage';

/** Sets the SCREAMING_SNAKE_CASE success message for an endpoint. */
export const ApiMessage = (message: string) =>
  SetMetadata(API_MESSAGE_KEY, message);
