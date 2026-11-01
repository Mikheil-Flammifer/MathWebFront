import RoleRoute from './RoleRoute'
import { ROLES } from '../../utils/constants'

// ADMIN or TEACHER
export default function StaffRoute() {
  return (
    <RoleRoute
      roles={[ROLES.ADMIN, ROLES.TEACHER]}
      message="This page is only for teachers and administrators."
    />
  )
}