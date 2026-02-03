'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Upload, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function LinkedInUpload() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<{
    imported: number;
    skipped: number;
  } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error('Please select a CSV file');
        return;
      }
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/import/linkedin', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      setUploadResult({
        imported: result.imported,
        skipped: result.skipped,
      });

      toast.success(`Imported ${result.imported} contacts`);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import contacts');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 space-y-2">
        <p>To export your LinkedIn connections:</p>
        <ol className="list-decimal list-inside space-y-1 text-gray-500">
          <li>Go to LinkedIn Settings → Data Privacy</li>
          <li>Click &quot;Get a copy of your data&quot;</li>
          <li>Select &quot;Connections&quot; and request the export</li>
          <li>Upload the Connections.csv file below</li>
        </ol>
      </div>

      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
          id="linkedin-csv"
        />

        {selectedFile ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm">
              <FileText className="h-5 w-5 text-gray-500" />
              <span>{selectedFile.name}</span>
            </div>
            <div className="flex justify-center gap-2">
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {uploading ? 'Importing...' : 'Import Contacts'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <label
            htmlFor="linkedin-csv"
            className="cursor-pointer space-y-2 block"
          >
            <Upload className="h-8 w-8 mx-auto text-gray-400" />
            <p className="text-sm text-gray-600">
              Click to select your Connections.csv file
            </p>
          </label>
        )}
      </div>

      {/* Import result with "View Contacts" link - include this pattern for future import sources */}
      {uploadResult && (
        <div className="p-3 bg-gray-50 rounded-md text-sm space-y-2">
          <p>
            <strong>{uploadResult.imported}</strong> contacts imported
          </p>
          {uploadResult.skipped > 0 && (
            <p className="text-gray-500">
              {uploadResult.skipped} duplicates skipped
            </p>
          )}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
          >
            View all contacts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
