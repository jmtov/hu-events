import { useMutation, useQueryClient } from '@tanstack/react-query'
import { attendanceService } from '@/services/attendance'

type UploadPayload = {
  email: string
  checklist_item_id: string
  file: File
}

export const useUploadChecklistDocument = (eventId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ email, checklist_item_id, file }: UploadPayload) => {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const filePath = `events/${eventId}/${email.replace('@', '_at_')}/${checklist_item_id}/${safeName}`

      // 1. Get a signed upload URL from our serverless function
      const { signedUrl } = await attendanceService.getSignedUploadUrl({
        path: filePath,
        contentType: file.type || 'application/octet-stream',
      })

      // 2. PUT the file directly to Supabase Storage (skipped in mock mode)
      if (signedUrl) {
        const uploadRes = await fetch(signedUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file,
        })
        if (!uploadRes.ok) {
          throw new Error(`Storage upload failed: ${uploadRes.status}`)
        }
      }

      // 3. Record the document URL in the participant checklist item
      await attendanceService.uploadDocument(eventId, {
        email,
        checklist_item_id,
        file_path: filePath,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participant', eventId] })
    },
  })
}
