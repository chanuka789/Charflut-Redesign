export function Statement({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-paper px-4 pt-14 pb-20 text-center sm:pt-16 sm:pb-[84px]">
      <h2 className="display-type text-[44px] leading-none uppercase sm:text-[56px]">{title}</h2>
      <p className="mx-auto mt-5 max-w-[460px] text-sm leading-[1.4] text-ink">{children}</p>
    </section>
  );
}
