export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-dark/10 py-8 px-6">
      <div className="max-w-content mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-6">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-coral font-bold text-sm uppercase tracking-wider hover:opacity-70 transition-opacity"
          >
            Instagram
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-coral font-bold text-sm uppercase tracking-wider hover:opacity-70 transition-opacity"
          >
            LinkedIn
          </a>
          <a
            href="mailto:hello@koolstudio.pl"
            className="text-coral font-bold text-sm uppercase tracking-wider hover:opacity-70 transition-opacity"
          >
            Email
          </a>
        </div>

        <p className="text-muted text-sm">
          &copy; {currentYear} Kool Studio. Wszystkie prawa zastrzeżone.
        </p>
      </div>
    </footer>
  );
}
