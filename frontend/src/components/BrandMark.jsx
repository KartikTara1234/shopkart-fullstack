export default function BrandMark({ className = "", decorative = true }) {
  return (
    <img
      className={`brand-mark ${className}`}
      src="/tara-mark.svg"
      alt={decorative ? "" : "Tara folded T monogram"}
      aria-hidden={decorative ? true : undefined}
    />
  );
}
