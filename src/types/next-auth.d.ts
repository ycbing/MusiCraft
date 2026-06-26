import 'next-auth'

declare module 'next-auth' {
  interface User {
    credits?: number
  }
  interface Session {
    user: {
      id: string
      credits?: number
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    credits?: number
  }
}
