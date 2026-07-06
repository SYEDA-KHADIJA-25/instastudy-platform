import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useCreateAcademicMaterial, useListAcademicMaterials } from "@/hooks/use-firestore";
import type { MaterialType } from "@/lib/types";
import { BookOpen, FileText, Globe, Lock, Upload } from "lucide-react";

const materialTypes: MaterialType[] = ["Notes", "Past Paper", "Project", "Other"];

export default function AcademicMaterialsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: materials, isLoading } = useListAcademicMaterials();
  const createMutation = useCreateAcademicMaterial();

  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [materialType, setMaterialType] = useState<MaterialType>("Notes");
  const [isPublic, setIsPublic] = useState(true);

  const canSubmit = useMemo(() => !!user?.uid && title.trim().length >= 3, [user?.uid, title]);

  const onSubmit = async () => {
    if (!user?.uid || !canSubmit) return;
    try {
      await createMutation.mutateAsync({
        uploadedBy: user.uid,
        uploaderName: user.name,
        title: title.trim(),
        course: course.trim() || undefined,
        description: description.trim() || undefined,
        fileUrl: fileUrl.trim() || undefined,
        materialType,
        isPublic,
      });
      setTitle("");
      setCourse("");
      setDescription("");
      setFileUrl("");
      setMaterialType("Notes");
      setIsPublic(true);
      toast({ title: "Material uploaded" });
    } catch {
      toast({ title: "Failed to upload material", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Academic Materials</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse notes, past papers, and project resources shared by the community.</p>

          <div className="mt-5 space-y-3">
            {isLoading ? (
              [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
            ) : materials && materials.length > 0 ? (
              materials.map((item) => (
                <Card key={item.id} className="border-card-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {item.uploaderName || "Unknown"} · {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{item.materialType}</Badge>
                        <Badge variant="outline" className="gap-1">
                          {item.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                          {item.isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>
                    </div>
                    {item.course && <p className="mt-2 text-sm text-muted-foreground">Course: {item.course}</p>}
                    {item.description && <p className="mt-2 text-sm text-foreground/90">{item.description}</p>}
                    {item.fileUrl && (
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        Open file
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-card-border">
                <CardContent className="flex flex-col items-center py-12 text-center">
                  <BookOpen className="mb-2 h-8 w-8 text-muted-foreground/60" />
                  <p className="font-medium text-foreground">No materials yet</p>
                  <p className="text-sm text-muted-foreground">Be the first to upload useful study resources.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Card className="h-fit border-card-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-4 w-4 text-primary" />
              Upload Material
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="material-title">Title</Label>
              <Input id="material-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="DSA Midterm Notes" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="material-course">Course (optional)</Label>
              <Input id="material-course" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="CS-201" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="material-type">Type</Label>
              <select
                id="material-type"
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value as MaterialType)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {materialTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="material-url">File URL (optional)</Label>
              <Input id="material-url" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="material-description">Description (optional)</Label>
              <Textarea
                id="material-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is included in these notes?"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              Make this material public
            </label>
            <Button onClick={() => void onSubmit()} disabled={!canSubmit || createMutation.isPending} className="w-full">
              {createMutation.isPending ? "Uploading..." : "Upload material"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
