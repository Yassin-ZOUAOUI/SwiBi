"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface Contact {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  item: {
    id: string;
    title: string;
    price: number;
    images: string[];
    seller: {
      id: string;
      name: string;
      avatar: string | null;
    };
  };
}

export default function ChatPage({ params }: { params: { conversationId: string } }) {
  const router = useRouter();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState("");
  const [contact, setContact] = React.useState<Contact | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [isSeller, setIsSeller] = React.useState(false);
  const [showSellConfirmation, setShowSellConfirmation] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch contact details for the conversation
    const fetchContactDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/contacts/conversation/${params.conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch contact details");
        const data = await response.json();
        setContact(data);
        // Check if current user is the seller
        const userResponse = await fetch("http://localhost:5000/api/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!userResponse.ok) throw new Error("Failed to fetch user data");
        const userData = await userResponse.json();
        setUserId(userData.id);
        setIsSeller(userData.id === data.item.seller.id);
      } catch (error) {
        console.error("Error fetching contact details:", error);
      }
    };

    fetchContactDetails();

    // Fetch messages
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/messages/${params.conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch messages");
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      }
    };

    fetchMessages();
    // Set up periodic refresh
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [params.conversationId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/messages/${params.conversationId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: newMessage }),
        }
      );

      if (!response.ok) throw new Error("Failed to send message");

      const message = await response.json();
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleSell = async () => {
    if (!contact) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/items/${contact.item.id}/sell`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to mark item as sold");

      toast({
        title: "Success",
        description: "Item marked as sold",
      });

      // Send a system message about the sale
      await fetch(
        `http://localhost:5000/api/messages/${params.conversationId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: `Item "${contact.item.title}" has been marked as sold to ${contact.user.name}.`,
          }),
        }
      );

      setShowSellConfirmation(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark item as sold",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container flex h-[calc(100vh-4rem)] flex-col py-4">
      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-2 ${
              message.sender.id === userId ? "flex-row-reverse" : ""
            }`}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.sender.avatar || undefined} />
              <AvatarFallback>
                {message.sender.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div
              className={`rounded-lg px-4 py-2 ${
                message.sender.id === userId
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <div className="text-sm font-medium">{message.sender.name}</div>
              <div>{message.content}</div>
              <div className="mt-1 text-xs opacity-70">
                {formatDistanceToNow(new Date(message.createdAt), {
                  addSuffix: true,
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <form onSubmit={handleSubmit} className="flex flex-1 gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit">Send</Button>
        </form>
        {isSeller && contact && (
          <Button
            variant="secondary"
            onClick={() => setShowSellConfirmation(true)}
          >
            Sell
          </Button>
        )}
      </div>

      <AlertDialog open={showSellConfirmation} onOpenChange={setShowSellConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Sale</AlertDialogTitle>
            <AlertDialogDescription>
              Are you selling the item "{contact?.item.title}" to {contact?.user.name}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleSell}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 