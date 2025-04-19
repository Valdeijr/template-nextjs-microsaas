import { db, firebaseCert } from '@/infrastructure/firebase/firebase'
import { FirestoreAdapter } from '@auth/firebase-adapter'
import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google, GitHub],
  adapter: FirestoreAdapter({
    credential: firebaseCert,
  }),
  callbacks: {
    async signIn({ user, account, profile }) {
      // Se não temos um email no perfil, simplesmente permitir o login normal
      if (!user.email) return true
      try {
        // Verificar se já existe um usuário com o mesmo email
        const usersRef = db.collection('users')
        const existingUserQuery = await usersRef.where('email', '==', user.email).get()
        if (!existingUserQuery.empty) {
          const existingUser = existingUserQuery.docs[0]
          const existingUserId = existingUser.id
          // Verificar se já existe uma conta para este provedor
          const accountsRef = db.collection('accounts')
          const existingAccountQuery = await accountsRef
            .where('userId', '==', existingUserId)
            .where('provider', '==', account?.provider)
            .get()
          if (existingAccountQuery.empty) {
            // Se ainda não existe uma conta para este provedor, criar uma
            await accountsRef.add({
              userId: existingUserId,
              provider: account?.provider,
              providerAccountId: account?.providerAccountId,
              type: account?.type,
              // Adicione outros campos necessários do account
            })
          }
          // Usar o ID do usuário existente
          user.id = existingUserId
        }

        return true
      } catch (error) {
        console.error('Erro ao vincular contas:', error)
        return false
      }
    },
    async session({ session, user }) {
      // Garantir que o ID do usuário esteja na sessão
      if (session?.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  // Adicione esta seção para evitar conflitos de redirecionamento com suas funções
  pages: {
    signIn: '/login',
  },
})
