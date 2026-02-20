import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Container className="text-center">
        <h1 className="text-6xl font-bold text-byu-navy">404</h1>
        <p className="mt-4 text-xl text-byu-dark-gray">Page not found</p>
        <Button asChild className="mt-8 bg-byu-navy hover:bg-byu-blue">
          <Link href="/">Go Home</Link>
        </Button>
      </Container>
    </div>
  );
}
