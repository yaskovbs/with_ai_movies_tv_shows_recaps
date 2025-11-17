import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Video, X } from 'lucide-react';
import type { VideoFile } from '../types';

interface VideoUploaderProps {
  onVideoSelect: (file: VideoFile) => void;
  selectedVideo: VideoFile | null;
  onRemoveVideo: () => void;
}

const VideoUploader = ({
  onVideoSelect,
  selectedVideo,
  onRemoveVideo,
}: VideoUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = ['MP4', 'AVI', 'MOV', 'MKV'];
  const maxVideoSize = 4 * 1024 * 1024 * 1024; // 4GB

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    const fileExtension = file.name.split('.').pop()?.toUpperCase();
    if (!fileExtension || !supportedFormats.includes(fileExtension)) {
      alert(`Unsupported video format. Supported formats: ${supportedFormats.join(', ')}`);
      return;
    }

    if (file.size > maxVideoSize) {
      alert('Video file is too large. Max size: 4GB');
      return;
    }

    const videoFile: VideoFile = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
    };
    onVideoSelect(videoFile);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const FileDisplay = ({ file, onRemove }: { file: VideoFile, onRemove: () => void }) => (
    <motion.div
      className="bg-gray-800 rounded-lg p-6 border-2 border-green-500"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
            <Video className="h-8 w-8 text-green-400" />
          <div>
            <h3 className="text-white font-medium">{file.name}</h3>
            <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">שלב 2: העלאת וידאו</h3>
        {selectedVideo ? (
            <FileDisplay file={selectedVideo} onRemove={onRemoveVideo} />
        ) : (
            <motion.div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${dragActive ? 'border-blue-400 bg-blue-400/10' : 'border-gray-600'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={openFileDialog}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".mp4,.avi,.mov,.mkv"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelection(file);
                    }}
                    className="hidden"
                />
                <div className="flex flex-col items-center">
                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                    <h4 className="text-lg font-semibold text-white">גרור או בחר קובץ וידאו</h4>
                    <p className="text-gray-400 text-sm">תומך ב-MP4, AVI, MOV, MKV</p>
                </div>
            </motion.div>
        )}
    </div>
  );
};

export default VideoUploader;
