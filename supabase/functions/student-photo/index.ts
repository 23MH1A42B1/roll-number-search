import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const CAMPUSES = ['AEC', 'ACET'] as const
const YEARS = ['21', '22', '23', '24']

const PHOTO_BASE_URL = Deno.env.get('COLLEGE_PHOTO_BASE_URL') ?? ''
const STUDENT_API_URL = Deno.env.get('COLLEGE_STUDENT_API_URL') ?? ''


const buildVariations = (rollNo: string): string[] => {
  const variations = [rollNo]
  if (rollNo.length > 2 && /^(19|20|21|22|23|24)$/.test(rollNo.substring(0, 2))) {
    const rest = rollNo.substring(2)
    for (const year of YEARS) {
      if (year !== rollNo.substring(0, 2)) variations.push(year + rest)
    }
  }
  return variations
}

const toBase64 = (bytes: Uint8Array): string => {
  let binary = ''
  const chunk = 8192
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const raw = typeof body?.rollNumber === 'string' ? body.rollNumber.trim() : ''

    if (!raw || raw.length > 32 || !/^[A-Za-z0-9]+$/.test(raw)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid roll number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const rollNo = raw.toLowerCase()
    const targets: Array<{ url: string; campus: string; rollNumber: string }> = []
    for (const campus of CAMPUSES) {
      for (const variation of buildVariations(rollNo)) {
        targets.push({
          url: `${PHOTO_BASE_URL}/${campus}/StudentPhotos/${variation}.jpg`,
          campus,
          rollNumber: variation,
        })
      }
    }

    const detailsPromise = (async () => {
      for (const variation of buildVariations(rollNo)) {
        try {
          const res = await fetch(`${STUDENT_API_URL}/${variation}`)
          if (!res.ok) continue
          const json = await res.json()
          const row = Array.isArray(json) ? json[0] : json
          if (row && row.rollno) return row
        } catch {
          continue
        }
      }
      return null
    })()


    const results = await Promise.all(
      targets.map(async (target) => {
        try {
          const res = await fetch(target.url)
          if (!res.ok) return null
          const buf = new Uint8Array(await res.arrayBuffer())
          if (buf.length < 100) return null
          const type = res.headers.get('content-type') || 'image/jpeg'
          if (!type.startsWith('image/')) return null
          return { ...target, image: `data:${type};base64,${toBase64(buf)}` }
        } catch {
          return null
        }
      }),
    )

    const found = results.find((r) => r !== null)
    const details = await detailsPromise

    if (!found && !details) {
      return new Response(
        JSON.stringify({ success: false, error: 'Student not found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        image: found?.image ?? null,
        campus: found?.campus ?? null,
        rollNumber: found?.rollNumber ?? details?.rollno ?? rollNo,
        details,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (_e) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unexpected error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
