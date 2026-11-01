import RoleRoute from './RoleRoute'
import { ROLES } from '../../utils/constants'

// ADMIN only
export default function AdminRoute() {
  return (
    <RoleRoute
      roles={[ROLES.ADMIN]}
      message="This page is only for administrators."
    />
  )
}