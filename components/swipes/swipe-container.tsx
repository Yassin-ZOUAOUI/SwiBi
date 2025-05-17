"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import ItemCard from "./item-card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  ville: string;
  category: string;
  userId: string;
}

export default function SwipeContainer() {
  const [items, setItems] = React.useState<Item[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    fetchItems();
  }, []);

    const fetchItems = async () => {    try {      const token = localStorage.getItem("token");      console.log("Token from localStorage:", token);            if (!token) {        throw new Error("Not authenticated");      }      console.log("Making request to /api/swipes/discover");      const response = await fetch("http://localhost:5000/api/swipes/discover", {        headers: {          Authorization: `Bearer ${token}`,        },      });      console.log("Response status:", response.status);      const data = await response.json();      console.log("Response data:", data);      if (!response.ok) {        throw new Error(data.message || "Failed to fetch items");      }      setItems(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (itemId: string, direction: "left" | "right") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      await fetch("http://localhost:5000/api/swipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId,
          direction,
        }),
      });

      if (direction === "right") {
        toast({
          title: "Liked!",
          description: "You can find this item in your matches",
        });
      }

      // Move to next item
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record swipe",
        variant: "destructive",
      });
    }
  };

  const handleDragStart = (event: React.MouseEvent | React.TouchEvent) => {
    const point = "touches" in event ? event.touches[0] : event;
    setDragStart({ x: point.clientX, y: point.clientY });
  };

  const handleDragEnd = (event: React.MouseEvent | React.TouchEvent) => {
    const point = "changedTouches" in event ? event.changedTouches[0] : event;
    const deltaX = point.clientX - dragStart.x;

    if (Math.abs(deltaX) > 100) {
      // Swipe threshold of 100px
      const direction = deltaX > 0 ? "right" : "left";
      handleSwipe(items[currentIndex].id, direction);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading items...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-muted-foreground">No more items to show</p>
        <Button onClick={fetchItems}>Refresh</Button>
      </div>
    );
  }

  if (currentIndex >= items.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-muted-foreground">You've seen all items</p>
        <Button onClick={() => {
          setCurrentIndex(0);
          fetchItems();
        }}>Start Over</Button>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div className="relative">
      <AnimatePresence>
        <motion.div
          key={currentItem.id}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
          className="cursor-grab active:cursor-grabbing"
        >
          <ItemCard item={currentItem} />
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center space-x-4 mt-6">
        <Button
          size="lg"
          variant="outline"
          onClick={() => handleSwipe(currentItem.id, "left")}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          size="lg"
          onClick={() => handleSwipe(currentItem.id, "right")}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
} 