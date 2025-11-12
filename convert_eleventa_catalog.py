import csv, json, re
from pathlib import Path

INPUT = "eleventa_export_demo.csv"
OUT_JSON = "public/catalog.json"
OUT_WSP = "catalogo_whatsapp.txt"

def slugify(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9áéíóúñü\\s-]", "", s)
    s = s.replace(" ", "_")
    return re.sub(r"_+", "_", s)

def row_to_item(row):
    nombre = row["Descripcion"].strip()
    return {
        "id": slugify(row.get("Codigo") or nombre),
        "nombre": nombre,
        "categoria": row.get("Categoria","General").strip(),
        "precio": float(row["Precio"].replace(",", "").strip()),
        "unidad": (row.get("Unidad") or "pz").strip(),
        "oferta": row.get("Oferta","").strip() or None,
        "disponible": row.get("Disponible","1").strip() in ["1","true","sí","si","TRUE"]
    }

def main():
    items = []
    with open(INPUT, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            items.append(row_to_item(r))

    Path("public").mkdir(exist_ok=True)
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

    categories = {}
    for it in items:
        if not it["disponible"]:
            continue
        categories.setdefault(it["categoria"], []).append(it)

    lines = ["Lista de precios del día:"]
    for cat, arr in categories.items():
        lines.append(f"\\n[{cat}]")
        for it in sorted(arr, key=lambda x: x["nombre"]):
            oferta = f" • {it['oferta']}" if it['oferta'] else ''
            # lines.append(f\"- {it['nombre']} ({it['unidad']}): ${it['precio']:.2f}{oferta}\")
            lines.append(f"- {it['nombre']} ({it['unidad']}): ${it['precio']:.2f}{oferta}")

    with open(OUT_WSP, "w", encoding="utf-8") as f:
        f.write('\\n'.join(lines))

    print(f"✅ Generado {OUT_JSON} y {OUT_WSP}")

if __name__ == "__main__":
    main()