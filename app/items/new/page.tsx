import { Metadata } from "next";
import NewItemForm from "@/components/items/new-item-form";

export const metadata: Metadata = {
  title: "Add New Item - SwiBi",
  description: "List a new item for sale on SwiBi",
};

export default function NewItemPage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col space-y-2 mb-8">
          <h1 className="text-3xl font-bold">Add New Item</h1>
          <p className="text-muted-foreground">
            Fill in the details below to list your item for sale
          </p>
        </div>
        <NewItemForm />
      </div>
    </div>
  );
} 