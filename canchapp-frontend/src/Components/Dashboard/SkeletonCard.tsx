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

export function SkeletonCanchaItem() {
    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 animate-pulse">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <div className="h-5 bg-gray-100 rounded-xl w-24" />
                    <div className="h-4 bg-gray-100 rounded-full w-16" />
                </div>
                <div className="h-8 w-24 bg-gray-100 rounded-xl" />
            </div>
            <div className="h-3 bg-gray-100 rounded-xl w-2/3" />
            <div className="flex gap-3 pt-4 border-t border-gray-100">
                <div className="flex-1 h-11 bg-gray-100 rounded-2xl" />
                <div className="flex-1 h-11 bg-gray-100 rounded-2xl" />
            </div>
        </div>
    );
}

export function SkeletonComentarioItem() {
    return (
        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm space-y-3 animate-pulse">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-100 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-100 rounded-xl w-1/4" />
                    <div className="h-3 bg-gray-100 rounded-xl w-1/3" />
                </div>
            </div>
            <div className="h-16 bg-gray-100 rounded-2xl" />
        </div>
    );
}

export function SkeletonReservaCard() {
    return (
        <div className="bg-[#032429]/60 border border-white/5 rounded-3xl p-6 space-y-6 animate-pulse">
            <div className="flex justify-between">
                <div className="h-12 w-12 bg-white/5 rounded-2xl" />
                <div className="h-6 w-24 bg-white/5 rounded-full" />
            </div>
            <div className="space-y-2">
                <div className="h-5 bg-white/5 rounded-xl w-3/4" />
                <div className="h-4 bg-white/5 rounded-xl w-1/2" />
            </div>
            <div className="bg-black/20 p-4 rounded-2xl space-y-2.5">
                <div className="h-3 bg-white/5 rounded-xl w-1/2" />
                <div className="h-3 bg-white/5 rounded-xl w-2/5" />
                <div className="h-3 bg-white/5 rounded-xl w-3/5" />
            </div>
            <div className="pt-4 border-t border-white/10 space-y-1.5">
                <div className="h-3 bg-white/5 rounded-xl w-1/4" />
                <div className="h-6 bg-white/5 rounded-xl w-1/3" />
            </div>
        </div>
    );
}

export function SkeletonPartidoItem() {
    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 p-2 shadow-sm animate-pulse">
            <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-100 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-100 rounded-xl w-2/3" />
                        <div className="h-3 bg-gray-100 rounded-xl w-1/3" />
                    </div>
                    <div className="h-6 w-20 bg-gray-100 rounded-full" />
                </div>
            </div>
            <div className="flex gap-2 px-4 pb-3 pt-1 border-t border-gray-50">
                <div className="flex-1 h-8 bg-gray-100 rounded-xl" />
                <div className="w-32 h-8 bg-gray-100 rounded-xl" />
            </div>
        </div>
    );
}
