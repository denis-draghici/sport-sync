"use client"

import * as React from "react"
import { format, setHours, setMinutes } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface DateTimePickerProps {
  value?: string // ISO string or datetime-local string (YYYY-MM-DDTHH:mm)
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function DateTimePicker({ value, onChange, placeholder = "Pick date & time", className }: DateTimePickerProps) {
  const date = value ? new Date(value) : undefined
  const [open, setOpen] = React.useState(false)

  const hours = date ? date.getHours() : 12
  const minutes = date ? date.getMinutes() : 0

  function handleDaySelect(day: Date | undefined) {
    if (!day) return
    const base = date ?? new Date()
    const next = setMinutes(setHours(day, base.getHours() || 12), base.getMinutes() || 0)
    onChange(format(next, "yyyy-MM-dd'T'HH:mm"))
  }

  function handleHourChange(h: string) {
    const base = date ?? new Date()
    const next = setHours(base, parseInt(h))
    onChange(format(next, "yyyy-MM-dd'T'HH:mm"))
  }

  function handleMinuteChange(m: string) {
    const base = date ?? new Date()
    const next = setMinutes(base, parseInt(m))
    onChange(format(next, "yyyy-MM-dd'T'HH:mm"))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground", className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {date ? format(date, "EEE, MMM d yyyy · h:mm a") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDaySelect}
          initialFocus
        />
        <div className="border-t border-border p-3 flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-1">Time</span>
          <Select value={String(hours)} onValueChange={handleHourChange}>
            <SelectTrigger className="w-20 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-48">
              {Array.from({ length: 24 }, (_, i) => (
                <SelectItem key={i} value={String(i)}>
                  {String(i).padStart(2, "0")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">:</span>
          <Select value={String(minutes)} onValueChange={handleMinuteChange}>
            <SelectTrigger className="w-20 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 15, 30, 45].map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {String(m).padStart(2, "0")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  )
}
