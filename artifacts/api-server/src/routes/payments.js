const router = require("express").Router();
const Stripe = require("stripe");
const db = require("../db");
const { requireAuth } = require("../auth");
const { v4: uuidv4 } = require("uuid");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || "");

// PKR → USD conversion (fixed rate for billing purposes)
// Stripe does not support PKR. We charge in USD and show PKR to the user.
const PKR_TO_USD_RATE = 278; // 1 USD ≈ 278 PKR

function pkrToUsdCents(pkr) {
  // USD uses 2 decimal places → multiply dollars by 100 to get cents
  const usd = pkr / PKR_TO_USD_RATE;
  return Math.max(50, Math.round(usd * 100)); // Stripe minimum is 50 cents
}

// ── POST /api/payments/create-checkout-session ────────────────
router.post("/create-checkout-session", requireAuth, async (req, res) => {
  const {
    tutorId, tutorName, slotIds, amountPkr,
    subject, notes, studentName, appUrl,
  } = req.body;
  const studentId = req.uid;

  if (!slotIds?.length || !amountPkr || !tutorId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const amountUsdCents = pkrToUsdCents(amountPkr);
    const amountUsdDisplay = (amountUsdCents / 100).toFixed(2);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",                   // USD — supported by Stripe
            unit_amount: amountUsdCents,        // in cents
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
        },
      ],
      metadata: {
        studentId,
        studentName: studentName || "",
        tutorId,
        tutorName: tutorName || "",
        slotIds: JSON.stringify(slotIds),
        subject: subject || "",
        notes: notes || "",
        amountPkr: String(amountPkr),
      },
      success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/book/${tutorId}?cancelled=1`,
    });

    // Persist a pending payment record
    await db.execute(
      `INSERT INTO payments
         (id, booking_id, student_id, stripe_session_id, amount_pkr, slots_count, status)
       VALUES (?, '', ?, ?, ?, ?, 'pending')`,
      [uuidv4(), studentId, session.id, amountPkr, slotIds.length]
    );

    res.json({ url: session.url, sessionId: session.id });
  } catch (e) {
    console.error("create-checkout-session error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── POST /api/payments/webhook ────────────────────────────────
// Stripe calls this after payment. Verifies signature, then
// creates the actual booking(s) in the DB.
router.post(
  "/webhook",
  require("express").raw({ type: "application/json" }), // raw body needed for sig verification
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = webhookSecret
        ? stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
        : JSON.parse(req.body.toString()); // dev fallback — no sig check
    } catch (e) {
      console.error("Webhook signature error:", e.message);
      return res.status(400).json({ error: `Webhook error: ${e.message}` });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const meta = session.metadata || {};

      const studentId  = meta.studentId;
      const tutorId    = meta.tutorId;
      const tutorName  = meta.tutorName;
      const studentName = meta.studentName;
      const slotIds    = JSON.parse(meta.slotIds || "[]");
      const subject    = meta.subject || null;
      const notes      = meta.notes || null;

      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();

        const bookingIds = [];

        for (const slotId of slotIds) {
          // Lock and validate slot
          const [[slot]] = await conn.execute(
            "SELECT * FROM availability WHERE id = ? FOR UPDATE",
            [slotId]
          );
          if (!slot || slot.is_booked) continue; // skip already-booked

          const bookingId = uuidv4();
          await conn.execute(
            `INSERT INTO bookings
               (id, student_id, tutor_id, slot_id, status, subject, notes,
                student_name, tutor_name, start_time, end_time)
             VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)`,
            [
              bookingId, studentId, tutorId, slotId,
              subject, notes, studentName, tutorName,
              slot.start_time, slot.end_time,
            ]
          );
          await conn.execute(
            "UPDATE availability SET is_booked = 1 WHERE id = ?",
            [slotId]
          );
          bookingIds.push(bookingId);
        }

        // Mark payment as paid
        await conn.execute(
          `UPDATE payments
           SET status = 'paid',
               paid_at = NOW(),
               stripe_payment_intent = ?,
               booking_id = ?
           WHERE stripe_session_id = ?`,
          [
            session.payment_intent || null,
            bookingIds[0] || "",
            session.id,
          ]
        );

        await conn.commit();
        console.log(`✅ Payment ${session.id} — created ${bookingIds.length} booking(s)`);
      } catch (e) {
        await conn.rollback();
        console.error("Webhook booking creation error:", e.message);
      } finally {
        conn.release();
      }
    }

    res.json({ received: true });
  }
);

// ── GET /api/payments/verify/:sessionId ──────────────────────
// Frontend polls this after redirect to confirm payment status.
router.get("/verify/:sessionId", requireAuth, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    const [[payment]] = await db.execute(
      "SELECT * FROM payments WHERE stripe_session_id = ?",
      [req.params.sessionId]
    );
    res.json({
      status: session.payment_status,          // "paid" | "unpaid" | "no_payment_required"
      dbStatus: payment?.status || "unknown",
      bookingId: payment?.booking_id || null,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
