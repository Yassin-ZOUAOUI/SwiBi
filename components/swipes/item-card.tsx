"use client";

import * as React from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

interface ItemCardProps {
  item: {
    title: string;
    description: string;
    price: number;
    images: string[];
    ville: string;
    category: string;
  };
}

export default function ItemCard({ item }: ItemCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === item.images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <Card className="w-full overflow-hidden">
      <div className="relative aspect-square" onClick={nextImage}>
        <Image
          src={item.images[currentImageIndex]}
          alt={item.title}
          fill
          className="object-cover"
        />
        {item.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
            {currentImageIndex + 1}/{item.images.length}
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{item.title}</CardTitle>
          <Badge variant="secondary">{item.category}</Badge>
        </div>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {item.ville}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description}
        </p>
      </CardContent>
      <CardFooter>
        <p className="text-lg font-semibold">{item.price} TND</p>
      </CardFooter>
    </Card>
  );
} 