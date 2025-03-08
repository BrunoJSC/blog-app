import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <section className="flex h-screen flex-col items-center justify-center">
      <SignUp />
    </section>
  );
}
