import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { Upload, Image as ImageIcon, X, Loader2, Link } from "lucide-react";

interface SimpleImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  description?: string;
  usedFor?: string;
  allowUrl?: boolean;
  previewHeight?: string;
}

export default function SimpleImageUpload({
  value = "",
  onChange,
  label = "Imagem",
  placeholder = "URL da imagem ou faça upload",
  description,
  usedFor = "hero",
  allowUrl = true,
  previewHeight = "h-48",
}: SimpleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      setError(null);

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("Arquivo muito grande. Máximo 5MB permitido.");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Apenas arquivos de imagem são permitidos.");
        return;
      }

      const formData = new FormData();
      formData.append("image", file);
      formData.append("used_for", usedFor);
      formData.append("alt_text", file.name);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onChange(data.url);
        setUrlInput(data.url);
        setError(null);
      } else {
        setError(data.message || "Erro no upload da imagem");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Erro ao fazer upload da imagem");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      uploadFile(imageFile);
    } else {
      setError("Apenas arquivos de imagem são permitidos.");
    }
  };

  const handleUrlChange = (newUrl: string) => {
    setUrlInput(newUrl);
    onChange(newUrl);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {label && <Label className="text-sm font-medium">{label}</Label>}
      {description && <p className="text-sm text-gray-600">{description}</p>}

      {/* Current Image Preview */}
      {value && (
        <div className="relative">
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="relative">
                <img
                  src={value}
                  alt="Preview"
                  className={`w-full ${previewHeight} object-cover rounded-lg`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    onChange("");
                    setUrlInput("");
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upload Area */}
      {!value && (
        <Card>
          <CardContent className="p-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {isUploading ? (
                <div className="space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                  <p className="text-sm text-gray-600">Enviando imagem...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">
                      {isDragging
                        ? "Solte a imagem aqui"
                        : "Clique para enviar ou arraste uma imagem"}
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF, WebP até 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Selecionar Arquivo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* URL Input */}
      {allowUrl && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Link className="w-4 h-4" />
                Ou inserir URL da imagem
              </Label>
              <Input
                type="url"
                value={urlInput}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder={placeholder}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
