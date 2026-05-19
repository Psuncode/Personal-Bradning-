ALTER TABLE "bookings" ALTER COLUMN "package_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "booking_id" SET NOT NULL;