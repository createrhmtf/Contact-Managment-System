export function BrandMark({ compact = false }) {
  return (
    <div className={`brand-lockup ${compact ? 'brand-lockup--compact' : ''}`}>
      <span className="brand-mark">N</span>
      {!compact && (
        <span>
          <strong>Nexa</strong>
          <small>Contacts</small>
        </span>
      )}
    </div>
  )
}
