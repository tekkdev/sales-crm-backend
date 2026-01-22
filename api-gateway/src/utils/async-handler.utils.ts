// utils/async-handler.util.ts
import { Logger } from '@nestjs/common';

// Alternative with custom success/error messages
export async function handleAsyncWithMessages<T>(
  operation: () => Promise<T>,
  logger: Logger,
  successMessage: string,
  errorMessage: string,
): Promise<T | null> {
  try {
    const result = await operation();
    logger.log(successMessage);
    return result;
  } catch (error) {
    logger.error(errorMessage, error);
    return null;
  }
}
