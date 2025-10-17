import { z } from 'zod';
import { mutateJsonFile, readJsonFile } from './fs-store';

const CUSTOMERS_FILE = 'customers.json';

const addressSchema = z.object({
  label: z.string().default('Primary'),
  address1: z.string().min(1),
  address2: z.string().optional().default(''),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(3),
  country: z.string().min(2),
});

const preferencesSchema = z.object({
  favoriteSeasons: z.array(z.string()).default([]),
  favoriteCollections: z.array(z.string()).default([]),
  scentProfile: z.array(z.string()).default([]),
  emailOptIn: z.boolean().default(true),
});

export const customerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  loyaltyTier: z.string().min(1),
  points: z.number().int().nonnegative().default(0),
  lifetimeValue: z.number().nonnegative().default(0),
  createdAt: z.string().default(() => new Date().toISOString()),
  addresses: z.array(addressSchema).default([]),
  preferences: preferencesSchema.default({ favoriteSeasons: [], favoriteCollections: [], scentProfile: [], emailOptIn: true }),
});

export type Customer = z.infer<typeof customerSchema>;

const customerInputSchema = customerSchema.omit({ id: true, createdAt: true });
export type CustomerInput = z.infer<typeof customerInputSchema>;

async function readCustomers() {
  return readJsonFile<Customer[]>(CUSTOMERS_FILE, []);
}

export async function listCustomers() {
  const customers = await readCustomers();
  return customers.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCustomer(id: string) {
  const customers = await readCustomers();
  return customers.find((customer) => customer.id === id) ?? null;
}

export async function createCustomer(input: CustomerInput) {
  const parsed = customerInputSchema.parse(input);
  const id = `CUS-${Math.floor(Math.random() * 9000 + 1000)}`;
  const customer: Customer = {
    ...parsed,
    id,
    createdAt: new Date().toISOString(),
  };

  await mutateJsonFile<Customer[]>(CUSTOMERS_FILE, (customers) => [...customers, customer], []);
  return customer;
}

export async function updateCustomer(id: string, input: Partial<CustomerInput>) {
  const current = await getCustomer(id);
  if (!current) {
    throw new Error('Customer not found');
  }

  const updated = customerSchema.parse({ ...current, ...input, id: current.id, createdAt: current.createdAt });

  await mutateJsonFile<Customer[]>(
    CUSTOMERS_FILE,
    (customers) => customers.map((customer) => (customer.id === id ? updated : customer)),
    [],
  );

  return updated;
}

export async function deleteCustomer(id: string) {
  await mutateJsonFile<Customer[]>(
    CUSTOMERS_FILE,
    (customers) => customers.filter((customer) => customer.id !== id),
    [],
  );
}
