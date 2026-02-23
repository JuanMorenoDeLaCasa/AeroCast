"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger } from "@/components/ui/popover"

export function DatePickerWithRange({ className, date, onDateChange }) {
  const [open, setOpen] = React.useState(false)
  const [fromTemp, setFromTemp] = React.useState(date?.from)
  const [toTemp, setToTemp] = React.useState(date?.to)

  React.useEffect(() => {
    if (open) {
      setFromTemp(date?.from ?? undefined)
      setToTemp(date?.to ?? undefined)
    }
  }, [open, date])

  React.useEffect(() => {
    if (!open) {
      setFromTemp(date?.from)
      setToTemp(date?.to)
    }
  }, [date, open])

  const applySelection = () => {
    let from = fromTemp ?? undefined
    let to = toTemp ?? undefined

    if (from && to && from.getTime() > to.getTime()) {
      const tmp = from
      from = to
      to = tmp
    }

    onDateChange?.({ from, to })
    setOpen(false)
  }

  const clearSelection = () => {
    setFromTemp(undefined)
    setToTemp(undefined)
    onDateChange?.({ from: undefined, to: undefined })
    setOpen(false)
  }

  return (
    <div className={cn("relative grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy", { locale: es })} -{" "}
                  {format(date.to, "dd/MM/yyyy", { locale: es })}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy", { locale: es })
              )
            ) : (
              <span>Seleccionar rango de fechas</span>
            )}
          </Button>
        </PopoverTrigger>

        {/* Popover fijo arriba del botón, responsive */}
        {open && (
          <div className="absolute bottom-full left-0 mb-2 z-50 w-[min(650px,90vw)] p-4 bg-white rounded-lg shadow-lg">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="mb-2 text-sm font-medium">Desde</div>
                <Calendar
                  mode="single"
                  selected={fromTemp}
                  onSelect={(d) => setFromTemp(d ?? undefined)}
                  locale={es}
                />
              </div>

              <div>
                <div className="mb-2 text-sm font-medium">Hasta</div>
                <Calendar
                  mode="single"
                  selected={toTemp}
                  onSelect={(d) => setToTemp(d ?? undefined)}
                  locale={es}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 md:flex-row md:justify-end">
              <Button variant="ghost" onClick={clearSelection}>Limpiar</Button>
              <Button onClick={applySelection}>Aplicar</Button>
            </div>
          </div>
        )}
      </Popover>
    </div>
  )
}
