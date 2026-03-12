
## 2024-03-10 - Resolve N+1 issues in Serializers using prefetch cache
**Learning:** Backend DRF serializers like `JobPostSerializer` and `PublicTutorProfileSerializer` heavily utilize nested foreign key properties. If methods like `.count()`, `.exists()`, or `.filter()` are called inside a `SerializerMethodField`, they bypass the `prefetch_related` cache and trigger N+1 queries.
**Action:** When working with DRF serializers that do aggregations or filter related models, check `hasattr(obj, '_prefetched_objects_cache')` first, and if present, perform list filtering or `len()` operations in Python memory on the cached `obj.related_name.all()` instead.
