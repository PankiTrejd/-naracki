import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface MediaFile {
  id: string;
  type: "image" | "document";
  url: string;
  name: string;
}

interface MediaViewerProps {
  files?: MediaFile[];
}

const MediaViewer = ({ files = [] }: MediaViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // If no files are provided, show a placeholder
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
        <FileText className="h-12 w-12 text-gray-400 mb-2" />
        <p className="text-gray-500">No media attachments</p>
      </div>
    );
  }

  const currentFile = files[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? files.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === files.length - 1 ? 0 : prev + 1));
  };

  const renderFilePreview = () => {
    if (currentFile.type === "image") {
      return (
        <img
          src={currentFile.url}
          alt={currentFile.name}
          className="max-h-[300px] max-w-full object-contain"
        />
      );
    } else {
      // For PDF or other document types
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
          <FileText className="h-16 w-16 text-gray-400 mb-2" />
          <p className="text-sm font-medium">{currentFile.name}</p>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <a href={currentFile.url} target="_blank" rel="noopener noreferrer">
              Open Document
            </a>
          </Button>
        </div>
      );
    }
  };

  return (
    <Card className="w-full bg-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Attachments ({files.length})</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={currentFile.url} download={currentFile.name}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </a>
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Maximize2 className="h-4 w-4 mr-1" />
                Fullscreen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <div className="flex flex-col items-center justify-center p-4">
                {currentFile.type === "image" ? (
                  <img
                    src={currentFile.url}
                    alt={currentFile.name}
                    className="max-h-[80vh] max-w-full object-contain"
                  />
                ) : (
                  <iframe
                    src={currentFile.url}
                    title={currentFile.name}
                    className="w-full h-[80vh]"
                  />
                )}
                <p className="mt-2 text-sm text-gray-500">{currentFile.name}</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative">
        <div className="flex justify-center items-center">
          {renderFilePreview()}
        </div>

        {files.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/80 shadow-sm pointer-events-auto"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/80 shadow-sm pointer-events-auto"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {files.length > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {files.map((file, index) => (
            <Button
              key={file.id}
              variant={index === currentIndex ? "default" : "outline"}
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setCurrentIndex(index)}
            >
              {file.type === "image" ? (
                <ImageIcon className="h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
            </Button>
          ))}
        </div>
      )}
    </Card>
  );
};

export default MediaViewer;
