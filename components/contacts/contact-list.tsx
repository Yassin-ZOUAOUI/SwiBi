"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

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
  conversation?: {
    id: string;
  } | null;
}

interface ContactListProps {
  contacts: Contact[];
  type: "sent" | "received";
}

export default function ContactList({ contacts, type }: ContactListProps) {
  const router = useRouter();
  const [localContacts, setLocalContacts] = React.useState<Contact[]>(contacts);

  React.useEffect(() => {
    setLocalContacts(contacts);
  }, [contacts]);

  const handleAccept = async (contactId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `http://localhost:5000/api/contacts/${contactId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "ACCEPTED" }),
        }
      );

      if (!response.ok) throw new Error("Failed to accept contact");

      const updatedContact = await response.json();
      
      // Update the local state with the new contact data
      setLocalContacts(prevContacts =>
        prevContacts.map(contact =>
          contact.id === contactId ? updatedContact : contact
        )
      );

      toast({
        title: "Success",
        description: "Contact accepted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (contactId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `http://localhost:5000/api/contacts/${contactId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "REJECTED" }),
        }
      );

      if (!response.ok) throw new Error("Failed to reject contact");

      const updatedContact = await response.json();

      // Update the local state with the new contact data
      setLocalContacts(prevContacts =>
        prevContacts.map(contact =>
          contact.id === contactId ? updatedContact : contact
        )
      );

      toast({
        title: "Success",
        description: "Contact rejected",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleOpenChat = (conversationId: string) => {
    router.push(`/chat/${conversationId}`);
  };

  if (localContacts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {type === "sent" 
            ? "No sent requests yet. Start swiping to find items!" 
            : "No received requests yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {localContacts.map((contact) => (
        <Card key={contact.id} className="p-4">
          <div className="flex items-start gap-4">
            <div className="relative h-24 w-24 flex-shrink-0">
              <img
                src={contact.item.images[0]}
                alt={contact.item.title}
                className="h-full w-full rounded-lg object-cover"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{contact.item.title}</h3>
                <Badge variant={contact.status === "PENDING" ? "outline" : contact.status === "ACCEPTED" ? "default" : "destructive"}>
                  {contact.status.toLowerCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage 
                    src={type === "sent" 
                      ? contact.item.seller.avatar || undefined
                      : contact.user?.avatar || undefined
                    } 
                  />
                  <AvatarFallback>
                    {type === "sent"
                      ? contact.item.seller.name?.charAt(0) || "S"
                      : contact.user?.name?.charAt(0) || "U"
                    }
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {type === "sent" ? contact.item.seller.name : contact.user?.name}
                </span>
              </div>
              <p className="text-sm font-medium">
                ${contact.item.price.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(contact.createdAt), {
                  addSuffix: true,
                })}
              </p>
              {type === "received" && contact.status === "PENDING" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAccept(contact.id)}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(contact.id)}
                  >
                    Reject
                  </Button>
                </div>
              )}
              {contact.status === "ACCEPTED" && contact.conversation && (
                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => handleOpenChat(contact.conversation!.id)}
                >
                  Open Chat
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 