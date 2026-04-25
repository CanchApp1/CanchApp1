import { User, Calendar, Clock, MapPin, Star } from 'lucide-react';

type MatchCardProps = {
    jugador: string;
    jugadores: number;
    cancha: string;
    fecha: string;
    hora: string;
    rating?: number; // Lo hacemos opcional por ahora
}

function MatchCard({ jugador, jugadores, cancha, fecha, hora, rating = 4 }: MatchCardProps) {
    return (
        <div className="bg-white border border-gray-100 rounded-[2rem] p-6 mb-6 shadow-sm hover:shadow-xl transition-all group">
            
            {/* Tag de estado */}
            <div className="flex justify-between items-start mb-4">
                <span className="bg-[#0ed1e8]/10 text-[#007a7a] text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
                    Partido Abierto
                </span>
                <div className="flex items-center gap-1 text-[#0ed1e8]">
                    <Star size={14} fill="#0ed1e8" />
                    <span className="text-xs font-bold text-gray-400">{rating.toFixed(1)}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                
                {/* Perfil del Retador */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <img
                            src={`https://i.pravatar.cc/150?u=${jugador}`} // Avatar dinámico por nombre
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-50 shadow-sm"
                            alt={jugador}
                        />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                        <h3 className="font-black text-[#03292e] text-lg leading-tight">{jugador}</h3>
                        <p className="text-gray-400 text-xs font-bold flex items-center gap-1 mt-1 uppercase">
                            <User size={12} /> {jugadores} Jugadores
                        </p>
                    </div>
                </div>

                {/* VS y Ubicación */}
                <div className="flex flex-col items-center justify-center border-y md:border-y-0 md:border-x border-gray-50 py-4 md:py-0">
                    <span className="text-2xl font-black text-[#03292e] italic opacity-20 group-hover:opacity-100 transition-opacity">VS</span>
                    <div className="flex items-center gap-1.5 mt-1">
                        <MapPin size={14} className="text-[#0ed1e8]" />
                        <p className="text-[#03292e] font-bold text-sm">{cancha}</p>
                    </div>
                </div>

                {/* Info de Tiempo */}
                <div className="space-y-2 text-right">
                    <div className="flex items-center justify-end gap-2 text-gray-500">
                        <span className="text-xs font-bold">{fecha}</span>
                        <Calendar size={14} className="text-gray-400" />
                    </div>
                    <div className="flex items-center justify-end gap-2 text-[#03292e]">
                        <span className="text-sm font-black">{hora}</span>
                        <Clock size={14} className="text-[#0ed1e8]" />
                    </div>
                    <p className="text-[10px] font-bold text-orange-400 uppercase tracking-tighter">Rival pendiente</p>
                </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-50">
                <button className="text-[#03292e] font-black text-sm hover:text-[#0ed1e8] transition-colors flex items-center gap-2">
                    Ver más detalles <span className="text-lg">→</span>
                </button>

                <button className="bg-[#03292e] text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-[#0a4149] transition-all active:scale-95 shadow-lg shadow-[#03292e]/10">
                    Aceptar Desafío
                </button>
            </div>
        </div>
    );
}

export default MatchCard;