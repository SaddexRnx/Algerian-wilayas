import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const bulkZipSchema = z.object({
  zipCodes: z.array(z.string().regex(/^\d{5}$/))
})

export const Route = createFileRoute('/api/public/bulk-zip')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const { zipCodes } = bulkZipSchema.parse(body)
          
          const results = await Promise.all(
            zipCodes.map(async (zip) => {
              try {
                const url = new URL(`/api/zip/${zip}.json`, request.url)
                const res = await fetch(url)
                if (!res.ok) return { zip, error: 'Not found' }
                return await res.json()
              } catch (e) {
                return { zip, error: 'Failed to resolve' }
              }
            })
          )

          return new Response(JSON.stringify(results), {
            headers: { 'Content-Type': 'application/json' }
          })
        } catch (e) {
          return new Response(JSON.stringify({ error: 'Invalid input' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          })
        }
      }
    }
  }
})
