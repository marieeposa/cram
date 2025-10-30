'use client';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, ZAxis } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

export default function AdvancedVisualizations({ barangays }) {
  // Prepare data for different visualizations
  
  // 1. Risk Distribution by Municipality
  const municipalityData = {};
  barangays.forEach(b => {
    const props = b.properties || b;
    const muni = props.municipality || 'Unknown';
    if (!municipalityData[muni]) {
      municipalityData[muni] = { low: 0, medium: 0, high: 0 };
    }
    const score = props.resilience_score || 0;
    if (score < 30) municipalityData[muni].low++;
    else if (score < 50) municipalityData[muni].medium++;
    else municipalityData[muni].high++;
  });

  const muniChartData = Object.entries(municipalityData).map(([name, counts]) => ({
    name: name.substring(0, 15),
    low: counts.low,
    medium: counts.medium,
    high: counts.high
  })).slice(0, 10);

  // 2. BRRS Score Distribution
  const scoreDistribution = barangays.reduce((acc, b) => {
    const props = b.properties || b;
    const score = Math.floor((props.resilience_score || 0) / 10) * 10;
    const key = `${score}-${score + 10}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const scoreChartData = Object.entries(scoreDistribution).map(([range, count]) => ({
    range,
    count
  })).sort((a, b) => parseInt(a.range) - parseInt(b.range));

  // 3. Coastal vs Inland Risk
  const coastalData = [
    { name: 'Coastal', value: barangays.filter(b => (b.properties || b).is_coastal).length },
    { name: 'Inland', value: barangays.filter(b => !(b.properties || b).is_coastal).length }
  ];

  // 4. Top 10 Highest Risk Barangays
  const topRisk = barangays
    .map(b => {
      const props = b.properties || b;
      return {
        name: (props.name || 'Unknown').substring(0, 20),
        score: props.resilience_score || 0
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return (
    <div className="space-y-8">
      {/* Risk by Municipality */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Risk Distribution by Municipality</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={muniChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="low" fill="#10b981" name="Low Risk" stackId="a" />
            <Bar dataKey="medium" fill="#f59e0b" name="Medium Risk" stackId="a" />
            <Bar dataKey="high" fill="#ef4444" name="High Risk" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* BRRS Score Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">BRRS Score Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scoreChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} name="Barangays" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Coastal vs Inland Barangays</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={coastalData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {coastalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 10 Highest Risk */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Top 10 Highest Risk Barangays</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topRisk} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="score" fill="#ef4444" name="BRRS Score" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}