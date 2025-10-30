import os
from groq import Groq

class AIAnalysisService:
    def __init__(self):
        self.client = Groq(api_key=os.getenv('GROQ_API_KEY'))
        # Updated to newest available model
        self.model = "llama-3.3-70b-versatile"
        
    def analyze_barangay(self, barangay_data):
        """Generate AI insights for a barangay"""
        
        hazards_text = ', '.join(barangay_data.get('hazards', [])) if barangay_data.get('hazards') else 'None reported'
        
        prompt = f"""You are a climate resilience expert analyzing a barangay in the Philippines.

**Barangay Profile:**
- Name: {barangay_data['name']}, {barangay_data['municipality']}
- Population: {barangay_data.get('population', 'N/A'):,}
- Location: {'Coastal' if barangay_data.get('is_coastal') else 'Inland'}

**Resilience Metrics:**
- Overall BRRS Score: {barangay_data.get('brrs_score', 'N/A')}/100
- Risk Level: {barangay_data.get('risk_level', 'Unknown')}
- Hazard Exposure: {barangay_data.get('hazard_exposure', 'N/A')}/100
- Health Sensitivity: {barangay_data.get('health_sensitivity', 'N/A')}/100
- Adaptive Capacity: {barangay_data.get('adaptive_capacity', 'N/A')}/100

**Identified Hazards:**
{hazards_text}

Provide a clear, actionable analysis in 3 sections:

**KEY VULNERABILITIES:** (2-3 sentences)
Identify the main climate risks this barangay faces.

**PRIORITY ACTIONS:** (3 specific recommendations)
List the top 3 most important actions to improve resilience.

**RESOURCE PRIORITIES:** (2 sentences)
Where should resources be allocated first?

Keep the tone professional but accessible. Use specific numbers from the data."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=400
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"⚠️ AI analysis temporarily unavailable. Please try again later.\n\nError: {str(e)}"
    
    def analyze_air_quality(self, air_quality_data):
        """Generate AI insights for air quality trends"""
        
        if not air_quality_data:
            return "No air quality data available for analysis."
        
        cities_summary = "\n".join([
            f"• {aq['municipality']}: AQI {aq['aqi']:.1f} - PM2.5: {aq['pm25']:.1f}μg/m³, PM10: {aq['pm10']:.1f}μg/m³, O₃: {aq.get('o3', 0):.1f}μg/m³"
            for aq in air_quality_data[:5]
        ])
        
        prompt = f"""You are an environmental health expert analyzing air quality in Negros Oriental, Philippines.

**Current Air Quality Data:**
{cities_summary}

**AQI Reference:**
- 0-50: Good
- 51-100: Moderate
- 101-150: Unhealthy for sensitive groups
- 151-200: Unhealthy
- 201+: Very unhealthy

Provide a brief analysis in 3 sections:

**OVERALL ASSESSMENT:** (2 sentences)
Current air quality status across the region.

**HEALTH IMPLICATIONS:** (2-3 sentences)
Who is most at risk and what are the health concerns?

**RECOMMENDATIONS:** (3 specific actions)
What should residents and local governments do?

Be concise and actionable."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=350
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"⚠️ Air quality analysis temporarily unavailable.\n\nError: {str(e)}"
    
    def generate_municipal_report(self, municipality_data):
        """Generate a summary report for a municipality"""
        
        prompt = f"""You are a climate policy analyst creating a summary for a Philippine municipality.

**Municipality:** {municipality_data['name']}
**Total Barangays:** {municipality_data.get('barangay_count', 'N/A')}
**Average BRRS Score:** {municipality_data.get('avg_brrs', 'N/A'):.1f}
**High-Risk Barangays:** {municipality_data.get('high_risk_count', 0)}
**Medium-Risk Barangays:** {municipality_data.get('medium_risk_count', 0)}
**Coastal Barangays:** {municipality_data.get('coastal_count', 0)}

Provide a 2-paragraph executive summary:

**Paragraph 1:** Current resilience status and main challenges
**Paragraph 2:** Key priorities for improving climate resilience

Keep it concise (max 150 words total)."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=250
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Report generation unavailable: {str(e)}"