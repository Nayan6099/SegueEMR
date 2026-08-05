export const logError = (context: string, error: unknown, meta?: Record<string, any>) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[${context}]`, message, meta ?? '', error instanceof Error ? error.stack : '');
};
