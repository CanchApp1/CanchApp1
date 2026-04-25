import { useState } from 'react';

interface CalendarProps {
    value: string; // "YYYY-MM-DD"
    onChange: (date: string) => void;
}

export const Calendar = ({ value, onChange }: CalendarProps) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
        setCurrentDate(newDate);
    };

    const handleDateClick = (day: number) => {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        onChange(`${year}-${month}-${dayStr}`); // Aquí usamos el onChange que viene por props
    };

    // Lógica para renderizar los números
    const days = [];
    const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const firstDay = firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

    // Espacios vacíos
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    // Días del mes
    // Dentro del bucle for (let day = 1; ...)
    for (let day = 1; day <= totalDays; day++) {
        const dateIterObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateIterStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Nueva lógica: ¿Es un día pasado?
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Solo queremos comparar fechas, no horas aquí
        const esPasado = dateIterObj < today;

        days.push(
            <button
                key={day}
                disabled={esPasado} // BLOQUEAMOS EL BOTÓN
                onClick={() => handleDateClick(day)}
                className={`p-2 h-10 w-10 mx-auto rounded-full transition-all flex items-center justify-center ${esPasado
                        ? 'text-gray-200 cursor-not-allowed' // Estilo de deshabilitado
                        : value === dateIterStr
                            ? 'bg-[#0ed1e8] text-white shadow-md scale-110'
                            : 'text-[#03292e] hover:bg-gray-100'
                    }`}
            >
                {day}
            </button>
        );
    }


    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-inner">
            <div className="flex justify-between items-center mb-6 px-4 font-bold text-[#03292e]">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full">&lt;</button>
                <span className="text-lg">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-full">&gt;</button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold">
                {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map(d => (
                    <span key={d} className="text-gray-400 pb-2">{d}</span>
                ))}
                {days}
            </div>
        </div>
    );
};
