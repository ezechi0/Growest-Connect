import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, FileText, Image, Video } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

export type BucketType = 'pitch-decks' | 'project-images' | 'project-videos' | 'kyc-documents' | 'avatars';

interface FileUploadProps {
  bucketType: BucketType;
  onUploadComplete?: (url: string, fileName: string) => void;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  children?: React.ReactNode;
  className?: string;
}

const bucketConfig = {
  'pitch-decks': {
    icon: FileText,
    label: 'Pitch Deck',
    accept: '.pdf,.ppt,.pptx',
    maxSize: 50
  },
  'project-images': {
    icon: Image,
    label: 'Image de projet',
    accept: '.jpg,.jpeg,.png,.webp',
    maxSize: 10
  },
  'project-videos': {
    icon: Video,
    label: 'Vidéo de projet',
    accept: '.mp4,.webm,.mov',
    maxSize: 100
  },
  'kyc-documents': {
    icon: FileText,
    label: 'Document KYC',
    accept: '.pdf,.jpg,.jpeg,.png',
    maxSize: 20
  },
  'avatars': {
    icon: Image,
    label: 'Avatar',
    accept: '.jpg,.jpeg,.png,.webp',
    maxSize: 5
  }
};

export const FileUpload: React.FC<FileUploadProps> = ({
  bucketType,
  onUploadComplete,
  maxSizeMB,
  acceptedTypes,
  children,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useUserRole();

  const config = bucketConfig[bucketType];
  const maxSize = maxSizeMB || config.maxSize;
  const accept = acceptedTypes?.join(',') || config.accept;
  const Icon = config.icon;

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validation de la taille
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: `La taille maximale autorisée est de ${maxSize}MB`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Génération du nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketType)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Récupération de l'URL publique
      const { data: urlData } = supabase.storage
        .from(bucketType)
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      toast({
        title: "Upload réussi",
        description: `${config.label} uploadé avec succès`
      });

      onUploadComplete?.(publicUrl, file.name);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Erreur d'upload",
        description: error.message || "Une erreur s'est produite lors de l'upload",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`upload-container ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {children ? (
        <div onClick={handleFileSelect} className="cursor-pointer">
          {children}
        </div>
      ) : (
        <Button
          onClick={handleFileSelect}
          disabled={uploading}
          className="flex items-center gap-2"
          variant="outline"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Upload en cours... {uploadProgress}%
            </>
          ) : (
            <>
              <Icon className="w-4 h-4" />
              Uploader {config.label}
            </>
          )}
        </Button>
      )}

      {uploading && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};