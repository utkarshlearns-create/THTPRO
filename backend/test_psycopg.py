import psycopg2
import sys

db_url = "postgresql://neondb_owner:npg_Dwk3aUNrIK5f@ep-cool-dew-ainh9q-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

try:
    print(f"Connecting to {db_url}...")
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT count(*) FROM jobs_subject;")
    count = cur.fetchone()[0]
    print(f"Connection Successful! jobs_subject count: {count}")

    # Seed logic
    subjects_to_add = [
        "Mathematics", "Physics", "Chemistry", "Biology", "Science", 
        "English", "Hindi", "Sanskrit", "Regional Languages",
        "Social Science", "History", "Geography", "Civics", "Political Science", 
        "Computer Science", "Information Technology", "Coding",
        "Accountancy", "Business Studies", "Economics", "Commerce",
        "EVS (Environmental Studies)", "Psychology", "Sociology", "Physical Education"
    ]
    added = 0
    for s in subjects_to_add:
        cur.execute("SELECT id FROM jobs_subject WHERE name = %s", (s,))
        if not cur.fetchone():
            cur.execute("INSERT INTO jobs_subject (name) VALUES (%s)", (s,))
            added += 1
    
    conn.commit()
    print(f"Seeded {added} new subjects.")
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"Connection Error: {e}")
