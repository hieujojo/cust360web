'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Panel,
  Edge,
  Node,
  ReactFlowProvider,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CustomNode, { CustomNodeData } from './CustomNode';
import { initialNodesData, MindMapNode, rootId } from './xmindData';
import { getLayoutedElements } from './layout';
import { Search, X, ChevronRight } from 'lucide-react';

const nodeTypes = {
  custom: CustomNode,
};

function MindMapContent() {
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { fitView, getNodes } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Function to build visible nodes/edges based on collapsed state
  const buildGraph = useCallback(() => {
    const visibleNodesMap = new Map<string, MindMapNode>();
    const edgesList: Edge[] = [];

    // Traverse from root to compute visibility
    const traverse = (nodeId: string, isVisible: boolean) => {
      const nodeData = initialNodesData.find((n) => n.id === nodeId);
      if (!nodeData) return;

      if (isVisible) {
        visibleNodesMap.set(nodeId, nodeData);
      }

      const isCollapsed = collapsedNodes.has(nodeId);

      nodeData.childrenIds.forEach((childId) => {
        if (isVisible && !isCollapsed) {
          edgesList.push({
            id: `${nodeId}-${childId}`,
            source: nodeId,
            target: childId,
            type: 'smoothstep',
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#9ca3af'
            },
            style: {
              stroke: '#9ca3af',
              strokeWidth: 2,
            }
          });
        }
        traverse(childId, isVisible && !isCollapsed);
      });
    };

    traverse(rootId, true);

    const currentNodesMap = new Map(getNodes().map(n => [n.id, n]));

    const reactFlowNodes: Node[] = Array.from(visibleNodesMap.values()).map((n) => {
      const isMatched = searchQuery
        ? n.title.toLowerCase().includes(searchQuery.toLowerCase())
        : false;

      // Preserve existing position if available so layout doesn't completely jump
      const existingNode = currentNodesMap.get(n.id);

      return {
        id: n.id,
        type: 'custom',
        position: existingNode ? existingNode.position : { x: 0, y: 0 },
        measured: existingNode?.measured,
        data: {
          title: n.title,
          level: n.level,
          hasChildren: n.childrenIds.length > 0,
          isCollapsed: collapsedNodes.has(n.id),
          isMatched,
          onToggleCollapse: (id: string) => {
            setCollapsedNodes((prev) => {
              const next = new Set(prev);
              if (next.has(id)) {
                next.delete(id);
              } else {
                next.add(id);
              }
              return next;
            });
          },
          onNodeClick: (id: string) => {
            setSelectedNodeId(id);
          },
        } as CustomNodeData,
      };
    });

    // Apply layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      reactFlowNodes,
      edgesList,
      rootId
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

  }, [collapsedNodes, searchQuery, setNodes, setEdges, getNodes]);

  useEffect(() => {
    buildGraph();
  }, [buildGraph]);

  // Optionally refit view when nodes change significantly
  useEffect(() => {
    const timeout = setTimeout(() => {
      fitView({ duration: 800, padding: 0.2 });
    }, 100);
    return () => clearTimeout(timeout);
  }, [collapsedNodes, fitView]);

  const selectedNodeData = useMemo(() => {
    if (!selectedNodeId) return null;
    return initialNodesData.find((n) => n.id === selectedNodeId);
  }, [selectedNodeId]);

  return (
    <div className="w-full h-full flex relative bg-muted/30">
      <div className="flex-1 h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          nodesDraggable={true}
        >
          <Background color="#ccc" gap={16} />
          <Controls />
          <MiniMap 
            zoomable 
            pannable 
            nodeClassName={(node) => {
              const d = node.data as unknown as CustomNodeData;
              if (d.level === 0) return '!bg-blue-500';
              if (d.level === 1) return '!bg-emerald-500';
              if (d.level === 2) return '!bg-amber-500';
              if (d.level === 3) return '!bg-purple-500';
              return '!bg-gray-400';
            }} 
          />
          
          <Panel position="top-left" className="bg-card p-2 rounded shadow flex items-center space-x-2 border border-border">
            <Search size={18} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="border border-border bg-background text-foreground rounded px-2 py-1 text-sm outline-none focus:border-blue-500 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Panel>
        </ReactFlow>
      </div>

      {/* Right Panel */}
      {selectedNodeData && (
        <div className="w-80 h-full bg-card border-l border-border shadow-2xl flex flex-col z-50 absolute right-0 top-0 transition-transform duration-300 ease-in-out">
          <div className="p-4 border-b border-border flex justify-between items-center bg-muted/50">
            <h3 className="font-semibold text-foreground">Chi tiết Node</h3>
            <button
              onClick={() => setSelectedNodeId(null)}
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X size={20} className="text-muted-foreground" />
            </button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">Tên Node</h4>
              <p className="text-foreground font-medium leading-relaxed">{selectedNodeData.title}</p>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">Cấp độ (Level)</h4>
              <p className="text-foreground">{selectedNodeData.level}</p>
            </div>

            {selectedNodeData.childrenIds.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Node con ({selectedNodeData.childrenIds.length})</h4>
                <ul className="space-y-2">
                  {selectedNodeData.childrenIds.map((childId) => {
                    const child = initialNodesData.find((n) => n.id === childId);
                    return child ? (
                      <li
                        key={child.id}
                        className="flex items-start bg-muted/50 p-2 rounded border border-border hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950/20 cursor-pointer transition-colors"
                        onClick={() => setSelectedNodeId(child.id)}
                      >
                        <ChevronRight size={16} className="mt-0.5 mr-1 text-blue-500 flex-shrink-0" />
                        <span className="text-sm text-foreground">{child.title}</span>
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MindMap() {
  return (
    <ReactFlowProvider>
      <MindMapContent />
    </ReactFlowProvider>
  );
}
