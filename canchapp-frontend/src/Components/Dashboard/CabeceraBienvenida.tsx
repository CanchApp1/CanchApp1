interface Props {
    saludo: string;
    nombreUsuario: string;
}

export default function CabeceraBienvenida({ saludo, nombreUsuario }: Props) {
    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 mb-8 flex justify-between items-center animate-in fade-in duration-500">
            <div>
                <p className="text-gray-500 font-medium mb-1">Panel de Control</p>
                <h2 className="text-3xl font-extrabold text-[#03292e]">
                    ¡{saludo}, <span className="text-[#0ed1e8]">{nombreUsuario}</span>! 👋
                </h2>
                <p className="text-gray-600 mt-2">Bienvenido a tu panel de gestión.</p>
            </div>
            <div className="hidden md:block h-24 w-24 bg-[#e6effc] rounded-full flex items-center justify-center text-4xl">🏟️</div>
        </div>
    );
}
