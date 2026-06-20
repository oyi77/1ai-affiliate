export function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-red-400 text-lg mb-2">Something went wrong</div>
      <p className="text-slate-400 text-sm mb-4 max-w-md">
        {error?.response?.data?.error || error?.message || 'An unexpected error occurred'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-surface-3 text-slate-300 rounded-lg text-sm hover:bg-surface-2 transition-all"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
