/**
 * Sample data in raw sheet shape (header row + string cells), used when
 * DATA_SOURCE=fixture. Deliberately includes messy and broken rows so the
 * resilience contract is exercised in development:
 * rows that are not Ready, rows missing hard-required fields (skipped),
 * and rows missing optional fields (rendered with elements omitted).
 */

const FIXTURE_RECEIPT_A =
  "https://drive.google.com/file/d/FIXTUREaaaaaaaaaaaaaaaa1/view?usp=sharing";
const FIXTURE_RECEIPT_B =
  "https://drive.google.com/open?id=FIXTUREbbbbbbbbbbbbbbbb2";
const FIXTURE_RECEIPT_C =
  "https://drive.google.com/file/d/FIXTUREcccccccccccccccc3/view";

export const MONEY_IN_FIXTURE: string[][] = [
  ["Date", "Amount", "Through", "Method", "Display Name", "Ready"],
  ["6/26/2026", "$250.00", "Barbs", "Zelle", "M. R.", "TRUE"],
  ["6/26/2026", "$100", "Kelly", "Venmo", "", "TRUE"],
  ["6/27/2026", "$1,500.00", "Barbs", "Bank Transfer", "Familia G.", "TRUE"],
  ["6/27/2026", "$75.50", "Kelly", "", "", "TRUE"],
  ["6/28/2026", "$40", "", "Cash", "J.", "TRUE"],
  // Not ready: unpublished by design.
  ["6/28/2026", "$500.00", "Barbs", "Zelle", "P. L.", "FALSE"],
  // Ready but missing amount: skipped by the gate.
  ["6/29/2026", "", "Kelly", "Zelle", "A. B.", "TRUE"],
  // Ready but junk date: skipped by the gate.
  ["pending", "$60.00", "Barbs", "Cash App", "", "TRUE"],
];

export const MONEY_OUT_FIXTURE: string[][] = [
  [
    "Date",
    "Amount",
    "Category",
    "Description ES",
    "Description EN",
    "City",
    "Receipt Links",
    "Public Link",
    "Purchaser",
    "Ready",
  ],
  [
    "6/28/2026",
    "$312.40",
    "Agua",
    "Compra de 40 cajas de agua potable para familias en el refugio.",
    "Purchase of 40 cases of drinking water for families at the shelter.",
    "La Guaira",
    `${FIXTURE_RECEIPT_A}, ${FIXTURE_RECEIPT_B}`,
    "",
    "Barbs",
    "TRUE",
  ],
  [
    "6/29/2026",
    "$580.00",
    "Medicina",
    "Medicamentos e insumos de primeros auxilios para el centro de salud.",
    "",
    "Caracas",
    FIXTURE_RECEIPT_C,
    "https://example.org/TODO-public-post",
    "Kelly",
    "TRUE",
  ],
  // Minimal valid row: only the hard-required fields.
  [
    "6/30/2026",
    "$95.75",
    "",
    "Transporte de suministros al puesto de ayuda.",
    "",
    "",
    "",
    "",
    "",
    "TRUE",
  ],
  [
    "7/1/2026",
    "$210.10",
    "Comida",
    "Arroz, harina y proteínas para cocina comunitaria.",
    "Rice, flour, and protein for the community kitchen.",
    "Caraballeda",
    FIXTURE_RECEIPT_A,
    "",
    "Kelly",
    "TRUE",
  ],
  // Ready but missing Description ES: skipped by the gate.
  ["7/1/2026", "$45.00", "Otro", "", "", "Caracas", "", "", "Barbs", "TRUE"],
  // Ready but zero amount: skipped by the gate.
  [
    "7/2/2026",
    "$0",
    "Comida",
    "Fila de prueba con monto invalido.",
    "",
    "",
    "",
    "",
    "",
    "TRUE",
  ],
  // Not ready: unpublished by design.
  [
    "7/2/2026",
    "$130.00",
    "Suministros",
    "Linternas y pilas.",
    "",
    "Catia La Mar",
    "",
    "",
    "Kelly",
    "FALSE",
  ],
];
