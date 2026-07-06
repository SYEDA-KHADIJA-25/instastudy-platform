const router = require("express").Router();
const Stripe = require("stripe");
const { db, uuidv4 } = require("../db");
const { requireAuth } = require("../auth");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || "");

const PKR_TO_USD_RATE = 278;
function pkrToUsdCents(pkr) {
  return Math.max(50, Math.round((pkr / PKR_TO_USD_RATE) * 100));
}

// POST /api/payments/create-checkout-session
router.post("/create-checkout-session", requireAuth, async (req, res) => {
  const { tutorId, tutorName, slotIds, amountPkr, subject, notes, studentName, appUrl } = req.body;
  const studentId = req.uid;

  if (!slotIds?.length || !amountPkr || !tutorId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const amountUsdCents  = pkrToUsdCents(amountPkr);
    const amountUsdDisplay = (amountUsdCents / 100).toFixed(2);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: amountUsdCents,
          product_data: {
            name: `Tutoring session${slotIds.length > 1 ? "s" : ""} with ${tutorName}`,
            description: [
              subject ? `Subject: ${subject}` : null,
              `${slotIds.length} slot${slotIds.length > 1 ? "s" : ""}`,
              `Rs ${Math.round(amountPkr).toLocaleString()} PKR ≈ $${amountUsdDisplay} USD`,
            ].filter(Boolean).join(" · "),
          },
        },
        quantity: 1,
      }],
      metadata: {
        studentId, studentName: studentName || "",
        tutorId,   tutorName:   tutorName   || "",
        slotIds: JSON.stringify(slotIds),
        subject: subject || "",
        notes:   notes   || "",
        amountPkr: String(amountPkr),
      },
      success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/book/${tutorId}?cancelled=1`,
    });

    // Store pending payment in Firestore
    const id = uuidv4();
    await db.collection("payments").doc(id).set({
      booking_id:            "",
      student_id:            studentId,
      stripe_session_id:     session.id,
      stripe_payment_intent: null,
      amount_pkr:            amountPkr,
      slots_count:           slotIds.length,
      status:                "pending",
      created_at:            new Date().toISOString(),
      paid_at:               null,
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (e) {
    console.error("create-checkout-session error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/payments/webhook
router.post(
  "/webhook",
  require("express").raw({ type: "application/json" }),
  async (req, res) => {
    const sig           = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = webhookSecret
        ? stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
        : JSON.parse(req.body.toString());
    } catch (e) {
      return res.status(400).json({ error: `Webhook error: ${e.message}` });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const meta    = session.metadata || {};
      const slotIds = JSON.parse(meta.slotIds || "[]");

      try {
        const bookingIds = [];

        for (const slotId of slotIds) {
          const slotRef  = db.collection("availability").doc(slotId);
          const bookingId = uuidv4();
          const bookingRef = db.collection("bookings").doc(bookingId);

          await db.runTransaction(async (t) => {
            const slotSnap = await t.get(slotRef);
            if (!slotSnap.exists || slotSnap.data().is_booked) return;

            t.set(bookingRef, {
              student_id:   meta.studentId,
              tutor_id:     meta.tutorId,
              slot_id:      slotId,
              status:       "pending",
              subject:      meta.subject || null,
              notes:        meta.notes   || null,
              meeting_link: null,
              created_at:   new Date().toISOString(),
            });
            t.update(slotRef, { is_booked: true });
          });
          bookingIds.push(bookingId);
        }

        // Mark payment paid
        const paySnap = await db.collection("payments")
          .where("stripe_session_id", "==", session.id).limit(1).get();
        if (!paySnap.empty) {
          await paySnap.docs[0].ref.update({
            status:                "paid",
            paid_at:               new Date().toISOString(),
            stripe_payment_intent: session.payment_intent || null,
            booking_id:            bookingIds[0] || "",
          });
        }

        console.log(`✅ Payment ${session.id} — created ${bookingIds.length} booking(s)`);
      } catch (e) {
        console.error("Webhook booking error:", e.message);
      }
    }

    res.json({ received: true });
  }
);

// GET /api/payments/verify/:sessionId
router.get("/verify/:sessionId", requireAuth, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    const snap    = await db.collection("payments")
      .where("stripe_session_id", "==", req.params.sessionId).limit(1).get();
    const payment = snap.empty ? null : snap.docs[0].data();
    res.json({
      status:    session.payment_status,
      dbStatus:  payment?.status || "unknown",
      bookingId: payment?.booking_id || null,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
