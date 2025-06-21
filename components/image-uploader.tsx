'use client'
import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { nanoid } from 'nanoid';
import { useRouter } from 'next/navigation';

type ImageUploaderProps = {
  editSlug: string | null;
}

const ImageUploader = ({ editSlug }: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      const redirectUrl = `/write${editSlug ? `?edit=${editSlug}` : ''}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    setUploading(true);
    setError(null);
    setUploadedUrl(null);
    setCopySuccess(false);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${nanoid()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('imgs')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('imgs')
        .getPublicUrl(filePath);

      setUploadedUrl(publicUrl);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || '上传失败，请检查存储桶策略或网络连接。');
      } else {
        setError('上传失败，请检查存储桶策略或网络连接。');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = () => {
    if (uploadedUrl) {
      navigator.clipboard.writeText(`![alt text](${uploadedUrl})`);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };
  
  const triggerFileSelect = async () => {
    // 在触发文件选择前检查登录状态
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      const redirectUrl = `/write${editSlug ? `?edit=${editSlug}` : ''}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-gray-300 mb-1">上传图片</label>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={triggerFileSelect}
          disabled={uploading}
          className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-500 transition-colors disabled:bg-gray-500"
        >
          {uploading ? '上传中...' : '选择文件'}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
      
      {uploadedUrl && (
        <div className="mt-4 p-3 bg-gray-700 rounded-lg flex items-center justify-between">
          <p className="text-sm text-gray-200 truncate">
            <span className="font-semibold text-green-400">上传成功:</span> {`![alt text](${uploadedUrl})`}
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-500"
          >
            {copySuccess ? '已复制!' : '复制'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 