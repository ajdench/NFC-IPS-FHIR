// NFC IPS Viewer Constants
// Color constants for stage backgrounds and UI elements

export const COLORS = {
    STAGE_POI: '#ffcccc',      // Pink for POI (Point of Injury)
    STAGE_ORANGE: '#ffe0b2',   // Orange for CASEVAC
    STAGE_YELLOW: '#ffe899',   // Yellow for MEDEVAC
    STAGE_GREEN: '#c8e6c9',    // Green for R1/Forward TACEVAC
    STAGE_BLUE: '#a8d2ff',     // Blue for R2/Rear TACEVAC
    STAGE_PURPLE: '#e1bee7'    // Purple for R3
};

// Care stage definitions with short names for display
export const CARE_STAGES = {
    POI: { shortName: 'POI', fullName: 'Point of Injury' },
    CASEVAC: { shortName: 'CASEVAC', fullName: 'Casualty Evacuation' },
    AXP: { shortName: 'AXP', fullName: 'Ambulance Exchange Point' },
    MEDEVAC: { shortName: 'MEDEVAC', fullName: 'Medical Evacuation' },
    R1: { shortName: 'R1', fullName: 'Role 1 Medical Facility' },
    FWDTACEVAC: { shortName: 'FWD TACEVAC', fullName: 'Forward Tactical Evacuation' },
    R2: { shortName: 'R2', fullName: 'Role 2 Medical Facility' },
    REARTACEVAC: { shortName: 'REAR TACEVAC', fullName: 'Rear Tactical Evacuation' },
    R3: { shortName: 'R3', fullName: 'Role 3 Medical Facility' }
};

// Terminology systems for medical coding
export const TERMINOLOGY_SYSTEMS = {
    SNOMED_CT: 'http://snomed.info/sct',
    LOINC: 'http://loinc.org',
    UCUM: 'http://unitsofmeasure.org',
    ICD10: 'http://hl7.org/fhir/sid/icd-10'
};

// Demo payload configurations
export const DEMO_PAYLOADS = {
    PAYLOAD_1: './payload-1.json',
    IPS_FHIR_JSON_1: './payload-1.json',
    PAYLOAD_2: './payload-2.json'
};

// Resource definitions
export const RESOURCES = {
    PROTOBUF_SCHEMA: './resources/nfc_payload.proto',
    CHART_JS: './resources/vendor/chart.min.js'
};

// FHIR extension URLs
export const FHIR_EXTENSIONS = {
    CARE_STAGE: 'http://example.org/fhir/StructureDefinition/care-stage',
    MILITARY_RANK: 'http://example.org/fhir/StructureDefinition/military-rank'
};

// FHIR profile URLs
export const FHIR_PROFILES = {
    IPS_BUNDLE: 'http://hl7.org/fhir/uv/ips/StructureDefinition/Bundle-uv-ips',
    IPS_PATIENT: 'http://hl7.org/fhir/uv/ips/StructureDefinition/Patient-uv-ips'
};