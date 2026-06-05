import { UsersRound } from 'lucide-react'

export function BrandMark({ compact = false }) {
  return (
    <div className={`brand-lockup ${compact ? 'brand-lockup--compact' : ''}`}>
      <span className="brand-mark" aria-hidden="true">
        <UsersRound size={25} strokeWidth={2.3} />
      </span>
      {!compact && (
        <span>
          <strong>CMS</strong>
          <small>Candidate Portal</small>
        </span>
      )}
    </div>
  )
}
