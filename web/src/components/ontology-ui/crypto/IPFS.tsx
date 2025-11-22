/**
 * IPFS Component
 *
 * InterPlanetary File System upload and retrieval.
 * Uses 6-token design system.
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface IPFSProps {
  onUpload?: (file: File) => Promise<string>;
  onRetrieve?: (cid: string) => Promise<string>;
  onCopy?: (text: string) => void;
  className?: string;
}

export function IPFS({ onUpload, onRetrieve, onCopy, className }: IPFSProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadCID, setUploadCID] = useState("");
  const [retrieveCID, setRetrieveCID] = useState("");
  const [retrievedUrl, setRetrievedUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isRetrieving, setIsRetrieving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadCID("");
    }
  };

  const handleUpload = async () => {
    if (!file || !onUpload) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadCID("");

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const cid = await onUpload(file);

      clearInterval(interval);
      setUploadProgress(100);
      setUploadCID(cid);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetrieve = async () => {
    if (!retrieveCID || !onRetrieve) return;

    setIsRetrieving(true);
    setRetrievedUrl("");

    try {
      const url = await onRetrieve(retrieveCID);
      setRetrievedUrl(url);
    } catch (error) {
      console.error("Retrieval failed:", error);
    } finally {
      setIsRetrieving(false);
    }
  };

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-font text-lg">IPFS Storage</CardTitle>
          <p className="text-font/60 text-sm">
            Upload and retrieve files from IPFS
          </p>
        </CardHeader>

        {/* Upload Section */}
        <div className="mb-6">
          <Label htmlFor="file-upload" className="text-font font-medium mb-3 block">
            Upload File
          </Label>
          <div className="space-y-3">
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              className="bg-background"
            />

            {file && (
              <div className="bg-background rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-font text-sm truncate">{file.name}</span>
                  <Badge variant="secondary">
                    {(file.size / 1024).toFixed(1)} KB
                  </Badge>
                </div>

                {isUploading && (
                  <Progress value={uploadProgress} className="h-2 bg-foreground">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </Progress>
                )}
              </div>
            )}

            <Button
              variant="primary"
              className="w-full"
              onClick={handleUpload}
              disabled={!file || isUploading}
            >
              {isUploading ? "Uploading..." : "Upload to IPFS"}
            </Button>

            {uploadCID && (
              <div className="bg-tertiary/10 border border-tertiary/20 rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-font font-medium text-sm">
                    ✓ Uploaded Successfully
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCopy?.(uploadCID)}
                  >
                    Copy CID
                  </Button>
                </div>
                <div className="text-font font-mono text-xs break-all">
                  {uploadCID}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-font/10 my-6" />

        {/* Retrieve Section */}
        <div>
          <Label htmlFor="retrieve-cid" className="text-font font-medium mb-3 block">
            Retrieve File
          </Label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                id="retrieve-cid"
                placeholder="Enter IPFS CID..."
                value={retrieveCID}
                onChange={(e) => setRetrieveCID(e.target.value)}
                className="bg-background font-mono"
              />
              <Button
                variant="primary"
                onClick={handleRetrieve}
                disabled={!retrieveCID || isRetrieving}
              >
                {isRetrieving ? "..." : "Get"}
              </Button>
            </div>

            {retrievedUrl && (
              <div className="bg-background rounded-md p-3">
                <div className="text-font/60 text-xs mb-2">Retrieved URL</div>
                <div className="text-font font-mono text-xs break-all mb-2">
                  {retrievedUrl}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onCopy?.(retrievedUrl)}
                  >
                    Copy URL
                  </Button>
                  <Button variant="secondary" size="sm" asChild>
                    <a
                      href={retrievedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View File
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
