import NextAuth from 'next-auth'
import { createClient } from '@supabase/supabase-js'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })
        
        if (error || !user) return null
        
        return {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email
        }
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    }
  },
  pages: {
    signIn: '/auth',
  }
})

export { handler as GET, handler as POST }
