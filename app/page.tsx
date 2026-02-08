'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PropertyInput, PropertyType, UseCase } from '@/types';
import { evaluateProperty } from '@/lib/rules/catalonia';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<PropertyInput>>({
    region: 'Catalunya',
    municipality: '',
    propertyType: 'flat',
    useCase: 'segunda-ocupacion',
    hasKitchen: false,
    hasBathroom: false,
    hasNaturalLight: false,
    hasVentilation: false,
    hasHeating: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.municipality || !formData.propertyType || !formData.useCase) {
      alert('Si us plau, omple tots els camps obligatoris.');
      return;
    }

    setLoading(true);

    try {
      // Ensure all required fields are present
      const completeFormData: PropertyInput = {
        municipality: formData.municipality!,
        region: formData.region || 'Catalunya',
        propertyType: formData.propertyType!,
        useCase: formData.useCase!,
        address: formData.address,
        yearBuilt: formData.yearBuilt,
        usefulArea: formData.usefulArea,
        totalArea: formData.totalArea,
        ceilingHeight: formData.ceilingHeight,
        numRooms: formData.numRooms,
        numBedrooms: formData.numBedrooms,
        numBathrooms: formData.numBathrooms,
        hasKitchen: formData.hasKitchen || false,
        hasBathroom: formData.hasBathroom || false,
        hasNaturalLight: formData.hasNaturalLight || false,
        hasVentilation: formData.hasVentilation || false,
        hasHeating: formData.hasHeating || false,
        intendedOccupancy: formData.intendedOccupancy,
        notes: formData.notes,
      };

      // Evaluate property
      const evaluationResult = evaluateProperty(completeFormData);

      // Save case
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyInput: completeFormData,
          evaluationResult,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to save case');
      }

      let caseData;
      try {
        caseData = await response.json();
      } catch (error) {
        throw new Error('Invalid JSON response from server');
      }
      
      if (!caseData || !caseData.id) {
        throw new Error('Invalid response from server: missing case ID');
      }
      router.push(`/results/${caseData.id}`);
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error al processar la sol·licitud. Si us plau, torna-ho a intentar.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof PropertyInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cédula de Habitabilitat Checker
          </h1>
          <p className="text-gray-600 mb-8">
            Eina de pre-validació per verificar els requisits per a la cédula de habitabilitat a Catalunya
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Informació Bàsica
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adreça (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => updateField('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Municipi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.municipality || ''}
                    onChange={(e) => updateField('municipality', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Barcelona"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipus de Propietat *
                  </label>
                  <select
                    required
                    value={formData.propertyType || 'flat'}
                    onChange={(e) => updateField('propertyType', e.target.value as PropertyType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="flat">Pis</option>
                    <option value="house">Casa</option>
                    <option value="studio">Estudi</option>
                    <option value="other">Altres</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ús *
                  </label>
                  <select
                    required
                    value={formData.useCase || 'segunda-ocupacion'}
                    onChange={(e) => updateField('useCase', e.target.value as UseCase)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="segunda-ocupacion">Segona Ocupació</option>
                    <option value="primera-ocupacion">Primera Ocupació</option>
                    <option value="renovation">Renovació</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Any de Construcció (opcional)
                  </label>
                  <input
                    type="number"
                    value={formData.yearBuilt || ''}
                    onChange={(e) => updateField('yearBuilt', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1990"
                  />
                </div>
              </div>
            </div>

            {/* Measurements */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Mesures
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Superfície Útil (m²) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.usefulArea || ''}
                    onChange={(e) => updateField('usefulArea', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="45.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alçada del Sostre (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.ceilingHeight || ''}
                    onChange={(e) => updateField('ceilingHeight', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre d'Habitacions
                  </label>
                  <input
                    type="number"
                    value={formData.numRooms || ''}
                    onChange={(e) => updateField('numRooms', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dormitoris
                  </label>
                  <input
                    type="number"
                    value={formData.numBedrooms || ''}
                    onChange={(e) => updateField('numBedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banys
                  </label>
                  <input
                    type="number"
                    value={formData.numBathrooms || ''}
                    onChange={(e) => updateField('numBathrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ocupants Previstos
                  </label>
                  <input
                    type="number"
                    value={formData.intendedOccupancy || ''}
                    onChange={(e) => updateField('intendedOccupancy', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2"
                  />
                </div>
              </div>
            </div>

            {/* Facilities */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Instal·lacions
              </h2>
              
              <div className="space-y-3">
                {[
                  { key: 'hasKitchen', label: 'Té cuina' },
                  { key: 'hasBathroom', label: 'Té bany' },
                  { key: 'hasNaturalLight', label: 'Té il·luminació natural' },
                  { key: 'hasVentilation', label: 'Té ventilació adequada' },
                  { key: 'hasHeating', label: 'Té calefacció' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData[key as keyof PropertyInput] as boolean || false}
                      onChange={(e) => updateField(key as keyof PropertyInput, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processant...' : 'Validar Requisits'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Aquest és un eina de pre-validació. No substitueix la certificació oficial d'un tècnic qualificat.
          </p>
          <Link
            href="/pricing"
            className="text-blue-600 hover:underline font-medium"
          >
            Veure plans i preus →
          </Link>
        </div>
      </div>
    </div>
  );
}
