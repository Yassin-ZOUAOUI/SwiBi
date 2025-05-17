"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContactList from "@/components/contacts/contact-list";

interface Contact {
  id: string;
  status: string;
  createdAt: string;
  item: {
    id: string;
    title: string;
    images: string[];
    price: number;
    seller: {
      id: string;
      name: string;
      avatar: string | null;
    };
  };
  user?: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface ContactsResponse {
  sent: Contact[];
  received: Contact[];
}

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = React.useState<ContactsResponse>({ sent: [], received: [] });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("http://localhost:5000/api/contacts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch contacts");
        }

        const data = await response.json();
        setContacts(data);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load contacts",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [router]);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <p>Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Your Matches</h1>
          <p className="text-muted-foreground mt-2">
            Manage your item matches and requests
          </p>
        </div>
        <Tabs defaultValue="received" className="w-full">
          <TabsList>
            <TabsTrigger value="received">Received Requests</TabsTrigger>
            <TabsTrigger value="sent">Sent Requests</TabsTrigger>
          </TabsList>
          <TabsContent value="received">
            <ContactList 
              contacts={contacts.received} 
              type="received"
            />
          </TabsContent>
          <TabsContent value="sent">
            <ContactList 
              contacts={contacts.sent} 
              type="sent"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 