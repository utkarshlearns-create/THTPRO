import csv
import os
import sys

# Set stdout to handle utf-8
sys.stdout.reconfigure(encoding='utf-8')

files = [
    "THE HOME TUITIONS (Responses) - Form Responses 1.csv",
    "THE HOME TUITIONS (Responses) - Form Responses 2.csv",
    "THE HOME TUITIONS (Responses) - NEW TUTOR RESPONSE SHEET.csv"
]

output_file = "headers_analysis.txt"

with open(output_file, 'w', encoding='utf-8') as out:
    for filename in files:
        if not os.path.exists(filename):
            out.write(f"Skipping {filename}: File not found\n")
            continue
            
        out.write(f"\n--- Analyzing: {filename} ---\n")
        try:
            with open(filename, 'r', encoding='utf-8', errors='replace') as f:
                reader = csv.reader(f)
                headers = next(reader)
                out.write("Headers:\n")
                for i, h in enumerate(headers):
                    out.write(f"  {i}: {h}\n")
                
                out.write("\nFirst Row Sample:\n")
                try:
                    row = next(reader)
                    for i, val in enumerate(row):
                        if i < len(headers):
                            out.write(f"  {headers[i]}: {val}\n")
                except StopIteration:
                    out.write("  <Empty File>\n")
                    
        except Exception as e:
            out.write(f"Error reading {filename}: {e}\n")

print(f"Analysis written to {output_file}")
