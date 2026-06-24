"use client"

 

export function WhatsAppFab({ number }: { number: string }) {
  if (!number) return null

  const href = `https://wa.me/${number.replace(/[^0-9]/g, "")}?text=Hi%20Zelvobd%2C%20I%20have%20a%20question`
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-24 right-4 z-30 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_8px_20px_rgba(37,211,102,0.4)] md:bottom-6"
    >
      <svg viewBox="0 0 32 32" className="h-8 w-8 fill-current" aria-hidden="true">
        <path d="M19.11 17.2c-.26-.13-1.52-.75-1.76-.83s-.41-.13-.58.13-.67.83-.82 1-.3.2-.56.07a7.1 7.1 0 0 1-2.1-1.3 7.9 7.9 0 0 1-1.45-1.8c-.15-.26 0-.4.11-.53s.26-.3.4-.44a1.7 1.7 0 0 0 .26-.44.48.48 0 0 0 0-.46c-.07-.13-.58-1.4-.8-1.92s-.42-.44-.58-.45h-.5a1 1 0 0 0-.7.33 2.92 2.92 0 0 0-.91 2.17 5.07 5.07 0 0 0 1.06 2.7 11.6 11.6 0 0 0 4.44 3.92 14.9 14.9 0 0 0 1.48.55 3.56 3.56 0 0 0 1.63.1 2.67 2.67 0 0 0 1.76-1.24 2.16 2.16 0 0 0 .15-1.24c-.06-.1-.24-.17-.5-.3zM16 6a10 10 0 0 0-8.36 15.5L6 26l4.64-1.6A10 10 0 1 0 16 6zm0 18.26a8.24 8.24 0 0 1-4.23-1.16l-.3-.18-2.75.95.93-2.69-.2-.3a8.26 8.26 0 1 1 6.55 3.38z" />
      </svg>
    </a>
  )
}
