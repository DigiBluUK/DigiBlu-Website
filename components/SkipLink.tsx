// The home page skips to the hero; the standalone pages skip to their
// .detail-page, which carries id="detail-content" as the old pages did.
export default function SkipLink({ target = "#hero-content" }: { target?: string }) {
  return (
    <a className="skip-link" href={target}>
      Skip to content
    </a>
  );
}
