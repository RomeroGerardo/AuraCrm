import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { FormField } from '../types/form.types';

interface FormRendererProps {
  title: string;
  description?: string;
  fields: FormField[];
  logoUrl?: string;
}

export const FormRenderer: React.FC<FormRendererProps> = ({ 
  title, 
  description, 
  fields,
  logoUrl
}) => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="w-full">
      <Card className="border-none shadow-premium rounded-2xl overflow-hidden glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 bg-muted/5">
          <div className="space-y-1.5 flex-1 pr-4">
            <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
            {description && <CardDescription className="text-sm">{description}</CardDescription>}
          </div>
          {logoUrl && (
            <div className="h-16 w-16 md:h-20 md:w-20 shrink-0">
              <img 
                src={logoUrl} 
                alt="Business Logo" 
                className="h-full w-full object-contain drop-shadow-sm"
              />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {fields.map((field) => {
              const error = errors[field.id];
              
              return (
                <div key={field.id} className="space-y-2">
                  {field.type !== 'checkbox' && (
                    <Label 
                      htmlFor={field.id}
                      className={field.required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : ""}
                    >
                      {field.label}
                    </Label>
                  )}

                  {field.type === 'text' && (
                    <Input
                      {...register(field.id)}
                      id={field.id}
                      placeholder={field.placeholder}
                      className={error ? "border-destructive" : ""}
                    />
                  )}

                  {field.type === 'textarea' && (
                    <Textarea
                      {...register(field.id)}
                      id={field.id}
                      placeholder={field.placeholder}
                      className={error ? "border-destructive" : ""}
                    />
                  )}

                  {field.type === 'select' && (
                    <Select 
                      onValueChange={(val) => setValue(field.id, val)}
                      value={watch(field.id)}
                    >
                      <SelectTrigger id={field.id} className={error ? "border-destructive" : ""}>
                        <SelectValue placeholder={field.placeholder || "Selecciona una opción..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option, idx) => (
                          <SelectItem key={idx} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {field.type === 'checkbox' && (
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox 
                        id={field.id}
                        checked={watch(field.id) ?? false}
                        onCheckedChange={(checked) => setValue(field.id, !!checked)}
                      />
                      <Label 
                        htmlFor={field.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {field.label} {field.required && <span className="text-destructive">*</span>}
                      </Label>
                    </div>
                  )}
                  
                  {error && (
                    <p className="text-xs text-destructive mt-1">
                      {error.message as string}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
