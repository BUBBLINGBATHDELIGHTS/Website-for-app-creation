import { ProductForm } from '@/components/admin/product-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { listProducts } from '@/lib/data/products';
import { deleteProductAction, updateInventoryAction } from './actions';

export const revalidate = 120;

export default async function AdminProductsPage() {
  const products = await listProducts();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl text-[#2F1F52]">Product orchestration</h1>
        <p className="text-sm text-[#4F3C75]">Manage inventory, seasonal collections, and launch new rituals.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create new ritual</CardTitle>
          <CardDescription>Use the form to add a product with seasonal theming.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm />
        </CardContent>
      </Card>
      <section className="space-y-4">
        <h2 className="font-display text-2xl text-[#2F1F52]">Current catalogue</h2>
        <div className="grid gap-4">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>
                    {product.category} · ${product.price.toFixed(2)} · Inventory {product.inventory}
                  </CardDescription>
                </div>
                <form action={deleteProductAction} className="flex gap-3">
                  <input type="hidden" name="id" value={product.id} />
                  <Button type="submit" variant="ghost">
                    Remove
                  </Button>
                </form>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-[#4F3C75]">{product.shortDescription}</p>
                <form action={updateInventoryAction} className="flex items-center gap-3">
                  <input type="hidden" name="id" value={product.id} />
                  <Input
                    name="inventory"
                    type="number"
                    defaultValue={product.inventory}
                    className="w-32 bg-white/80"
                    aria-label={`Inventory for ${product.name}`}
                  />
                  <Button type="submit" variant="outline">
                    Update inventory
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
          {products.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-[#4F3C75]">
                No products yet—create your first ritual above.
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
