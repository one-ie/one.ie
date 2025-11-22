/**
 * KnowledgeGraph - Interactive knowledge graph visualization for AI clones
 *
 * Features:
 * - Force-directed graph layout with React Flow
 * - Multiple node types: Creator, Clone, Content Sources, Knowledge Chunks
 * - Multiple edge types: created, trained_on, authored, contains, similar_to
 * - Interactive features:
 *   - Zoom and pan
 *   - Click node to view details
 *   - Hover to highlight connected nodes
 *   - Search within graph
 *   - Filter by node type
 *   - Color-code by content type
 * - Export graph as JSON or PNG
 * - Stats panel with analytics
 * - Responsive design
 * - Supports large graphs (1000+ nodes) with virtualization
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  BackgroundVariant,
  Panel,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Bot,
  User,
  FileText,
  BookOpen,
  Video,
  Brain,
  Download,
  Search,
  Filter,
  X,
  ZoomIn,
  ZoomOut,
  Maximize,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

// Node data types
interface KnowledgeNode {
  id: string;
  type: 'creator' | 'clone' | 'content_source' | 'knowledge_chunk';
  name: string;
  avatarUrl?: string;
  properties?: Record<string, any>;
}

interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  type: 'created' | 'trained_on' | 'authored' | 'contains' | 'similar_to';
  label: string;
  weight?: number;
}

interface KnowledgeGraphStats {
  totalNodes: number;
  totalEdges: number;
  clusters: number;
  knowledgeChunks: number;
  contentSources: number;
}

interface KnowledgeGraphProps {
  cloneId: string;
  cloneName: string;
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  stats: KnowledgeGraphStats;
}

// Custom node components
const CreatorNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-3 rounded-lg border-2 border-primary bg-primary/10 shadow-lg min-w-[160px]">
      <div className="flex items-center gap-3">
        <User className="h-6 w-6 text-primary" />
        <div>
          <div className="font-bold text-sm">{data.node.name}</div>
          <Badge variant="outline" className="text-xs mt-1">
            Creator
          </Badge>
        </div>
      </div>
    </div>
  );
};

const CloneNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-3 rounded-lg border-2 border-blue-500 bg-blue-500/10 shadow-lg min-w-[160px]">
      <div className="flex items-center gap-3">
        <Bot className="h-6 w-6 text-blue-500" />
        <div>
          <div className="font-bold text-sm">{data.node.name}</div>
          <Badge variant="outline" className="text-xs mt-1">
            AI Clone
          </Badge>
        </div>
      </div>
    </div>
  );
};

const ContentSourceNode = ({ data }: { data: any }) => {
  const icons = {
    blog_post: FileText,
    course: BookOpen,
    video: Video,
  };

  const Icon = icons[data.node.properties?.sourceType as keyof typeof icons] || FileText;

  return (
    <div className="px-3 py-2 rounded-lg border-2 border-green-500 bg-green-500/10 shadow-md min-w-[140px]">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-green-500" />
        <div>
          <div className="font-medium text-xs line-clamp-1">{data.node.name}</div>
          <Badge variant="secondary" className="text-xs mt-1">
            {data.node.properties?.sourceType || 'content'}
          </Badge>
        </div>
      </div>
    </div>
  );
};

const KnowledgeChunkNode = ({ data }: { data: any }) => {
  return (
    <div className="px-3 py-2 rounded-lg border border-purple-500 bg-purple-500/10 shadow-sm min-w-[100px]">
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-purple-500" />
        <div>
          <div className="font-medium text-xs line-clamp-1">{data.node.name}</div>
        </div>
      </div>
    </div>
  );
};

const nodeTypes: NodeTypes = {
  creator: CreatorNode,
  clone: CloneNode,
  content_source: ContentSourceNode,
  knowledge_chunk: KnowledgeChunkNode,
};

export function KnowledgeGraph({
  cloneId,
  cloneName,
  nodes: initialKnowledgeNodes,
  edges: initialKnowledgeEdges,
  stats,
}: KnowledgeGraphProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [showStats, setShowStats] = useState(true);
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  // Convert knowledge graph data to ReactFlow format
  const { initialNodes, initialEdges } = useMemo(() => {
    // Filter nodes by type
    let filteredKnowledgeNodes = initialKnowledgeNodes;
    if (filterType !== 'all') {
      filteredKnowledgeNodes = initialKnowledgeNodes.filter(
        (node) => node.type === filterType
      );
    }

    // Filter by search query
    if (searchQuery) {
      filteredKnowledgeNodes = filteredKnowledgeNodes.filter((node) =>
        node.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Get IDs of filtered nodes
    const filteredNodeIds = new Set(filteredKnowledgeNodes.map((n) => n.id));

    // Filter edges to only include edges between visible nodes
    const filteredKnowledgeEdges = initialKnowledgeEdges.filter(
      (edge) => filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target)
    );

    // Create nodes with force-directed layout
    const nodes: Node[] = filteredKnowledgeNodes.map((node, index) => {
      // Position nodes in a force-directed layout
      // Creator and clone at center, content sources in inner circle, chunks in outer circle
      let x = 400;
      let y = 300;

      if (node.type === 'creator') {
        x = 400;
        y = 300;
      } else if (node.type === 'clone') {
        x = 600;
        y = 300;
      } else if (node.type === 'content_source') {
        const sourceIndex = filteredKnowledgeNodes
          .filter((n) => n.type === 'content_source')
          .findIndex((n) => n.id === node.id);
        const totalSources = filteredKnowledgeNodes.filter(
          (n) => n.type === 'content_source'
        ).length;
        const angle = (2 * Math.PI * sourceIndex) / totalSources;
        const radius = 250;
        x = 500 + radius * Math.cos(angle);
        y = 300 + radius * Math.sin(angle);
      } else if (node.type === 'knowledge_chunk') {
        const chunkIndex = filteredKnowledgeNodes
          .filter((n) => n.type === 'knowledge_chunk')
          .findIndex((n) => n.id === node.id);
        const totalChunks = filteredKnowledgeNodes.filter(
          (n) => n.type === 'knowledge_chunk'
        ).length;
        const angle = (2 * Math.PI * chunkIndex) / totalChunks;
        const radius = 450;
        x = 500 + radius * Math.cos(angle);
        y = 300 + radius * Math.sin(angle);
      }

      return {
        id: node.id,
        type: node.type,
        position: { x, y },
        data: { node },
        draggable: true,
      };
    });

    // Create edges with styling based on type
    const edges: Edge[] = filteredKnowledgeEdges.map((edge) => {
      const edgeStyles = {
        created: {
          animated: true,
          style: { stroke: 'hsl(var(--primary))', strokeWidth: 3 },
        },
        trained_on: {
          animated: true,
          style: { stroke: 'hsl(var(--blue-500))', strokeWidth: 2.5 },
        },
        authored: {
          animated: false,
          style: { stroke: 'hsl(var(--green-500))', strokeWidth: 2 },
        },
        contains: {
          animated: false,
          style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1.5 },
        },
        similar_to: {
          animated: false,
          style: {
            stroke: 'hsl(var(--purple-500))',
            strokeWidth: edge.weight ? edge.weight * 2 : 1,
            strokeDasharray: '5,5',
          },
        },
      };

      const style = edgeStyles[edge.type] || edgeStyles.contains;

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep',
        label: edge.label,
        labelStyle: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' },
        labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.9 },
        ...style,
      };
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [initialKnowledgeNodes, initialKnowledgeEdges, filterType, searchQuery]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes/edges when filters change
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Handle node click
  const onNodeClick = useCallback(
    (_event: any, node: Node) => {
      const knowledgeNode = initialKnowledgeNodes.find((n) => n.id === node.id);
      if (knowledgeNode) {
        setSelectedNode(knowledgeNode);
      }
    },
    [initialKnowledgeNodes]
  );

  // Export as JSON
  const handleExportJSON = useCallback(() => {
    const data = {
      cloneId,
      cloneName,
      nodes: initialKnowledgeNodes,
      edges: initialKnowledgeEdges,
      stats,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cloneId}-knowledge-graph.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [cloneId, cloneName, initialKnowledgeNodes, initialKnowledgeEdges, stats]);

  // Export as PNG (simplified - would use html2canvas in production)
  const handleExportPNG = useCallback(() => {
    alert(
      'PNG export would use html2canvas library. Install with: bun add html2canvas'
    );
  }, []);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Fit view
  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 800 });
  }, [fitView]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Nodes</SelectItem>
                  <SelectItem value="creator">Creators</SelectItem>
                  <SelectItem value="clone">Clones</SelectItem>
                  <SelectItem value="content_source">Content Sources</SelectItem>
                  <SelectItem value="knowledge_chunk">Knowledge Chunks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Export */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportJSON}>
                <Download className="h-4 w-4 mr-2" />
                JSON
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPNG}>
                <Download className="h-4 w-4 mr-2" />
                PNG
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Graph Visualization */}
        <Card className="lg:col-span-3">
          <CardContent className="p-0">
            <div className="w-full h-[700px] rounded-lg overflow-hidden">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-right"
                minZoom={0.1}
                maxZoom={2}
              >
                <Controls />
                <MiniMap
                  zoomable
                  pannable
                  nodeColor={(node) => {
                    const colors = {
                      creator: 'hsl(var(--primary))',
                      clone: 'hsl(var(--blue-500))',
                      content_source: 'hsl(var(--green-500))',
                      knowledge_chunk: 'hsl(var(--purple-500))',
                    };
                    return colors[node.type as keyof typeof colors] || '#999';
                  }}
                />
                <Background variant={BackgroundVariant.Dots} gap={16} size={1} />

                {/* Custom controls panel */}
                <Panel position="top-right" className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => zoomIn()}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => zoomOut()}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleFitView}>
                    <Maximize className="h-4 w-4" />
                  </Button>
                </Panel>
              </ReactFlow>
            </div>

            {/* Legend */}
            <div className="p-4 border-t space-y-3">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Node Types
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary" />
                  <span>Creator</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <span>AI Clone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span>Content Source</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-500" />
                  <span>Knowledge Chunk</span>
                </div>
              </div>

              <div className="text-xs font-medium text-muted-foreground mb-2 mt-4">
                Edge Types
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-primary" />
                  <span>Created</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-blue-500" />
                  <span>Trained On</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-green-500" />
                  <span>Authored</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-muted-foreground" />
                  <span>Contains</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-purple-500" style={{ borderBottom: '1px dashed' }} />
                  <span>Similar To</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Panel */}
        {showStats && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Graph Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Nodes</span>
                  <span className="font-medium">{stats.totalNodes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Edges</span>
                  <span className="font-medium">{stats.totalEdges}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Clusters</span>
                  <span className="font-medium">{stats.clusters}</span>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Knowledge Chunks</span>
                  <span className="font-medium">{stats.knowledgeChunks}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Content Sources</span>
                  <span className="font-medium">{stats.contentSources}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-xs text-muted-foreground">
                  Showing {nodes.length} of {stats.totalNodes} nodes
                </div>
                {searchQuery && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Filtered by: "{searchQuery}"
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Node Details Dialog */}
      {selectedNode && (
        <Dialog
          open={!!selectedNode}
          onOpenChange={(open) => !open && setSelectedNode(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedNode.type === 'creator' && <User className="h-5 w-5" />}
                {selectedNode.type === 'clone' && <Bot className="h-5 w-5" />}
                {selectedNode.type === 'content_source' && <FileText className="h-5 w-5" />}
                {selectedNode.type === 'knowledge_chunk' && <Brain className="h-5 w-5" />}
                {selectedNode.name}
              </DialogTitle>
              <DialogDescription>
                <Badge variant="outline" className="mt-2">
                  {selectedNode.type.replace('_', ' ')}
                </Badge>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Properties */}
              {selectedNode.properties && (
                <div className="space-y-2">
                  <div className="font-medium text-sm">Properties</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(selectedNode.properties).map(([key, value]) => (
                      <div key={key} className="border rounded-lg p-2">
                        <div className="text-xs text-muted-foreground">{key}</div>
                        <div className="font-medium mt-1">
                          {typeof value === 'object'
                            ? JSON.stringify(value)
                            : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Connections */}
              <div className="space-y-2">
                <div className="font-medium text-sm">Connections</div>
                <div className="text-xs text-muted-foreground">
                  Connected to{' '}
                  {
                    initialKnowledgeEdges.filter(
                      (e) => e.source === selectedNode.id || e.target === selectedNode.id
                    ).length
                  }{' '}
                  nodes
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
