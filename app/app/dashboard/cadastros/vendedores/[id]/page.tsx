import { VendedorForm } from '@/components/produtos/vendedor-form'

interface Props {
  params: { id: string }
}

export default function EditarVendedorPage({ params }: Props) {
  return <VendedorForm id={params.id} />
}
