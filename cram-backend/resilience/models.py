from django.contrib.gis.db import models


class Municipality(models.Model):
    """Municipality/City information and boundaries"""
    
    psgc_code = models.CharField(max_length=20, unique=True, null=True, blank=True)
    name = models.CharField(max_length=200)
    province = models.CharField(max_length=200)
    region = models.CharField(max_length=100)
    classification = models.CharField(max_length=50, default='Municipality')
    geometry = models.MultiPolygonField(srid=4326)
    population = models.IntegerField(null=True, blank=True)
    land_area = models.FloatField(null=True, blank=True)
    
    # Climate projections summary
    climate_summary = models.TextField(
        null=True, 
        blank=True, 
        help_text="Summary of climate projections (2036-2099)"
    )
    rainfall_trend = models.CharField(
        max_length=50, 
        null=True, 
        blank=True,
        help_text="Increase/Decrease/Stable"
    )
    temperature_trend = models.CharField(
        max_length=50, 
        null=True, 
        blank=True,
        help_text="Increase/Decrease/Stable"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Municipalities"
        ordering = ['province', 'name']
    
    def __str__(self):
        return f"{self.name}, {self.province}"


class Barangay(models.Model):
    """Barangay information and boundaries"""
    
    municipality_fk = models.ForeignKey(
        Municipality, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='barangays'
    )
    
    # Identifiers
    psgc_code = models.CharField(max_length=20, unique=True, null=True, blank=True)
    name = models.CharField(max_length=200)
    municipality = models.CharField(max_length=200)
    province = models.CharField(max_length=200)
    region = models.CharField(max_length=100)
    
    # Geometry
    geometry = models.MultiPolygonField(srid=4326)
    
    # Demographics
    population = models.IntegerField(null=True, blank=True)
    households = models.IntegerField(null=True, blank=True)
    elderly_population = models.IntegerField(null=True, blank=True)
    children_population = models.IntegerField(null=True, blank=True)
    poverty_incidence = models.FloatField(null=True, blank=True)
    
    # Geography
    total_area = models.FloatField(null=True, blank=True)
    is_coastal = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Barangays"
        ordering = ['province', 'municipality', 'name']
    
    def __str__(self):
        return f"{self.name}, {self.municipality}, {self.province}"


class HazardExposure(models.Model):
    """Hazard data per barangay - from LDRRMD and NOAH"""
    
    HAZARD_TYPES = [
        ('flood', 'Flood'),
        ('cyclone', 'Tropical Cyclone'),
        ('landslide', 'Landslide'),
        ('storm_surge', 'Storm Surge'),
    ]
    
    barangay = models.ForeignKey(Barangay, on_delete=models.CASCADE, related_name='hazards')
    hazard_type = models.CharField(max_length=50, choices=HAZARD_TYPES)
    susceptibility = models.CharField(max_length=50)
    susceptibility_score = models.IntegerField()  # 1-4 scale
    
    # Source info
    source = models.CharField(max_length=200, default="LDRRMD")
    assessed_date = models.DateField(null=True, blank=True)
    
    class Meta:
        unique_together = ['barangay', 'hazard_type']
    
    def __str__(self):
        return f"{self.barangay.name} - {self.hazard_type}: {self.susceptibility}"


class NOAHFloodHazard(models.Model):
    """NOAH Flood Hazard data by return period"""
    
    barangay = models.OneToOneField(Barangay, on_delete=models.CASCADE, related_name='noah_flood')
    
    # 5-year return period (frequent)
    flood_5yr_low_pct = models.FloatField(null=True, blank=True, help_text="% of area in low flood zone")
    flood_5yr_med_pct = models.FloatField(null=True, blank=True)
    flood_5yr_high_pct = models.FloatField(null=True, blank=True)
    
    # 25-year return period (standard planning)
    flood_25yr_low_pct = models.FloatField(null=True, blank=True)
    flood_25yr_med_pct = models.FloatField(null=True, blank=True)
    flood_25yr_high_pct = models.FloatField(null=True, blank=True)
    
    # 100-year return period (catastrophic)
    flood_100yr_low_pct = models.FloatField(null=True, blank=True)
    flood_100yr_med_pct = models.FloatField(null=True, blank=True)
    flood_100yr_high_pct = models.FloatField(null=True, blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    def get_composite_flood_score(self):
        """Calculate weighted flood risk score (0-100)"""
        # Weight: 5yr=20%, 25yr=50%, 100yr=30%
        score = 0
        
        if self.flood_5yr_high_pct:
            score += self.flood_5yr_high_pct * 0.20
        if self.flood_25yr_high_pct:
            score += self.flood_25yr_high_pct * 0.50
        if self.flood_100yr_high_pct:
            score += self.flood_100yr_high_pct * 0.30
            
        return min(score, 100)
    
    class Meta:
        verbose_name_plural = "NOAH Flood Hazards"
    
    def __str__(self):
        return f"{self.barangay.name} - NOAH Flood"


class StormSurgeHazard(models.Model):
    """Storm Surge Advisory data (Advisory 1-4)"""
    
    barangay = models.OneToOneField(Barangay, on_delete=models.CASCADE, related_name='storm_surge')
    
    # Advisory 1 (lowest risk)
    ssa1_low_pct = models.FloatField(null=True, blank=True, help_text="% of area in low surge zone")
    ssa1_med_pct = models.FloatField(null=True, blank=True)
    ssa1_high_pct = models.FloatField(null=True, blank=True)
    
    # Advisory 2
    ssa2_low_pct = models.FloatField(null=True, blank=True)
    ssa2_med_pct = models.FloatField(null=True, blank=True)
    ssa2_high_pct = models.FloatField(null=True, blank=True)
    
    # Advisory 3
    ssa3_low_pct = models.FloatField(null=True, blank=True)
    ssa3_med_pct = models.FloatField(null=True, blank=True)
    ssa3_high_pct = models.FloatField(null=True, blank=True)
    
    # Advisory 4 (highest risk)
    ssa4_low_pct = models.FloatField(null=True, blank=True)
    ssa4_med_pct = models.FloatField(null=True, blank=True)
    ssa4_high_pct = models.FloatField(null=True, blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    def get_composite_storm_surge_score(self):
        """Calculate weighted storm surge risk (0-100)"""
        # Weight: SSA1=10%, SSA2=20%, SSA3=30%, SSA4=40%
        score = 0
        
        if self.ssa1_high_pct:
            score += self.ssa1_high_pct * 0.10
        if self.ssa2_high_pct:
            score += self.ssa2_high_pct * 0.20
        if self.ssa3_high_pct:
            score += self.ssa3_high_pct * 0.30
        if self.ssa4_high_pct:
            score += self.ssa4_high_pct * 0.40
            
        return min(score, 100)
    
    class Meta:
        verbose_name_plural = "Storm Surge Hazards"
    
    def __str__(self):
        return f"{self.barangay.name} - Storm Surge"


class LiquefactionHazard(models.Model):
    """Liquefaction Susceptibility data"""
    
    barangay = models.OneToOneField(Barangay, on_delete=models.CASCADE, related_name='liquefaction')
    
    # Susceptibility percentages by level
    low_pct = models.FloatField(null=True, blank=True, help_text="% of area with low susceptibility")
    med_pct = models.FloatField(null=True, blank=True)
    high_pct = models.FloatField(null=True, blank=True)
    very_high_pct = models.FloatField(null=True, blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    def get_liquefaction_score(self):
        """Calculate liquefaction risk score (0-100)"""
        # Weight: Low=10%, Medium=30%, High=50%, Very High=100%
        score = 0
        
        if self.low_pct:
            score += self.low_pct * 0.10
        if self.med_pct:
            score += self.med_pct * 0.30
        if self.high_pct:
            score += self.high_pct * 0.50
        if self.very_high_pct:
            score += self.very_high_pct * 1.00
            
        return min(score, 100)
    
    class Meta:
        verbose_name_plural = "Liquefaction Hazards"
    
    def __str__(self):
        return f"{self.barangay.name} - Liquefaction"


class TropicalCycloneTrack(models.Model):
    """Tropical Cyclone tracks for 2024"""
    
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, null=True, blank=True)
    begin_index = models.IntegerField(help_text="Start index")
    end_index = models.IntegerField(help_text="End index")
    
    # Track geometry (LineString)
    track = models.LineStringField(srid=4326)
    
    # Metadata
    year = models.IntegerField(default=2024)
    affected_negros = models.BooleanField(default=False, help_text="Did this cyclone affect Negros Oriental?")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Tropical Cyclone Tracks"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} (2024)"
    
    def affects_negros_oriental(self):
        """Check if track passes near Negros Oriental"""
        negros_bbox = {
            'min_lon': 122.5,
            'max_lon': 123.5,
            'min_lat': 9.0,
            'max_lat': 10.5
        }
        
        buffer = 0.5
        track_extent = self.track.extent
        
        return (
            track_extent[0] <= negros_bbox['max_lon'] + buffer and
            track_extent[2] >= negros_bbox['min_lon'] - buffer and
            track_extent[1] <= negros_bbox['max_lat'] + buffer and
            track_extent[3] >= negros_bbox['min_lat'] - buffer
        )


class AirQualityData(models.Model):
    """Monthly air quality averages per municipality"""
    
    municipality = models.ForeignKey(Municipality, on_delete=models.CASCADE, related_name='air_quality')
    
    # Time period
    year = models.IntegerField()
    month = models.IntegerField()
    
    # Air Quality Index (1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor)
    avg_aqi = models.FloatField(help_text="Average AQI for the month")
    
    # Pollutants (μg/m³)
    avg_pm25 = models.FloatField(null=True, blank=True, help_text="PM2.5 average")
    avg_pm10 = models.FloatField(null=True, blank=True, help_text="PM10 average")
    avg_o3 = models.FloatField(null=True, blank=True, help_text="Ozone average")
    avg_no2 = models.FloatField(null=True, blank=True, help_text="NO2 average")
    avg_co = models.FloatField(null=True, blank=True, help_text="CO average")
    
    # Metadata
    data_points = models.IntegerField(default=0, help_text="Number of hourly readings")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Air Quality Data"
        unique_together = ['municipality', 'year', 'month']
        ordering = ['-year', '-month', 'municipality']
    
    def __str__(self):
        return f"{self.municipality.name} - {self.year}/{self.month:02d} (AQI: {self.avg_aqi:.1f})"
    
    def get_air_quality_score(self):
        """Calculate air quality risk score (0-100)"""
        # AQI 1=Good (0), 2=Fair (25), 3=Moderate (50), 4=Poor (75), 5=Very Poor (100)
        aqi_score_map = {1: 0, 2: 25, 3: 50, 4: 75, 5: 100}
        return aqi_score_map.get(round(self.avg_aqi), 50)


class ResilienceScore(models.Model):
    """Barangay Resilience Readiness Score"""
    
    barangay = models.OneToOneField(Barangay, on_delete=models.CASCADE, related_name='resilience')
    
    # Component scores (0-100)
    hazard_exposure_score = models.FloatField(default=0)
    health_sensitivity_score = models.FloatField(default=0)
    adaptive_capacity_score = models.FloatField(default=0)
    
    # Sub-scores for transparency
    flood_risk_score = models.FloatField(null=True, blank=True)
    landslide_risk_score = models.FloatField(null=True, blank=True)
    storm_surge_risk_score = models.FloatField(null=True, blank=True)
    liquefaction_risk_score = models.FloatField(null=True, blank=True)
    population_density_score = models.FloatField(null=True, blank=True)
    air_quality_score = models.FloatField(null=True, blank=True)
    
    # Overall BRRS (0-100)
    overall_score = models.FloatField(default=0)
    risk_level = models.CharField(max_length=20, default='Unknown')
    
    # Metadata
    calculated_at = models.DateTimeField(auto_now=True)
    data_completeness = models.FloatField(default=0)  # % of data present
    
    def calculate_score(self):
        """Calculate weighted BRRS score"""
        self.overall_score = (
            self.hazard_exposure_score * 0.40 +
            self.health_sensitivity_score * 0.30 +
            self.adaptive_capacity_score * 0.30
        )
        
        # Classify risk level
        if self.overall_score < 40:
            self.risk_level = 'Low'
        elif self.overall_score < 70:
            self.risk_level = 'Medium'
        else:
            self.risk_level = 'High'
        
        self.save()
    
    class Meta:
        verbose_name_plural = "Resilience Scores"
    
    def __str__(self):
        return f"{self.barangay.name} - BRRS: {self.overall_score:.1f}"