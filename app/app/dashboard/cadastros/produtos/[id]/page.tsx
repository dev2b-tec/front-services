import { ProdutoForm } from '@/components/produtos/produto-form'

type Props = { params: Promise<{ id: string }> }

export default async function EditarProdutoPage({ params }: Props) {
  const { id } = await params
  return <ProdutoForm id={id} />
}
