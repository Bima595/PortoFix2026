'use client';

export function ReloadButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 active:scale-[0.98]"
    >
      Reload page
    </button>
  );
}
