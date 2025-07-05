import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, Mail, Lock, FileText, Tag, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    businessProfile: {
      name: '',
      description: '',
      industry: 'general',
      logo: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  });
  const [loading, setLoading] = useState(false);

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
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({
          ...formData,
          businessProfile: {
            ...formData.businessProfile,
            logo: e.target?.result as string
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      toast.success('Registration successful! Please check your email to verify your account.');
      onSwitchToLogin();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join SocioBot</h1>
          <p className="text-lg text-gray-600">Create your account and start generating amazing content</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <Mail className="w-4 h-4 mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <Building2 className="w-4 h-4 mr-2" />
                Business Name *
              </label>
              <input
                type="text"
                value={formData.businessProfile.name}
                onChange={(e) => setFormData({
                  ...formData,
                  businessProfile: { ...formData.businessProfile, name: e.target.value }
                })}
                placeholder="e.g., Urban Bites Café"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <Lock className="w-4 h-4 mr-2" />
                Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <Lock className="w-4 h-4 mr-2" />
                Confirm Password *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                minLength={6}
                required
              />
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
              <Tag className="w-4 h-4 mr-2" />
              Industry *
            </label>
            <select
              value={formData.businessProfile.industry}
              onChange={(e) => setFormData({
                ...formData,
                businessProfile: { ...formData.businessProfile, industry: e.target.value }
              })}
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
              value={formData.businessProfile.description}
              onChange={(e) => setFormData({
                ...formData,
                businessProfile: { ...formData.businessProfile, description: e.target.value }
              })}
              placeholder="e.g., We're a fast-casual dining brand focusing on Indian street food with a modern twist."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
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
                  <span className="text-sm text-gray-600">Click to upload logo</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              {formData.businessProfile.logo && (
                <div className="w-20 h-20 border border-gray-200 rounded-xl overflow-hidden">
                  <img
                    src={formData.businessProfile.logo}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};