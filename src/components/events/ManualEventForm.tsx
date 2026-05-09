"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Sport } from "@prisma/client"
import { toast } from "sonner"
import { createManualEvent } from "@/actions/events"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SPORT_LIST, SPORT_LABELS } from "@/lib/sports"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Loader2 } from "lucide-react"

const schema = z.object({
  sport: z.enum(Object.values(Sport) as [Sport, ...Sport[]]),
  venueName: z.string().max(200).optional(),
  venueAddress: z.string().max(500).optional(),
  scheduledAt: z.string().optional(),
  notes: z.string().max(1000).optional(),
})

type FormValues = z.infer<typeof schema>

export function ManualEventForm() {
  const [pending, setPending] = useState(false)
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { sport: Sport.FOOTBALL, venueName: "", venueAddress: "", scheduledAt: "", notes: "" },
  })

  async function onSubmit(values: FormValues) {
    setPending(true)
    const fd = new FormData()
    Object.entries(values).forEach(([k, v]) => v && fd.set(k, v as string))
    const result = await createManualEvent(fd)
    if (result?.error) {
      toast.error(result.error)
      setPending(false)
      return
    }
    toast.success("Event created!")
    router.push(`/events/${result.event?.id}`)
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="sport" render={({ field }) => (
              <FormItem>
                <FormLabel>Sport</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {SPORT_LIST.map((s) => (
                      <SelectItem key={s} value={s}>{SPORT_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="venueName" render={({ field }) => (
              <FormItem>
                <FormLabel>Venue name <span className="text-muted-foreground">(optional)</span></FormLabel>
                <FormControl><Input placeholder="e.g. City Sports Hall" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="venueAddress" render={({ field }) => (
              <FormItem>
                <FormLabel>Address <span className="text-muted-foreground">(optional)</span></FormLabel>
                <FormControl><Input placeholder="e.g. Hauptstraße 1, Berlin" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="scheduledAt" render={({ field }) => (
              <FormItem>
                <FormLabel>Date & Time <span className="text-muted-foreground">(optional)</span></FormLabel>
                <FormControl>
                  <DateTimePicker value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Notes <span className="text-muted-foreground">(optional)</span></FormLabel>
                <FormControl><Textarea placeholder="Any details for participants..." rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Create event
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
