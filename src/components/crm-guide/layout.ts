import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';

export const getLayoutedElements = (nodes: Node[], edges: Edge[], rootId: string) => {
  const rootNode = nodes.find(n => n.id === rootId);
  if (!rootNode) return { nodes, edges };

  // Find direct children of root
  const rootEdges = edges.filter(e => e.source === rootId);
  const rootChildrenIds = rootEdges.map(e => e.target);

  // Split direct children into Left and Right sets
  const half = Math.ceil(rootChildrenIds.length / 2);
  const rightChildIds = new Set(rootChildrenIds.slice(0, half));
  const leftChildIds = new Set(rootChildrenIds.slice(half));

  // Helper to get all descendants of a set of ids
  const getDescendants = (startIds: Set<string>) => {
    const descendants = new Set<string>(startIds);
    let currentLevel = Array.from(startIds);
    while (currentLevel.length > 0) {
      const nextLevel: string[] = [];
      edges.forEach(e => {
        if (currentLevel.includes(e.source)) {
          descendants.add(e.target);
          nextLevel.push(e.target);
        }
      });
      currentLevel = nextLevel;
    }
    return descendants;
  };

  const rightNodesIds = getDescendants(rightChildIds);
  const leftNodesIds = getDescendants(leftChildIds);

  const rightNodes = nodes.filter(n => rightNodesIds.has(n.id) || n.id === rootId);
  const rightEdges = edges.filter(e => rightNodesIds.has(e.source) && rightNodesIds.has(e.target) || e.source === rootId && rightChildIds.has(e.target));

  const leftNodes = nodes.filter(n => leftNodesIds.has(n.id) || n.id === rootId);
  const leftEdges = edges.filter(e => leftNodesIds.has(e.source) && leftNodesIds.has(e.target) || e.source === rootId && leftChildIds.has(e.target));

  // Layout Right side
  const dagreRight = new dagre.graphlib.Graph();
  dagreRight.setDefaultEdgeLabel(() => ({}));
  dagreRight.setGraph({ rankdir: 'LR', ranksep: 120, nodesep: 40 });
  
  rightNodes.forEach(n => {
    dagreRight.setNode(n.id, { width: n.measured?.width || 250, height: n.measured?.height || 60 });
  });
  rightEdges.forEach(e => { dagreRight.setEdge(e.source, e.target); });
  dagre.layout(dagreRight);

  // Layout Left side
  const dagreLeft = new dagre.graphlib.Graph();
  dagreLeft.setDefaultEdgeLabel(() => ({}));
  // Trick: layout LR, then mirror the X coordinates later
  dagreLeft.setGraph({ rankdir: 'LR', ranksep: 120, nodesep: 40 });

  leftNodes.forEach(n => {
    dagreLeft.setNode(n.id, { width: n.measured?.width || 250, height: n.measured?.height || 60 });
  });
  leftEdges.forEach(e => { dagreLeft.setEdge(e.source, e.target); });
  dagre.layout(dagreLeft);

  // Merge the two layouts
  const layoutedNodes: Node[] = [];
  const rootRightPos = dagreRight.node(rootId);
  const rootLeftPos = dagreLeft.node(rootId);

  nodes.forEach(node => {
    let x = 0;
    let y = 0;
    let targetPos = 'left';
    let sourcePos = 'right';

    const width = node.measured?.width || 250;
    const height = node.measured?.height || 60;

    if (node.id === rootId) {
      x = 0;
      y = 0;
    } else if (rightNodesIds.has(node.id)) {
      const pos = dagreRight.node(node.id);
      x = pos.x - rootRightPos.x;
      y = pos.y - rootRightPos.y;
      targetPos = 'left';
      sourcePos = 'right';
    } else if (leftNodesIds.has(node.id)) {
      const pos = dagreLeft.node(node.id);
      x = -(pos.x - rootLeftPos.x);
      y = pos.y - rootLeftPos.y;
      targetPos = 'right';
      sourcePos = 'left';
    }

    layoutedNodes.push({
      ...node,
      targetPosition: targetPos as any,
      sourcePosition: sourcePos as any,
      position: {
        x: x - width / 2,
        y: y - height / 2,
      },
    });
  });

  const layoutedEdges = edges.map(edge => {
    if (edge.source === rootId) {
      if (rightChildIds.has(edge.target)) {
        return { ...edge, sourceHandle: 'right' };
      } else if (leftChildIds.has(edge.target)) {
        return { ...edge, sourceHandle: 'left' };
      }
    }
    return edge;
  });

  return { nodes: layoutedNodes, edges: layoutedEdges };
};
