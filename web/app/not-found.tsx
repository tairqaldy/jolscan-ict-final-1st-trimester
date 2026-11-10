import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="container-page grid min-h-[70vh] place-content-center gap-4 text-center">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="text-4xl font-bold">Nothing to inspect here</h1>
      <p className="text-muted">The page you asked for is not here.</p>
      <div>
        <ButtonLink href="/">Back to the start</ButtonLink>
      </div>
    </main>
  );
}
