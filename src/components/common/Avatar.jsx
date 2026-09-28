import { getAssetUrl, getInitials } from '../../utils/helpers'

export default function Avatar({ user, className = 'w-9 h-9 text-sm' }) {
  const src = getAssetUrl(user?.avatarUrl)
  return src ? (
    <img src={src} alt="" className={`${className} rounded-full object-cover border border-space-400`} />
  ) : (
    <span
      className={`${className} rounded-full grid place-items-center shrink-0 font-display font-semibold
                  text-plasma-200 bg-plasma-500/20 border border-plasma-500/30`}
    >
      {getInitials(user)}
    </span>
  )
}