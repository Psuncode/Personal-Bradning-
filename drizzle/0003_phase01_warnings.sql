CREATE TYPE "public"."booking_status" AS ENUM('confirmed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'succeeded', 'failed', 'refunded');--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'confirmed'::"public"."booking_status";--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DATA TYPE "public"."booking_status" USING "status"::"public"."booking_status";--> statement-breakpoint
-- WR-03: text 'true'/'false' -> real boolean. The DROP DEFAULT then USING-cast
-- pattern is required because Postgres cannot implicitly cast text->boolean.
-- Note for ops: if any existing rows hold a value other than 'true'/'false'
-- (e.g. 'TRUE' or '1') the cast will fail; current seed only uses 'true'.
ALTER TABLE "packages" ALTER COLUMN "active" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "packages" ALTER COLUMN "active" SET DATA TYPE boolean USING ("active" = 'true');--> statement-breakpoint
ALTER TABLE "packages" ALTER COLUMN "active" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DATA TYPE "public"."payment_status" USING "status"::"public"."payment_status";--> statement-breakpoint
CREATE INDEX "bookings_event_date_idx" ON "bookings" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX "bookings_client_email_idx" ON "bookings" USING btree ("client_email");--> statement-breakpoint
CREATE INDEX "bookings_created_at_idx" ON "bookings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contacts_created_at_idx" ON "contacts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "inquiries_email_idx" ON "inquiries" USING btree ("email");--> statement-breakpoint
CREATE INDEX "inquiries_created_at_idx" ON "inquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "payments_booking_id_idx" ON "payments" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pending_reservations_expires_at_idx" ON "pending_reservations" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "pending_reservations_stripe_session_id_idx" ON "pending_reservations" USING btree ("stripe_session_id");