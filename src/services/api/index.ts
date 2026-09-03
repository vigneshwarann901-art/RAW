export type ApiResult<T> = { data: T | null; error: string | null };

export async function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
