import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type ParticipantModuleProps = {
  emails: string[]
  onAdd: (email: string) => void
  onRemove: (email: string) => void
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ParticipantModule = ({ emails, onAdd, onRemove }: ParticipantModuleProps) => {
  const { t } = useTranslation('admin')
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    const email = inputValue.trim()
    if (!email) return

    if (!EMAIL_REGEX.test(email)) {
      setError(t('events.create.participants.invalidEmail'))
      return
    }

    if (emails.includes(email)) {
      setError(t('events.create.participants.duplicateEmail'))
      return
    }

    onAdd(email)
    setInputValue('')
    setError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {t('events.create.participants.description')}
      </p>

      <div className="flex flex-col gap-1">
        <div className="flex gap-2">
          <Input
            type="email"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setError(null)
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('events.create.participants.addPlaceholder')}
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
            {t('events.create.participants.add')}
          </Button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      {emails.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {t('events.create.participants.empty')}
        </p>
      ) : (
        <ul className="space-y-1.5">
          {emails.map((email) => (
            <li
              key={email}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
            >
              <span className="text-sm text-foreground">{email}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(email)}
              >
                {t('events.create.participants.remove')}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ParticipantModule
