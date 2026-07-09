'use client';

import { useState, useRef } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { adminFetch } from '@/src/api/_shared/adminFetch';
import { BASE_URL } from '@/src/api/_shared/client';
import { notify } from '@/lib/notify';

export function ImageUpload({ 
  value, 
  onChange,
  label
}: { 
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await adminFetch(`${BASE_URL}/uploads/rich-text`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data?.data?.url) {
        onChange(data.data.url);
      } else {
        notify.error({ title: 'Error', message: 'Failed to upload image' });
      }
    } catch (e) {
      notify.error({ title: 'Error', message: 'Upload failed' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-semibold">{label}</label>}
      {value ? (
        <div className="relative overflow-hidden rounded-md border w-full max-w-sm bg-black/5">
           <img src={value.startsWith('http') ? value : `http://localhost:5000${value}`} alt="Uploaded" className="w-full h-auto object-contain max-h-48" />
           <button
             type="button"
             onClick={() => onChange('')}
             className="absolute right-2 top-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1 transition"
           >
             <X className="w-4 h-4" />
           </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-md p-6 bg-secondary/10 hover:bg-secondary/30 transition w-full max-w-sm"
        >
          {isUploading ? (
             <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : (
             <>
               <UploadCloud className="w-6 h-6 text-primary mb-2" />
               <span className="text-sm font-medium">Click to upload image</span>
             </>
          )}
        </button>
      )}
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={inputRef}
        onChange={(e) => {
          if (e.target.files?.[0]) handleUpload(e.target.files[0]);
        }} 
      />
    </div>
  );
}
