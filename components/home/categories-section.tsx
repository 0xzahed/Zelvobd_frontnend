"use client"

export function CategoriesSection() {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-foreground md:text-xl">
        Featured{" "}
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(45deg, #052F84, #7BA4F7)" }}
        >
          Categories
        </span>
      </h2>
    </section>
  )
}
