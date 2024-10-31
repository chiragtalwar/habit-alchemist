"use client"

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface AuthFormProps {
  redirectPath?: string;
}

export function AuthForm({ redirectPath = '/create' }: AuthFormProps) {
  const supabase = createClientComponentClient()

  return (
    <Auth
      supabaseClient={supabase}
      appearance={{
        theme: ThemeSupa,
        variables: {
          default: {
            colors: {
              brand: '#000000',
              brandAccent: '#666666',
            },
          },
        },
      }}
      providers={['google']}
      redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${redirectPath}`}
      onlyThirdPartyProviders
    />
  )
} 