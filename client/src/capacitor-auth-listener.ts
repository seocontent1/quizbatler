import { App } from '@capacitor/app'
import { supabase } from './lib/supabase'

App.addListener('appUrlOpen', async ({ url }) => {
  console.log('Deep link recebido:', url)

  if (url?.startsWith('com.jesusquiz.battle33://auth/callback')) {
    const code = url.split('code=')[1]
    if (!code) return

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('Sessão trocada:', data, error)
  }
})
