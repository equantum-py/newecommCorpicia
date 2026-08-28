'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useBudgetStore } from '@/store/budgetStore';
import { formatPrice, formatUnit, generateWhatsAppMessage, getSafeMinQuantity, getSafeQuantity, getProductImage } from '@/lib/utils';
import { trackWhatsAppClick } from '@/lib/tracking';
import { Minus, Plus, Trash2, ShoppingCart, X, Package } from 'lucide-react';

export function BudgetDrawer() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { items, removeItem, updateQuantity, getTotal } = useBudgetStore();

  const handleWhatsAppClick = () => {
    trackWhatsAppClick('budget_drawer', 'enviar-presupuesto');

    const messageItems = items.map(item => ({
      name: item.product.name,
      quantity: item.quantity,
      total: item.total,
      unit: item.product.unit,
    }));

    const url = generateWhatsAppMessage(messageItems, getTotal());
    const safeUrl = url.replace('https://wa.me/', 'https://api.whatsapp.com/send?phone=');
    window.open(safeUrl, '_blank');
  };

  if (pathname?.startsWith('/admin')) return null;
  if (items.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-[60] flex items-center gap-2 bg-corpicia-green text-white px-4 py-3 rounded-full shadow-lg"
      >
        <ShoppingCart className="w-5 h-5" />
        {items.length} productos
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[70]"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[80] flex flex-col shadow-2xl">
            <div className="flex justify-between p-4 border-b flex-shrink-0">
              <h2 className="font-bold flex gap-2 items-center">
                <ShoppingCart className="w-5 h-5" /> Presupuesto
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4 bg-gray-50 p-3 rounded-lg">
                  <div className="w-20 h-20 bg-white flex-shrink-0 rounded overflow-hidden">
                    {(() => {
                      const imgUrl = getProductImage(item.product);
                      return imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          sizes="80px"
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-300">
                          <Package size={28} />
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2">{item.product.name}</h4>

                    <p className="text-sm text-gray-500 font-medium">
                      {formatPrice(item.unitPrice)} / {formatUnit(item.product.unit)}
                    </p>

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const safeMin = getSafeMinQuantity(item.product);
                          const safeQty = getSafeQuantity(item.quantity, safeMin);
                          const isAtMin = safeQty <= safeMin;
                          return (
                            <>
                              <button
                                onClick={() => updateQuantity(item.product.id, Math.max(safeMin, safeQty - 1))}
                                disabled={isAtMin}
                                className={`p-1 rounded ${isAtMin ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                              >
                                <Minus className="w-4 h-4" />
                              </button>

                              <span className="text-sm font-medium">
                                {safeQty} {formatUnit(item.product.unit)}
                              </span>

                              <button
                                onClick={() => updateQuantity(item.product.id, safeQty + 1)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </>
                          );
                        })()}
                      </div>

                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-right font-bold text-green-600 mt-1">
                      {formatPrice(item.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t bg-white flex-shrink-0 space-y-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(getTotal())}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1 min-h-[44px]"
                  onClick={() => setIsOpen(false)}
                >
                  Seguir comprando
                </Button>

                <Link href="/presupuesto" className="flex-1">
                  <Button
                    className="w-full min-h-[44px] bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    Ver presupuesto
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
