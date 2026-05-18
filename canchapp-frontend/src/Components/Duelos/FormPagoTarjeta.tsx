import { useState } from 'react';
import { CreditCard, Lock, ChevronLeft } from 'lucide-react';

interface Props {
  monto: number;
  procesando: boolean;
  onConfirmar: () => void;
  onVolver: () => void;
}

export default function FormPagoTarjeta({ monto, procesando, onConfirmar, onVolver }: Props) {
  const [form, setForm] = useState({ numero: '', expiracion: '', cvc: '', nombre: '' });
  const [confirmado, setConfirmado] = useState(false);

  const handleNumero = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 16);
    v = v.replace(/(\d{4})(?=\d)/g, '$1 ');
    setForm(f => ({ ...f, numero: v }));
  };

  const handleExpiracion = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2);
    setForm(f => ({ ...f, expiracion: v }));
  };

  const handleCvc = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, cvc: e.target.value.replace(/\D/g, '').substring(0, 3) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmado) { setConfirmado(true); return; }
    onConfirmar();
  };

  return (
    <div className="p-6 md:p-8 space-y-5">

      {/* Encabezado de paso */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onVolver}
          disabled={procesando}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 disabled:opacity-40"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
            alt="Stripe"
            className="h-6"
          />
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
            Pago seguro
          </p>
        </div>
      </div>

      {/* Resumen de monto */}
      <div className="bg-[#03292e] text-white rounded-2xl p-4 flex justify-between items-center">
        <p className="text-sm font-bold text-gray-300">Total a pagar ahora</p>
        <p className="text-2xl font-black">${monto.toLocaleString('es-CO')} <span className="text-sm font-normal">COP</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
            Número de tarjeta
          </label>
          <div className="relative">
            <input
              required
              type="text"
              value={form.numero}
              onChange={handleNumero}
              placeholder="0000 0000 0000 0000"
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#0ed1e8] focus:bg-white outline-none transition-all pl-12 font-mono"
            />
            <CreditCard className="absolute left-4 top-4 text-gray-400" size={20} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
              Expiración
            </label>
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
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
              CVC
            </label>
            <div className="relative">
              <input
                required
                type="text"
                value={form.cvc}
                onChange={handleCvc}
                placeholder="000"
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#0ed1e8] outline-none text-center font-mono"
              />
              <Lock className="absolute right-4 top-4 text-gray-300" size={18} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
            Nombre en la tarjeta
          </label>
          <input
            required
            type="text"
            value={form.nombre}
            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
            placeholder="Nombre del Titular"
            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#0ed1e8] outline-none uppercase"
          />
        </div>

        {!confirmado ? (
          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-black text-lg bg-[#03292e] text-white hover:bg-[#0a4149] transition-all shadow-lg active:scale-95"
          >
            Revisar Pago
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-yellow-50 border-2 border-yellow-100 p-4 rounded-2xl text-center">
              <p className="text-[#03292e] font-bold text-sm">
                ¿Confirmas el pago de{' '}
                <span className="text-lg font-black">${monto.toLocaleString('es-CO')}</span>?
              </p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase font-black">Esta acción no se puede deshacer</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmado(false)}
                disabled={procesando}
                className="flex-1 py-4 rounded-2xl font-bold text-gray-400 hover:text-gray-600 transition-all disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={procesando}
                className="flex-[2] py-4 rounded-2xl font-black text-lg transition-all shadow-lg flex items-center justify-center gap-3 bg-[#0ed1e8] text-[#03292e] hover:bg-[#0bc0d5] active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {procesando ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#03292e]" />
                    Procesando...
                  </>
                ) : 'Confirmar y Pagar'}
              </button>
            </div>
          </div>
        )}

        <p className="text-[10px] text-center text-gray-400 italic">
          Transacción segura protegida por encriptación SSL de 256 bits.
        </p>
      </form>
    </div>
  );
}
