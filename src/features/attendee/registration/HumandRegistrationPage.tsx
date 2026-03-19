import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import FormInput from '@/components/Input/form'
import FormSelect from '@/components/Select/form'
import EventHeader from './EventHeader'
import SuccessScreen from './SuccessScreen'

// ---------------------------------------------------------------------------
// Demo event data — replace with real API data once the event endpoint is ready
// ---------------------------------------------------------------------------
const DEMO_EVENT = {
  title: 'HR Retreat 2026',
  type: 'HR Retreat',
  date: '14–16 April 2026',
  location: 'Cartagena, Colombia',
  description:
    'Retiro anual da equipe de RH para planejamento estratégico, atividades de team building e alinhamentos para o segundo semestre.',
}

const DEMO_PREFERENCE_FIELDS = [
  {
    id: 'dietary',
    labelKey: 'registration.fields.dietary.label',
    type: 'select' as const,
    options: ['Nenhuma', 'Vegetariano', 'Vegano', 'Sem glúten', 'Sem lactose', 'Outra'],
  },
  {
    id: 'tshirt',
    labelKey: 'registration.fields.tshirt.label',
    type: 'select' as const,
    options: ['PP', 'P', 'M', 'G', 'GG', 'XGG'],
  },
  {
    id: 'emergency_contact',
    labelKey: 'registration.fields.emergencyContact.label',
    type: 'text' as const,
    options: [],
  },
]

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const registrationSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().min(1).email(),
  city: z.string().min(1),
  region: z.string().min(1),
  country: z.string().min(1),
  role: z.string(),
  preferences: z.record(z.string(), z.string()),
})

type RegistrationValues = z.infer<typeof registrationSchema>

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
const HumandRegistrationPage = () => {
  const { t } = useTranslation('attendee')
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      city: '',
      region: '',
      country: '',
      role: '',
      preferences: {},
    },
  })

  const handleSubmit = form.handleSubmit(() => {
    setSubmitted(true)
  })

  const handleBack = () => {
    form.reset()
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto max-w-xl">
          <EventHeader event={DEMO_EVENT} />
          <Card>
            <CardContent className="pt-6">
              <SuccessScreen name={form.getValues('fullName')} onBack={handleBack} />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-xl space-y-6">
        <EventHeader event={DEMO_EVENT} />

        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('registration.sections.info')}</CardTitle>
                <CardDescription>{t('registration.requiredHint')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormInput name="fullName" label={t('registration.fields.fullName.label')} placeholder="Ex: Ana Silva" required />
                <FormInput name="email" label={t('registration.fields.email.label')} type="email" placeholder="ana@empresa.com" required />
                <FormInput name="role" label={t('registration.fields.role.label')} placeholder="Ex: Gerente de RH" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('registration.sections.location')}</CardTitle>
                <CardDescription>{t('registration.sections.locationHint')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormInput name="city" label={t('registration.fields.city.label')} placeholder="Ex: São Paulo" required />
                <div className="grid grid-cols-2 gap-4">
                  <FormInput name="region" label={t('registration.fields.region.label')} placeholder="Ex: SP" required />
                  <FormInput name="country" label={t('registration.fields.country.label')} placeholder="Ex: Brasil" required />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('registration.sections.preferences')}</CardTitle>
                <CardDescription>{t('registration.sections.preferencesHint')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {DEMO_PREFERENCE_FIELDS.map((field, i) => (
                  <div key={field.id}>
                    {i > 0 && <Separator className="mb-4" />}
                    {field.type === 'select' ? (
                      <FormSelect
                        name={`preferences.${field.id}`}
                        label={t(field.labelKey)}
                        options={field.options.map((o) => ({ value: o, label: o }))}
                      />
                    ) : (
                      <FormInput
                        name={`preferences.${field.id}`}
                        label={t(field.labelKey)}
                        placeholder={t('registration.fields.preferences.placeholder')}
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button type="submit" className="w-full">
              {t('registration.submit')}
            </Button>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}

export default HumandRegistrationPage
