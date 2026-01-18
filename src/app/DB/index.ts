import { USER_ROLE } from '../constants/userRole_constant'
import { User } from '../modules/user/user.model'
import bcrypt from 'bcryptjs'
const superAdmin = {
  email: 'akash@gmail.com',
  phone: '01719681150',
  password: 'admin123',
  name: 'Akash Khan',
  role: USER_ROLE.superAdmin,
  status: 'active',
  isDeleted: false
}

const seedSuperAdmin = async () => {
  const isSuperAdminExists = await User.findOne({ role: USER_ROLE.superAdmin })
  if (!isSuperAdminExists) {
    const hashedPassword = await bcrypt.hash(superAdmin.password, 10)
    await User.create({ ...superAdmin, password: hashedPassword })
  }
}

export default seedSuperAdmin
