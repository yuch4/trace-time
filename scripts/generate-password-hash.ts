import bcrypt from 'bcryptjs'

async function generateHash() {
  const password = 'password123' // テスト用パスワード
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)
  console.log('Password Hash:', hash)
}

generateHash() 