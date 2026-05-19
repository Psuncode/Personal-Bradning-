// src/db/schema.ts
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  unique,
  index,
} from "drizzle-orm/pg-core";

// contacts: main site contact form submissions
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  referrer: text("referrer"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// inquiries: photography-specific inquiries (pre-booking interest)
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  eventType: text("event_type"),
  eventDate: timestamp("event_date", { withTimezone: true }),
  message: text("message"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  referrer: text("referrer"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// packages: photography service packages (seed data lives here)
export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  priceInCents: integer("price_in_cents").notNull(),
  depositInCents: integer("deposit_in_cents").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  // text 'true'/'false' instead of boolean to avoid PgBouncer prepared-statement issues
  active: text("active").default("true").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// bookings: confirmed photography bookings (created after successful Stripe payment)
// UNIQUE(package_id, event_date) closes the double-booking race at the DB layer —
// see 01-REVIEW.md CR-02 + 03-REVIEW.md CR-02. The checkout pre-check and webhook
// idempotency check are belt-and-suspenders; this constraint is the last line.
export const bookings = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),
    packageId: integer("package_id").references(() => packages.id),
    clientName: text("client_name").notNull(),
    clientEmail: text("client_email").notNull(),
    clientPhone: text("client_phone"),
    eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
    stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
    depositPaidInCents: integer("deposit_paid_in_cents"),
    // 'confirmed' | 'cancelled' | 'completed'
    status: text("status").default("confirmed").notNull(),
    notes: text("notes"),
    // Set when confirmation email has been sent successfully. Webhook retries
    // check this column so a Stripe redelivery never double-sends the email.
    // See CR-01 in .planning/phases/03-booking-and-payments/03-REVIEW.md.
    emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("bookings_package_event_unique").on(table.packageId, table.eventDate),
  ]
);

// payments: Stripe payment records (one per Stripe payment intent)
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id),
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull().unique(),
  amountInCents: integer("amount_in_cents").notNull(),
  currency: text("currency").default("usd").notNull(),
  // 'pending' | 'succeeded' | 'failed'
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// pending_reservations: temporary slot hold during checkout (prevents double-booking)
// Application code sets expiresAt = now() + 30 minutes when creating a reservation.
// Cleanup: delete WHERE expires_at < NOW() in any route that reads this table.
//
// CR-02 (01-REVIEW.md): package_id is NOT NULL so orphan holds are not insertable,
// and we add an index on requested_date for the per-slot lookup the checkout route
// performs. A full UNIQUE(package_id, requested_date) is intentionally NOT applied
// here because partial-unique predicates against NOW() are non-immutable in
// Postgres; instead, the checkout route deletes expired rows before its
// SELECT-then-INSERT and the bookings UNIQUE constraint is the durable backstop.
export const pendingReservations = pgTable(
  "pending_reservations",
  {
    id: serial("id").primaryKey(),
    packageId: integer("package_id").references(() => packages.id).notNull(),
    clientEmail: text("client_email"),
    requestedDate: timestamp("requested_date", { withTimezone: true }).notNull(),
    stripeSessionId: text("stripe_session_id"),
    // Set by app: new Date(Date.now() + 30 * 60 * 1000)
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("pending_reservations_requested_date_idx").on(table.requestedDate),
  ]
);
