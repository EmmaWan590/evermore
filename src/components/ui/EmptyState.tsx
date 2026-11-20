export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="flex animate-fade flex-col items-center px-6 py-24 text-center">
      <p className="font-display text-[18px] tracking-[0.04em] text-starlight/75">{title}</p>
      {body ? (
        <p className="mt-4 max-w-[300px] text-[13px] leading-[1.9] text-dust/75">{body}</p>
      ) : null}
    </div>
  )
}
