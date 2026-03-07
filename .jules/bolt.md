
## 2024-05-15 - Django DRF N+1 queries with `.count()`
**Learning:** In Django REST Framework, calling `.count()` inside a `SerializerMethodField` ignores `prefetch_related` and triggers N+1 queries. To utilize the prefetch cache and avoid this, check `hasattr(obj, '_prefetched_objects_cache')` and use `len(obj.related_name.all())` instead.
**Action:** When adding counts to serializers, always check for the prefetch cache first.
