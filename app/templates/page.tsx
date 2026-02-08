'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CaseTemplate } from '@/types';
import { Plus, FileText, Users, Globe } from 'lucide-react';
import Link from 'next/link';

export default function TemplatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [templates, setTemplates] = useState<CaseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<'user' | 'team' | 'public'>('user');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      loadTemplates();
    }
  }, [status, router, scope]);

  const loadTemplates = async () => {
    try {
      const response = await fetch(`/api/templates?scope=${scope}`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const useTemplate = (template: CaseTemplate) => {
    // Navigate to home page with template data in query params
    const params = new URLSearchParams({
      template: template.id,
    });
    router.push(`/?${params.toString()}`);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
              <p className="mt-2 text-gray-600">Reusable case templates for faster property evaluation</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Template
            </Link>
          </div>
        </div>

        {/* Scope Filter */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setScope('user')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                scope === 'user'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              My Templates
            </button>
            <button
              onClick={() => setScope('team')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                scope === 'team'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="h-4 w-4 mr-2" />
              Team Templates
            </button>
            <button
              onClick={() => setScope('public')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                scope === 'public'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Globe className="h-4 w-4 mr-2" />
              Public Templates
            </button>
          </div>
        </div>

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <div className="bg-white rounded-lg shadow text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No templates found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create a template from an existing case to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                {template.description && (
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                )}
                <div className="text-xs text-gray-500 mb-4">
                  <p>Region: {template.propertyInput.region}</p>
                  <p>Type: {template.propertyInput.propertyType}</p>
                  {template.propertyInput.usefulArea && (
                    <p>Area: {template.propertyInput.usefulArea} m²</p>
                  )}
                </div>
                <button
                  onClick={() => useTemplate(template)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Use Template
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
