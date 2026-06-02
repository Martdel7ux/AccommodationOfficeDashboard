import { useRef, useState } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.js';

const BUCKET = 'acc-images';

export default function ImageUpload({ onFilesChange, existingImages = [], onDeleteExisting }) {
  const inputRef = useRef(null);
  const [uploads, setUploads]   = useState([]); // { id, file, status, public_url, storage_path, original_name }
  const [dragging, setDragging] = useState(false);

  const uploadFile = async (file) => {
    const ext         = file.name.split('.').pop().toLowerCase();
    const storage_path = `${crypto.randomUUID()}.${ext}`;
    const id          = storage_path;

    setUploads((prev) => [...prev, { id, file, status: 'uploading', storage_path, original_name: file.name }]);

    const { error } = await supabase.storage.from(BUCKET).upload(storage_path, file);

    if (error) {
      setUploads((prev) => prev.map((u) => u.id === id ? { ...u, status: 'error' } : u));
      return;
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storage_path);
    const public_url = urlData.publicUrl;

    setUploads((prev) => {
      const updated = prev.map((u) =>
        u.id === id ? { ...u, status: 'done', public_url } : u
      );
      onFilesChange(
        updated.filter((u) => u.status === 'done').map(({ storage_path, public_url, original_name }) => ({
          storage_path, public_url, original_name,
        }))
      );
      return updated;
    });
  };

  const addFiles = (fileList) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    files.forEach(uploadFile);
  };

  const removeUpload = async (id) => {
    const item = uploads.find((u) => u.id === id);
    if (item?.status === 'done' && item.storage_path) {
      await supabase.storage.from(BUCKET).remove([item.storage_path]);
    }
    setUploads((prev) => {
      const updated = prev.filter((u) => u.id !== id);
      onFilesChange(
        updated.filter((u) => u.status === 'done').map(({ storage_path, public_url, original_name }) => ({
          storage_path, public_url, original_name,
        }))
      );
      return updated;
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150
          ${dragging
            ? 'border-primary-400 bg-primary-50'
            : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
          }`}
      >
        <Upload size={24} className="mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-medium text-slate-600">
          Drop images here, or <span className="text-primary-600">browse</span>
        </p>
        <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP · up to 10MB · max 10 images</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Existing images (edit mode) */}
      {existingImages.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">Existing photos</p>
          <div className="flex flex-wrap gap-2">
            {existingImages.map((img) => (
              <div key={img.id} className="relative group">
                <img
                  src={img.public_url}
                  alt={img.original_name}
                  className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => onDeleteExisting(img.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New uploads */}
      {uploads.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">New photos</p>
          <div className="flex flex-wrap gap-2">
            {uploads.map((u) => (
              <div key={u.id} className="relative group w-20 h-20">
                {u.status === 'uploading' ? (
                  <div className="w-full h-full rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
                    <Loader2 size={18} className="animate-spin text-primary-500" />
                  </div>
                ) : u.status === 'error' ? (
                  <div className="w-full h-full rounded-lg border border-red-200 bg-red-50 flex items-center justify-center">
                    <X size={16} className="text-red-400" />
                  </div>
                ) : (
                  <img
                    src={u.public_url}
                    alt={u.original_name}
                    className="w-full h-full object-cover rounded-lg border border-slate-200"
                  />
                )}
                {u.status !== 'uploading' && (
                  <button
                    type="button"
                    onClick={() => removeUpload(u.id)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {existingImages.length === 0 && uploads.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ImageIcon size={13} />
          No photos uploaded yet
        </div>
      )}
    </div>
  );
}
