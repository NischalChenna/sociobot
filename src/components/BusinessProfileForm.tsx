import React, { useState } from 'react';
import { Upload, Building2, FileText, Tag } from 'lucide-react';
import { BusinessProfile } from '../types';

interface BusinessProfileFormProps {
  onSubmit: (profile: BusinessProfile) => void;
}

export const BusinessProfileForm: React.FC<BusinessProfileFormProps> = ({ onSubmit }) => {
  const [profile, setProfile] = useState<BusinessProfile>({
    name: '',
    description: '',
    industry: 'general'
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const industries = [
    { value: 'food', label: 'Food & Dining' },
    { value: 'retail', label: 'Retail & Shopping' },
    { value: 'hospitality', label: 'Hospitality & Events' },
    { value: 'fitness', label: 'Fitness & Wellness' },
    { value: 'general', label: 'General Business' }
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.name.trim() && profile.description.trim()) {
      onSubmit({
        ...profile,
        logo: logoPreview || undefined
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to SocioBot</h1>
          <p className="text-lg text-gray-600">Let's set up your business profile to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
              <Building2 className="w-4 h-4 mr-2" />
              Business Name *
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="e.g., Urban Bites Café"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
              <Upload className="w-4 h-4 mr-2" />
              Business Logo (Optional)
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex-1 flex items-center justify-center px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all duration-200">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-600">
                    {logoFile ? logoFile.name : 'Click to upload logo'}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              {logoPreview && (
                <div className="w-20 h-20 border border-gray-200 rounded-xl overflow-hidden">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
              <Tag className="w-4 h-4 mr-2" />
              Industry *
            </label>
            <select
              value={profile.industry}
              onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            >
              {industries.map((industry) => (
                <option key={industry.value} value={industry.value}>
                  {industry.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
              <FileText className="w-4 h-4 mr-2" />
              Business Description *
            </label>
            <textarea
              value={profile.description}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              placeholder="e.g., We're a fast-casual dining brand focusing on Indian street food with a modern twist."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!profile.name.trim() || !profile.description.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
          >
            Continue to Content Generation
          </button>
        </form>
      </div>
    </div>
  );
};