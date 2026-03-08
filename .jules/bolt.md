
## 2024-03-08 - DRF SerializerMethodField Prefetch Cache Optimization
**Learning:** In Django Rest Framework, using methods like `.count()`, `.exists()`, or `.filter()` inside a `SerializerMethodField` ignores `prefetch_related` declarations from the view's queryset. This results in severe N+1 database queries.
**Action:** Always check `hasattr(obj, '_prefetched_objects_cache')` and whether the related field is in the cache before making database queries in a `SerializerMethodField`. If the objects are prefetched, perform operations (like `len()`, `any()`, or list filtering) on `obj.related_name.all()` in Python memory to leverage the cache and prevent N+1 queries.
