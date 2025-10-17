import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = process.env.BBD_DATA_DIR ?? path.join(process.cwd(), 'data');

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  await ensureDir();
  const filePath = path.join(DATA_DIR, filename);

  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await writeJsonFile(filename, fallback);
      return fallback;
    }

    console.error(`[data] Failed to read ${filename}`, error);
    return fallback;
  }
}

export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  await ensureDir();
  const filePath = path.join(DATA_DIR, filename);
  const serialized = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, serialized, 'utf-8');
}

export async function mutateJsonFile<T>(filename: string, mutator: (data: T) => T, fallback: T): Promise<T> {
  const current = await readJsonFile<T>(filename, fallback);
  const updated = mutator(current);
  await writeJsonFile(filename, updated);
  return updated;
}
