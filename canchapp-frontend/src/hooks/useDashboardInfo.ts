import { useState, useEffect } from 'react';

export const useDashboardInfo = () => {
    const [saludo, setSaludo] = useState('');
    const [nombreUsuario, setNombreUsuario] = useState('Propietario');

    useEffect(() => {
        // Lógica del saludo
        const hora = new Date().getHours();
        if (hora >= 5 && hora < 12) setSaludo('Buenos días');
        else if (hora >= 12 && hora < 19) setSaludo('Buenas tardes');
        else setSaludo('Buenas noches');

        // Lógica del nombre
        const nombreGuardado = sessionStorage.getItem('userName');
        if (nombreGuardado) setNombreUsuario(nombreGuardado);
    }, []);

    // Le devolvemos al componente solo lo que necesita para el "menú"
    return { saludo, nombreUsuario };
};
