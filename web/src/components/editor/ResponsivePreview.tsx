/**
 * ResponsivePreview - Mobile responsive preview system
 *
 * Features:
 * - Device presets (iPhone, iPad, Android, Desktop)
 * - Custom dimensions
 * - Orientation toggle (portrait/landscape)
 * - Live preview with real-time updates
 * - Responsive warnings
 * - Touch simulation
 * - Uses SplitPane from ontology-ui/enhanced
 */

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  DEVICE_PRESETS,
  ORIENTATIONS,
  getDeviceDimensions,
  getDevicesByType,
  checkResponsiveWarnings,
  getBreakpointName,
  type DevicePreset,
  type Orientation,
} from "@/lib/editor/device-presets";
import {
  MonitorIcon,
  SmartphoneIcon,
  TabletIcon,
  RotateCwIcon,
  AlertTriangleIcon,
  MaximizeIcon,
  MinimizeIcon,
  RefreshCwIcon,
  ExternalLinkIcon,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface ResponsivePreviewProps {
  /** URL or content to preview */
  src?: string;
  /** HTML content to preview (alternative to src) */
  htmlContent?: string;
  /** Default device preset ID */
  defaultDevice?: string;
  /** Default orientation */
  defaultOrientation?: Orientation["id"];
  /** Callback when device changes */
  onDeviceChange?: (device: DevicePreset) => void;
  /** Callback when orientation changes */
  onOrientationChange?: (orientation: Orientation["id"]) => void;
  /** Show warnings */
  showWarnings?: boolean;
  /** Enable touch simulation */
  enableTouchSimulation?: boolean;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ResponsivePreview({
  src,
  htmlContent,
  defaultDevice = "iphone_14_pro",
  defaultOrientation = "portrait",
  onDeviceChange,
  onOrientationChange,
  showWarnings = true,
  enableTouchSimulation = true,
  className,
}: ResponsivePreviewProps) {
  // State
  const [selectedDeviceId, setSelectedDeviceId] = useState(defaultDevice);
  const [orientation, setOrientation] = useState<Orientation["id"]>(defaultOrientation);
  const [customWidth, setCustomWidth] = useState<number | null>(null);
  const [customHeight, setCustomHeight] = useState<number | null>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [scale, setScale] = useState(1);
  const [warnings, setWarnings] = useState<
    Array<{ type: string; message: string }>
  >([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchPoints, setTouchPoints] = useState<Array<{ x: number; y: number }>>([]);

  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get current device
  const selectedDevice = DEVICE_PRESETS[selectedDeviceId];

  // Calculate dimensions
  const dimensions = isCustomMode && customWidth && customHeight
    ? { width: customWidth, height: customHeight }
    : getDeviceDimensions(selectedDevice, orientation);

  // Auto-scale preview to fit container
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth - 48; // Padding
    const containerHeight = container.clientHeight - 48;

    const scaleX = containerWidth / dimensions.width;
    const scaleY = containerHeight / dimensions.height;
    const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%

    setScale(newScale);
  }, [dimensions.width, dimensions.height]);

  // Check for responsive warnings
  useEffect(() => {
    if (!showWarnings) return;

    const newWarnings = checkResponsiveWarnings(
      dimensions.width,
      dimensions.height,
      dimensions.width,
      dimensions.height
    );

    setWarnings(newWarnings);
  }, [dimensions, showWarnings]);

  // Handle device change
  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setIsCustomMode(false);
    onDeviceChange?.(DEVICE_PRESETS[deviceId]);
  };

  // Handle orientation toggle
  const handleOrientationToggle = () => {
    const newOrientation = orientation === "portrait" ? "landscape" : "portrait";
    setOrientation(newOrientation);
    onOrientationChange?.(newOrientation);
  };

  // Handle custom dimensions
  const handleCustomDimensions = () => {
    setIsCustomMode(true);
    if (!customWidth) setCustomWidth(dimensions.width);
    if (!customHeight) setCustomHeight(dimensions.height);
  };

  // Handle refresh
  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  // Handle fullscreen toggle
  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Touch simulation (visual feedback)
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (!enableTouchSimulation) return;

    const rect = iframeRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    setTouchPoints([...touchPoints, { x, y }]);

    // Remove touch point after animation
    setTimeout(() => {
      setTouchPoints((prev) => prev.slice(1));
    }, 1000);
  };

  // Render device type icon
  const renderDeviceIcon = (type: DevicePreset["type"]) => {
    switch (type) {
      case "mobile":
        return <SmartphoneIcon className="h-4 w-4" />;
      case "tablet":
        return <TabletIcon className="h-4 w-4" />;
      case "desktop":
        return <MonitorIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      <div className="border-b bg-muted/50 p-3 space-y-3">
        {/* Device Selection */}
        <div className="flex items-center gap-2 flex-wrap">
          <Label className="text-xs font-medium">Device:</Label>
          <Select value={selectedDeviceId} onValueChange={handleDeviceChange}>
            <SelectTrigger className="w-48 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {/* Mobile */}
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Mobile
              </div>
              {getDevicesByType("mobile").map((device) => (
                <SelectItem key={device.id} value={device.id}>
                  <div className="flex items-center gap-2">
                    <SmartphoneIcon className="h-3 w-3" />
                    {device.name}
                  </div>
                </SelectItem>
              ))}

              {/* Tablet */}
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                Tablet
              </div>
              {getDevicesByType("tablet").map((device) => (
                <SelectItem key={device.id} value={device.id}>
                  <div className="flex items-center gap-2">
                    <TabletIcon className="h-3 w-3" />
                    {device.name}
                  </div>
                </SelectItem>
              ))}

              {/* Desktop */}
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                Desktop
              </div>
              {getDevicesByType("desktop").map((device) => (
                <SelectItem key={device.id} value={device.id}>
                  <div className="flex items-center gap-2">
                    <MonitorIcon className="h-3 w-3" />
                    {device.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Orientation Toggle */}
          {selectedDevice.type !== "desktop" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOrientationToggle}
                    className="h-8"
                  >
                    <RotateCwIcon className="h-4 w-4 mr-1" />
                    {orientation === "portrait" ? "Portrait" : "Landscape"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle orientation (Cmd/Ctrl + R)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Dimensions */}
          <div className="flex items-center gap-2 ml-auto">
            <Badge variant="outline" className="font-mono text-xs">
              {dimensions.width} × {dimensions.height}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {getBreakpointName(dimensions.width)}
            </Badge>
            {selectedDevice.hasTouch && (
              <Badge variant="default" className="text-xs">
                Touch
              </Badge>
            )}
          </div>

          {/* Actions */}
          <Separator orientation="vertical" className="h-6" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCwIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh preview</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFullscreenToggle}
                  className="h-8 w-8 p-0"
                >
                  {isFullscreen ? (
                    <MinimizeIcon className="h-4 w-4" />
                  ) : (
                    <MaximizeIcon className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFullscreen ? "Exit fullscreen" : "Fullscreen"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {src && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(src, "_blank")}
                    className="h-8 w-8 p-0"
                  >
                    <ExternalLinkIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open in new tab</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Custom Dimensions */}
        {isCustomMode && (
          <div className="flex items-center gap-2">
            <Label className="text-xs">Width:</Label>
            <Input
              type="number"
              value={customWidth || ""}
              onChange={(e) => setCustomWidth(Number(e.target.value))}
              className="w-24 h-8"
            />
            <Label className="text-xs">Height:</Label>
            <Input
              type="number"
              value={customHeight || ""}
              onChange={(e) => setCustomHeight(Number(e.target.value))}
              className="w-24 h-8"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCustomMode(false)}
              className="h-8"
            >
              Reset
            </Button>
          </div>
        )}

        {!isCustomMode && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCustomDimensions}
            className="h-8 text-xs"
          >
            Custom Dimensions
          </Button>
        )}
      </div>

      {/* Warnings */}
      {showWarnings && warnings.length > 0 && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-b space-y-2">
          {warnings.map((warning, index) => (
            <Alert key={index} variant="default" className="py-2">
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertTitle className="text-sm font-medium">
                {warning.type === "overflow" && "Content Overflow"}
                {warning.type === "horizontal-scroll" && "Horizontal Scroll"}
                {warning.type === "vertical-scroll" && "Vertical Scroll"}
              </AlertTitle>
              <AlertDescription className="text-xs">
                {warning.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Preview Container */}
      <div
        ref={containerRef}
        className={cn(
          "flex-1 flex items-center justify-center bg-muted/20 p-6 overflow-auto",
          isFullscreen && "fixed inset-0 z-50 bg-background"
        )}
      >
        {/* Device Frame */}
        <div
          className="relative bg-background rounded-lg shadow-2xl overflow-hidden border-8 border-gray-800"
          style={{
            width: dimensions.width * scale,
            height: dimensions.height * scale,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          {/* Preview Iframe */}
          <iframe
            ref={iframeRef}
            src={src}
            srcDoc={htmlContent}
            className="w-full h-full"
            style={{
              width: dimensions.width,
              height: dimensions.height,
              transform: `scale(${1 / scale})`,
              transformOrigin: "top left",
            }}
            title="Responsive Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onTouchStart={handleTouchStart}
            onMouseDown={handleTouchStart}
          />

          {/* Touch Points Visualization */}
          {enableTouchSimulation &&
            touchPoints.map((point, index) => (
              <div
                key={index}
                className="absolute pointer-events-none"
                style={{
                  left: point.x,
                  top: point.y,
                  width: 60,
                  height: 60,
                  marginLeft: -30,
                  marginTop: -30,
                }}
              >
                <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />
                <div className="absolute inset-0 rounded-full bg-blue-500/50" />
              </div>
            ))}

          {/* Device Info Overlay */}
          <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-mono">
            {selectedDevice.name} • {dimensions.width}×{dimensions.height}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * Example: Funnel preview with responsive testing
 */
export function FunnelResponsivePreview({
  funnelUrl,
  funnelHtml,
}: {
  funnelUrl?: string;
  funnelHtml?: string;
}) {
  const [device, setDevice] = useState<DevicePreset | null>(null);
  const [orientation, setOrientation] = useState<Orientation["id"]>("portrait");

  return (
    <ResponsivePreview
      src={funnelUrl}
      htmlContent={funnelHtml}
      defaultDevice="iphone_14_pro"
      defaultOrientation="portrait"
      onDeviceChange={setDevice}
      onOrientationChange={setOrientation}
      showWarnings={true}
      enableTouchSimulation={true}
    />
  );
}
