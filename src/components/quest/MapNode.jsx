import { Lock, Check, Play } from 'lucide-react'
import { NODE_STATUS, getCategoryTheme } from '../../utils/constants'
import { useCooldown } from '../../hooks/useCooldown'
import { formatCountdown } from '../../utils/helpers'

const R = 26

export default function MapNode({ node, selected, onSelect }) {
  const { remaining, active: cooling } = useCooldown(node.retryAvailableAt)
  const theme = getCategoryTheme(node.mainCategoryName)
  const locked = node.status === NODE_STATUS.LOCKED
  const solved = node.status === NODE_STATUS.SOLVED
  const available = node.status === NODE_STATUS.AVAILABLE

  const fill = locked ? '#1e293b' : solved ? theme.color : '#0f172a'
  const stroke = locked ? '#475569' : theme.color
  const Icon = locked ? Lock : solved ? Check : Play
  const iconColor = locked ? '#64748b' : solved ? '#0b1020' : theme.color

  return (
    <g
      transform={`translate(${node.x} ${node.y})`}
      onClick={() => onSelect(node)}
      style={{ cursor: 'pointer' }}
      opacity={locked ? 0.55 : 1}
    >
      {available && !cooling && (
        <circle r={R + 8} fill="none" stroke={theme.color} strokeOpacity="0.35">
          <animate attributeName="r" values={`${R + 4};${R + 12};${R + 4}`} dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="2.4s" repeatCount="indefinite" />
        </circle>
      )}

      {selected && <circle r={R + 6} fill="none" stroke="#fff" strokeWidth="2" />}
      {node.start && (
        <circle r={R + 3} fill="none" stroke="#fff" strokeDasharray="3 4" strokeOpacity="0.7" />
      )}

      <circle r={R} fill={fill} stroke={stroke} strokeWidth="3" />
      <g transform="translate(-10 -10)">
        <Icon width={20} height={20} color={iconColor} />
      </g>

      <text y={R + 18} textAnchor="middle" fontSize="12" fill="#cbd5e1">
        {node.xpReward} XP
      </text>

      {cooling && (
        <g transform={`translate(0 ${-R - 14})`}>
          <rect x="-26" y="-11" width="52" height="20" rx="10" fill="#7f1d1d" />
          <text y="4" textAnchor="middle" fontSize="12" fill="#fecaca">
            {formatCountdown(remaining)}
          </text>
        </g>
      )}
    </g>
  )
}