import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const root = document.getElementById("root")!
const hasSupabaseConfig = Boolean(
	import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
)

if (!hasSupabaseConfig) {
	root.innerHTML = `
		<main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#f6f7f9;color:#17202a;font-family:system-ui,sans-serif;text-align:center">
			<section style="max-width:520px;background:white;border:1px solid #dfe3e8;border-radius:12px;padding:32px;box-shadow:0 12px 30px rgba(23,50,77,.12)">
				<h1 style="margin:0 0 12px;color:#17324d">Configuration required</h1>
				<p style="margin:0;line-height:1.6">Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to the Vercel project environment variables, then redeploy.</p>
			</section>
		</main>
	`
} else {
	createRoot(root).render(<App />)
}
