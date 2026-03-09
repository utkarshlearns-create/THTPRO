## 2025-03-09 - N+1 Queries in SerializerMethodField
**Learning:** In Django Rest Framework, calling methods like `.count()`, `.exists()`, or `.filter()` inside a `SerializerMethodField` ignores `prefetch_related` declarations and triggers N+1 queries.
**Action:** Check `hasattr(obj, '_prefetched_objects_cache')` and perform operations in Python memory on `obj.related_name.all()` (e.g., `len()`, `any()`, or list filtering) instead to utilize the prefetch cache.
