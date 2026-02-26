import csv

files = [
    r'c:\Users\brahm\THTPRO\THE HOME TUITIONS (Responses) - Form Responses 1.csv',
    r'c:\Users\brahm\THTPRO\THE HOME TUITIONS (Responses) - Form Responses 2.csv',
    r'c:\Users\brahm\THTPRO\THE HOME TUITIONS (Responses) - NEW TUTOR RESPONSE SHEET.csv',
]

for fpath in files:
    print(f"\n=== {fpath.split(chr(92))[-1]} ===")
    with open(fpath, encoding='utf-8') as f:
        reader = csv.reader(f)
        headers = next(reader)
        # Find document-related columns
        doc_cols = []
        for i, h in enumerate(headers):
            h_lower = h.lower()
            if any(kw in h_lower for kw in ['aadhaar', 'aadhar', 'marksheet', 'qualification', 'photograph', 'photo', 'document', 'certificate', 'id proof']):
                doc_cols.append((i, h))
        
        print(f"Document columns: {doc_cols}")
        
        # Check first 3 rows for sample data
        has_data = 0
        no_data = 0
        for row in reader:
            has_any = False
            for ci, cn in doc_cols:
                if ci < len(row) and row[ci].strip():
                    has_any = True
            if has_any:
                has_data += 1
            else:
                no_data += 1
        print(f"Rows with document links: {has_data}")
        print(f"Rows without document links: {no_data}")
        
        # Show sample
        f.seek(0)
        reader = csv.reader(f)
        next(reader)
        for idx, row in enumerate(reader):
            if idx >= 2:
                break
            for ci, cn in doc_cols:
                val = row[ci] if ci < len(row) else ''
                print(f"  Row {idx} - {cn}: {val[:80]}...")
