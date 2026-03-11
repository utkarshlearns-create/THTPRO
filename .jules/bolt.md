
## 2024-05-18 - DRF SerializerMethodField N+1 Queries
**Learning:** Using Django queryset methods like `.count()`, `.exists()`, or `.filter()` inside a DRF `SerializerMethodField` ignores the queryset's `prefetch_related` cache, leading to severe N+1 query bottlenecks on large lists.
**Action:** Always check `hasattr(obj, '_prefetched_objects_cache')` within `SerializerMethodField` logic. If prefetched, process the data in Python memory using `.all()` and built-in functions (e.g., `len()`, `any()`, list comprehensions). Ensure querysets feeding the serializer use `.prefetch_related()` for those relationships.
