import { Button } from "@/components/ui/button";

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

interface ItemCardProps {
  item: Item;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{item.title}</h3>
          <p className="text-muted-foreground">{item.description}</p>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium">Price</p>
          <p className="text-muted-foreground">{item.price} TND</p>
        </div>
        <div>
          <p className="text-sm font-medium">Location</p>
          <p className="text-muted-foreground">{item.ville}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Category</p>
          <p className="text-muted-foreground">{item.category}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Status</p>
          <p className="text-muted-foreground">{item.status}</p>
        </div>
      </div>
      {item.images.length > 0 && (
        <div className="aspect-video relative overflow-hidden rounded-md">
          <img
            src={item.images[0]}
            alt={item.title}
            className="object-cover w-full h-full"
          />
        </div>
      )}
    </div>
  );
} 