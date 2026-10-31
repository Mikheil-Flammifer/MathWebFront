export default function LegalPage({ title, children }) {
  return (
    <article className="max-w-3xl mx-auto">
      <h1 className="page-title mb-6">{title}</h1>
      <div className="space-y-4 text-chalk-300 leading-relaxed">{children}</div>
    </article>
  )
}