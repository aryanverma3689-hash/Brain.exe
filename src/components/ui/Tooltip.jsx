import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import React from 'react';
import { cn } from '../../lib/utils';

export function TooltipProvider({ children }) {
  return <TooltipPrimitive.Provider delayDuration={200}>{children}</TooltipPrimitive.Provider>;
}

export function Tooltip({ children, content, side = 'top', align = 'center', className }) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          sideOffset={6}
          className={cn(
            "z-50 rounded-md bg-[#18181b] px-3 py-1.5 text-xs font-medium text-white shadow-xl border border-white/10",
            className
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-[#18181b]" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
