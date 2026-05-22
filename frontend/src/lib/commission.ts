/**
 * InstaStudy Platform Commission
 * Currency: PKR
 * Rate range: PKR 300 – 900 /hr
 *
 * Commission is split equally between both parties:
 *   - Student pays:  tutor rate + Rs 40 (at Rs 300 base) → same ratio at all rates
 *   - Tutor receives: tutor rate − Rs 40 (at Rs 300 base) → same ratio at all rates
 *
 * Commission ratio per side: 40 ÷ 300 ≈ 13.33%
 * Platform total per session: studentCommission + tutorCommission ≈ 26.67% of rate
 *
 * Quick reference table:
 * Tutor rate | Student adds | Student pays | Tutor deducted | Tutor receives | Platform earns
 *   Rs 300   |    Rs 40     |   Rs 340     |     Rs 40      |    Rs 260      |    Rs 80
 *   Rs 400   |    Rs 53     |   Rs 453     |     Rs 53      |    Rs 347      |    Rs 107
 *   Rs 500   |    Rs 67     |   Rs 567     |     Rs 67      |    Rs 433      |    Rs 133
 *   Rs 600   |    Rs 80     |   Rs 680     |     Rs 80      |    Rs 520      |    Rs 160
 *   Rs 700   |    Rs 93     |   Rs 793     |     Rs 93      |    Rs 607      |    Rs 187
 *   Rs 800   |    Rs 107    |   Rs 907     |     Rs 107     |    Rs 693      |    Rs 213
 *   Rs 900   |    Rs 120    |   Rs 1,020   |     Rs 120     |    Rs 780      |    Rs 240
 */

export const CURRENCY = "PKR";
export const CURRENCY_SYMBOL = "Rs";
export const MIN_RATE = 300;
export const MAX_RATE = 900;

/** Per-side commission ratio: 40 ÷ 300 ≈ 0.1333 */
export const COMMISSION_RATE_PER_SIDE = 40 / 300;

/** Commission charged to the student (added on top of tutor rate) */
export function studentCommission(tutorRate: number): number {
  return Math.round(tutorRate * COMMISSION_RATE_PER_SIDE);
}

/** Commission deducted from the tutor's payout */
export function tutorCommission(tutorRate: number): number {
  return Math.round(tutorRate * COMMISSION_RATE_PER_SIDE);
}

/** Total platform commission per session */
export function platformCommission(tutorRate: number): number {
  return studentCommission(tutorRate) + tutorCommission(tutorRate);
}

/** What the student pays = tutor rate + student commission */
export function studentPrice(tutorRate: number): number {
  return tutorRate + studentCommission(tutorRate);
}

/** What the tutor actually receives = tutor rate − tutor commission */
export function tutorPayout(tutorRate: number): number {
  return tutorRate - tutorCommission(tutorRate);
}

/** Format as Rs X */
export function fmt(amount: number): string {
  return `${CURRENCY_SYMBOL} ${Math.round(amount).toLocaleString()}`;
}

// Legacy alias — kept so existing callers don't break
export const commissionAmount = platformCommission;
export const COMMISSION_RATE = COMMISSION_RATE_PER_SIDE * 2;
