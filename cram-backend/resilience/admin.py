from django.contrib.gis import admin
from .models import Municipality, Barangay, HazardExposure, NOAHFloodHazard, ResilienceScore
from .models import StormSurgeHazard

@admin.register(StormSurgeHazard)
class StormSurgeHazardAdmin(admin.ModelAdmin):
    list_display = ['barangay', 'ssa1_high_pct', 'ssa2_high_pct', 'ssa3_high_pct', 'ssa4_high_pct']
    search_fields = ['barangay__name']

@admin.register(Municipality)
class MunicipalityAdmin(admin.GISModelAdmin):
    list_display = ["name", "province", "classification", "population"]
    list_filter = ["province", "classification", "region"]
    search_fields = ["name", "province", "region"]

@admin.register(Barangay)
class BarangayAdmin(admin.GISModelAdmin):
    list_display = ["name", "municipality", "province", "population", "is_coastal"]
    list_filter = ["province", "municipality", "is_coastal", "region"]
    search_fields = ["name", "municipality", "province", "psgc_code"]

@admin.register(HazardExposure)
class HazardExposureAdmin(admin.ModelAdmin):
    list_display = ["barangay", "hazard_type", "susceptibility", "susceptibility_score", "source", "assessed_date"]
    list_filter = ["hazard_type", "susceptibility", "source"]
    search_fields = ["barangay__name"]

@admin.register(NOAHFloodHazard)
class NOAHFloodHazardAdmin(admin.ModelAdmin):
    list_display = [
        "barangay",
        "flood_5yr_high_pct",
        "flood_25yr_high_pct",
        "flood_100yr_high_pct",
        "updated_at",
    ]
    search_fields = ["barangay__name"]
    list_filter = ["updated_at"]

@admin.register(ResilienceScore)
class ResilienceScoreAdmin(admin.ModelAdmin):
    list_display = ["barangay", "overall_score", "risk_level", "hazard_exposure_score",
                    "health_sensitivity_score", "adaptive_capacity_score", "calculated_at"]
    list_filter = ["risk_level"]
    search_fields = ["barangay__name"]