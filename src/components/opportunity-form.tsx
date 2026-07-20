import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createContact } from '@/services/contacts'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  contact_nature: z.enum(['pessoa_fisica', 'pessoa_juridica'], {
    required_error: 'Selecione o tipo de contato',
  }),
  status: z.enum(['lead', 'ativo', 'inativo']).default('lead'),
  name: z.string().min(1, 'Nome / Razão Social é obrigatório'),
  tax_id: z.string().optional(),
  organization: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  lead_source: z.string().optional(),
  value: z.coerce.number().min(0).optional(),
  next_follow_up: z.string().optional(),
  notes: z.string().optional(),
})

interface OpportunityFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function OpportunityForm({ onSuccess, onCancel }: OpportunityFormProps) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contact_nature: 'pessoa_fisica',
      status: 'lead',
      name: '',
      tax_id: '',
      organization: '',
      email: '',
      phone: '',
      lead_source: '',
      value: undefined,
      next_follow_up: '',
      notes: '',
    },
  })

  const contactNature = form.watch('contact_nature')
  const taxIdLabel = contactNature === 'pessoa_fisica' ? 'CPF' : 'CNPJ'
  const taxIdPlaceholder =
    contactNature === 'pessoa_fisica' ? '000.000.000-00' : '00.000.000/0000-00'

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const data: any = {
        ...values,
        type: 'prospect',
        pipeline_stage: 'prospeccao',
      }
      if (data.next_follow_up) {
        data.next_follow_up = new Date(data.next_follow_up).toISOString()
      } else {
        delete data.next_follow_up
      }
      await createContact(data)
      toast({ title: 'Oportunidade adicionada!' })
      onSuccess()
    } catch {
      toast({ title: 'Erro ao salvar oportunidade', variant: 'destructive' })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contact_nature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Contato *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pessoa_fisica">Pessoa Física</SelectItem>
                    <SelectItem value="pessoa_juridica">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tax_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{taxIdLabel}</FormLabel>
              <FormControl>
                <Input placeholder={taxIdPlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome / Razão Social *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: João da Silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empresa / Organização</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Acme Corp" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="exemplo@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="(00) 00000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="lead_source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origem</FormLabel>
                <FormControl>
                  <Input placeholder="Instagram, indicação..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Potencial (R$)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="next_follow_up"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Próximo follow-up</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea placeholder="Adicione notas adicionais aqui..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Salvar Contato
          </Button>
        </div>
      </form>
    </Form>
  )
}
