# process_eleventa_csv.py
import csv, json
from datetime import datetime
from collections import defaultdict
from pathlib import Path

INPUT = "ventas_eleventa.csv"
OUT_FILE = "public/dashboard_data.json"

def main():
    ventas_por_dia = defaultdict(float)
    productos = defaultdict(lambda: {"ventas": 0, "categoria": None})
    categorias = defaultdict(float)

    with open(INPUT, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            fecha = row["Fecha"][:10]
            prod = row["Producto"]
            cat = row.get("Categoria", "General")
            importe = float(row["Importe"])
            cant = float(row["Cantidad"])

            ventas_por_dia[fecha] += importe
            productos[prod]["ventas"] += importe
            productos[prod]["categoria"] = cat
            categorias[cat] += importe

    data = {
        "ventas_diarias": [{"fecha": k, "monto": v} for k, v in sorted(ventas_por_dia.items())],
        "top_productos": sorted(
            [{"nombre": p, **v} for p, v in productos.items()],
            key=lambda x: x["ventas"],
            reverse=True,
        )[:10],
        "categorias": [{"name": k, "value": v} for k, v in categorias.items()],
    }

    Path("public").mkdir(exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"✅ Dashboard data generada en {OUT_FILE}")

if __name__ == "__main__":
    main()