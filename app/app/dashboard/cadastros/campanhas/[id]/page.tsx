import { CampanhaForm } from '@/components/produtos/campanha-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarCampanhaPage({ params }: Props) {
  const { id } = await params
  return <CampanhaForm id={id} />
}
