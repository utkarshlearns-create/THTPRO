import csv
import random
import os

# Configuration
NUM_RECORDS = 50
OUTPUT_FILE = 'tutors_dummy.csv'

# Data Pools
NAMES = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
    "Diya", "Saanvi", "Ananya", "Aadhya", "Pari", "Anika", "Navya", "Angel", "Myra", "Sara",
    "Ravi", "Suresh", "Ramesh", "Priya", "Sneha", "Amit", "Rahul", "Pooja", "Neha", "Vikram"
]
SURNAMES = [
    "Kumar", "Singh", "Sharma", "Verma", "Gupta", "Malhotra", "Bhatia", "Saxena", "Yadav", "Jain",
    "Agarwal", "Mishra", "Tripathi", "Pandey", "Das", "Ghosh", "Reddy", "Nair", "Patel", "Mehta"
]
LOCALITIES = [
    "Indira Nagar", "Goms", "Aliganj", "Hazratganj", "Mahanagar", "Jankipuram", "Vikas Nagar", 
    "Gomti Nagar", "Chowk", "Aminabad", "Ashiyana", "Rajajipuram"
]
SUBJECTS = [
    "Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi", "Computer Science", 
    "Economics", "Accounts", "Business Studies", "History", "Geography"
]
MODES = ["HOME", "ONLINE", "BOTH"]

def generate_phone():
    return f"9{random.randint(100000000, 999999999)}"

def generate_tutor():
    first_name = random.choice(NAMES)
    last_name = random.choice(SURNAMES)
    full_name = f"{first_name} {last_name}"
    
    return {
        "Full Name": full_name,
        "Phone": generate_phone(),
        "Email": f"{first_name.lower()}.{last_name.lower()}{random.randint(1,99)}@example.com",
        "Gender": random.choice(["Male", "Female"]),
        "Subjects": ", ".join(random.sample(SUBJECTS, k=random.randint(1, 3))),
        "Locality": random.choice(LOCALITIES),
        "Experience": random.randint(0, 15),
        "Mode": random.choice(MODES)
    }

def main():
    headers = ["Full Name", "Phone", "Email", "Gender", "Subjects", "Locality", "Experience", "Mode"]
    
    with open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        
        for _ in range(NUM_RECORDS):
            writer.writerow(generate_tutor())
            
    print(f"Successfully generated {NUM_RECORDS} tutor records in '{os.path.abspath(OUTPUT_FILE)}'")

if __name__ == "__main__":
    main()
