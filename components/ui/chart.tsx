import type * as React from "react"

export const Chart = () => {
  return null
}

export const ChartContainer = ({
  children,
  data,
  xAxisKey,
  yAxisKey,
  className,
}: {
  children: React.ReactNode
  data: any[]
  xAxisKey: string
  yAxisKey: string
  className?: string
}) => {
  return <div className={className}>{children}</div>
}

export const ChartTooltip = ({ children }: { children?: React.ReactNode }) => {
  return null
}

export const ChartTooltipContent = () => {
  return null
}

export const ChartLegend = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={className}>{children}</div>
}

export const ChartLegendItem = ({ name, color }: { name: string; color: string }) => {
  return null
}

export const ChartGrid = () => {
  return null
}

export const ChartXAxis = () => {
  return null
}

export const ChartYAxis = () => {
  return null
}

export const ChartLine = ({
  x,
  y,
  strokeWidth,
  className,
}: { x: string; y: string; strokeWidth: number; className?: string }) => {
  return null
}

export const ChartBar = ({ x, y, className }: { x: string; y: string; className?: string }) => {
  return null
}

export const ChartArea = ({ x, y, className }: { x: string; y: string; className?: string }) => {
  return null
}
