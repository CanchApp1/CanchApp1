export default function PanelEstadisticas() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-[#0ed1e8]">
                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Reservas de Hoy</h3>
                <p className="text-3xl font-black text-[#03292e] mt-2">0</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-[#03292e]">
                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Ingresos del Mes</h3>
                <p className="text-3xl font-black text-[#03292e] mt-2">$0</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Estado del Local</h3>
                <p className="text-xl font-bold text-green-500 mt-3">Abierto</p>
            </div>
        </div>
    );
}
