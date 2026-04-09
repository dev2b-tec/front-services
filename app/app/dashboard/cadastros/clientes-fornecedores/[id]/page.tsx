import { ClienteFornecedorForm } from '@/components/produtos/cliente-fornecedor-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarCadastroPage({ params }: Props) {
  const { id } = await params
  return <ClienteFornecedorForm id={id} />
}
