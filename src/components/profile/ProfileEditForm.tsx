"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, SportPreference } from "@prisma/client";
import { toast } from "sonner";
import {
  updateProfile,
  uploadAvatar,
  upsertSportPreference,
  getSuggestedSports,
} from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { SportPreferenceList } from "./SportPreferenceList";
import { SPORT_LIST, SPORT_LABELS, SKILL_LEVEL_LABELS } from "@/lib/sports";
import { Sport, SkillLevel } from "@prisma/client";
import { Loader2, Sparkles, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  name: z.string().min(2),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
});

type FormValues = z.infer<typeof schema>;
type ProfileWithPrefs = User & { sportPreferences: SportPreference[] };

export function ProfileEditForm({ profile }: { profile: ProfileWithPrefs }) {
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [suggestedSports, setSuggestedSports] = useState<Sport[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [preferences, setPreferences] = useState(profile.sportPreferences);
  const [selectedSport, setSelectedSport] = useState<Sport | "">("");
  const [selectedSkill, setSelectedSkill] = useState<SkillLevel>(
    SkillLevel.BEGINNER,
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile.name,
      bio: profile.bio ?? "",
      location: profile.location ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    setSaving(true);
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => v && fd.set(k, v));
    const result = await updateProfile(fd);
    if (result?.error) toast.error(result.error);
    else toast.success("Profile updated!");
    setSaving(false);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    const result = await uploadAvatar(fd);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Avatar updated!");
      setAvatarUrl(result.avatarUrl ?? null);
    }
    setUploading(false);
  }

  async function handleSuggestSports() {
    const bio = form.getValues("bio");
    if (!bio) return toast.error("Add a bio first");
    setLoadingSuggestions(true);
    const sports = await getSuggestedSports(bio);
    setSuggestedSports(sports);
    setLoadingSuggestions(false);
    if (sports.length === 0) toast.info("No sports detected in your bio");
  }

  async function handleAddSport() {
    if (!selectedSport) return;
    const result = await upsertSportPreference(
      selectedSport as Sport,
      selectedSkill,
    );
    if (result?.success) {
      toast.success(`${SPORT_LABELS[selectedSport as Sport]} added!`);
      setPreferences((prev) => {
        const filtered = prev.filter((p) => p.sport !== selectedSport);
        return [
          ...filtered,
          {
            sport: selectedSport as Sport,
            skillLevel: selectedSkill,
            id: selectedSport,
            userId: profile.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
      });
      setSelectedSport("");
    }
  }

  async function handleAddSuggested(sport: Sport) {
    await upsertSportPreference(sport, SkillLevel.BEGINNER);
    toast.success(`${SPORT_LABELS[sport]} added!`);
    setSuggestedSports((prev) => prev.filter((s) => s !== sport));
    setPreferences((prev) => {
      const filtered = prev.filter((p) => p.sport !== sport);
      return [
        ...filtered,
        {
          sport,
          skillLevel: SkillLevel.BEGINNER,
          id: sport,
          userId: profile.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    });
  }

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Profile Photo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <UserAvatar name={profile.name} avatarUrl={avatarUrl} size="lg" />
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Camera className="h-4 w-4 mr-2" />
              )}
              Change photo
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG or WebP. Max 4MB.
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </CardContent>
      </Card>

      {/* Profile info */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Personal Info</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City / Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Berlin, Germany" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell people about yourself and what sports you love..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSuggestSports}
                      disabled={loadingSuggestions}
                      className="mt-1"
                    >
                      {loadingSuggestions ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <Sparkles className="h-3 w-3 mr-1 text-primary" />
                      )}
                      AI: detect sports from bio
                    </Button>
                  </FormItem>
                )}
              />
              {suggestedSports.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground w-full">
                    Detected sports — click to add:
                  </span>
                  {suggestedSports.map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handleAddSuggested(s)}
                    >
                      + {SPORT_LABELS[s]}
                    </Badge>
                  ))}
                </div>
              )}
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Sports */}
      <Card id="sports" className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Add a Sport</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <Select
              value={selectedSport}
              onValueChange={(v) => setSelectedSport(v as Sport)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sport" />
              </SelectTrigger>
              <SelectContent>
                {SPORT_LIST.map((s) => (
                  <SelectItem key={s} value={s}>
                    {SPORT_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedSkill}
              onValueChange={(v) => setSelectedSkill(v as SkillLevel)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Skill level" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(SkillLevel).map((l) => (
                  <SelectItem key={l} value={l}>
                    {SKILL_LEVEL_LABELS[l]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddSport} disabled={!selectedSport}>
              Add
            </Button>
          </div>
          <SportPreferenceList preferences={preferences} editable />
        </CardContent>
      </Card>
    </div>
  );
}
