import { z } from 'zod';

export const formFieldSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['text', 'textarea', 'select', 'checkbox']),
  label: z.string().min(1, 'La etiqueta es obligatoria'),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
});

export const formTemplateSchema = z.object({
  name: z.string().min(3, 'El nombre de la plantilla debe tener al menos 3 caracteres'),
  fields: z.array(formFieldSchema).min(1, 'Debes añadir al menos un campo'),
});

export type FormFieldValues = z.infer<typeof formFieldSchema>;
export type FormTemplateValues = z.infer<typeof formTemplateSchema>;

// Función auxiliar para generar un esquema de validación dinámico basado en los campos
export const generateDynamicSchema = (fields: any[]) => {
  const shape: Record<string, any> = {};

  fields.forEach((field) => {
    let validator: z.ZodTypeAny = z.any();

    if (field.type === 'text' || field.type === 'textarea' || field.type === 'select') {
      let stringValidator = z.string();
      if (field.required) {
        stringValidator = stringValidator.min(1, `${field.label} es obligatorio`);
      } else {
        stringValidator = stringValidator.optional().or(z.literal('')) as any;
      }
      validator = stringValidator;
    } else if (field.type === 'checkbox') {
      let boolValidator = z.boolean();
      if (field.required) {
        boolValidator = boolValidator.refine((val) => val === true, {
          message: `${field.label} debe estar marcado`,
        }) as any;
      }
      validator = boolValidator;
    }

    shape[field.id] = validator;
  });

  // Agregar validación para la firma si es necesaria
  shape['signature_url'] = z.string().min(1, 'La firma es obligatoria');

  return z.object(shape);
};
