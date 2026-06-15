interface Props {
    className?: string;
}

export function SkeletonCard({ className = '' }: Props) {
    return <div className={`animate-pulse bg-gray-100 rounded-2xl ${className}`} />;
}

export function SkeletonReservaItem() {
    return (
        <div className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm flex items-center gap-4 animate-pulse">
            <div className="h-12 w-12 bg-gray-100 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded-xl w-2/5" />
                <div className="h-3 bg-gray-100 rounded-xl w-1/3" />
            </div>
            <div className="h-6 w-24 bg-gray-100 rounded-full" />
        </div>
    );
}

export function SkeletonJugadorItem() {
    return (
        <div className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm flex items-center gap-4 animate-pulse">
            <div className="h-12 w-12 bg-gray-100 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded-xl w-1/3" />
                <div className="h-3 bg-gray-100 rounded-xl w-1/4" />
            </div>
            <div className="h-8 w-12 bg-gray-100 rounded-xl" />
        </div>
    );
}
