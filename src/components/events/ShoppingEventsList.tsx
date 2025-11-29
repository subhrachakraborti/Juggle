'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';

interface ShoppingItem {
    id: string;
    name: string;
    price: number;
    picture: string;
    buyLink: string;
}

interface ShoppingEventsListProps {
    items: ShoppingItem[];
}

export function ShoppingEventsList({ items }: ShoppingEventsListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48 w-full bg-gray-100">
                        <Image
                            src={item.picture}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>
                    <CardContent className="p-4 space-y-3">
                        <div>
                            <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                            <p className="text-2xl font-bold text-primary">
                                ${item.price.toFixed(2)}
                            </p>
                        </div>
                        <Button asChild className="w-full">
                            <a href={item.buyLink} target="_blank" rel="noopener noreferrer">
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Buy Now
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
