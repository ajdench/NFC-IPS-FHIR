# 📋 Battlefield → Hospital Data Transfer via NFC/URL

## ✅ Goal
Enable **offline-first transfer** of critical patient summary data (Big Four, NHS number, blood group, injuries, treatments) using **NFC cards** that open a URL on iOS/Android devices and deliver structured payloads to a web app for expansion into **FHIR IPS bundles**.

---

## 🔑 Requirements
1. **Tap-to-open UX**: NFC → Browser → Website auto-load.
2. **Self-contained payload**: No server fetch at commit; payload itself carries data.
3. **≤ 2,000 char URL limit**: Ensure NFC-stored URL fits across iOS & Android.
4. **Standards alignment**:
   - FHIR IPS (R4)
   - SNOMED CT / LOINC / ICD mappings
5. **Compression**: Required to maximise data under URL limit.
6. **Security**:
   - Payload carried in URL fragment (`#...`) — never sent to webserver logs.
   - HTTPS transport protects confidentiality in transit.
   - Optional encryption for higher threat environments.

---

## 🏗️ Architectural Approaches

### Option 1: **JSON (minified)**
- Pros: Human-readable, trivial encode/decode.
- Cons: Largest size (keys + quotes overhead).
- Example (Thomas Hodge):
  - JSON minified: ~1,105 bytes
  - DEFLATE: ~378 bytes
  - Base64URL: **504 chars**
  - Final URL length: **530 chars**

---

### Option 2: **CBOR (Concise Binary Object Representation)**
- Pros: Binary JSON, self-describing, drop-in support in JS/Python.
- Cons: Still carries map key overhead (unless integer keys).
- Size: ~30–40% smaller than JSON.
- Expected example:
  - Raw CBOR: ~700 bytes
  - DEFLATE: ~250–280 bytes
  - Base64URL: ~340–370 chars
  - Final URL length: **~365–390 chars**

---

### Option 3: **Protocol Buffers (ProtoBuf)**
- Pros:
  - Schema-based: no keys on wire, smallest payload.
  - Very fast, compact.
- Cons:
  - Requires `.proto` schema for encoding/decoding (server side).
  - Not self-describing (opaque without schema).
- Example (Thomas Hodge):
  - Raw ProtoBuf: ~250–300 bytes
  - DEFLATE + Base64URL: ~250–300 chars
  - Final URL length: **~280–310 chars**
- Note: Phone/browser doesn’t need schema — it just forwards the string in URL fragment.

---

## 📦 Common Example (Thomas Hodge)

### Compact Payload (JSON form before compression)
```json
{
  "D":[{"sys":"http://loinc.org","code":"8867-4"}, ...],
  "P":{"n":["Thomas","Hodge"],"r":"CPL","sn":"5199","dob":18840602,"nhs":"4857773456","bg":0},
  "V":{"poi":[[1,120],[2,24],[3,90],[4,60],[5,92]]},
  "C":{"poi":[[6],[7]]},
  "E":{
    "poi":[[8,"2025-09-15T10:07:00Z"],[9,"2025-09-15T10:10:00Z",1000,"iv"]],
    "medevac":[[10,"2025-09-15T10:30:00Z",null,"mask"]],
    "r1":[[11,"2025-09-15T11:00:00Z",500,"iv"],[12,"2025-09-15T11:10:00Z"]],
    "r2":[[13,"2025-09-15T12:30:00Z"]]
  },
  "t":16900000
}
```

### Example URL after DEFLATE + Base64URL
```
https://www.medis.org.uk/#eNqdkk1PwzAMhv-LzymzncRJegUkDhw4IA5UPYxtbBNbM60DCU3777gFBAwhrZzS2s_7...
```
- JSON: ~530 chars
- CBOR: ~370 chars
- ProtoBuf: ~300 chars

---

## 🔒 Security Options
- **Default**: HTTPS transport protects integrity/confidentiality.
- **Optional encryption**:
  - Encrypt payload before Base64URL.
  - Decrypt in web app with shared key.
- **Operational model**:
  - Geneva Convention logic: prefer treating captured patient with available data rather than concealment.

---

## ✅ Recommendations
- **Prototype with CBOR** for simplicity + size savings.
- **Upgrade to ProtoBuf** if maximal density required.
- Always use **URL fragment (`#`)** to avoid server logs.
- Ensure **server/web app** has decoding pipeline:
  - Base64URL → Inflate → Decode (CBOR/ProtoBuf) → Expand via codebook → FHIR IPS Bundle.

