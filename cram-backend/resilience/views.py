from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from django.db.models import Count, Avg, Q
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Municipality, Barangay, HazardExposure, ResilienceScore,
    NOAHFloodHazard, StormSurgeHazard, LiquefactionHazard,
    AirQualityData, TropicalCycloneTrack
)
from .serializers import (
    MunicipalitySerializer, BarangaySerializer, 
    BarangayListSerializer, HazardExposureSerializer, ResilienceScoreSerializer,
    NOAHFloodHazardSerializer, StormSurgeHazardSerializer, 
    LiquefactionHazardSerializer, AirQualityDataSerializer,
    TropicalCycloneTrackSerializer
)
from .ai_service import AIAnalysisService

# Initialize AI service
ai_service = AIAnalysisService()


class MunicipalityViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for municipalities"""
    queryset = Municipality.objects.annotate(
        barangay_count=Count('barangays')
    ).order_by('name')
    serializer_class = MunicipalitySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name', 'province']
    filterset_fields = ['province', 'classification']
    
    @action(detail=True, methods=['get'])
    def barangays(self, request, pk=None):
        """Get all barangays in this municipality"""
        municipality = self.get_object()
        barangays = municipality.barangays.all()
        serializer = BarangayListSerializer(barangays, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def air_quality(self, request, pk=None):
        """Get air quality data for this municipality"""
        municipality = self.get_object()
        air_quality = municipality.air_quality.all().order_by('-year', '-month')
        serializer = AirQualityDataSerializer(air_quality, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def ai_report(self, request, pk=None):
        """Generate AI-powered municipal report"""
        municipality = self.get_object()
        
        barangays = municipality.barangays.all()
        resilience_scores = ResilienceScore.objects.filter(barangay__in=barangays)
        
        municipality_data = {
            'name': municipality.name,
            'barangay_count': barangays.count(),
            'avg_brrs': resilience_scores.aggregate(Avg('overall_score'))['overall_score__avg'] or 0,
            'high_risk_count': resilience_scores.filter(risk_level='High').count(),
            'medium_risk_count': resilience_scores.filter(risk_level='Medium').count(),
            'coastal_count': barangays.filter(is_coastal=True).count()
        }
        
        report = ai_service.generate_municipal_report(municipality_data)
        
        return Response({
            'municipality': municipality.name,
            'report': report,
            'data': municipality_data,
            'generated_at': timezone.now()
        })


class BarangayViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for barangays with filtering and risk analysis"""
    queryset = Barangay.objects.select_related(
        'municipality_fk', 'resilience'
    ).prefetch_related('hazards')
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'municipality', 'province']
    filterset_fields = ['municipality', 'is_coastal', 'resilience__risk_level']
    ordering_fields = ['name', 'population', 'resilience__overall_score']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BarangayListSerializer
        return BarangaySerializer
    
    @action(detail=True, methods=['get'])
    def ai_analysis(self, request, pk=None):
        """Generate AI-powered analysis for this barangay"""
        barangay = self.get_object()
        resilience = ResilienceScore.objects.filter(barangay=barangay).first()
        
        barangay_data = {
            'name': barangay.name,
            'municipality': barangay.municipality or 'Unknown',
            'population': barangay.population,
            'brrs_score': resilience.overall_score if resilience else None,
            'risk_level': resilience.risk_level if resilience else 'Unknown',
            'hazard_exposure': resilience.hazard_exposure_score if resilience else None,
            'health_sensitivity': resilience.health_sensitivity_score if resilience else None,
            'adaptive_capacity': resilience.adaptive_capacity_score if resilience else None,
            'is_coastal': barangay.is_coastal,
            'hazards': [h.hazard_type for h in barangay.hazards.all()]
        }
        
        analysis = ai_service.analyze_barangay(barangay_data)
        
        return Response({
            'barangay_id': barangay.id,
            'barangay_name': barangay.name,
            'analysis': analysis,
            'data': barangay_data,
            'generated_at': timezone.now()
        })
    
    @action(detail=False, methods=['get'])
    def high_risk(self, request):
        """Get high-risk barangays"""
        high_risk = Barangay.objects.filter(
            resilience__risk_level='High'
        ).select_related('resilience').order_by('-resilience__overall_score')
        serializer = BarangayListSerializer(high_risk, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def medium_risk(self, request):
        """Get medium-risk barangays"""
        medium_risk = Barangay.objects.filter(
            resilience__risk_level='Medium'
        ).select_related('resilience').order_by('-resilience__overall_score')
        serializer = BarangayListSerializer(medium_risk, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def coastal(self, request):
        """Get coastal barangays"""
        coastal = Barangay.objects.filter(
            is_coastal=True
        ).select_related('resilience').order_by('name')
        serializer = BarangayListSerializer(coastal, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get overall statistics"""
        stats = ResilienceScore.objects.aggregate(
            avg_score=Avg('overall_score'),
            avg_hazard=Avg('hazard_exposure_score'),
            avg_health=Avg('health_sensitivity_score'),
            avg_capacity=Avg('adaptive_capacity_score'),
            high_risk=Count('id', filter=Q(risk_level='High')),
            medium_risk=Count('id', filter=Q(risk_level='Medium')),
            low_risk=Count('id', filter=Q(risk_level='Low'))
        )
        
        hazard_stats = HazardExposure.objects.values('hazard_type').annotate(
            count=Count('id')
        )
        
        noah_flood_count = NOAHFloodHazard.objects.count()
        storm_surge_count = StormSurgeHazard.objects.count()
        liquefaction_count = LiquefactionHazard.objects.count()
        
        return Response({
            'resilience_stats': stats,
            'hazard_stats': list(hazard_stats),
            'hazard_coverage': {
                'noah_flood': noah_flood_count,
                'storm_surge': storm_surge_count,
                'liquefaction': liquefaction_count,
                'landslide': HazardExposure.objects.filter(hazard_type='landslide').count()
            },
            'total_barangays': Barangay.objects.count(),
            'total_municipalities': Municipality.objects.count(),
            'coastal_barangays': Barangay.objects.filter(is_coastal=True).count()
        })


class ResilienceScoreViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for resilience scores"""
    queryset = ResilienceScore.objects.select_related('barangay').all()
    serializer_class = ResilienceScoreSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['risk_level']
    ordering_fields = [
        'overall_score', 'hazard_exposure_score', 
        'health_sensitivity_score', 'adaptive_capacity_score'
    ]
    ordering = ['-overall_score']
    
    @action(detail=False, methods=['get'])
    def top_risk(self, request):
        """Get top 10 highest risk barangays"""
        top_10 = ResilienceScore.objects.select_related(
            'barangay'
        ).order_by('-overall_score')[:10]
        serializer = self.get_serializer(top_10, many=True)
        return Response(serializer.data)


class HazardExposureViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for LDRRMD hazard data"""
    queryset = HazardExposure.objects.select_related('barangay').all()
    serializer_class = HazardExposureSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['hazard_type', 'susceptibility']


class NOAHFloodHazardViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for NOAH flood data"""
    queryset = NOAHFloodHazard.objects.select_related('barangay').all()
    serializer_class = NOAHFloodHazardSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['flood_100yr_high_pct', 'flood_25yr_high_pct']
    
    @action(detail=False, methods=['get'])
    def high_risk(self, request):
        """Get barangays with high 100-year flood risk"""
        high_risk = NOAHFloodHazard.objects.filter(
            flood_100yr_high_pct__gte=50
        ).select_related('barangay').order_by('-flood_100yr_high_pct')
        serializer = self.get_serializer(high_risk, many=True)
        return Response(serializer.data)


class StormSurgeHazardViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for storm surge data"""
    queryset = StormSurgeHazard.objects.select_related('barangay').all()
    serializer_class = StormSurgeHazardSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['ssa4_high_pct', 'ssa3_high_pct']
    
    @action(detail=False, methods=['get'])
    def high_risk(self, request):
        """Get barangays with high SSA4 risk"""
        high_risk = StormSurgeHazard.objects.filter(
            ssa4_high_pct__gte=50
        ).select_related('barangay').order_by('-ssa4_high_pct')
        serializer = self.get_serializer(high_risk, many=True)
        return Response(serializer.data)


class LiquefactionHazardViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for liquefaction data"""
    queryset = LiquefactionHazard.objects.select_related('barangay').all()
    serializer_class = LiquefactionHazardSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['very_high_pct', 'high_pct']
    
    @action(detail=False, methods=['get'])
    def high_risk(self, request):
        """Get barangays with high liquefaction risk"""
        high_risk = LiquefactionHazard.objects.filter(
            Q(very_high_pct__gte=30) | Q(high_pct__gte=50)
        ).select_related('barangay').order_by('-very_high_pct')
        serializer = self.get_serializer(high_risk, many=True)
        return Response(serializer.data)


class AirQualityDataViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for air quality data"""
    queryset = AirQualityData.objects.select_related('municipality').all()
    serializer_class = AirQualityDataSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['municipality', 'year', 'month']
    ordering = ['-year', '-month']
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get latest air quality data for all municipalities"""
        latest = AirQualityData.objects.order_by('-year', '-month').first()
        if latest:
            latest_data = AirQualityData.objects.filter(
                year=latest.year,
                month=latest.month
            ).select_related('municipality')
            serializer = self.get_serializer(latest_data, many=True)
            return Response(serializer.data)
        return Response([])
    
    @action(detail=False, methods=['get'])
    def ai_analysis(self, request):
        """Generate AI analysis of air quality trends"""
        latest = AirQualityData.objects.order_by('-year', '-month').first()
        if not latest:
            return Response({'error': 'No air quality data available'}, status=404)
        
        latest_data = AirQualityData.objects.filter(
            year=latest.year,
            month=latest.month
        ).select_related('municipality')
        
        air_quality_data = [
            {
                'municipality': aq.municipality.name if aq.municipality else 'Unknown',
                'aqi': aq.avg_aqi or 0,
                'pm25': aq.avg_pm25 or 0,
                'pm10': aq.avg_pm10 or 0,
                'o3': aq.avg_o3 or 0,
                'no2': aq.avg_no2 or 0
            }
            for aq in latest_data
        ]
        
        analysis = ai_service.analyze_air_quality(air_quality_data)
        
        return Response({
            'analysis': analysis,
            'data': air_quality_data,
            'period': f"{latest.year}-{latest.month:02d}",
            'generated_at': timezone.now()
        })


class TropicalCycloneTrackViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for cyclone tracks"""
    queryset = TropicalCycloneTrack.objects.all()
    serializer_class = TropicalCycloneTrackSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['year', 'category', 'affected_negros']
    ordering = ['-year', 'name']
    
    @action(detail=False, methods=['get'])
    def affecting_negros(self, request):
        """Get cyclones that affected Negros Oriental"""
        affecting = TropicalCycloneTrack.objects.filter(
            affected_negros=True
        ).order_by('-year', 'name')
        serializer = self.get_serializer(affecting, many=True)
        return Response(serializer.data)