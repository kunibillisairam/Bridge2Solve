import { redirect } from 'next/navigation';

export default function CitizenRootRedirect() {
  redirect('/citizen/dashboard');
}
