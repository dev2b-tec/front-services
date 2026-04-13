'use client'

import { ReactNode } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface BotaoComTooltipProps {
  children: ReactNode
  tooltip: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function BotaoComTooltip({ children, tooltip, side = 'top', className = '' }: BotaoComTooltipProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={className}>
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
