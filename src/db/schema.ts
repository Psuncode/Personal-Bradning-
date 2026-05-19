// src/db/schema.ts
import {
  pgTable,
  pgEnum,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  unique,
  index,
} from "drizzle-orm/pg-core";

// WR-04: constrain status columns to known literal sets so a typo in a route
// handler (e.g. "confimed") fails fast at insert time instead of silently
// drifting the data and breaking every downstream filter.
export const bookingStatus = pgEnum("booking_status", [
  "confirmed",
  "cancelled",
  "completed",
]);

export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "succeeded",
  "failed",
  // 'refunded' is set by the Stripe webhook on charge.refunded — see
  // src/app/(main)/api/webhooks/stripe/route.ts. Without this enum member the
  // refund flow would fail to compile (and at runtime: insert an invalid enum).
  "refunded",
]);

// contacts: main site contact form submissions
export const contacts = pgTable(
  "contacts",
  {
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
  },
  // WR-06: admin list view orders by createdAt DESC, so seek-style pagination
  // benefits from a btree on the same column.
  (table) => [index("contacts_created_at_idx").on(table.createdAt)]
);

// inquiries: photography-specific inquiries (pre-booking interest)
export const inquiries = pgTable(
  "inquiries",
  {
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
  },
  // WR-06: dedupe / client lookup is by email; admin list view by createdAt.
  (table) => [
    index("inquiries_email_idx").on(table.email),
    index("inquiries_created_at_idx").on(table.createdAt),
  ]
);

// packages: photography service packages (seed data lives here)
export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  priceInCents: integer("price_in_cents").notNull(),
  depositInCents: integer("deposit_in_cents").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  // WR-03: real boolean. The original `text("true"/"false")` was justified as
  // avoiding PgBouncer prepared-statement issues, but the app uses Neon's HTTP
  // driver which doesn't use prepared statements or sit behind PgBouncer.
  active: boolean("active").default(true).notNull(),
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
    // WR-04: enum-backed status — Postgres rejects any value outside the set.
    status: bookingStatus("status").default("confirmed").notNull(),
    notes: text("notes"),
    // Set when confirmation email has been sent successfully. Webhook retries
    // check this column so a Stripe redelivery never double-sends the email.
    // See CR-01 in .planning/phases/03-booking-and-payments/03-REVIEW.md.
    emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    // WR-05: $onUpdate(() => new Date()) makes the ORM stamp updatedAt on every
    // UPDATE. This only covers writes that go through Drizzle — raw SQL writes
    // still need to set it manually. A DB-side trigger would be belt-and-
    // suspenders but is intentionally out of scope here (would require a
    // CREATE FUNCTION migration with no easy rollback). All current writes go
    // through Drizzle's update builder, so the ORM-side guarantee suffices.
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique("bookings_package_event_unique").on(table.packageId, table.eventDate),
    // WR-06: hot lookups in the calendar view, "my bookings" lookup, and admin
    // list ordering. (stripe_payment_intent_id already has a unique index.)
    index("bookings_event_date_idx").on(table.eventDate),
    index("bookings_client_email_idx").on(table.clientEmail),
    index("bookings_created_at_idx").on(table.createdAt),
    index("bookings_status_idx").on(table.status),
  ]
);

// payments: Stripe payment records (one per Stripe payment intent)
export const payments = pgTable(
  "payments",
  {
    id: serial("id").primaryKey(),
    bookingId: integer("booking_id").references(() => bookings.id),
    stripePaymentIntentId: text("stripe_payment_intent_id").notNull().unique(),
    amountInCents: integer("amount_in_cents").notNull(),
    currency: text("currency").default("usd").notNull(),
    // WR-04: enum-backed status (was unconstrained text).
    status: paymentStatus("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  // WR-06: bookingId is an FK without an implicit index in Postgres; the
  // "list payments for booking X" lookup would otherwise sequential-scan.
  (table) => [
    index("payments_booking_id_idx").on(table.bookingId),
    index("payments_status_idx").on(table.status),
  ]
);

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
    // WR-06: cleanup job filters by `expires_at < NOW()` on every checkout;
    // webhook resolution looks up rows by stripe_session_id.
    index("pending_reservations_expires_at_idx").on(table.expiresAt),
    index("pending_reservations_stripe_session_id_idx").on(table.stripeSessionId),
  ]
);
