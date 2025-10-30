'use client';
import { useState, useEffect } from 'react';
import { fetchBarangays } from '@/lib/api';
import { MessageCircle, Package, Heart, Users, Send, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';

export default function SupportPage() {
  const [barangays, setBarangays] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    barangay_id: '',
    resource_type: 'food',
    quantity: '',
    urgency: 'medium',
    description: '',
    contact_person: '',
    contact_number: '',
    contact_email: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchBarangays();
        setBarangays(data);
        
        // Load existing requests from localStorage
        const saved = localStorage.getItem('support_requests');
        if (saved) {
          setRequests(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const selectedBarangay = barangays.find(b => {
      const props = b.properties || b;
      return props.id === parseInt(formData.barangay_id);
    });

    const props = selectedBarangay?.properties || selectedBarangay;
    
    const newRequest = {
      id: Date.now(),
      ...formData,
      barangay_name: props?.name || 'Unknown',
      municipality: props?.municipality || 'Unknown',
      timestamp: new Date().toISOString(),
      status: 'active'
    };

    const updated = [newRequest, ...requests];
    setRequests(updated);
    localStorage.setItem('support_requests', JSON.stringify(updated));
    
    setShowForm(false);
    setFormData({
      barangay_id: '',
      resource_type: 'food',
      quantity: '',
      urgency: 'medium',
      description: '',
      contact_person: '',
      contact_number: '',
      contact_email: ''
    });
  };

  const markAsResolved = (id) => {
    const updated = requests.map(r => 
      r.id === id ? { ...r, status: 'resolved' } : r
    );
    setRequests(updated);
    localStorage.setItem('support_requests', JSON.stringify(updated));
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 border-red-300 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-green-100 border-green-300 text-green-800';
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'food': return '🍚';
      case 'medicine': return '💊';
      case 'rescue': return '🚑';
      case 'shelter': return '🏠';
      case 'water': return '💧';
      default: return '📦';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Barangay Support Network
          </h1>
          <p className="text-gray-600 text-lg">
            🤝 Connect barangays for resource sharing and mutual aid
          </p>
        </div>

        {/* Action Button */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <AlertCircle size={24} />
            {showForm ? 'Cancel Request' : 'Request Support'}
          </button>
        </div>

        {/* Request Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Support Request</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Barangay *
                  </label>
                  <select
                    required
                    value={formData.barangay_id}
                    onChange={(e) => setFormData({...formData, barangay_id: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select Barangay</option>
                    {barangays.map((b) => {
                      const props = b.properties || b;
                      return (
                        <option key={props.id} value={props.id}>
                          {props.name} - {props.municipality}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Resource Type *
                  </label>
                  <select
                    required
                    value={formData.resource_type}
                    onChange={(e) => setFormData({...formData, resource_type: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="food">🍚 Food</option>
                    <option value="medicine">💊 Medicine</option>
                    <option value="rescue">🚑 Rescue Team</option>
                    <option value="shelter">🏠 Shelter</option>
                    <option value="water">💧 Water</option>
                    <option value="other">📦 Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity/Amount Needed *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., 100 family packs, 50 people"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Urgency Level *
                  </label>
                  <select
                    required
                    value={formData.urgency}
                    onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="low">🟢 Low - Can wait 24+ hours</option>
                    <option value="medium">🟡 Medium - Needed within 12-24 hours</option>
                    <option value="high">🟠 High - Needed within 6-12 hours</option>
                    <option value="critical">🔴 Critical - Immediate (0-6 hours)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Describe the situation and specific needs..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Person *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Name and position"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="09XX-XXX-XXXX"
                    value={formData.contact_number}
                    onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="contact@barangay.gov.ph"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Send size={20} />
                Submit Support Request
              </button>
            </form>
          </div>
        )}

        {/* Active Requests */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Active Support Requests</h2>
          
          {requests.filter(r => r.status === 'active').length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-200">
              <Heart className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-semibold">No active requests at this time</p>
              <p className="text-gray-500">All barangays are currently well-supplied</p>
            </div>
          ) : (
            requests.filter(r => r.status === 'active').map((request) => (
              <div key={request.id} className={`bg-white rounded-2xl shadow-xl p-6 border-2 ${getUrgencyColor(request.urgency)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{getResourceIcon(request.resource_type)}</div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{request.barangay_name}</h3>
                      <p className="text-gray-600">{request.municipality}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="px-4 py-2 bg-white rounded-lg font-bold uppercase text-sm">
                      {request.urgency} Priority
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(request.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Resource Needed</div>
                    <div className="font-bold text-gray-900 capitalize">{request.resource_type}</div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Quantity</div>
                    <div className="font-bold text-gray-900">{request.quantity}</div>
                  </div>
                </div>

                <div className="bg-white/50 rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-600 mb-2">Description</div>
                  <p className="text-gray-900">{request.description}</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                  <div className="font-bold text-blue-900 mb-2">📞 Contact Information</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-blue-600" />
                      <span className="text-gray-900">{request.contact_person}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-blue-600" />
                      <a href={`tel:${request.contact_number}`} className="text-blue-600 hover:underline">
                        {request.contact_number}
                      </a>
                    </div>
                    {request.contact_email && (
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-blue-600" />
                        <a href={`mailto:${request.contact_email}`} className="text-blue-600 hover:underline">
                          {request.contact_email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => markAsResolved(request.id)}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  ✅ Mark as Resolved
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}