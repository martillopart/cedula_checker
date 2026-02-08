'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const plans = [
    {
      name: 'Gratuït',
      price: '€0',
      period: 'per sempre',
      description: 'Per provar la eina',
      features: [
        '1 informe per mes',
        'Informe amb marca d\'aigua',
        'Compartir enllaços',
        'Validació bàsica',
      ],
      cta: 'Començar gratuïtament',
      ctaLink: '/',
      popular: false,
    },
    {
      name: 'Solo',
      price: '€49',
      period: '/mes',
      description: 'Per a tècnics i professionals individuals',
      features: [
        '60 informes per mes',
        'Informes sense marca d\'aigua',
        'Descarregar PDF',
        'Historial de casos',
        'Compartir enllaços',
        'Suport per correu',
      ],
      cta: 'Començar prova',
      ctaLink: '/',
      popular: true,
    },
    {
      name: 'Team',
      price: '€199',
      period: '/mes',
      description: 'Per a agències i equips',
      features: [
        '400 informes per mes',
        'Múltiples usuaris',
        'Informes sense marca d\'aigua',
        'Descarregar PDF',
        'Historial de casos',
        'Plantilles reutilitzables',
        'Suport prioritari',
        'Exports CSV',
      ],
      cta: 'Contactar',
      ctaLink: '/',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Plans i Preus
          </h1>
          <p className="text-xl text-gray-600">
            Tria el pla que millor s\'adapti a les teves necessitats
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-lg shadow-xl p-8 ${
                plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-blue-500 text-white text-center py-1 rounded-t-lg -mt-8 mx-8 mb-4">
                  Més Popular
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h2>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-gray-600 ml-2">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.ctaLink}
                className={`block w-full text-center py-3 px-6 rounded-md font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Preguntes Freqüents
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Què passa si supero el límit de informes?
              </h3>
              <p className="text-gray-600">
                Pots comprar informes addicionals per €5 cadascun, o actualitzar al següent pla.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Puc cancel·lar en qualsevol moment?
              </h3>
              <p className="text-gray-600">
                Sí, pots cancel·lar la teva subscripció en qualsevol moment sense cap penalització.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Aquest informe substitueix la certificació oficial?
              </h3>
              <p className="text-gray-600">
                No. Aquest és un eina de pre-validació que ajuda a identificar problemes abans de la visita del tècnic. Encara necessitaràs un tècnic qualificat per obtenir la cédula oficial.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← Tornar a l'inici
          </Link>
        </div>
      </div>
    </div>
  );
}
