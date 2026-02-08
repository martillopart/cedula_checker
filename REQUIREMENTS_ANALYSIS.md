# Cédula de Habitabilidad Requirements Analysis

## Current Implementation Status

### ✅ Currently Implemented Rules (9 rules)

1. **Superfície útil mínima** (36 m² for segunda ocupación)
2. **Alçada mínima del sostre** (2.5m)
3. **Culina obligatòria** (presence check)
4. **Bany obligatori** (presence check)
5. **Il·luminació natural** (presence check)
6. **Ventilació** (presence check)
7. **Densitat d'ocupació** (9 m²/persona minimum)
8. **Nombre mínim d'habitacions** (basic check)
9. **Calefacció** (presence check)

## Missing Requirements from Decret 141/2012

### Critical Missing Requirements

#### 1. **Different Minimum Areas by Use Case**
- **Primera ocupació**: 30 m² minimum (currently only checking 36 m² for segunda)
- **Segunda ocupació**: 36 m² minimum ✅ (implemented)
- **Renovation**: Different rules may apply

#### 2. **Kitchen Detailed Requirements**
Currently only checks presence, but should verify:
- ✅ Running water connection
- ✅ Drainage system
- ✅ Cooking facility (stove/fireplace)
- ✅ Minimum kitchen dimensions/area

#### 3. **Bathroom Detailed Requirements**
Currently only checks presence, but should verify:
- ✅ Toilet (WC)
- ✅ Shower or bathtub
- ✅ Running water
- ✅ Drainage
- ✅ Minimum dimensions

#### 4. **Access Requirements**
- Staircase safety (if multi-story)
- Elevator requirements (for buildings above certain height)
- Door width minimums
- Corridor width minimums

#### 5. **Water Supply & Drainage**
- ✅ Water supply connection (not checked)
- ✅ Drainage system (not checked)
- ✅ Hot water availability (not checked)

#### 6. **Electrical Installation**
- ✅ Electrical installation compliance (not checked)
- ✅ Minimum electrical capacity (not checked)
- ✅ Safety standards (not checked)

#### 7. **Structural Safety**
- ✅ Building structure safety (not checked)
- ✅ Fire safety requirements (not checked)
- ✅ Emergency exits (not checked)

#### 8. **Energy Efficiency** (CTE - Código Técnico de la Edificación)
- ✅ Energy performance certificate (not checked)
- ✅ Thermal insulation (not checked)
- ✅ Windows efficiency (not checked)

#### 9. **Accessibility** (for certain cases)
- ✅ Accessibility requirements (not checked)
- ✅ Door widths for accessibility (not checked)
- ✅ Bathroom accessibility (not checked)

#### 10. **Gas Installation** (if applicable)
- ✅ Gas installation safety (not checked)
- ✅ Ventilation for gas appliances (not checked)

#### 11. **Municipality-Specific Overrides**
- Some municipalities have additional requirements
- Currently only basic region check

#### 12. **Property Type Specifics**
- Different rules for flats vs houses vs studios
- Currently basic type check only

## Recommendations

### High Priority Additions

1. **Different minimum areas by use case**
   - Primera ocupació: 30 m²
   - Segunda ocupació: 36 m²
   - Update rule to check based on `useCase`

2. **Kitchen detailed validation**
   - Add fields: `kitchenHasWater`, `kitchenHasDrainage`, `kitchenHasStove`
   - Validate all are present

3. **Bathroom detailed validation**
   - Add fields: `bathroomHasToilet`, `bathroomHasShower`, `bathroomHasWater`, `bathroomHasDrainage`
   - Validate all are present

4. **Water supply check**
   - Add field: `hasWaterSupply`
   - Validate presence

5. **Drainage system check**
   - Add field: `hasDrainageSystem`
   - Validate presence

### Medium Priority Additions

6. **Access requirements**
   - Add fields: `hasStaircase`, `hasElevator` (if needed), `doorWidth`, `corridorWidth`
   - Validate based on building height/type

7. **Electrical installation**
   - Add field: `hasElectricalInstallation`, `electricalCapacity`
   - Basic validation

8. **Energy efficiency**
   - Add field: `hasEnergyCertificate`
   - Warning if missing (may be required)

### Lower Priority (Future Enhancements)

9. **Structural safety** (requires professional inspection)
10. **Accessibility** (case-specific)
11. **Gas installation** (if applicable)
12. **Municipality-specific rules** (database needed)

## Current Coverage Estimate

- **Basic Requirements**: ~60% covered
- **Detailed Requirements**: ~30% covered
- **Complete Legal Compliance**: ~40% covered

## Action Items

1. ✅ Update minimum area rule to check use case
2. ✅ Add detailed kitchen/bathroom validation
3. ✅ Add water supply and drainage checks
4. ⬜ Add access requirements
5. ⬜ Add electrical installation check
6. ⬜ Add energy efficiency warning
