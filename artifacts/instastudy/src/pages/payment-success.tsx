import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { verifyPayment } from "@/lib/api-client";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentSuccessPage() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "paid" | "failed">("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) { setStatus("failed"); return; }

    let attempts = 0;
    const poll = async () => {
      try {
        const result = await verifyPayment(sessionId);
        if (result.status === "paid" || result.dbStatus === "paid") {
          setStatus("paid");
        } else if (attempts < 6) {
          attempts++;
          setTimeout(poll, 2000); // webhook may be slightly delayed
        } else {
          setStatus("failed");
        }
      } catch {
        setStatus("failed");
      }
    };
    void poll();
  }, []);

  return (
    <AppLayout>
      <div className="mx-auto max-w-md py-20 flex flex-col items-center text-center">
        {status === "loading" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <Loader2 className="h-14 w-14 animate-spin text-primary mx-auto" />
            <p className="text-lg font-semibold text-foreground">Confirming your payment…</p>
            <p className="text-sm text-muted-foreground">Please wait, this takes a few seconds.</p>
          </motion.div>
        )}

        {status === "paid" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mx-auto">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Payment successful!</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your booking request has been sent to the tutor. You'll see it in your bookings.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Button className="w-full" onClick={() => setLocation("/bookings")}>
                View my bookings
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setLocation("/tutors")}>
                Browse more tutors
              </Button>
            </div>
          </motion.div>
        )}

        {status === "failed" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 mx-auto">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Payment not confirmed</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We couldn't confirm your payment. If money was deducted, please contact support.
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => history.back()}>
              Go back
            </Button>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
