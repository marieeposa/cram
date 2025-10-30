from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import (
    Municipality, Barangay, HazardExposure, ResilienceScore,
    NOAHFloodHazard, StormSurgeHazard, LiquefactionHazard,
    AirQualityData, TropicalCycloneTrack
)


class MunicipalitySerializer(serializers.ModelSerializer):
    barangay_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Municipality
        fields = '__all__'


class ResilienceScoreSerializer(serializers.ModelSerializer):
    barangay_name = serializers.CharField(source='barangay.name', read_only=True)
    municipality = serializers.CharField(source='barangay.municipality', read_only=True)
    
    class Meta:
        model = ResilienceScore
        fields = '__all__'


class HazardExposureSerializer(serializers.ModelSerializer):
    barangay_name = serializers.CharField(source='barangay.name', read_only=True)
    
    class Meta:
        model = HazardExposure
        fields = '__all__'


# GeoJSON serializer for barangays with geometry
class BarangaySerializer(GeoFeatureModelSerializer):
    resilience = ResilienceScoreSerializer(read_only=True)
    hazards = HazardExposureSerializer(many=True, read_only=True)
    resilience_score = serializers.FloatField(source='resilience.overall_score', read_only=True)
    risk_level = serializers.CharField(source='resilience.risk_level', read_only=True)
    
    class Meta:
        model = Barangay
        geo_field = 'geometry'
        fields = [
            'id', 'name', 'municipality', 'province', 'region', 
            'population', 'households', 'total_area', 'is_coastal',
            'poverty_incidence', 'psgc_code', 'resilience', 'hazards',
            'resilience_score', 'risk_level'
        ]


class BarangayListSerializer(GeoFeatureModelSerializer):
    resilience_score = serializers.FloatField(source='resilience.overall_score', read_only=True)
    risk_level = serializers.CharField(source='resilience.risk_level', read_only=True)
    
    class Meta:
        model = Barangay
        geo_field = 'geometry'
        fields = [
            'id', 'name', 'municipality', 'province', 'population',
            'is_coastal', 'resilience_score', 'risk_level'
        ]


# Hazard layer serializers
class NOAHFloodHazardSerializer(serializers.ModelSerializer):
    barangay_name = serializers.CharField(source='barangay.name', read_only=True)
    barangay_id = serializers.IntegerField(source='barangay.id', read_only=True)
    
    class Meta:
        model = NOAHFloodHazard
        fields = [
            'id', 'barangay', 'barangay_id', 'barangay_name', 
            'flood_5yr_high_pct', 'flood_25yr_high_pct', 'flood_100yr_high_pct'
        ]


class StormSurgeHazardSerializer(serializers.ModelSerializer):
    barangay_name = serializers.CharField(source='barangay.name', read_only=True)
    barangay_id = serializers.IntegerField(source='barangay.id', read_only=True)
    
    class Meta:
        model = StormSurgeHazard
        fields = [
            'id', 'barangay', 'barangay_id', 'barangay_name',
            'ssa1_high_pct', 'ssa2_high_pct', 'ssa3_high_pct', 'ssa4_high_pct'
        ]


class LiquefactionHazardSerializer(serializers.ModelSerializer):
    barangay_name = serializers.CharField(source='barangay.name', read_only=True)
    barangay_id = serializers.IntegerField(source='barangay.id', read_only=True)
    
    class Meta:
        model = LiquefactionHazard
        fields = [
            'id', 'barangay', 'barangay_id', 'barangay_name',
            'very_high_pct', 'high_pct', 'moderate_pct', 'low_pct', 'none_pct'
        ]


class AirQualityDataSerializer(serializers.ModelSerializer):
    municipality_name = serializers.CharField(source='municipality.name', read_only=True)
    
    class Meta:
        model = AirQualityData
        fields = '__all__'


class TropicalCycloneTrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = TropicalCycloneTrack
        fields = '__all__'