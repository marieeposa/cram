export default function RiskBadge({ level, score }) {
  const getBadgeStyle = () => {
    const actualLevel = level || (score >= 50 ? 'High' : score >= 30 ? 'Medium' : 'Low');
    
    if (actualLevel === 'High' || score >= 50) {
      return {
        container: 'bg-gradient-to-r from-red-500 to-pink-500',
        text: 'text-white',
        icon: '🔴',
        glow: 'shadow-lg shadow-red-200'
      };
    } else if (actualLevel === 'Medium' || score >= 30) {
      return {
        container: 'bg-gradient-to-r from-yellow-400 to-orange-400',
        text: 'text-white',
        icon: '⚠️',
        glow: 'shadow-lg shadow-yellow-200'
      };
    } else {
      return {
        container: 'bg-gradient-to-r from-green-400 to-emerald-400',
        text: 'text-white',
        icon: '✅',
        glow: 'shadow-lg shadow-green-200'
      };
    }
  };

  const style = getBadgeStyle();
  const displayLevel = level || (score >= 50 ? 'High' : score >= 30 ? 'Medium' : 'Low');

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${style.container} ${style.text} ${style.glow} transition-all duration-300 hover:scale-110`}>
      <span className="text-base">{style.icon}</span>
      <span>{displayLevel}</span>
      {score !== null && score !== undefined && (
        <span className="ml-1 opacity-90">({score.toFixed(1)})</span>
      )}
    </div>
  );
}