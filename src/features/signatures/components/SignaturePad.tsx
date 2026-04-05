import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eraser } from 'lucide-react';

interface SignaturePadProps {
  onConfirm: (base64: string) => void;
  title?: string;
  className?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ 
  onConfirm, 
  title = "Firma del Cliente",
  className = "" 
}) => {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const clear = () => {
    sigCanvas.current?.clear();
    onConfirm('');
  };

  const handleChange = () => {
    if (sigCanvas.current?.isEmpty()) {
      onConfirm('');
      return;
    }
    // Usamos getCanvas() directamente para evitar el error de import_build.default en trim-canvas
    const canvas = sigCanvas.current?.getCanvas();
    if (canvas) {
      onConfirm(canvas.toDataURL('image/png'));
    }
  };

  return (
    <Card className={`w-full overflow-hidden ${className}`}>
      <CardHeader className="py-2 px-4">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="bg-muted/30 p-0 border-y relative">
        <SignatureCanvas
          ref={sigCanvas}
          onEnd={handleChange}
          penColor="black"
          canvasProps={{
            className: "signature-canvas w-full h-[180px] cursor-crosshair bg-white",
          }}
        />
        <Button 
          type="button" 
          variant="secondary" 
          size="icon" 
          onClick={clear}
          className="absolute bottom-2 right-2 h-8 w-8 rounded-full shadow-sm"
          title="Limpiar firma"
        >
          <Eraser className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
