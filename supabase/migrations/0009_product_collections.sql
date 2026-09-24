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


-- Colecciones iniciales que representan las secciones actuales del Home.
-- Los productos se vinculan por slug para conservar exactamente la selección actual.
INSERT INTO product_collections (title, slug, description, is_active, show_on_home, home_order_index, sort_mode)
VALUES
 ('Productos destacados','productos-destacados','Productos principales mostrados al inicio del Home.',true,true,1,'manual'),
 ('Riego automático','riego-automatico-home','Productos de riego automático mostrados en el bloque verde del Home.',true,true,2,'manual'),
 ('Terminaciones y materiales','terminaciones-materiales','Productos de paisajismo, terminaciones y materiales.',true,true,3,'manual'),
 ('Más productos para tu proyecto','mas-productos-proyecto','Resto del catálogo activo mostrado al final del Home.',true,true,4,'manual')
ON CONFLICT (slug) DO UPDATE SET
 title=EXCLUDED.title,
 description=EXCLUDED.description,
 is_active=EXCLUDED.is_active,
 show_on_home=EXCLUDED.show_on_home,
 home_order_index=EXCLUDED.home_order_index,
 sort_mode=EXCLUDED.sort_mode;

WITH featured(slug, pos) AS (
 VALUES ('cesped-esmeralda',1),('cesped-siempre-verde',2),('cesped-kavaju',3),('cesped-mani-docena',4)
), c AS (SELECT id FROM product_collections WHERE slug='productos-destacados')
INSERT INTO product_collection_items(collection_id,product_id,order_index)
SELECT c.id,p.id,f.pos FROM featured f JOIN products p ON p.slug=f.slug CROSS JOIN c
ON CONFLICT(collection_id,product_id) DO UPDATE SET order_index=EXCLUDED.order_index;

WITH irrigation(slug,pos) AS (
 VALUES ('valvula-riego-rain-bird',1),('aspersor-rain-bird-5004',2),('mini-rotor-rain-bird-3500',3),('difusor-riego',4)
), c AS (SELECT id FROM product_collections WHERE slug='riego-automatico-home')
INSERT INTO product_collection_items(collection_id,product_id,order_index)
SELECT c.id,p.id,i.pos FROM irrigation i JOIN products p ON p.slug=i.slug CROSS JOIN c
ON CONFLICT(collection_id,product_id) DO UPDATE SET order_index=EXCLUDED.order_index;

WITH landscape AS (
 SELECT p.id, row_number() OVER (ORDER BY p.created_at DESC)::int pos
 FROM products p JOIN categories c ON c.id=p.category_id
 WHERE c.slug IN ('decorativos','pisos-exteriores') AND p.is_active=true
), pc AS (SELECT id FROM product_collections WHERE slug='terminaciones-materiales')
INSERT INTO product_collection_items(collection_id,product_id,order_index)
SELECT pc.id,l.id,l.pos FROM landscape l CROSS JOIN pc
ON CONFLICT(collection_id,product_id) DO UPDATE SET order_index=EXCLUDED.order_index;

WITH already AS (
 SELECT pci.product_id FROM product_collection_items pci
 JOIN product_collections pc ON pc.id=pci.collection_id
 WHERE pc.slug IN ('productos-destacados','riego-automatico-home','terminaciones-materiales')
), remaining AS (
 SELECT p.id,row_number() OVER (ORDER BY p.created_at DESC)::int pos
 FROM products p WHERE p.is_active=true AND p.id NOT IN (SELECT product_id FROM already)
), pc AS (SELECT id FROM product_collections WHERE slug='mas-productos-proyecto')
INSERT INTO product_collection_items(collection_id,product_id,order_index)
SELECT pc.id,r.id,r.pos FROM remaining r CROSS JOIN pc
ON CONFLICT(collection_id,product_id) DO UPDATE SET order_index=EXCLUDED.order_index;
