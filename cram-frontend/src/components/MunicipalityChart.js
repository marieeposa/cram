'use client';
import { useEffect, useState } from 'react';
import { fetchBarangays } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444'
};

export default function MunicipalityChart({ municipalityId }) {
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const allBarangays = await fetchBarangays();
        
        // Filter barangays for this municipality
        // Note: You'll need to match by municipality name or ID
        const municipalityBarangays = allBarangays.slice(0, 10); // Placeholder

        // Prepare bar chart data
        const barData = municipalityBarangays.map(b => {
          const props = b.properties || b;
          return {
            name: props.name?.substring(0, 15) || 'Unknown',
            score: props.resilience_score || 0
          };
        }).sort((a, b) => b.score - a.score);

        // Prepare pie chart data
        const riskCounts = { low: 0, medium: 0, high: 0 };
        allBarangays.forEach(b => {
          const props = b.properties || b;
          const score = props.resilience_score || 0;
          if (score < 30) riskCounts.low++;
          else if (score < 50) riskCounts.medium++;
          else riskCounts.high++;
        });

        const pie = [
          { name: 'Low Risk', value: riskCounts.low, color: COLORS.low },
          { name: 'Medium Risk', value: riskCounts.medium, color: COLORS.medium },
          { name: 'High Risk', value: riskCounts.high, color: COLORS.high }
        ];

        setChartData(barData);
        setPieData(pie);
      } catch (error) {
        console.error('Error loading chart data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [municipalityId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Bar Chart */}
      <div>
        <h3 className="font-semibold text-lg mb-4 text-gray-900">Top 10 Barangays by BRRS Score</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="score" fill="#3b82f6" name="BRRS Score" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div>
        <h3 className="font-semibold text-lg mb-4 text-gray-900">Risk Level Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}