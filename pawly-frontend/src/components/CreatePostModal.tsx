"use client";

import { useState, useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "./ui/Button";
import { postApi } from "@/lib/api";
import { getCloudinarySignature } from "@/app/actions";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (newPost: any) => void;
}

export function CreatePostModal({ isOpen, onClose, onPostCreated }: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

    if (!cloudName || !apiKey) {
      throw new Error("Cloudinary configuration is missing");
    }

    const { timestamp, signature } = await getCloudinarySignature();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image to Cloudinary");
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !file) {
      setError("Please add some content or an image");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let imageUrl = "";
      
      if (file) {
        imageUrl = await uploadToCloudinary(file);
      }

      const newPost = await postApi.create({
        content,
        imageUrl: imageUrl || undefined,
      });

      onPostCreated(newPost);
      setContent("");
      removeImage();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong while creating the post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-background border border-border w-full max-w-lg rounded-xl shadow-lg flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Create new post</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-md text-sm">
              {error}
            </div>
          )}

          <textarea
            className="w-full bg-transparent resize-none outline-none text-lg min-h-[100px] placeholder:text-muted-foreground"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {preview && (
            <div className="relative mt-2">
              <img src={preview} alt="Preview" className="w-full rounded-lg max-h-80 object-cover" />
              <button 
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-primary hover:bg-muted rounded-full transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <ImagePlus className="w-5 h-5" />
            </button>
          </div>
          
          <Button 
            onClick={handleSubmit} 
            disabled={loading || (!content.trim() && !file)}
          >
            {loading ? "Posting..." : "Post"}
          </Button>
        </div>

      </div>
    </div>
  );
}
