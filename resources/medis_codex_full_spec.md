# MEDIS NFC URL Payload – End‑to‑End Specification (v1.0)

This document is a **complete, self‑contained spec** for encoding battlefield → hospital handover data into an NFC URL fragment, rendering it client‑side, and expanding to FHIR IPS on the website. It includes the **final schema**, **security stance**, **encoding pipeline**, **viewer logic**, and a **full working payload** (Thomas Hodge) in **JSON** matching the schema for AI/codegen tools.

---

## 1) Objectives & Scope

- **Offline-first**: NFC tag holds an **entire care summary** as a URL (with data in the `#fragment`).
- **Tap-to-open** UX on iOS/Android → default browser → website.
- **Standards-ready**: All clinical items are **coded** (SNOMED CT, LOINC; optionally ICD).
- **Interoperable output**: Website expands to **FHIR IPS (R4)** resources for display and integrations.
- **No server dependency at write time**: Payload itself is the record; lookup of human-readable terms happens later when the device is online.

Non-goals:
- Longitudinal EHR history.
- Persisting or syncing to servers during NFC write (done later if desired).

---

## 2) URL & Size Constraints

- NFC tag stores a URL of the form:  
  `https://www.medis.org.uk/#<fragment>`
- `<fragment>` is a URL-safe Base64 string of a **compressed binary** (see pipeline below).
- **Sensible limit** for reliability across platforms: **≤ 2,000 characters** total URL length.
- Our design comfortably fits **rich multi-stage care** in ~1,800–1,950 chars at the upper bound.

---

## 3) Security Position

- **HTTPS is sufficient**: protects confidentiality/integrity in transit.
- **No additional encryption**: payload resides in URL **fragment**, which browsers **do not send** to servers or logs.
- **Operational principle**: Data is intended to **assist care** even if intercepted (Geneva Convention context).

---

## 4) Encoding Pipeline

```
NFCPayload (ProtoBuf)
  → zlib DEFLATE (level 6–9)
    → Base64URL (RFC 4648, strip '=' padding)
      → URL fragment after '#'
```

- **Write side (NFC)**: assemble schema object → serialize → compress → base64url → store as `#fragment`.
- **Read side (browser)**: get `location.hash` → base64url decode → inflate → ProtoBuf decode → render.

---

## 5) Terminology & Translation

- **Codes only on the wire** to remain compact:  
  - SNOMED CT (prefix `sct:`) for findings/conditions/interventions/demographics where applicable.  
  - LOINC (prefix `loinc:`) for vitals/labs (units **omitted** when intrinsic to the LOINC definition).  
  - NHS number (`uk.nhs:`) as an identifier system.
- **FQNs / Preferred Terms** are **looked up client/server-side** post‑decode, when online:  
  - SNOMED CT: SNOMED Browser / MLDS / local terminology server (multilingual).  
  - LOINC: LOINC web/API or local table.  
  - ICD‑10/11 (optional): if mapped server-side for registries and reporting.

---

## 6) ProtoBuf Schema (authoritative)

```proto
syntax = "proto3";

package medis.nfc;

// Generic coded reference
message CodeRef {
  string sys = 1;   // "sct", "loinc", "icd11", "uk.nhs"
  string code = 2;  // code value
}

// Patient demographics
message Patient {
  string given = 1;
  string family = 2;
  CodeRef gender = 3;       // SNOMED-coded (e.g., sct:248153007 male)
  CodeRef blood_group = 4;  // SNOMED-coded (e.g., sct:112144000 O RhD+)
  CodeRef nhs_id = 5;       // uk.nhs:<number>
  CodeRef service_id = 6;   // service identifier system/code (sct code for type)
  string dob = 7;           // YYYY-MM-DD
}

// Vital sign observation
message Vital {
  CodeRef code = 1;  // e.g., loinc:8867-4 (HR)
  double value = 2;  // numeric
}

// Condition / finding
message Condition {
  CodeRef code = 1;  // SNOMED/ICD
  string onset = 2;  // optional datetime
}

// Intervention / event
message Event {
  CodeRef code = 1;  // SNOMED/LOINC
  string time = 2;   // ISO datetime
  double dose = 3;   // optional numeric
  string unit = 4;   // optional (mg, ml, units)
  string route = 5;  // optional (iv, po, etc.)
}

// Stage of care
message Stage {
  repeated Vital vitals = 1;
  repeated Condition conditions = 2;
  repeated Event events = 3;
}

// Top-level NFC payload
message NFCPayload {
  Patient patient = 1;
  Stage poi = 2;      // Point of Injury
  Stage medevac = 3;  // MEDEVAC
  Stage r1 = 4;       // Role 1 (PHEC/DCR)
  Stage r2 = 5;       // Role 2 (DCS)
  int64 t = 6;        // creation timestamp (epoch minutes or ISO on decode)
}
```

