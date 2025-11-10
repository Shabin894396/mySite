import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock_quantity: number;
  rating: number;
}

const ProductCard = ({ 
  name, 
  description, 
  price, 
  image_url, 
  category, 
  stock_quantity, 
  rating 
}: ProductCardProps) => {
  return (
    <Card className="overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 group">
      <div className="relative overflow-hidden aspect-square">
        <img 
          src={image_url} 
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
          {category}
        </Badge>
        {stock_quantity < 10 && (
          <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">
            Only {stock_quantity} left
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg text-card-foreground mb-2 line-clamp-1">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">
            ${price.toFixed(2)}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="text-sm font-medium text-foreground">{rating}</span>
          </div>
        </div>
        <div className="mt-3 text-sm text-muted-foreground">
          In Stock: {stock_quantity}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
