import { useEffect, useState } from 'react'
import { repository } from '../../data/repository'

/**
 * Turns a stored attachment blob into a displayable URL and cleans it up again.
 * Thumbnails by default: full-size pixels are only loaded where they are shown.
 */
export function useAttachmentUrl(
  id: string | undefined,
  variant: 'thumb' | 'full' = 'thumb',
): string | null {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setUrl(null)
      return
    }

    let alive = true
    let created: string | null = null

    void repository
      .getAttachmentBlob(id, variant)
      .then((blob) => {
        if (!alive || !blob) return
        created = URL.createObjectURL(blob)
        setUrl(created)
      })
      .catch(() => {
        // A missing photo simply renders nothing.
      })

    return () => {
      alive = false
      if (created) URL.revokeObjectURL(created)
    }
  }, [id, variant])

  return url
}
