/**
 * PluginDependencyGraph Component
 * Visual dependency graph showing plugin relationships
 * Based on NetworkGraph pattern with plugin-specific styling
 */

import React, { useRef, useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Plugin, PluginDependency } from "@/types/plugin";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface PluginDependencyGraphProps {
  plugins: Plugin[];
  dependencies: PluginDependency[];
  onPluginClick?: (plugin: Plugin) => void;
  className?: string;
}

interface Node {
  id: string;
  plugin: Plugin;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Edge {
  source: Node;
  target: Node;
  dependency: PluginDependency;
}

const categoryColors: Record<string, string> = {
  blockchain: "#a855f7",
  knowledge: "#3b82f6",
  client: "#22c55e",
  browser: "#f97316",
  llm: "#ec4899",
  provider: "#06b6d4",
  evaluator: "#eab308",
  adapter: "#6366f1",
  service: "#6b7280",
};

export function PluginDependencyGraph({
  plugins,
  dependencies,
  onPluginClick,
  className,
}: PluginDependencyGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [dragNode, setDragNode] = useState<Node | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();

  // Initialize nodes and edges
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    // Create nodes
    const nodeMap = new Map<string, Node>();
    plugins.forEach((plugin) => {
      nodeMap.set(plugin._id, {
        id: plugin._id,
        plugin,
        x: width / 2 + (Math.random() - 0.5) * 300,
        y: height / 2 + (Math.random() - 0.5) * 300,
        vx: 0,
        vy: 0,
        radius: 25,
      });
    });

    // Create edges
    const edgeList: Edge[] = [];
    dependencies.forEach((dep) => {
      const source = nodeMap.get(dep.pluginId);
      dep.dependsOn.forEach((targetId) => {
        const target = nodeMap.get(targetId);
        if (source && target) {
          edgeList.push({ source, target, dependency: dep });
        }
      });
    });

    setNodes(Array.from(nodeMap.values()));
    setEdges(edgeList);
  }, [plugins, dependencies]);

  // Force simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    const simulate = () => {
      // Apply forces
      nodes.forEach((node) => {
        // Reset forces
        node.vx *= 0.9;
        node.vy *= 0.9;

        // Centering force
        const centerX = (canvasRef.current?.width ?? 800) / 2;
        const centerY = (canvasRef.current?.height ?? 600) / 2;
        node.vx += (centerX - node.x) * 0.001;
        node.vy += (centerY - node.y) * 0.001;

        // Repulsion between nodes
        nodes.forEach((other) => {
          if (node === other) return;
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 250 && distance > 0) {
            const force = -150 / (distance * distance);
            node.vx += (dx / distance) * force;
            node.vy += (dy / distance) * force;
          }
        });
      });

      // Spring force for edges
      edges.forEach(({ source, target }) => {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const targetDistance = 180;

        if (distance > 0) {
          const force = (distance - targetDistance) * 0.015;
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          source.vx += fx;
          source.vy += fy;
          target.vx -= fx;
          target.vy -= fy;
        }
      });

      // Update positions
      nodes.forEach((node) => {
        if (node !== dragNode) {
          node.x += node.vx;
          node.y += node.vy;

          // Boundary constraints
          const canvas = canvasRef.current;
          if (canvas) {
            node.x = Math.max(
              node.radius,
              Math.min(canvas.width - node.radius, node.x)
            );
            node.y = Math.max(
              node.radius,
              Math.min(canvas.height - node.radius, node.y)
            );
          }
        }
      });

      setNodes([...nodes]);
      animationFrameRef.current = requestAnimationFrame(simulate);
    };

    animationFrameRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [nodes, edges, dragNode]);

  // Render to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transforms
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw edges
    edges.forEach(({ source, target }) => {
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);

      ctx.strokeStyle = "rgba(156, 163, 175, 0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Arrow
      const angle = Math.atan2(target.y - source.y, target.x - source.x);
      const arrowX = target.x - Math.cos(angle) * target.radius;
      const arrowY = target.y - Math.sin(angle) * target.radius;

      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(
        arrowX - 10 * Math.cos(angle - Math.PI / 6),
        arrowY - 10 * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        arrowX - 10 * Math.cos(angle + Math.PI / 6),
        arrowY - 10 * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = "rgba(156, 163, 175, 0.5)";
      ctx.fill();
    });

    // Draw nodes
    nodes.forEach((node) => {
      const isHovered = hoveredNode === node;
      const color = categoryColors[node.plugin.category] || "#6b7280";

      // Circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      ctx.fillStyle = isHovered ? color : color + "cc";
      ctx.fill();

      ctx.strokeStyle = isHovered ? "#ffffff" : color;
      ctx.lineWidth = isHovered ? 3 : 2;
      ctx.stroke();

      // Plugin name (first letter)
      ctx.font = isHovered ? "bold 18px sans-serif" : "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "white";
      ctx.fillText(node.plugin.name[0].toUpperCase(), node.x, node.y);

      // Label
      if (isHovered) {
        ctx.font = "12px sans-serif";
        ctx.fillStyle = color;
        const metrics = ctx.measureText(node.plugin.name);
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.fillRect(
          node.x - metrics.width / 2 - 4,
          node.y + node.radius + 8,
          metrics.width + 8,
          20
        );
        ctx.fillStyle = "#1f2937";
        ctx.fillText(node.plugin.name, node.x, node.y + node.radius + 18);
      }
    });

    ctx.restore();
  }, [nodes, edges, hoveredNode, zoom, pan]);

  // Mouse events
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    if (dragNode) {
      dragNode.x = x;
      dragNode.y = y;
      dragNode.vx = 0;
      dragNode.vy = 0;
      return;
    }

    // Check hover
    const hovered = nodes.find((node) => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < node.radius;
    });

    setHoveredNode(hovered || null);
  };

  const handleMouseDown = () => {
    if (hoveredNode) {
      setDragNode(hoveredNode);
    }
  };

  const handleMouseUp = () => {
    setDragNode(null);
  };

  const handleClick = () => {
    if (hoveredNode && onPluginClick) {
      onPluginClick(hoveredNode.plugin);
    }
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.2, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.2, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Plugin Dependency Graph</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleReset}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border rounded-lg w-full bg-gray-50 dark:bg-gray-900 cursor-move"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
        />

        {hoveredNode && (
          <div className="p-3 bg-secondary rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{hoveredNode.plugin.name}</p>
              <Badge className="text-xs">
                {hoveredNode.plugin.category}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {hoveredNode.plugin.description}
            </p>
            {hoveredNode.plugin.dependencies.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Dependencies: {hoveredNode.plugin.dependencies.length}
              </p>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryColors).map(([category, color]) => (
            <Badge
              key={category}
              variant="outline"
              className="text-xs"
              style={{ borderColor: color, color }}
            >
              {category}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
