-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(2, 1) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read products
CREATE POLICY "Anyone can view products"
  ON public.products
  FOR SELECT
  USING (true);

-- Create policy to allow anyone to insert products (for demo purposes)
CREATE POLICY "Anyone can insert products"
  ON public.products
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow anyone to update products (for demo purposes)
CREATE POLICY "Anyone can update products"
  ON public.products
  FOR UPDATE
  USING (true);

-- Create policy to allow anyone to delete products (for demo purposes)
CREATE POLICY "Anyone can delete products"
  ON public.products
  FOR DELETE
  USING (true);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample products
INSERT INTO public.products (name, description, price, image_url, category, stock_quantity, rating) VALUES
  ('Wireless Headphones', 'Premium noise-cancelling wireless headphones with 30-hour battery life', 129.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 'Electronics', 45, 4.5),
  ('Smart Watch', 'Fitness tracking smartwatch with heart rate monitor and GPS', 249.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', 'Electronics', 32, 4.7),
  ('Leather Backpack', 'Vintage leather backpack with laptop compartment', 89.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', 'Accessories', 28, 4.3),
  ('Running Shoes', 'Lightweight performance running shoes with advanced cushioning', 159.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 'Footwear', 56, 4.8),
  ('Coffee Maker', 'Professional espresso machine with milk frother', 299.99, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500', 'Home', 18, 4.6),
  ('Yoga Mat', 'Non-slip eco-friendly yoga mat with carrying strap', 34.99, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500', 'Fitness', 67, 4.4)