from django.core.management.base import BaseCommand
from resilience.models import Barangay, HazardExposure, ResilienceScore

class Command(BaseCommand):
    help = 'Calculate Barangay Resilience Readiness Scores'

    def handle(self, *args, **options):
        from django.db.models import Avg, Count, Max, Min
        
        self.stdout.write('Calculating resilience scores...')
        
        barangays = Barangay.objects.all()
        total = barangays.count()
        calculated = 0
        
        for barangay in barangays:
            try:
                # Get or create resilience score
                score, created = ResilienceScore.objects.get_or_create(
                    barangay=barangay
                )
                
                # 1. Calculate Hazard Exposure Score (0-100)
                hazards = HazardExposure.objects.filter(barangay=barangay)
                if hazards.exists():
                    avg_hazard = hazards.aggregate(avg=Avg('susceptibility_score'))['avg']
                    # Scale from 1-4 to 0-100 (inverted: lower hazard = higher score)
                    score.hazard_exposure_score = 100 - ((avg_hazard - 1) / 3 * 100)
                else:
                    score.hazard_exposure_score = 50  # Default: medium
                
                # 2. Calculate Health Sensitivity Score (0-100)
                # Based on population density and vulnerable groups
                if barangay.population and barangay.population > 0:
                    # Higher population = higher sensitivity (lower score)
                    pop_factor = min(barangay.population / 10000, 1.0)  # Cap at 10k
                    score.health_sensitivity_score = 100 - (pop_factor * 50)
                else:
                    score.health_sensitivity_score = 50  # Default
                
                # 3. Calculate Adaptive Capacity Score (0-100)
                # For now, use a simple heuristic
                score.adaptive_capacity_score = 50  # Default: medium capacity
                
                # 4. Calculate overall BRRS
                score.calculate_score()
                
                calculated += 1
                if calculated % 50 == 0:
                    self.stdout.write(f'Calculated {calculated}/{total}...')
            
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Error for {barangay.name}: {str(e)}'))
        
        # Summary
        self.stdout.write('\n' + '='*80)
        self.stdout.write(self.style.SUCCESS(f'✓ Calculated scores for {calculated} barangays'))
        
        # Show statistics
        stats = ResilienceScore.objects.aggregate(
            avg_score=Avg('overall_score'),
            max_score=Max('overall_score'),
            min_score=Min('overall_score')
        )
        
        self.stdout.write(f'\nOverall BRRS Statistics:')
        self.stdout.write(f'  Average: {stats["avg_score"]:.1f}')
        self.stdout.write(f'  Highest: {stats["max_score"]:.1f}')
        self.stdout.write(f'  Lowest:  {stats["min_score"]:.1f}')
        
        # Show distribution by risk level
        risk_dist = ResilienceScore.objects.values('risk_level').annotate(
            count=Count('id')
        ).order_by('-count')
        
        self.stdout.write('\nRisk Level Distribution:')
        for item in risk_dist:
            self.stdout.write(f'  {item["risk_level"]}: {item["count"]} barangays')
        
        # Show top 10 highest risk
        self.stdout.write('\nTop 10 Highest Risk Barangays:')
        high_risk = ResilienceScore.objects.select_related('barangay').order_by('-overall_score')[:10]
        for rs in high_risk:
            self.stdout.write(f'  {rs.barangay.name}, {rs.barangay.municipality}: {rs.overall_score:.1f} ({rs.risk_level})')           