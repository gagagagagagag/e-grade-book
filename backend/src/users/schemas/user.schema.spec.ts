import { UserRoles } from './user.schema'
import { AdminUser, TeacherUser, ParentUser, StudentUser } from '.'

describe('User schema', () => {
  test('the admin role should equal the schema name', () => {
    expect(UserRoles.Admin).toEqual(AdminUser.name)
  })

  test('the teacher role should equal the schema name', () => {
    expect(UserRoles.Teacher).toEqual(TeacherUser.name)
  })

  test('the parent role should equal the schema name', () => {
    expect(UserRoles.Parent).toEqual(ParentUser.name)
  })

  test('the student role should equal the schema name', () => {
    expect(UserRoles.Student).toEqual(StudentUser.name)
  })
})
