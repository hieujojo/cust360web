import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type CustomNodeData = {
  title: string;
  level: number;
  hasChildren: boolean;
  isCollapsed: boolean;
  isMatched: boolean;
  onToggleCollapse: (id: string) => void;
  onNodeClick: (id: string) => void;
};

const levelColors = [
  'bg-blue-100 border-blue-400 text-blue-900', // Root
  'bg-emerald-100 border-emerald-400 text-emerald-900', // L1
  'bg-amber-100 border-amber-400 text-amber-900', // L2
  'bg-purple-100 border-purple-400 text-purple-900', // L3
  'bg-rose-100 border-rose-400 text-rose-900', // L4
];

const CustomNode = ({ id, data, selected, targetPosition, sourcePosition }: NodeProps) => {
  const customData = data as unknown as CustomNodeData;
  const levelClass = levelColors[Math.min(customData.level, levelColors.length - 1)];

  // For root node, we don't have a target handle, but we might want two source handles?
  // React Flow handles edges correctly as long as we define Handles.
  // Actually, for root, we should define both Left and Right source handles so edges can connect.
  const isRoot = customData.level === 0;

  return (
    <div
      className={cn(
        'relative flex items-center justify-between rounded-xl border-2 px-4 py-3 shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 max-w-[280px]',
        levelClass,
        selected ? 'ring-2 ring-indigo-500 ring-offset-2' : '',
        customData.isMatched ? 'animate-pulse ring-4 ring-yellow-400 ring-offset-2' : '',
        'cursor-pointer'
      )}
      onClick={() => customData.onNodeClick(id)}
    >
      {/* Target Handle */}
      {!isRoot && (
        <Handle type="target" position={targetPosition || Position.Left} className="w-2 h-2 !bg-gray-400" />
      )}

      {/* For Root, we need left and right source handles. For others, just one source handle */}
      {isRoot && (
        <>
          <Handle type="source" id="left" position={Position.Left} className="w-2 h-2 !bg-gray-400" />
          <Handle type="source" id="right" position={Position.Right} className="w-2 h-2 !bg-gray-400" />
        </>
      )}

      {/* Label */}
      <div className="flex-1 text-sm font-medium leading-tight">
        {customData.title}
      </div>

      {/* Expand/Collapse Button */}
      {customData.hasChildren && (
        <button
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full border border-gray-400 bg-white text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors z-10 focus:outline-none",
            sourcePosition === Position.Left ? "mr-3 order-first" : "ml-3"
          )}
          onClick={(e) => {
            e.stopPropagation();
            customData.onToggleCollapse(id);
          }}
        >
          {customData.isCollapsed ? '+' : '-'}
        </button>
      )}

      {/* Source Handle */}
      {!isRoot && customData.hasChildren && (
        <Handle type="source" position={sourcePosition || Position.Right} className="w-2 h-2 !bg-gray-400" />
      )}
    </div>
  );
};

export default memo(CustomNode);
