import { redirect } from 'next/navigation';

export default function OldRootPage({ params }: { params: { id: string } }) {
  redirect(`/roots/${params.id}`);
}