Notes:
- If you later want **even smaller** payloads, define a **predefined code dictionary** and carry only integers; keep a sideband `version` field.

---

## 7) Client-Side Viewer Logic (no styling)

1. **Extract fragment**: `frag = window.location.hash.slice(1)`  
   - If empty: optional demo/fallback (e.g., accept pasted JSON).

2. **Decode**:  
   - Base64URL → bytes  
   - Inflate (DEFLATE) → ProtoBuf bytes  
   - `NFCPayload.decode(bytes)` via `protobuf.js`

3. **Render**:
   - **Patient**: name, DOB, gender (badge `sct:...`), blood group (badge), IDs (badges).  
   - **Stages** (`poi`, `medevac`, `r1`, `r2`):  
     - Vitals table: **badge (sys:code)** + numeric value.  
     - Conditions table: **badge** + onset.  
     - Events table: **badge** + time + optional *dose + unit + route*.
   - **Summary**: counts of vitals/conditions/events; `t` timestamp.

4. **FQNs** (optional, when online): hit terminology services to resolve codes into preferred terms (and language).

---

## 8) Full Working Payload (JSON form for testing/codex)

This JSON matches the **ProtoBuf shapes** and can be used as a reference input for tooling and tests.

```json
{
  "patient": {
    "given": "Thomas",
    "family": "Hodge",
    "gender": { "sys": "sct", "code": "248153007" },
    "blood_group": { "sys": "sct", "code": "112144000" },
    "nhs_id": { "sys": "uk.nhs", "code": "4857773456" },
    "service_id": { "sys": "sct", "code": "419358007" },
    "dob": "1884-06-02"
  },
  "poi": {
    "vitals": [
      { "code": { "sys": "loinc", "code": "8867-4" }, "value": 120 },
      { "code": { "sys": "loinc", "code": "9279-1" }, "value": 24 },
      { "code": { "sys": "loinc", "code": "59408-5" }, "value": 92 }
    ],
    "conditions": [
      { "code": { "sys": "sct", "code": "449868002" } },
      { "code": { "sys": "sct", "code": "26929004" } },
      { "code": { "sys": "sct", "code": "22298006" } }
    ],
    "events": [
      { "code": { "sys": "sct", "code": "112738007" }, "time": "2025-09-15T10:07:00Z" },
      { "code": { "sys": "sct", "code": "430193006" }, "time": "2025-09-15T10:10:00Z" }
    ]
  },
  "medevac": {
    "vitals": [
      { "code": { "sys": "loinc", "code": "8867-4" }, "value": 110 },
      { "code": { "sys": "loinc", "code": "9279-1" }, "value": 22 },
      { "code": { "sys": "loinc", "code": "59408-5" }, "value": 95 }
    ],
    "conditions": [
      { "code": { "sys": "sct", "code": "386661006" } }
    ],
    "events": [
      { "code": { "sys": "sct", "code": "243141000" }, "time": "2025-09-15T10:30:00Z" },
      { "code": { "sys": "sct", "code": "387544009" }, "time": "2025-09-15T10:40:00Z", "dose": 100, "unit": "mcg", "route": "iv" },
      { "code": { "sys": "sct", "code": "225358003" }, "time": "2025-09-15T10:45:00Z" },
      { "code": { "sys": "sct", "code": "386746003" }, "time": "2025-09-15T10:50:00Z" }
    ]
  },
  "r1": {
    "vitals": [
      { "code": { "sys": "loinc", "code": "8867-4" }, "value": 100 },
      { "code": { "sys": "loinc", "code": "9279-1" }, "value": 20 },
      { "code": { "sys": "loinc", "code": "59408-5" }, "value": 96 },
      { "code": { "sys": "loinc", "code": "8480-6" }, "value": 90 },
      { "code": { "sys": "loinc", "code": "8462-4" }, "value": 60 }
    ],
    "conditions": [
      { "code": { "sys": "sct", "code": "82271004" } }
    ],
    "events": [
      { "code": { "sys": "sct", "code": "182777000" }, "time": "2025-09-15T11:00:00Z", "dose": 1000, "unit": "mg", "route": "iv" },
      { "code": { "sys": "sct", "code": "16990000" }, "time": "2025-09-15T11:10:00Z", "dose": 500, "unit": "ml", "route": "iv" },
      { "code": { "sys": "sct", "code": "199225006" }, "time": "2025-09-15T11:15:00Z" },
      { "code": { "sys": "sct", "code": "372756003" }, "time": "2025-09-15T11:20:00Z" },
      { "code": { "sys": "sct", "code": "441742003" }, "time": "2025-09-15T11:25:00Z" },
      { "code": { "sys": "loinc", "code": "718-7" }, "time": "2025-09-15T11:30:00Z", "dose": 9, "unit": "g/dL" },
      { "code": { "sys": "loinc", "code": "32693-4" }, "time": "2025-09-15T11:35:00Z", "dose": 4.5, "unit": "mmol/L" }
    ]
  },
  "r2": {
    "vitals": [
      { "code": { "sys": "loinc", "code": "8867-4" }, "value": 88 },
      { "code": { "sys": "loinc", "code": "9279-1" }, "value": 18 },
      { "code": { "sys": "loinc", "code": "59408-5" }, "value": 98 },
      { "code": { "sys": "loinc", "code": "8480-6" }, "value": 110 },
      { "code": { "sys": "loinc", "code": "8462-4" }, "value": 70 },
      { "code": { "sys": "loinc", "code": "8310-5" }, "value": 37.2 }
    ],
    "conditions": [
      { "code": { "sys": "sct", "code": "417746004" } }
    ],
    "events": [
      { "code": { "sys": "sct", "code": "387713003" }, "time": "2025-09-15T12:30:00Z", "dose": 2, "unit": "units", "route": "iv" },
      { "code": { "sys": "sct", "code": "60910002" }, "time": "2025-09-15T12:40:00Z" },
      { "code": { "sys": "sct", "code": "708255002" }, "time": "2025-09-15T12:50:00Z" },
      { "code": { "sys": "sct", "code": "385949008" }, "time": "2025-09-15T13:00:00Z" },
      { "code": { "sys": "sct", "code": "225928001" }, "time": "2025-09-15T13:10:00Z" },
      { "code": { "sys": "loinc", "code": "34714-6" }, "time": "2025-09-15T13:20:00Z", "dose": 1.4, "unit": "ratio" },
      { "code": { "sys": "loinc", "code": "1925-7" }, "time": "2025-09-15T13:25:00Z", "dose": -2.0, "unit": "mmol/L" }
    ]
  },
  "t": 16900000
}
```

