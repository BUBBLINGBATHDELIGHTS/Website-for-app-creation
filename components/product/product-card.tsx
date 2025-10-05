'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  hero_image?: string;
  tags?: string[];
  rating?: number;
  review_count?: number;
};

export function ProductCard({ id, name, price, hero_image, tags = [], rating, review_count }: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/80 shadow-lg"
    >
      <Link href={`/shop/products/${id}`} className="relative h-60 w-full overflow-hidden">
        <Image
          src={
            hero_image ||
            'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'
          }
          alt={name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <Link href={`/shop/products/${id}`} className="font-display text-lg text-[#2F1F52]">
            {name}
          </Link>
          <span className="text-base font-semibold text-[#4F3C75]">${price.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#8C7BAF]">
          {rating ? `${rating.toFixed(1)} · ` : ''}
          {review_count ? `${review_count} reviews` : 'New ritual'}
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Button className="flex-1" asChild>
            <Link href={`/shop/cart?add=${id}`}>Add to Cart</Link>
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <Link href={`/shop/products/${id}#ritual`}>View Ritual</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
