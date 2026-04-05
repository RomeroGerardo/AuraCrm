import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Convierte un Data URL de Base64 a un objeto Blob
 */
const dataURLtoBlob = (dataurl: string) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

export const useSignature = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadSignature = async (base64: string, submissionId: string): Promise<string | null> => {
    setIsUploading(true);
    try {
      const blob = dataURLtoBlob(base64);
      const fileName = `${submissionId}.png`;
      const filePath = `${fileName}`;

      const { error } = await supabase.storage
        .from('signatures')
        .upload(filePath, blob, {
          contentType: 'image/png',
          upsert: true,
        });

      if (error) {
        throw error;
      }

      // Obtener la URL pública (o la ruta si es privado, 
      // pero el RFC dice grabar signature_url)
      const { data: { publicUrl } } = supabase.storage
        .from('signatures')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading signature:', error);
      toast.error('Error al subir la firma: ' + (error.message || 'Error desconocido'));
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadSignature,
    isUploading,
  };
};
