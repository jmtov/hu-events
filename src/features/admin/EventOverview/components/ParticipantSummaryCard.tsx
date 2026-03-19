import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Participant, RsvpStatus } from '@/types/participant'

const RSVP_BADGE_STYLES: Record<RsvpStatus, string> = {
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  declined: 'bg-red-100 text-red-800 border-red-200',
}

type ParticipantSummaryCardProps = {
  participants: Participant[]
  eventId: string
  style?: React.CSSProperties
}

const PREVIEW_LIMIT = 5

const ParticipantSummaryCard = ({ participants, eventId, style }: ParticipantSummaryCardProps) => {
  const { t } = useTranslation('admin')
  const preview = participants.slice(0, PREVIEW_LIMIT)
  const remaining = participants.length - preview.length

  return (
    <Card className="animate-appear-from-bottom" style={style}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('events.overview.participants.title')}
        </CardTitle>
        <Link
          to="/admin/events/$eventId/participants"
          params={{ eventId }}
          search={{ created: false }}
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-7 px-2 text-xs')}
        >
          {t('events.overview.participants.manage')}
        </Link>
      </CardHeader>
      <CardContent>
        {participants.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            {t('events.overview.participants.empty')}
          </p>
        ) : (
          <ul className="space-y-2">
            {preview.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-sm text-foreground">
                  {p.full_name || p.email}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    'shrink-0 px-1.5 py-0 text-[10px]',
                    RSVP_BADGE_STYLES[p.rsvp_status],
                  )}
                >
                  {t(`events.overview.rsvp.${p.rsvp_status}`)}
                </Badge>
              </li>
            ))}
            {remaining > 0 && (
              <li className="text-xs text-muted-foreground">
                +{remaining} {t('events.overview.participants.more')}
              </li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default ParticipantSummaryCard
