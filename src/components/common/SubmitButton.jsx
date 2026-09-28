export default function SubmitButton({ loading, children, ...props }) {
  return (
    <button type="submit" disabled={loading} className="btn-primary w-full py-3" {...props}>
      {loading ? <span className="spinner-sm border-white/30 border-t-white" /> : children}
    </button>
  )
}