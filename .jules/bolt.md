## 2024-05-24 - Optimized CRM Dashboard Stats Pipeline
**Learning:** In Django, chaining `count()` queries on multiple filtered sets (like counting pending, approved, assigned jobs) triggers multiple N+1 queries. We can aggregate them using `JobPost.objects.values('status').annotate(count=Count('status'))` reducing DB queries from 5 to 1.
**Action:** Always prefer `annotate` and `Count` over looping or repeating `filter().count()` on the same queryset when building pipeline metrics or dashboard stats.
