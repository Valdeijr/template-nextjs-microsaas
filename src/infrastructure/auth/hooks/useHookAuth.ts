import { auth, signIn, signOut } from '@/infrastructure/auth/providers/authProviders'
import { redirect } from 'next/navigation'

export default function useHookAuth() {
  const session = auth()

  async function loginGoogle() {
    'use server'
    await signIn('google', {
      redirectTo: '/dashboard',
    })
  }

  async function loginGithub() {
    'use server'
    await signIn('github', {
      redirectTo: '/dashboard',
    })
  }

  async function logout() {
    'use server'
    if (!session) return
    await signOut()
    redirect('/login')
  }

  return { loginGoogle, loginGithub, logout }
}
