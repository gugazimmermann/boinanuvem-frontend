export function ScrollToTop() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 right-8 w-12 h-12 text-white rounded-full transition shadow-lg flex items-center justify-center hover:opacity-90 cursor-pointer bg-primary"
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
}
