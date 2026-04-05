import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import type { GalleryItem } from '../types/gallery.types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, ImageOff, Trash2, Loader2 } from 'lucide-react';
import { useDeleteGalleryItem } from '../hooks/useGallery';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface GalleryCarouselProps {
  items: GalleryItem[];
}

/**
 * Carrusel interactivo que muestra pares de fotos "Antes y Después".
 * Utiliza Swiper.js para la navegación suave e incluye funcionalidad de borrado.
 */
export const GalleryCarousel = ({ items }: GalleryCarouselProps) => {
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);
  const { mutateAsync: deleteItem, isPending: isDeleting } = useDeleteGalleryItem();

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteItem(itemToDelete);
      setItemToDelete(null);
    } catch (error) {
      // Toast ya manejado en el hook
    }
  };

  if (items.length === 0) {
    return (
      <Card className="border-dashed h-64 flex flex-col items-center justify-center text-center p-8 bg-muted/20 rounded-2xl">
        <div className="p-4 rounded-full bg-muted mb-4">
          <ImageOff className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="font-medium text-muted-foreground">La galería está vacía</p>
        <p className="text-sm text-muted-foreground/70">Sube fotos para comenzar a documentar el progreso.</p>
      </Card>
    );
  }

  return (
    <>
      <div className="relative group max-w-4xl mx-auto">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={32}
          slidesPerView={1}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          pagination={{ 
            clickable: true,
            dynamicBullets: true,
            bulletActiveClass: 'bg-primary opacity-100',
          }}
          className="rounded-2xl overflow-hidden shadow-2xl border bg-card"
        >
          {items.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="flex flex-col relative">
                {/* Botón de eliminar flotante */}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setItemToDelete(item)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>

                {/* Contenedor de Imágenes */}
                <div className="grid grid-cols-2 gap-[2px] bg-muted/30">
                  <div className="relative aspect-[4/5] sm:aspect-[3/2]">
                    <img
                      src={item.before_url || ''}
                      alt="Estado Inicial"
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <Badge className="absolute top-4 left-4 font-bold uppercase tracking-widest bg-black/60 text-white border-none backdrop-blur-md px-3 py-1">
                      Antes
                    </Badge>
                  </div>
                  <div className="relative aspect-[4/5] sm:aspect-[3/2]">
                    <img
                      src={item.after_url || ''}
                      alt="Resultado Final"
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <Badge className="absolute top-4 left-4 font-bold uppercase tracking-widest bg-primary/90 text-white border-none backdrop-blur-md px-3 py-1">
                      Después
                    </Badge>
                  </div>
                </div>

                {/* Información del Tratamiento */}
                <div className="p-6 sm:p-8 bg-gradient-to-b from-card to-muted/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h3 className="text-2xl font-extrabold tracking-tight text-foreground">
                      {item.treatment}
                    </h3>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full w-fit">
                      <Calendar className="h-4 w-4 text-primary" />
                      {new Date(item.taken_at + 'T12:00:00').toLocaleDateString(undefined, { 
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                  
                  {item.notes && (
                    <div className="mt-2 p-4 rounded-xl bg-muted/30 border-l-4 border-primary/30">
                      <p className="text-sm text-balance text-muted-foreground leading-relaxed italic">
                        "{item.notes}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}
          {/* Espaciado para paginación Swiper */}
          <div className="h-10"></div>
        </Swiper>

        {/* Botones de navegación personalizados */}
        <button className="swiper-button-prev-custom absolute left-2 sm:-left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/90 dark:bg-zinc-900/90 shadow-xl border text-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-primary hover:text-white hover:scale-110">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button className="swiper-button-next-custom absolute right-2 sm:-right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/90 dark:bg-zinc-900/90 shadow-xl border text-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-primary hover:text-white hover:scale-110">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Modal de Confirmación */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar estas fotos?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán permanentemente las imágenes de "Antes" y "Después" de {itemToDelete?.treatment}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

