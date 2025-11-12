// app/page.tsx
"use client";
import { useEffect, useMemo, useState } from "react";

type Item = {
    id: string;
    nombre: string;
    categoria: string;
    precio: number;
    unidad: string;
    oferta?: string;
    disponible: boolean;
    imagen: string;
};

export default function Home() {
    const [items, setItems] = useState<Item[]>([]);
    const [q, setQ] = useState("");
    const [cat, setCat] = useState<string>("Todas");
    const [qty, setQty] = useState<Record<string, number>>({});
    const [telefono] = useState<string>("526692727479");

    useEffect(() => {
        fetch("/catalog.json").then(r => r.json()).then(setItems);
    }, []);

    const categorias = useMemo(() => {
        const s = new Set(items.map(i => i.categoria));
        return ["Todas", ...Array.from(s)];
    }, [items]);

    const filtrados = useMemo(() => {
        return items.filter(i => {
            if (!i.disponible) return false;
            if (cat !== "Todas" && i.categoria !== cat) return false;
            if (q && !i.nombre.toLowerCase().includes(q.toLowerCase())) return false;
            return true;
        });
    }, [items, q, cat]);

    const total = useMemo(() => {
        return filtrados.reduce((acc, i) => {
            const n = qty[i.id] || 0;
            return acc + n * i.precio;
        }, 0);
    }, [filtrados, qty]);

    const totalItems = useMemo(() => {
        return Object.values(qty).reduce((a, b) => a + b, 0);
    }, [qty]);

    const message = useMemo(() => {
        const seleccion = filtrados
            .filter(i => (qty[i.id] || 0) > 0)
            .map(i => `- ${i.nombre} x ${qty[i.id]} ${i.unidad} @ $${i.precio.toFixed(2)}`)
            .join("%0A");
        const encabezado = "Hola, quiero pedir:%0A%0A";
        const footer = `%0A%0ATotal estimado: $${total.toFixed(2)} MXN%0A%0A%0A Gracias!`;
        return encabezado + seleccion + footer;
    }, [filtrados, qty, total]);

    const waUrl = `https://wa.me/${telefono}?text=${message}`;

    const getCategoryIcon = (cat: string) => {
        if (cat === "Frutas") return "🍎";
        if (cat === "Verduras") return "🥬";
        return "🛒";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50">
            {/* Header */}
            <header className="bg-white shadow-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
                                🍉 Frutería La Puerta
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">Frescura directo a tu mesa • Mazatlán</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
                            <span className="text-2xl">📍</span>
                            <span className="text-sm font-medium text-green-800">Entrega local</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 pb-32">
                {/* Buscador y filtros */}
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                            <input
                                placeholder="Buscar frutas o verduras..."
                                value={q}
                                onChange={e => setQ(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                            />
                        </div>
                        <select
                            value={cat}
                            onChange={e => setCat(e.target.value)}
                            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white font-medium"
                        >
                            {categorias.map(c => (
                                <option key={c} value={c}>
                                    {getCategoryIcon(c)} {c}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Grid de productos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtrados.map(i => (
                        <div
                            key={i.id}
                            className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                        >
                            {/* Imagen placeholder con gradiente */}
                            <div className="relative h-40 overflow-hidden rounded-t-2xl">
                                <img
                                    src={i.imagen}
                                    alt={i.nombre}
                                    className="object-cover w-full h-full scale-100 group-hover:scale-105 transition-transform duration-500"
                                />
                                {i.oferta && (
                                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                        ¡OFERTA!
                                    </div>
                                )}
                            </div>

                            <div className="p-5">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">{i.nombre}</h3>
                                        <p className="text-sm text-gray-500">{i.categoria} • {i.unidad}</p>
                                    </div>
                                </div>

                                <div className="flex items-baseline gap-2 mb-3">
                                    <span className="text-3xl font-bold text-green-600">${i.precio.toFixed(2)}</span>
                                    <span className="text-sm text-gray-500">MXN</span>
                                </div>

                                {i.oferta && (
                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 mb-3 rounded">
                                        <p className="text-xs font-semibold text-yellow-800">{i.oferta}</p>
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setQty(q => ({ ...q, [i.id]: Math.max(0, (q[i.id] || 0) - 0.5) }))}
                                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-red-500 hover:text-white font-bold transition-all flex items-center justify-center"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        min={0}
                                        step="0.5"
                                        value={qty[i.id] || 0}
                                        onChange={e => setQty(q => ({ ...q, [i.id]: Math.max(0, parseFloat(e.target.value || "0")) }))}
                                        className="flex-1 text-center text-lg font-bold border-2 border-gray-200 rounded-xl py-2 focus:border-green-500 outline-none"
                                    />
                                    <button
                                        onClick={() => setQty(q => ({ ...q, [i.id]: (q[i.id] || 0) + 0.5 }))}
                                        className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold transition-all flex items-center justify-center shadow-md"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filtrados.length === 0 && (
                    <div className="text-center py-16">
                        <span className="text-6xl">🔍</span>
                        <p className="text-xl text-gray-500 mt-4">No encontramos productos con ese criterio</p>
                    </div>
                )}
            </main>

            {/* Carrito flotante */}
            {totalItems > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-green-500 shadow-2xl z-50 animate-slide-up">
                    <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                                    {totalItems}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total estimado</p>
                                    <p className="text-2xl font-bold text-gray-800">${total.toFixed(2)} <span className="text-sm font-normal">MXN</span></p>
                                </div>
                            </div>
                            <a href={waUrl} target="_blank" rel="noreferrer">
                                <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 sm:px-8 py-4 rounded-2xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 group">
                                    <span className="text-2xl group-hover:scale-110 transition-transform">💬</span>
                                    Pedir por WhatsApp
                                </button>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}