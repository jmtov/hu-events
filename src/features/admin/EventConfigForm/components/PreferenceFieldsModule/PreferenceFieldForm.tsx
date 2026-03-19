import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import FormInput from '@/components/Input/form';
import FormSelect from '@/components/Select/form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  PREFERENCE_FIELD_TYPE_OPTIONS,
  preferenceFieldSchema,
  type PreferenceFieldValues,
} from './constants';

type PreferenceFieldFormProps = {
  defaultValues?: Partial<PreferenceFieldValues>;
  onSubmit: (values: PreferenceFieldValues) => Promise<void> | void;
  onCancel: () => void;
  isPending?: boolean;
  /** Render wrapper as <div> to avoid invalid nested <form> elements */
  asDiv?: boolean;
};

const PreferenceFieldForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isPending = false,
  asDiv = false,
}: PreferenceFieldFormProps) => {
  const form = useForm<PreferenceFieldValues>({
    resolver: zodResolver(preferenceFieldSchema),
    defaultValues: {
      label: '',
      field_type: 'text',
      options_raw: '',
      required: false,
      ...defaultValues,
    },
  });

  const fieldType = useWatch({ control: form.control, name: 'field_type' });

  const Wrapper = asDiv ? 'div' : 'form';
  const wrapperProps = asDiv ? {} : { onSubmit: form.handleSubmit(onSubmit) };

  return (
    <FormProvider {...form}>
      <Wrapper
        {...wrapperProps}
        className="space-y-4 rounded-xl border border-border bg-muted/30 p-4"
      >
        <FormInput
          name="label"
          label="Nome do campo"
          placeholder="Ex: Restrições alimentares, Tamanho da camiseta..."
          required
        />

        <FormSelect
          name="field_type"
          label="Tipo de resposta"
          options={PREFERENCE_FIELD_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />

        {fieldType === 'select' && (
          <div className="space-y-1.5">
            <Controller
              name="options_raw"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-1.5">
                  <Label htmlFor="options_raw">
                    Opções <span className="text-destructive"> *</span>
                  </Label>
                  <input
                    id="options_raw"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Ex: S, M, L, XL"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                  {fieldState.error?.message ? (
                    <p className="text-xs text-destructive">{fieldState.error.message}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Separe as opções por vírgula
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        )}

        {/* Required toggle */}
        <div className="rounded-lg border border-border bg-background p-3">
          <Controller
            name="required"
            control={form.control}
            render={({ field }) => (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="pf-required" className="cursor-pointer">
                    Obrigatório
                  </Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Participantes devem preencher este campo no onboarding
                  </p>
                </div>
                <Switch
                  id="pf-required"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            type={asDiv ? 'button' : 'submit'}
            onClick={asDiv ? form.handleSubmit(onSubmit) : undefined}
            disabled={isPending}
            size="sm"
          >
            {isPending ? 'Salvando...' : 'Salvar campo'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancelar
          </Button>
        </div>
      </Wrapper>
    </FormProvider>
  );
};

export default PreferenceFieldForm;
