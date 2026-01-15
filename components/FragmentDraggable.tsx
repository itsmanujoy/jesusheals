"use client";

import { Fragment } from "@/utils/fragmentSplitter";

interface FragmentDraggableProps {
  fragment: Fragment;
  isSelected: boolean;
  onClick: () => void;
  isInOrder: boolean;
}

export function FragmentDraggable({
  fragment,
  isSelected,
  onClick,
  isInOrder,
}: FragmentDraggableProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 md:px-4 py-2 md:py-3 rounded-lg border-2 transition-all touch-target active:scale-95
        ${
          isSelected
            ? "border-church-blue bg-blue-100 shadow-lg scale-105"
            : "border-gray-300 bg-white hover:border-church-blue hover:bg-blue-50"
        }
        ${isInOrder ? "ring-2 ring-green-400" : ""}
      `}
    >
      <span className="text-xs md:text-lg font-medium text-gray-800 block break-words max-w-[150px]">{fragment.text}</span>
    </button>
  );
}

