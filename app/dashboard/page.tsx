"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Bar, BarChart } from "recharts";

type DashboardData = {
    ventas_diarias: { fecha: string; monto: number }[];
    top_productos: { nombre: string; ventas: number; categoria: string }[];
    categorias: { name: string; value: number }[];
    ultimos_pedidos?: { cliente: string; productos: string; monto: number; fecha: string }[];
};

export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/dashboard_data.json")
            .then(r => r.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error cargando datos:", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-green-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🍉</div>
                    <p className="text-xl text-gray-600">Cargando datos del dashboard...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-green-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <p className="text-xl text-gray-600">No se pudieron cargar los datos</p>
                </div>
            </div>
        );
    }

    // Calcular KPIs dinámicos
    const totalVentas = data.ventas_diarias.reduce((acc, v) => acc + v.monto, 0);
    const diasRegistrados = data.ventas_diarias.length;
    const promedioVentaDiaria = totalVentas / diasRegistrados;

    // Últimos 7 días para el gráfico de línea
    const ultimos7Dias = data.ventas_diarias.slice(-7).map(v => {
        const fecha = new Date(v.fecha);
        const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        return {
            dia: dias[fecha.getDay()],
            monto: v.monto
        };
    });

    // Top 5 productos para el gráfico de barras
    const top5Productos = data.top_productos.slice(0, 5);

    // Calcular porcentaje de reducción de merma (simulado basado en ventas)
    const mermaReducida = Math.round((promedioVentaDiaria / 1000) * 2); // Fórmula simple

    const colores = ["#16a34a", "#f97316", "#84cc16", "#06b6d4"];

    // Pedidos simulados (puedes reemplazar con datos reales si los tienes)
    const pedidosRecientes = data.ultimos_pedidos || [
        { cliente: "María López", productos: top5Productos[0]?.nombre || "Varios", monto: Math.round(promedioVentaDiaria * 0.05), fecha: data.ventas_diarias[data.ventas_diarias.length - 1]?.fecha.slice(5) || "11/11" },
        { cliente: "Carlos Ruiz", productos: top5Productos[1]?.nombre || "Varios", monto: Math.round(promedioVentaDiaria * 0.03), fecha: data.ventas_diarias[data.ventas_diarias.length - 2]?.fecha.slice(5) || "10/11" },
        { cliente: "Diana Pérez", productos: top5Productos[2]?.nombre || "Varios", monto: Math.round(promedioVentaDiaria * 0.06), fecha: data.ventas_diarias[data.ventas_diarias.length - 3]?.fecha.slice(5) || "09/11" },
    ];

    return (
        <main className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-green-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
                    📊 Panel de Control — Frutería La Puerta
                </h1>

                {/* Tarjetas KPI */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {[
                        {
                            title: "Ventas Totales",
                            value: `$${totalVentas.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
                            icon: "💰",
                            color: "from-green-400 to-green-600"
                        },
                        {
                            title: "Productos Activos",
                            value: data.top_productos.length.toString(),
                            icon: "🛒",
                            color: "from-emerald-400 to-teal-500"
                        },
                        {
                            title: "Días Registrados",
                            value: diasRegistrados.toString(),
                            icon: "📅",
                            color: "from-orange-400 to-pink-500"
                        },
                        {
                            title: "Promedio Diario",
                            value: `$${Math.round(promedioVentaDiaria).toLocaleString('es-MX')}`,
                            icon: "📈",
                            color: "from-yellow-400 to-lime-500"
                        }
                    ].map((k, idx) => (
                        <div key={idx} className={`p-6 rounded-2xl bg-gradient-to-br ${k.color} text-white shadow-lg hover:shadow-xl transition-shadow`}>
                            <div className="text-3xl mb-2">{k.icon}</div>
                            <div className="text-xl font-bold">{k.value}</div>
                            <div className="text-sm opacity-90">{k.title}</div>
                        </div>
                    ))}
                </div>

                {/* Gráficos principales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Línea de ventas diarias */}
                    <div className="col-span-2 bg-white rounded-xl p-5 shadow-lg">
                        <h3 className="font-bold text-gray-700 mb-3">Ventas Últimos 7 Días</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={ultimos7Dias}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                <XAxis dataKey="dia" />
                                <YAxis />
                                <Tooltip formatter={(value: any) => `$${value.toLocaleString('es-MX')}`} />
                                <Line type="monotone" dataKey="monto" stroke="#16a34a" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pie chart de categorías */}
                    <div className="bg-white rounded-xl p-5 shadow-lg">
                        <h3 className="font-bold text-gray-700 mb-3">Participación por Categoría</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie data={data.categorias} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                                    {data.categorias.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colores[index % colores.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: any) => `$${value.toLocaleString('es-MX')}`} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2">
                            {data.categorias.map((cat, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colores[idx % colores.length] }}></div>
                                        <span>{cat.name}</span>
                                    </div>
                                    <span className="font-semibold">${cat.value.toLocaleString('es-MX', { minimumFractionDigits: 0 })}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top productos */}
                <div className="mt-10 bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="font-bold text-gray-700 mb-4">🛒 Top 5 Productos Más Vendidos</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={top5Productos}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis dataKey="nombre" />
                            <YAxis />
                            <Tooltip formatter={(value: any) => `$${value.toLocaleString('es-MX')}`} />
                            <Bar dataKey="ventas" fill="#34d399" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Tabla de pedidos recientes */}
                <div className="mt-10 bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="font-bold text-gray-700 mb-4">📦 Últimos Pedidos</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-green-100 text-left">
                                    <th className="py-2 px-3 rounded-l-lg">Cliente</th>
                                    <th className="py-2 px-3">Productos</th>
                                    <th className="py-2 px-3">Monto</th>
                                    <th className="py-2 px-3 rounded-r-lg">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedidosRecientes.map((p, i) => (
                                    <tr key={i} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="py-2 px-3">{p.cliente}</td>
                                        <td className="py-2 px-3">{p.productos}</td>
                                        <td className="py-2 px-3 font-semibold text-green-600">${p.monto.toLocaleString('es-MX')}</td>
                                        <td className="py-2 px-3 text-gray-600">{p.fecha}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tabla completa de productos */}
                <div className="mt-10 bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="font-bold text-gray-700 mb-4">📋 Todos los Productos</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-orange-100 text-left">
                                    <th className="py-2 px-3 rounded-l-lg">#</th>
                                    <th className="py-2 px-3">Producto</th>
                                    <th className="py-2 px-3">Categoría</th>
                                    <th className="py-2 px-3 rounded-r-lg">Ventas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.top_productos.map((p, i) => (
                                    <tr key={i} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="py-2 px-3 text-gray-500">{i + 1}</td>
                                        <td className="py-2 px-3 font-medium">{p.nombre}</td>
                                        <td className="py-2 px-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${p.categoria === 'Frutas' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {p.categoria}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 font-semibold text-green-600">${p.ventas.toLocaleString('es-MX', { minimumFractionDigits: 0 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}