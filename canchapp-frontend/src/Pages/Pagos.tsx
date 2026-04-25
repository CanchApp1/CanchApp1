/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Barra_de_navegacion from '../Components/Barra_navegacion';
import { CreditCard, Lock, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { crearReserva } from '../services/reservaService';

export default function PagosPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Extraemos los datos del estado de navegación
    // precioAMostrar es el valor ya calculado (precio * duracion) enviado desde Reservar.tsx
    const { reservaDTO, cancha, fecha, hora, precioAMostrar } = location.state || {};
    const [procesando, setProcesando] = useState(false);
    const [pagoExitoso, setPagoExitoso] = useState(false);
    const montoFinal = precioAMostrar || reservaDTO?.precio || 0; 
    const [form, setForm] = useState({
        numero: '',
        expiracion: '',
        cvc: '',
        nombre: ''
    });

   
    // --- MANEJADORES CON MÁSCARAS Y VALIDACIONES ---

    const handleNumeroTarjeta = (e: React.ChangeEvent<HTMLInputElement>) => {
        let valor = e.target.value.replace(/\D/g, ''); // Solo números
        valor = valor.substring(0, 16); // Máximo 16 dígitos
        // Agrupa de a 4: "0000 0000 0000 0000"
        const formateado = valor.replace(/(\d{4})(?=\d)/g, '$1 ');
        setForm({ ...form, numero: formateado });
    };

    const handleExpiracion = (e: React.ChangeEvent<HTMLInputElement>) => {
        let valor = e.target.value.replace(/\D/g, ''); // Solo números
        valor = valor.substring(0, 4); // Máximo 4 dígitos (MMYY)
        
        // Inserta la barra "/" automáticamente después del mes
        if (valor.length > 2) {
            valor = valor.substring(0, 2) + '/' + valor.substring(2);
        }
        setForm({ ...form, expiracion: valor });
    };

    const handleCVC = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value.replace(/\D/g, '').substring(0, 3); // Solo números, máx 3
        setForm({ ...form, cvc: valor });
    };

    const handleSimularPago = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcesando(true);

        try {
            const token = sessionStorage.getItem('token');

            // 1. Simulación de latencia de pasarela de pago
            await new Promise(resolve => setTimeout(resolve, 2500));

            // 2. Si hay token y datos, procedemos a registrar la reserva real en el DB
            if (token && reservaDTO) {
                await crearReserva(reservaDTO, token);
                setPagoExitoso(true);
                // Redirigir tras 3 segundos de éxito
                setTimeout(() => navigate('/MisReservas'), 3000);
            } else {
                throw new Error("Faltan datos de sesión o reserva");
            }
        } catch (error) {
            console.error(error);
            alert("Hubo un error al procesar el pago o registrar la reserva. Intenta de nuevo.");
        } finally {
            setProcesando(false);
        }
    };

    // Formateador de moneda para el diseño
    const formatCurrency = (val: number) => new Intl.NumberFormat('de-DE').format(val);

    if (pagoExitoso) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-md animate-in zoom-in duration-300">
                    <CheckCircle2 size={80} className="text-green-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-black text-[#03292e] mb-2">¡Pago Exitoso!</h2>
                    <p className="text-gray-500 mb-6">Tu reserva para la <b>{cancha?.nombreEstablecimiento}</b> ha sido confirmada.</p>
                    <div className="bg-gray-100 p-4 rounded-2xl text-sm text-left text-[#03292e]">
                        <p><b>Fecha:</b> {fecha}</p>
                        <p><b>Hora:</b> {hora}</p>
                        <p><b>Total Pagado:</b> ${formatCurrency(precioAMostrar)} COP</p>
                    </div>
                    <p className="mt-6 text-xs text-gray-400 italic">Redirigiendo a tus reservas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Barra_de_navegacion />

            <main className="flex-1 flex flex-col lg:flex-row p-6 md:p-12 gap-8 max-w-6xl mx-auto w-full">
                
                {/* Columna Izquierda: Resumen de Compra */}
                <div className="flex-1 space-y-6">
                    <h1 className="text-4xl font-black text-[#03292e]">Finalizar Pago</h1>
                    
                    <div className="bg-[#03292e] text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                             <CreditCard size={120} />
                        </div>
                        <h3 className="text-[#0ed1e8] font-bold uppercase tracking-widest text-sm mb-4">Resumen de Reserva</h3>
                        <div className="space-y-2">
                            <p className="text-2xl font-bold">{cancha?.nombreEstablecimiento}</p>
                            <p className="opacity-80 flex items-center gap-2"><Calendar size={16}/> {fecha} a las {hora}</p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/20 flex justify-between items-end">
                            <div>
                                <p className="text-xs opacity-60 uppercase">Total a pagar</p>
                                <p className="text-3xl font-black">${formatCurrency(montoFinal)} <span className="text-sm font-normal">COP</span></p>
                            </div>
                            <ShieldCheck className="text-[#0ed1e8]" />
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Formulario "Stripe" */}
                <div className="flex-1 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-gray-100">
                    <form onSubmit={handleSimularPago} className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-8" />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Número de Tarjeta</label>
                                <div className="relative">
                                    <input 
                                        required
                                        type="text" 
                                        value={form.numero}
                                        onChange={handleNumeroTarjeta}
                                        placeholder="0000 0000 0000 0000"
                                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#0ed1e8] focus:bg-white outline-none transition-all pl-12 font-mono"
                                    />
                                    <CreditCard className="absolute left-4 top-4 text-gray-400" size={20} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Expiración</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={form.expiracion}
                                        onChange={handleExpiracion}
                                        placeholder="MM/YY"
                                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#0ed1e8] outline-none text-center font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">CVC</label>
                                    <div className="relative">
                                        <input 
                                            required
                                            type="text" 
                                            value={form.cvc}
                                            onChange={handleCVC}
                                            placeholder="000"
                                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#0ed1e8] outline-none text-center font-mono"
                                        />
                                        <Lock className="absolute right-4 top-4 text-gray-300" size={18} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Nombre en la tarjeta</label>
                                <input 
                                    required
                                    type="text" 
                                    value={form.nombre}
                                    onChange={(e) => setForm({...form, nombre: e.target.value})}
                                    placeholder="Nombre del Titular"
                                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#0ed1e8] outline-none uppercase"
                                />
                            </div>
                        </div>

                        <button
                            disabled={procesando}
                            type="submit"
                            className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-lg flex items-center justify-center gap-3 ${
                                procesando 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                : 'bg-[#0ed1e8] text-[#03292e] hover:bg-[#0bc0d5] active:scale-95'
                            }`}
                        >
                            {procesando ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#03292e]"></div>
                                    Procesando Pago...
                                </>
                            ) : (
                                `Pagar $${formatCurrency(precioAMostrar || 0)}`
                            )}
                        </button>
                        
                        <p className="text-[10px] text-center text-gray-400 px-6 italic">
                            Transacción segura protegida por encriptación SSL de 256 bits.
                        </p>
                    </form>
                </div>
            </main>
        </div>
    );
}