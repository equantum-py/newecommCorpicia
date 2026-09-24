CREATE TABLE IF NOT EXISTS product_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  show_on_home boolean NOT NULL DEFAULT false,
  home_order_index integer,
  sort_mode text NOT NULL DEFAULT 'manual' CHECK (sort_mode IN ('manual','title_asc','title_desc','price_asc','price_desc','newest','oldest')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_collection_items (
  collection_id uuid NOT NULL REFERENCES product_collections(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_product_collection_items_order ON product_collection_items(collection_id, order_index);
CREATE INDEX IF NOT EXISTS idx_product_collections_home ON product_collections(show_on_home, home_order_index) WHERE is_active = true;

ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collection_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active collections" ON product_collections;
CREATE POLICY "Public can view active collections" ON product_collections FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view collection items" ON product_collection_items;
CREATE POLICY "Public can view collection items" ON product_collection_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM product_collections c WHERE c.id = collection_id AND c.is_active = true)
);
