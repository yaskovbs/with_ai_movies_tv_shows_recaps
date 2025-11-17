import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Headphones, ScrollText, X } from 'lucide-react';
import type { AudioFile, ScriptFile } from '../types';

interface ScriptOrAudioUploaderProps {
  onFileSelect: (file: AudioFile | ScriptFile) => void;
  onTextSubmit: (text: string) => void;
  selectedFile: AudioFile | ScriptFile | null;
  onRemoveFile: () => void;
}

const ScriptOrAudioUploader = ({
  onFileSelect,
  onTextSubmit,
  selectedFile,
  onRemoveFile,
}: ScriptOrAudioUploaderProps) => {
  const [inputType, setInputType] = useState<'upload' | 'text'>('upload');
  const [text, setText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = ['TXT', 'MP3', 'WAV', 'M4A', 'FLAC'];
  const maxFileSize = 100 * 1024 * 1024; // 100MB

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
      alert(`Unsupported file type. Supported formats: ${supportedFormats.join(', ')}`);
      return;
    }

    if (file.size > maxFileSize) {
      alert('File is too large. Max size: 100MB');
      return;
    }

    if (['MP3', 'WAV', 'M4A', 'FLAC'].includes(fileExtension)) {
      const audioFile: AudioFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
      };
      onFileSelect(audioFile);
    } else if (['TXT'].includes(fileExtension)) {
      const scriptFile: ScriptFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
      };
      onFileSelect(scriptFile);
    }
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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSubmitText = () => {
    if (text.trim()) {
      onTextSubmit(text);
    }
  };

  const FileDisplay = ({ file, onRemove }: { file: AudioFile | ScriptFile, onRemove: () => void }) => (
    <motion.div
      className="bg-gray-800 rounded-lg p-6 border-2 border-green-500"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          {file.type.startsWith('audio') ? <Headphones className="h-8 w-8 text-green-400" /> : <ScrollText className="h-8 w-8 text-green-400" />}
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
        <h3 className="text-xl font-semibold text-white mb-4">שלב 1: העלאת סקריפט או שמע</h3>
        <div className="flex bg-gray-700/50 rounded-lg p-1 mb-4">
            <button 
                onClick={() => setInputType('upload')}
                className={`w-1/2 py-2 rounded-md text-sm font-medium transition-colors ${inputType === 'upload' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600/50'}`}
            >
                העלאת קובץ
            </button>
            <button 
                onClick={() => setInputType('text')}
                className={`w-1/2 py-2 rounded-md text-sm font-medium transition-colors ${inputType === 'text' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600/50'}`}
            >
                כתיבת סקריפט
            </button>
        </div>

        {selectedFile ? (
            <FileDisplay file={selectedFile} onRemove={onRemoveFile} />
        ) : (
            <>
                {inputType === 'upload' && (
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
                            accept=".txt,.mp3,.wav,.m4a,.flac"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileSelection(file);
                            }}
                            className="hidden"
                        />
                        <div className="flex flex-col items-center">
                            <Upload className="h-12 w-12 text-gray-400 mb-4" />
                            <h4 className="text-lg font-semibold text-white">גרור או בחר קובץ</h4>
                            <p className="text-gray-400 text-sm">תומך ב-TXT, MP3, WAV, M4A, FLAC</p>
                        </div>
                    </motion.div>
                )}

                {inputType === 'text' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <textarea
                            value={text}
                            onChange={handleTextChange}
                            placeholder="הדבק או כתוב את הסקריפט שלך כאן..."
                            className="w-full h-40 bg-gray-900 border border-gray-600 rounded-lg p-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                        <button
                            onClick={handleSubmitText}
                            className="mt-4 w-full py-2 px-4 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        >
                            הגש סקריפט
                        </button>
                    </motion.div>
                )}
            </>
        )}
    </div>
  );
};

export default ScriptOrAudioUploader;
