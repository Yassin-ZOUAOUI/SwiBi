import { Metadata } from "next";
import SwipeContainer from "@/components/swipes/swipe-container";

export const metadata: Metadata = {
  title: "Swipe Items - SwiBi",
  description: "Discover and swipe on items you're interested in",
};

export default function SwipesPage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-md">
        <div className="flex flex-col space-y-2 mb-8 text-center">
          <h1 className="text-3xl font-bold">Discover Items</h1>
          <p className="text-muted-foreground">
            Swipe right on items you're interested in
          </p>
        </div>
        <SwipeContainer />
      </div>
    </div>
  );
} 