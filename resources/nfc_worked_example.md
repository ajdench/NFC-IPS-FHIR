# NFC Battlefield Transfer – Worked Example

This document captures requirements, encoding pipeline, and example payload for transmitting IPS/FHIR battlefield data via NFC URL fragments.

## 📐 Architecture

- NFC tag stores URL: `https://www.medis.org.uk/#<fragment>`
- `<fragment>` = Base64URL( DEFLATE( ProtoBuf(NFCPayload) ) )
- No server log exposure: fragment never sent in HTTP requests
- ~2000 character safe limit on iOS/Android URL handling

## 📦 Encoding Pipeline

1. **Serialize**: ProtoBuf schema (`NFCPayload`)
2. **Compress**: DEFLATE (zlib, level 6–9)
3. **Encode**: Base64URL (RFC 4648, no padding)
4. **Embed**: into URL fragment after `#`

## 🔒 Security Considerations

- **HTTPS is sufficient**: protects confidentiality and integrity in transit.  
- **No extra encryption required**: payload is in the URL fragment (`#`), never logged by webservers.  
- **Operational principle**: Information is deliberately shareable to ensure best possible care, even if intercepted.  

---

## 🌐 Client-Side Viewer Logic

The NFC workflow requires a **browser-based client** that can parse and display payloads. Styling is not part of these requirements; only decoding and rendering logic are specified.

### Core Logic
1. **Extract Fragment**
   - Read `window.location.hash` (minus `#`).
   - If empty → show demo/fallback mode.

2. **Decode Payload**
   - Base64URL decode → DEFLATE inflate → ProtoBuf decode.
   - Schema: `NFCPayload` (as defined earlier).

3. **Fallback Mode**
   - If fragment looks like JSON, parse directly (dev/test use).
   - Optionally allow paste box for raw JSON.

4. **Render Patient Section**
   - Display: name, DOB, gender, blood group, IDs.
   - For coded entries: show `sys:code` in badge with tooltip.

5. **Render Stages**
   - For each stage (`poi`, `medevac`, `r1`, `r2`):
     - **Vitals** table: code badge + value.
     - **Conditions** table: code badge + onset (if present).
     - **Events** table: code badge + time + dose + route.

6. **Summary Section**
   - Display total count of vitals, conditions, events.
   - Display creation timestamp (`t`).

### Tooltips
- Each coded item (`CodeRef`) shows `sys:code` as tooltip.
- No FQN resolution is required client-side; translation occurs server-side if needed.

### Optional Features
- Developer details panel showing the embedded `.proto` schema.
- JSON export button: dumps decoded payload to clipboard.

---
