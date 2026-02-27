'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, AlertTriangle } from 'lucide-react';
import { classNames } from '@/lib/utils';

interface HeadshotUploaderProps {
  currentHeadshotUrl?: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  className?: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export default function HeadshotUploader({
  currentHeadshotUrl,
  onUpload,
  onRemove,
  className,
}: HeadshotUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentHeadshotUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndProcess = useCallback(
    (file: File) => {
      setError(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Please upload a PNG or JPG file.');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError('File must be under 2MB.');
        return;
      }

      // Create a square-cropped preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = Math.min(img.width, img.height);
          canvas.width = 300;
          canvas.height = 300;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const sx = (img.width - size) / 2;
            const sy = (img.height - size) / 2;
            ctx.drawImage(img, sx, sy, size, size, 0, 0, 300, 300);
            setPreview(canvas.toDataURL('image/jpeg', 0.9));
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
      onUpload(file);
    },
    [onUpload]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndProcess(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) validateAndProcess(file);
    },
    [validateAndProcess]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
    onRemove();
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-navy-900 mb-2">
        Agent Headshot
      </label>

      {preview ? (
        <div className="relative inline-block">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md">
            <img
              src={preview}
              alt="Headshot preview"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={handleRemove}
            className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
            aria-label="Remove headshot"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={classNames(
            'flex flex-col items-center justify-center w-28 h-28 border-2 border-dashed rounded-full cursor-pointer transition-colors duration-200',
            isDragging
              ? 'border-gold-400 bg-gold-50'
              : 'border-gray-200 bg-gray-50 hover:border-navy-300 hover:bg-gray-100'
          )}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
          }}
        >
          <Upload
            className={classNames(
              'w-6 h-6 mb-1',
              isDragging ? 'text-gold-500' : 'text-gray-400'
            )}
          />
          <p className="text-xs text-gray-500">Upload</p>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-2">
        Square crop applied automatically. PNG or JPG, max 2MB.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload headshot file"
      />

      {error && (
        <div className="flex items-center space-x-2 mt-2 text-sm text-red-600">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
