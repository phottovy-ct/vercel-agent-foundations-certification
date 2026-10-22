"use client";

// Created by AI (Claude Code): Generative UI exercise, based on the guide's starter card.
// The tool's input is `productId` (the guide's Workflows version of getProductDetails),
// and the success shape is narrowed explicitly so `tsc --noEmit` passes.

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/format";
import type { ProductDetailsToolInvocation } from "@/lib/agent";
import type { Product } from "@/lib/types";

interface AgentProductCardProps {
  invocation: ProductDetailsToolInvocation;
}

export function AgentProductCard({ invocation }: AgentProductCardProps) {
  if (
    invocation.state === "input-streaming" ||
    invocation.state === "input-available"
  ) {
    const id = invocation.input?.productId;
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        Looking up{id ? ` "${id}"` : ""}…
      </div>
    );
  }

  if (invocation.state !== "output-available") return null;

  const output = invocation.output;

  if (!output) return null;

  if ("error" in output && output.error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {output.error}
      </div>
    );
  }

  // The tool returns either product details or { error }; narrow to the success shape.
  if (!("slug" in output) || !output.slug) return null;
  const product = output as Extract<typeof output, { slug: string }>;

  const image = product.images[0];

  return <ProductDetailsCard product={product} image={image} />;
}

// Created by AI (Claude Code): beyond the guide. Adds an "Add to Cart" button that reuses
// the store's CartProvider (same addToCart the product page uses). Split into its own
// component because hooks can't run after AgentProductCard's early returns.
type ProductDetails = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  images: string[];
  tags: string[];
  featured: boolean;
  inStock: boolean;
};

function ProductDetailsCard({
  product,
  image,
}: {
  product: ProductDetails;
  image: string | undefined;
}) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    // The tool output has every Product field the cart uses except createdAt.
    const cartProduct: Product = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      currency: product.currency,
      category: product.category,
      images: product.images,
      tags: product.tags,
      featured: product.featured,
      createdAt: "",
    };
    addToCart(cartProduct, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {image && (
        <div className="relative aspect-4/3 bg-secondary">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 480px, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold leading-tight">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {formatPrice(product.price, product.currency)}
            </p>
          </div>
        </div>
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {product.description}
        </p>
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/products/${product.slug}`}>View product →</Link>
          </Button>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={!product.inStock || isAdded}
          >
            {isAdded ? (
              <>
                <Check className="mr-1 h-4 w-4" />
                Added
              </>
            ) : product.inStock ? (
              "Add to Cart"
            ) : (
              "Out of Stock"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
