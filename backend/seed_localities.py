from jobs.models import Location, Locality

lucknow = Location.objects.filter(city='Lucknow').first()
if lucknow:
    lucknow_areas = [
        'Gomti Nagar', 'Indira Nagar', 'Aliganj', 'Hazratganj', 
        'Mahanagar', 'Aashiana', 'Vikas Nagar', 'Rajajipuram',
        'Kapurthala', 'Jankipuram', 'Chowk', 'Aminabad', 
        'Gomti Nagar Extension', 'Sushant Golf City', 'Transport Nagar'
    ]
    for area in lucknow_areas:
        obj, created = Locality.objects.get_or_create(location=lucknow, name=area)
        print(f"Locality {area} in Lucknow: {'Created' if created else 'Already Exists'}")
else:
    print("Lucknow city not found in Locations. Creating it first...")
    lucknow, _ = Location.objects.get_or_create(city='Lucknow', state='Uttar Pradesh')
    lucknow_areas = [
        'Gomti Nagar', 'Indira Nagar', 'Aliganj', 'Hazratganj', 
        'Mahanagar', 'Aashiana', 'Vikas Nagar', 'Rajajipuram',
        'Kapurthala', 'Jankipuram', 'Chowk', 'Aminabad', 
        'Gomti Nagar Extension', 'Sushant Golf City', 'Transport Nagar'
    ]
    for area in lucknow_areas:
        obj, created = Locality.objects.get_or_create(location=lucknow, name=area)
        print(f"Locality {area} in Lucknow: {'Created' if created else 'Already Exists'}")