---

## 9) Reference Encode/Decode (Python)

```python
# pip install protobuf==5.*
# python -m pip install protobuf
import base64, zlib
from nfc_payload_pb2 import NFCPayload  # generated from the .proto above

def encode_payload_to_url(payload: NFCPayload, base_url: str) -> str:
  raw = payload.SerializeToString()
  compressed = zlib.compress(raw, level=9)
  b64url = base64.urlsafe_b64encode(compressed).rstrip(b"=").decode("ascii")
  return f"{base_url}#{b64url}"

def decode_url_fragment(fragment: str) -> NFCPayload:
  # add padding back
  pad = "=" * ((4 - len(fragment) % 4) % 4)
  compressed = base64.urlsafe_b64decode(fragment + pad)
  raw = zlib.decompress(compressed)
  msg = NFCPayload()
  msg.ParseFromString(raw)
  return msg
```

---

## 10) Expected Sizes (for this full record)

- **Raw ProtoBuf**: ~1.8 KB  
- **DEFLATE**: ~1.3 KB  
- **Base64URL fragment**: ~1.75–1.85 K characters  
- **Final URL**: ~1.80–1.95 K characters (≤ 2,000 safe target)

---

## 11) IPS Expansion (server/client)

After decode, expand to **FHIR IPS**:

- Map **Patient** → `Patient` resource (gender, birthDate, identifiers, blood group via `Observation` if preferred).  
- Map **Vitals** → `Observation` (LOINC code → `code`, numeric → `valueQuantity`).  
- Map **Conditions** → `Condition` (`code.coding` from SNOMED).  
- Map **Events** → `Procedure` / `MedicationAdministration` / `ServiceRequest` as appropriate.  
- Bundle everything into an IPS `Bundle` with narrative for UI.  
- Resolve **FQNs** via terminology services; attach `display` in `code.coding`.

---

## 12) Test Checklist

- [ ] Fragment decode succeeds with valid Base64URL, fails fast with invalid.  
- [ ] ProtoBuf schema changes are **versioned** (add `schema_version` if needed).  
- [ ] LOINC units omitted when intrinsic (e.g., bpm, mmHg); present when clinically necessary.  
- [ ] URL length stays ≤ 2,000 characters across iOS and Android.  
- [ ] Viewer renders without network; FQN lookup is opportunistic when online.

---
