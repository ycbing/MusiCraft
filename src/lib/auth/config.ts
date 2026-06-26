import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { pool } from "@/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const { rows } = await pool.query(
          "SELECT * FROM users WHERE email = $1",
          [credentials.email]
        )
        const user = rows[0]
        if (!user) return null

        const isValid = await compare(credentials.password as string, user.password as string)
        if (!isValid) return null

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          credits: user.credits,
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.credits = (user as any).credits
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).credits = token.credits
      }
      return session
    },
  },
})
