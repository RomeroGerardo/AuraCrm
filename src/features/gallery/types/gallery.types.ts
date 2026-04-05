export interface GalleryItem {
  id: string;
  client_id: string;
  professional_id: string;
  before_url: string;
  after_url: string;
  treatment: string;
  taken_at: string; // Fecha del tratamiento
  notes?: string;
  created_at: string;
}

export interface UploadGalleryItemInput {
  client_id: string;
  before_file: File;
  after_file: File;
  treatment: string;
  notes?: string;
}
