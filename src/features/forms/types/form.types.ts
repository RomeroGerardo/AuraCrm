export type FormFieldType = 'text' | 'textarea' | 'select' | 'checkbox';

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  required: boolean;
  options?: string[]; // Solo para 'select'
  placeholder?: string;
}

export interface FormTemplate {
  id: string;
  professional_id: string;
  name: string;
  fields: FormField[];
  created_at: string;
}

export interface FormSubmission {
  id: string;
  template_id: string;
  client_id: string;
  answers: Record<string, any>;
  signature_url?: string;
  signed_at?: string;
  ip_address?: string;
  created_at: string;
  template?: {
    name: string;
    fields: FormField[];
  };
}

export type CreateFormTemplateInput = Omit<FormTemplate, 'id' | 'created_at' | 'professional_id'>;
export type UpdateFormTemplateInput = Partial<CreateFormTemplateInput>;

export type CreateFormSubmissionInput = Omit<FormSubmission, 'id' | 'created_at'>;
