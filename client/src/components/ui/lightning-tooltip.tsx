import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface LightningTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  icon?: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export function LightningTooltip({
  children,
  content,
  icon = <Info className="h-3 w-3 text-bitcoin-orange" />,
  side = "top",
  align = "center",
}: LightningTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span className="cursor-help">
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side={side}
          align={align}
          className="max-w-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg p-3 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start gap-2">
            {icon}
            <span className="text-sm">{content}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}