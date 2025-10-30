export default function StatsCard({ title, value, icon, color = 'blue' }) {
  const colorClasses = {
    blue: {
      bg: 'from-blue-500 to-cyan-500',
      ring: 'ring-blue-200',
      shadow: 'shadow-blue-100',
      text: 'text-blue-600'
    },
    green: {
      bg: 'from-green-500 to-emerald-500',
      ring: 'ring-green-200',
      shadow: 'shadow-green-100',
      text: 'text-green-600'
    },
    yellow: {
      bg: 'from-yellow-500 to-orange-500',
      ring: 'ring-yellow-200',
      shadow: 'shadow-yellow-100',
      text: 'text-yellow-600'
    },
    red: {
      bg: 'from-red-500 to-pink-500',
      ring: 'ring-red-200',
      shadow: 'shadow-red-100',
      text: 'text-red-600'
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={`relative overflow-hidden bg-white rounded-2xl shadow-lg ${colors.shadow} ring-1 ${colors.ring} hover:shadow-xl transition-all duration-300 group`}>
      {/* Gradient Background Accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.bg} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}></div>
      
      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className={`text-4xl font-bold bg-gradient-to-r ${colors.bg} bg-clip-text text-transparent`}>
              {value}
            </p>
          </div>
          <div className={`${colors.text} opacity-80 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300`}>
            {icon}
          </div>
        </div>
      </div>

      {/* Bottom Accent Bar */}
      <div className={`h-1 bg-gradient-to-r ${colors.bg}`}></div>
    </div>
  );
}