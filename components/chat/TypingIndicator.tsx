export function TypingIndicator({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="flex items-center gap-2 bg-[#f3f0e9] px-4 py-2 text-xs font-semibold text-bluechat-blue dark:bg-slate-950">
      <span className="flex gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-bluechat-blue [animation-delay:-0.2s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-bluechat-blue [animation-delay:-0.1s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-bluechat-blue" />
      </span>
      sedang menulis pesan
    </div>
  );
}