---

## 📑 ProtoBuf Schema (draft)

```proto
syntax = "proto3";

package medis.nfc;

// Codebook entry
message Code {
  string sys = 1;   // system URI (e.g. SNOMED, LOINC)
  string code = 2;  // code string
}

// Patient demographics
message Patient {
  repeated string n = 1;  // name [given, family]
  string r = 2;           // rank/prefix
  string sn = 3;          // service number
  int32 dob = 4;          // YYYYMMDD
  string nhs = 5;         // NHS number
  int32 bg = 6;           // blood group index (into D)
}

// Vital signs (per stage)
message Vitals {
  repeated VitalValue poi = 1;
  repeated VitalValue medevac = 2;
  repeated VitalValue r1 = 3;
  repeated VitalValue r2 = 4;
}
message VitalValue {
  int32 dIndex = 1;       // index into D
  double value = 2;
  string unit = 3;        // optional
}

// Conditions (per stage)
message Conditions {
  repeated ConditionValue poi = 1;
  repeated ConditionValue medevac = 2;
  repeated ConditionValue r1 = 3;
  repeated ConditionValue r2 = 4;
}
message ConditionValue {
  int32 dIndex = 1;       // index into D
  string onset = 2;       // optional datetime
}

// Events / Interventions (per stage)
message Events {
  repeated EventValue poi = 1;
  repeated EventValue medevac = 2;
  repeated EventValue r1 = 3;
  repeated EventValue r2 = 4;
}
message EventValue {
  int32 dIndex = 1;       // index into D
  string time = 2;        // performed datetime
  double dose = 3;        // optional dose
  string route = 4;       // optional route
}

// Top-level NFC payload
message NFCPayload {
  repeated Code D = 1;      // codebook
  Patient P = 2;            // patient
  Vitals V = 3;             // vitals
  Conditions C = 4;         // conditions
  Events E = 5;             // events
  int64 t = 6;              // record creation epoch minutes
}
```

---

## 🖥️ Worked CLI Example – Python (ProtoBuf → DEFLATE → Base64URL → URL)

Below demonstrates a reference pipeline in **Python** using `protobuf`, `zlib`, and `base64`.

### 1. Compile `.proto`
```bash
protoc --python_out=. nfc_payload.proto
```

### 2. Example Script
```python
import base64, zlib
from nfc_payload_pb2 import NFCPayload, Code, Patient, Vitals, Conditions, Events, EventValue, VitalValue, ConditionValue

# 1. Build NFCPayload message
payload = NFCPayload()
payload.D.add(sys="http://loinc.org", code="8867-4")       # HR
payload.D.add(sys="http://snomed.info/sct", code="112738007")  # Tourniquet
payload.P.n.extend(["Thomas","Hodge"])
payload.P.r = "CPL"
payload.P.sn = "5199"
payload.P.dob = 18840602
payload.P.nhs = "4857773456"
payload.P.bg = 0
payload.V.poi.add(dIndex=0, value=120, unit="bpm")
payload.C.poi.add(dIndex=1)
payload.E.poi.add(dIndex=1, time="2025-09-15T10:07:00Z")

# 2. Serialize ProtoBuf to bytes
raw_bytes = payload.SerializeToString()

# 3. Compress with DEFLATE (zlib)
compressed = zlib.compress(raw_bytes, level=9)

# 4. Encode Base64URL
b64url = base64.urlsafe_b64encode(compressed).rstrip(b"=").decode("ascii")

# 5. Build final URL
url = "https://www.medis.org.uk/#" + b64url
print("Final URL length:", len(url))
print("Example URL:", url[:120] + "...")
```

### 3. Expected Output
- Raw ProtoBuf: ~250–300 bytes
- DEFLATE: ~180–220 bytes
- Base64URL: ~250–300 characters
- Final URL: ~280–310 characters (well under 2,000)

---

## 🛠️ Notes
- Replace `nfc_payload.proto` with the schema defined earlier.
- Same pipeline works in **Go**, **C++**, **Rust**, or **Node.js** — just change the libraries:
  - Go: `google.golang.org/protobuf`
  - Node.js: `protobufjs`
  - Rust: `prost`
- The NFC tag only needs to carry the **URL**; only the **server/web app** requires the `.proto` schema to decode.
