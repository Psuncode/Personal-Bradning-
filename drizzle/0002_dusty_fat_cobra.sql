ALTER TABLE "pending_reservations" ALTER COLUMN "package_id" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "pending_reservations_requested_date_idx" ON "pending_reservations" USING btree ("requested_date");--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_package_event_unique" UNIQUE("package_id","event_date");