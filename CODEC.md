# CODEC.md - Codec Pipeline Documentation

This document details the codec pipeline used in the NFC IPS Viewer project for processing International Patient Summary (IPS) data.

## Overview

The codec pipeline is responsible for handling various IPS data formats, including Base64 encoded JSON, Protobuf schemas, and FHIR resources. It provides mechanisms for automatic schema detection, compression handling, and conversion between different data representations.

## Data Processing Pipeline

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NFC Fragment  │───►│   Base64 Decode │───►│ Protobuf Decode │
│ URL-safe Base64 │    │ + Decompression │    │  Schema Detection│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐    ┌────────▼────────┐
│   UI Rendering  │◄───│   View Model    │◄───│  CodeRef→FHIR   │
│ Medical Stages  │    │   Generation    │    │   Conversion    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Core Components

### 1. Base64 Decoder

*   **Functionality:** Decodes URL-safe Base64 encoded strings extracted from NFC URI fragments.
*   **Compression Handling:** Automatically attempts to decompress the decoded data using `pako` if it detects a compressed format.

### 2. Protobuf Decoder

*   **Functionality:** Parses data according to defined Protobuf schemas.
*   **Schema Detection:** Supports automatic detection of legacy versus CodeRef Protobuf schemas.
*   **Dependencies:** Utilizes `protobuf.js` for Protobuf message handling.

### 3. CodeRef to FHIR Conversion

*   **Functionality:** Transforms data from the project's internal CodeRef format into FHIR (Fast Healthcare Interoperability Resources) compliant structures.
*   **Terminology Mapping:** Integrates with the Terminology Service for mapping CodeRef concepts to standard FHIR terminology (e.g., SNOMED CT, LOINC).

### 4. View Model Generation

*   **Functionality:** Converts FHIR resources into a simplified view model optimized for UI rendering.
*   **Medical Stages:** Organizes clinical data into distinct medical stages (e.g., POI, CASEVAC, MEDEVAC, R1-R3) for chronological display.

### 5. UI Rendering

*   **Functionality:** Renders the view model data onto the web page, including dynamic UI components, vitals charts, and patient information.
*   **Dynamic UI:** Utilizes JavaScript configurations for dynamic generation of information boxes and other UI elements.

## Protobuf Schemas

*   **Location:** Protobuf schema definitions are located in the `resources/` directory.
*   **Schemas:**
    *   `nfc_payload.proto`: Defines the current CodeRef Protobuf schema.
    *   `nfc_payload_legacy.proto`: Defines the legacy Protobuf schema for backward compatibility.

## Compression

*   **Library:** `pako.js` is used for handling zlib/gzip compression and decompression.
*   **Automatic Detection:** The pipeline attempts to decompress data if it identifies a compressed payload, ensuring flexibility in data transmission.

## Error Handling

*   **Comprehensive Error Boundaries:** The codec pipeline includes robust error handling mechanisms to manage malformed data, unsupported schemas, and decompression failures.
*   **User Feedback:** Provides user-friendly error messages to guide troubleshooting.

## Future Enhancements

*   **Schema Versioning:** Implement a more robust schema versioning system for Protobuf definitions.
*   **Performance Optimization:** Further optimize the decoding and conversion processes for large IPS payloads.
*   **Extensibility:** Design the pipeline to easily integrate new data formats and conversion logic.
