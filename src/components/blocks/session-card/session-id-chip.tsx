type SessionIdChipProps = {
  sessionId: string
}

export function SessionIdChip({ sessionId }: SessionIdChipProps) {
  return (
    <span className="inline-flex max-w-full truncate rounded-md border border-border/70 bg-muted/50 px-2.5 py-1 font-mono text-[11px] text-muted-foreground shadow-sm">
      {sessionId}
    </span>
  )
}
