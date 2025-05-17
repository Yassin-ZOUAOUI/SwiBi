"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import ItemCard from "@/components/items/item-card";

interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  ville: string | null;
  avatar: string | null;
}

interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  ville: string;
  category: string;
  status: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch user profile and items
    const fetchData = async () => {
      try {
        // Fetch user profile
        const profileResponse = await fetch("http://localhost:5000/api/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch profile");
        }

        const userData = await profileResponse.json();
        setUser(userData);

        // Fetch user's items
        const itemsResponse = await fetch("http://localhost:5000/api/items/my-items", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!itemsResponse.ok) {
          throw new Error("Failed to fetch items");
        }

        const itemsData = await itemsResponse.json();
        setItems(itemsData);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container py-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Profile</h1>
            <Button onClick={() => router.push("/profile-setup")}>
              Edit Profile
            </Button>
          </div>
          <div className="rounded-lg border p-4 space-y-4">
            <div>
              <h2 className="font-semibold">Email</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
            <div>
              <h2 className="font-semibold">Name</h2>
              <p className="text-muted-foreground">{user?.name || "Not set"}</p>
            </div>
            <div>
              <h2 className="font-semibold">Phone</h2>
              <p className="text-muted-foreground">{user?.phone || "Not set"}</p>
            </div>
            <div>
              <h2 className="font-semibold">City</h2>
              <p className="text-muted-foreground">{user?.ville || "Not set"}</p>
            </div>
          </div>
        </div>

        {/* User's Items */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">My Items</h2>
            <Button onClick={() => router.push("/items/new")}>
              Add New Item
            </Button>
          </div>
          <div className="grid gap-4">
            {items.length === 0 ? (
              <p className="text-muted-foreground">No items listed yet</p>
            ) : (
              items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onEdit={() => router.push(`/items/${item.id}/edit`)}
                  onDelete={async () => {
                    try {
                      const token = localStorage.getItem("token");
                      const response = await fetch(`http://localhost:5000/api/items/${item.id}`, {
                        method: "DELETE",
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      });

                      if (!response.ok) {
                        throw new Error("Failed to delete item");
                      }

                      // Remove item from state
                      setItems(items.filter((i) => i.id !== item.id));

                      toast({
                        title: "Success",
                        description: "Item deleted successfully",
                      });
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to delete item",
                        variant: "destructive",
                      });
                    }
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 