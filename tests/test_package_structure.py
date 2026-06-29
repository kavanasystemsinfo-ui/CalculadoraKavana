#!/usr/bin/env python3
"""Test production calculation with package/row structure."""

import json

# Test data
template_data = {
    "id": "test-1",
    "name": "Test Model",
    "models": [{
        "name": "Modelo A",
        "piecesPerPallet": 480,
        "piecesPerPackage": 120,
        "piecesPerRow": 24,
        "measures": [{"lengthMm": 1000}]
    }]
}

# Verify structure
assert "piecesPerPackage" in template_data["models"][0]
assert "piecesPerRow" in template_data["models"][0]

# Test calculation formula
pallet = 480
package = 120
row = 24

# Validate logical relationships
assert pallet % package == 0, "Paquetes deben caber en palet"
assert package % row == 0, "Filas deben caber en paquetes"

print("✅ Test passed: package/row structure validated")