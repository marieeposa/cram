from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'municipalities', views.MunicipalityViewSet)
router.register(r'barangays', views.BarangayViewSet)
router.register(r'resilience-scores', views.ResilienceScoreViewSet)
router.register(r'hazards', views.HazardExposureViewSet)
router.register(r'noah-flood', views.NOAHFloodHazardViewSet)
router.register(r'storm-surge', views.StormSurgeHazardViewSet)
router.register(r'liquefaction', views.LiquefactionHazardViewSet)
router.register(r'air-quality', views.AirQualityDataViewSet)
router.register(r'cyclone-tracks', views.TropicalCycloneTrackViewSet)

urlpatterns = [
    path('', include(router.urls)),
]