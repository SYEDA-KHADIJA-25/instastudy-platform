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
import { useCreateMaterialRequest, useListMaterialRequests } from "@/hooks/use-firestore";
import { CircleCheck, CircleDot, Inbox, MessageSquarePlus } from "lucide-react";

export default function MaterialRequestsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: requests, isLoading } = useListMaterialRequests();
  const createMutation = useCreateMaterialRequest();

  const [course, setCourse] = useState("");
  const [description, setDescription] = useState("");
  const canSubmit = useMemo(() => !!user?.uid && description.trim().length >= 8, [user?.uid, description]);

  const onSubmit = async () => {
    if (!user?.uid || !canSubmit) return;
    try {
      await createMutation.mutateAsync({
        requestedBy: user.uid,
        requesterName: user.name,
        course: course.trim() || undefined,
        description: description.trim(),
      });
      setCourse("");
      setDescription("");
      toast({ title: "Request posted" });
    } catch {
      toast({ title: "Failed to post request", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Material Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ask for notes, past papers, and resources you cannot find yet.</p>

          <div className="mt-5 space-y-3">
            {isLoading ? (
              [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
            ) : requests && requests.length > 0 ? (
              requests.map((item) => (
                <Card key={item.id} className="border-card-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.requesterName || "Unknown student"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={item.status === "Open" ? "secondary" : "outline"} className="gap-1">
                        {item.status === "Fulfilled" ? <CircleCheck className="h-3 w-3" /> : <CircleDot className="h-3 w-3" />}
                        {item.status}
                      </Badge>
                    </div>
                    {item.course && <p className="mt-2 text-sm text-muted-foreground">Course: {item.course}</p>}
                    <p className="mt-2 text-sm text-foreground/90">{item.description}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-card-border">
                <CardContent className="flex flex-col items-center py-12 text-center">
                  <Inbox className="mb-2 h-8 w-8 text-muted-foreground/60" />
                  <p className="font-medium text-foreground">No requests yet</p>
                  <p className="text-sm text-muted-foreground">Share what material you need and the community can help.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Card className="h-fit border-card-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquarePlus className="h-4 w-4 text-primary" />
              Post Request
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="request-course">Course (optional)</Label>
              <Input id="request-course" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="CS-301" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="request-description">Describe what you need</Label>
              <Textarea
                id="request-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Need solved past papers for Operating Systems final exam."
                rows={5}
              />
            </div>
            <Button onClick={() => void onSubmit()} disabled={!canSubmit || createMutation.isPending} className="w-full">
              {createMutation.isPending ? "Posting..." : "Post request"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
