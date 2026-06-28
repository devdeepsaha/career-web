export default function LogoMark({ className = 'h-8 w-8' }) {
    return (
        <span
            className={`relative inline-flex shrink-0 items-center justify-center rounded-full border-[3px] border-red-600 bg-white shadow-[inset_0_0_0_3px_rgba(239,68,68,0.14)] ${className}`}
            aria-hidden="true"
        >
            <span className="h-3/5 w-3/5 rounded-full border-[3px] border-red-500 bg-red-50" />
            <span className="absolute h-1.5 w-1.5 rounded-full bg-slate-950" />
        </span>
    );
}
