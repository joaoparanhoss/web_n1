import { useEffect, useState } from 'react';

export function Topbar() {
  const [hora, setHora] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full flex justify-end items-center px-6 py-3 border-b border-slate-800 bg-slate-950">
      <div className="text-right">
        <p className="text-base font-semibold text-white leading-none">
          {hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {hora.toLocaleDateString('pt-BR', { dateStyle: 'long' })}
        </p>
      </div>
    </div>
  );
}
