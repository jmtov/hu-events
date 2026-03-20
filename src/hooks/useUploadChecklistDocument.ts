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
    mutationFn: async ({ email, checklist_item_id }: UploadPayload) => {
      // TODO: implement real file upload via signed URL once storage is ready.
      // Steps will be:
      //   1. Get signed upload URL from /api/upload/sign
      //   2. PUT file to Supabase Storage using the signed URL
      //   3. Pass the real file_path to uploadDocument below
      const filePath = 'https://placeholder.test/document.pdf'

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
