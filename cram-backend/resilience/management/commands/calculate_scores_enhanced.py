from django.core.management.base import BaseCommand
from resilience.models import Barangay, HazardExposure, NOAHFloodHazard, StormSurgeHazard, LiquefactionHazard, AirQualityData, ResilienceScore
from django.db.models import Count, Avg

class Command(BaseCommand):
    help = 'Calculate enhanced BRRS using all available hazard data and metrics'

    def handle(self, *args, **options):
        self.stdout.write('Starting enhanced BRRS calculation...')
        
        barangays = Barangay.objects.all()
        total = barangays.count()
        
        self.stdout.write(f'Processing {total} barangays...\n')
        
        updated = 0
        
        for idx, barangay in enumerate(barangays):
            try:
                # Get or create resilience score
                score, created = ResilienceScore.objects.get_or_create(barangay=barangay)
                
                # === 1. HAZARD EXPOSURE SCORE (40%) ===
                hazard_score = self.calculate_hazard_exposure(barangay)
                score.hazard_exposure_score = hazard_score
                
                # === 2. HEALTH SENSITIVITY SCORE (30%) ===
                health_score = self.calculate_health_sensitivity(barangay)
                score.health_sensitivity_score = health_score
                
                # === 3. ADAPTIVE CAPACITY SCORE (30%) ===
                capacity_score = self.calculate_adaptive_capacity(barangay)
                score.adaptive_capacity_score = capacity_score
                
                # === CALCULATE OVERALL BRRS ===
                score.calculate_score()
                
                # Calculate data completeness
                score.data_completeness = self.calculate_data_completeness(barangay)
                score.save()
                
                updated += 1
                
                if (idx + 1) % 50 == 0:
                    self.stdout.write(f'Processed {idx + 1}/{total}...')
            
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Error: {barangay.name} - {str(e)}'))
        
        # === SUMMARY ===
        self.stdout.write('\n' + '='*80)
        self.stdout.write(self.style.SUCCESS(f'✓ Updated {updated} barangay resilience scores'))
        
        # Risk level distribution
        stats = ResilienceScore.objects.values('risk_level').annotate(
            count=Count('id')
        ).order_by('-count')
        
        self.stdout.write('\nRisk Level Distribution:')
        for stat in stats:
            self.stdout.write(f"  {stat['risk_level']}: {stat['count']} barangays")
        
        # Average scores
        avg_scores = ResilienceScore.objects.aggregate(
            avg_overall=Avg('overall_score'),
            avg_hazard=Avg('hazard_exposure_score'),
            avg_health=Avg('health_sensitivity_score'),
            avg_capacity=Avg('adaptive_capacity_score')
        )
        
        self.stdout.write('\nAverage Scores:')
        self.stdout.write(f"  Overall BRRS: {avg_scores['avg_overall']:.1f}")
        self.stdout.write(f"  Hazard Exposure: {avg_scores['avg_hazard']:.1f}")
        self.stdout.write(f"  Health Sensitivity: {avg_scores['avg_health']:.1f}")
        self.stdout.write(f"  Adaptive Capacity: {avg_scores['avg_capacity']:.1f}")
        
        # Top 10 highest risk
        self.stdout.write('\n' + '='*80)
        self.stdout.write('Top 10 Highest Risk Barangays:')
        
        high_risk = ResilienceScore.objects.select_related('barangay').order_by('-overall_score')[:10]
        
        for i, score in enumerate(high_risk, 1):
            self.stdout.write(
                f"  {i}. {score.barangay.name}, {score.barangay.municipality} - "
                f"BRRS: {score.overall_score:.1f} ({score.risk_level})"
            )
    
    def calculate_hazard_exposure(self, barangay):
        """
        Calculate hazard exposure score (0-100)
        Components:
        - NOAH Flood Risk: 35%
        - Storm Surge Risk: 30%
        - Landslide Risk: 20%
        - Liquefaction Risk: 15%
        """
        flood_score = 0
        surge_score = 0
        landslide_score = 0
        liquefaction_score = 0
        
        # === FLOOD RISK (from NOAH data) ===
        try:
            noah_flood = barangay.noah_flood
            flood_score = noah_flood.get_composite_flood_score()
        except NOAHFloodHazard.DoesNotExist:
            # Fallback to LDRRMD flood data if NOAH not available
            try:
                flood_hazard = HazardExposure.objects.get(barangay=barangay, hazard_type='flood')
                flood_score = flood_hazard.susceptibility_score * 25  # Scale 1-4 to 0-100
            except HazardExposure.DoesNotExist:
                flood_score = 0
        
        # === STORM SURGE RISK ===
        try:
            storm_surge = barangay.storm_surge
            surge_score = storm_surge.get_composite_storm_surge_score()
        except StormSurgeHazard.DoesNotExist:
            surge_score = 0
        
        # === LANDSLIDE RISK ===
        try:
            landslide = HazardExposure.objects.get(barangay=barangay, hazard_type='landslide')
            landslide_score = landslide.susceptibility_score * 25  # Scale 1-4 to 0-100
        except HazardExposure.DoesNotExist:
            landslide_score = 0
        
        # === LIQUEFACTION RISK ===
        try:
            liquefaction = barangay.liquefaction
            liquefaction_score = liquefaction.get_liquefaction_score()
        except LiquefactionHazard.DoesNotExist:
            liquefaction_score = 0
        
        # Store sub-scores in resilience record
        resilience = barangay.resilience
        resilience.flood_risk_score = flood_score
        resilience.storm_surge_risk_score = surge_score
        resilience.landslide_risk_score = landslide_score
        resilience.liquefaction_risk_score = liquefaction_score
        
        # Weighted combination: Flood=35%, Storm Surge=30%, Landslide=20%, Liquefaction=15%
        total_score = (
            (flood_score * 0.35) + 
            (surge_score * 0.30) + 
            (landslide_score * 0.20) +
            (liquefaction_score * 0.15)
        )
        
        return min(total_score, 100)
    
    def calculate_health_sensitivity(self, barangay):
        """
        Calculate health sensitivity score (0-100)
        Higher score = more vulnerable
        
        Components:
        - Population density: 40%
        - Vulnerable populations: 25%
        - Poverty incidence: 20%
        - Air Quality/Climate Stress: 15%
        """
        score = 0
        
        # === POPULATION DENSITY ===
        if barangay.population and barangay.total_area and barangay.total_area > 0:
            pop_density = barangay.population / barangay.total_area
            
            if pop_density > 100:
                density_score = 100
            elif pop_density > 50:
                density_score = 75
            elif pop_density > 20:
                density_score = 50
            elif pop_density > 10:
                density_score = 25
            else:
                density_score = 10
            
            score += density_score * 0.40
            barangay.resilience.population_density_score = density_score
        else:
            score += 50 * 0.40
        
        # === VULNERABLE POPULATIONS ===
        if barangay.population and barangay.population > 0:
            vulnerable_pct = 0
            
            if barangay.elderly_population:
                vulnerable_pct += (barangay.elderly_population / barangay.population) * 100
            
            if barangay.children_population:
                vulnerable_pct += (barangay.children_population / barangay.population) * 100
            
            if vulnerable_pct > 50:
                vulnerable_score = 100
            elif vulnerable_pct > 40:
                vulnerable_score = 75
            elif vulnerable_pct > 30:
                vulnerable_score = 50
            else:
                vulnerable_score = 25
            
            score += vulnerable_score * 0.25
        else:
            score += 50 * 0.25
        
        # === POVERTY INCIDENCE ===
        if barangay.poverty_incidence:
            poverty_score = min(barangay.poverty_incidence * 2, 100)
            score += poverty_score * 0.20
        else:
            score += 50 * 0.20
        
        # === AIR QUALITY / CLIMATE STRESS ===
        air_quality_score = 0
        
        if barangay.municipality_fk:
            try:
                # Get latest air quality data
                latest_aq = AirQualityData.objects.filter(
                    municipality=barangay.municipality_fk
                ).order_by('-year', '-month').first()
                
                if latest_aq:
                    air_quality_score = latest_aq.get_air_quality_score()
                    barangay.resilience.air_quality_score = air_quality_score
            except:
                pass
        
        score += air_quality_score * 0.15
        
        return min(score, 100)
    
    def calculate_adaptive_capacity(self, barangay):
        """
        Calculate adaptive capacity score (0-100)
        INVERSE: Lower score = better capacity, higher score = lower capacity
        
        Components:
        - Infrastructure accessibility: 40%
        - Community organization: 30%
        - Economic resources: 30%
        """
        score = 0
        
        # === INFRASTRUCTURE (inverse - rural/remote = higher score) ===
        if barangay.is_coastal:
            infrastructure_score = 60
        else:
            infrastructure_score = 40
        
        score += infrastructure_score * 0.40
        
        # === COMMUNITY ORGANIZATION (inverse - fewer households = higher score) ===
        if barangay.households and barangay.households > 0:
            if barangay.households > 500:
                community_score = 20
            elif barangay.households > 200:
                community_score = 40
            elif barangay.households > 100:
                community_score = 60
            else:
                community_score = 80
            
            score += community_score * 0.30
        else:
            score += 50 * 0.30
        
        # === ECONOMIC RESOURCES (from poverty) ===
        if barangay.poverty_incidence:
            economic_score = min(barangay.poverty_incidence * 2, 100)
            score += economic_score * 0.30
        else:
            score += 50 * 0.30
        
        return min(score, 100)
    
    def calculate_data_completeness(self, barangay):
        """Calculate what % of expected data is present"""
        total_fields = 11  # Increased to include air quality
        present_fields = 0
        
        # Check critical data fields
        if barangay.population:
            present_fields += 1
        if barangay.total_area:
            present_fields += 1
        if barangay.households:
            present_fields += 1
        if barangay.poverty_incidence:
            present_fields += 1
        
        # Check hazard data
        if hasattr(barangay, 'noah_flood'):
            present_fields += 1
        if hasattr(barangay, 'storm_surge'):
            present_fields += 1
        if hasattr(barangay, 'liquefaction'):
            present_fields += 1
        if HazardExposure.objects.filter(barangay=barangay, hazard_type='landslide').exists():
            present_fields += 1
        if HazardExposure.objects.filter(barangay=barangay, hazard_type='flood').exists():
            present_fields += 1
        
        # Check air quality
        if barangay.municipality_fk and AirQualityData.objects.filter(municipality=barangay.municipality_fk).exists():
            present_fields += 1
        
        # Geometry
        if barangay.geometry:
            present_fields += 1
        
        return (present_fields / total_fields) * 100