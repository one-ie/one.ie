/**
 * Image Assistant Component
 *
 * AI-powered image suggestion interface for funnel pages.
 * Features:
 * - Stock photo search (Unsplash)
 * - AI image generation prompts
 * - Template graphics
 * - User uploads
 * - Smart suggestions based on context
 */

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Sparkles,
  Upload,
  Download,
  Image as ImageIcon,
  Palette,
  ExternalLink,
} from 'lucide-react';

import type {
  ImageSuggestion,
  ImageSuggestionRequest,
  PageType,
  ImageStyle,
  AspectRatio,
} from '@/lib/ai/image-suggestions';
import {
  generateSearchKeywords,
  generateImagePrompt,
  generateAltText,
  extractImageColors,
  getTemplateImages,
  sortImagesByRelevance,
} from '@/lib/ai/image-suggestions';
import { searchImages, unsplash } from '@/lib/integrations/unsplash';
import { FileUploader } from '@/components/ontology-ui/advanced/FileUploader';

export interface ImageAssistantProps {
  pageType: PageType;
  industry: string;
  onSelectImage?: (image: ImageSuggestion) => void;
  onGeneratePrompt?: (prompt: string) => void;
  className?: string;
}

export function ImageAssistant({
  pageType,
  industry,
  onSelectImage,
  onGeneratePrompt,
  className,
}: ImageAssistantProps) {
  // State
  const [style, setStyle] = useState<ImageStyle>('modern');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [customKeywords, setCustomKeywords] = useState('');
  const [suggestions, setSuggestions] = useState<ImageSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageSuggestion | null>(
    null
  );
  const [imageColors, setImageColors] = useState<string[]>([]);

  // Auto-fetch suggestions when pageType or industry changes
  useEffect(() => {
    fetchSuggestions();
  }, [pageType, industry, style, aspectRatio]);

  // Fetch image suggestions
  const fetchSuggestions = async () => {
    setLoading(true);

    try {
      const keywords = generateSearchKeywords(pageType, industry, style);

      if (customKeywords.trim()) {
        keywords.push(...customKeywords.split(',').map((k) => k.trim()));
      }

      // Fetch from multiple sources
      const [stockPhotos, templateImages] = await Promise.all([
        searchImages(keywords, {
          limit: 8,
          aspectRatio,
        }),
        Promise.resolve(getTemplateImages(pageType, style)),
      ]);

      // Combine and sort by relevance
      const allSuggestions = [...stockPhotos, ...templateImages];

      const request: ImageSuggestionRequest = {
        pageType,
        industry,
        style,
        aspectRatio,
        keywords,
      };

      const sorted = sortImagesByRelevance(allSuggestions, request);
      setSuggestions(sorted);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle image selection
  const handleSelectImage = async (image: ImageSuggestion) => {
    setSelectedImage(image);
    onSelectImage?.(image);

    // Trigger download tracking for Unsplash
    if (image.source === 'stock' && image.downloadUrl) {
      unsplash.triggerDownload(image.downloadUrl);
    }

    // Extract colors from image
    try {
      const colors = await extractImageColors(image.url);
      setImageColors(colors);
    } catch (error) {
      console.error('Failed to extract colors:', error);
    }
  };

  // Generate AI image prompt
  const handleGeneratePrompt = () => {
    const prompt = generateImagePrompt(pageType, industry, style, aspectRatio);
    onGeneratePrompt?.(prompt);
  };

  // Image grid component
  const ImageGrid = ({ images }: { images: ImageSuggestion[] }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <Card
          key={image.id}
          className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
          onClick={() => handleSelectImage(image)}
        >
          <div className="aspect-video relative">
            <img
              src={image.thumbnail}
              alt={image.alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 text-xs"
            >
              {image.source}
            </Badge>
          </div>
          <div className="p-2">
            <p className="text-xs font-medium truncate">{image.title}</p>
            {image.author && (
              <p className="text-xs text-muted-foreground truncate">
                by {image.author.name}
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Image Assistant
            </CardTitle>
            <CardDescription>
              Find the perfect image for your {pageType} page
            </CardDescription>
          </div>
          <Button onClick={handleGeneratePrompt} variant="outline" size="sm">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Prompt
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="style">Style</Label>
            <Select value={style} onValueChange={(v) => setStyle(v as ImageStyle)}>
              <SelectTrigger id="style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
            <Select
              value={aspectRatio}
              onValueChange={(v) => setAspectRatio(v as AspectRatio)}
            >
              <SelectTrigger id="aspect-ratio">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                <SelectItem value="1:1">1:1 (Square)</SelectItem>
                <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Custom Keywords</Label>
            <div className="flex gap-2">
              <Input
                id="keywords"
                placeholder="Add keywords..."
                value={customKeywords}
                onChange={(e) => setCustomKeywords(e.target.value)}
              />
              <Button onClick={fetchSuggestions} size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs for different sources */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="stock">Stock Photos</TabsTrigger>
            <TabsTrigger value="template">Templates</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-video" />
                ))}
              </div>
            ) : (
              <ImageGrid images={suggestions} />
            )}
          </TabsContent>

          <TabsContent value="stock" className="mt-4">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-video" />
                ))}
              </div>
            ) : (
              <ImageGrid
                images={suggestions.filter((img) => img.source === 'stock')}
              />
            )}
          </TabsContent>

          <TabsContent value="template" className="mt-4">
            <ImageGrid
              images={suggestions.filter((img) => img.source === 'template')}
            />
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <FileUploader
              accept="image/*"
              maxFiles={1}
              showPreview={true}
              onUpload={async (file) => {
                // TODO: Implement actual upload to CDN
                // For now, create object URL
                return URL.createObjectURL(file);
              }}
              onChange={(files) => {
                if (files.length > 0 && files[0].status === 'complete') {
                  const uploadedImage: ImageSuggestion = {
                    id: `upload-${files[0].id}`,
                    url: files[0].preview || '',
                    thumbnail: files[0].preview || '',
                    source: 'user-upload',
                    alt: generateAltText(pageType, industry, []),
                    title: files[0].file.name,
                    tags: [],
                    aspectRatio: '16:9',
                  };
                  handleSelectImage(uploadedImage);
                }
              }}
            />
          </TabsContent>
        </Tabs>

        {/* Selected Image Preview */}
        {selectedImage && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="text-sm">Selected Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.alt}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedImage.title}
                  </span>
                  <Badge variant="outline">{selectedImage.aspectRatio}</Badge>
                </div>

                {selectedImage.author && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>by {selectedImage.author.name}</span>
                    {selectedImage.author.url && (
                      <a
                        href={selectedImage.author.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}

                {imageColors.length > 0 && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs">
                      <Palette className="h-3 w-3" />
                      Extracted Colors
                    </Label>
                    <div className="flex gap-2">
                      {imageColors.map((color, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded border border-border"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  <strong>Alt text:</strong> {selectedImage.alt}
                </div>
              </div>

              <Button className="w-full" onClick={() => onSelectImage?.(selectedImage)}>
                <Download className="h-4 w-4 mr-2" />
                Use This Image
              </Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
