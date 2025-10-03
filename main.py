from db_handler import init_db, save_donation, get_all_donations
import re

# Initialize DB
init_db()

def show_menu():
    print("\n==============================================")
    print("   Welcome to Multi-Faith Religious Donation Optimizer")
    print("==============================================")
    print("1. View all existing donations")
    print("2. Add a new donation")
    print("3. Exit")
    print("==============================================")

def show_table(data):
    """Pretty print donations in table form"""
    print("\n========== Existing Donations ==========")
    print(f"{'Name':<15} {'Religion':<10} {'Amount':<10} {'Message'}")
    print("-" * 50)
    for d in data:
        name, religion, amount, message = d
        print(f"{name:<15} {religion:<10} ${amount:<9.2f} {message}")
    print("-" * 50)

while True:
    show_menu()
    choice = input("Enter your choice (1/2/3): ").strip()

    if choice == "1":
        donations = get_all_donations()
        if donations:
            show_table(donations)
        else:
            print("\n⚠️ No donations found in the database yet.")
        # after showing, go back to menu (loop continues)

    elif choice == "2":
        # ------------------------
        # Get valid email
        # ------------------------
        while True:
            email = input("Enter your email: ").strip()
            if re.match(r"^[\w\.-]+@gmail\.(com|in)$", email):
                break
            else:
                print("❌ Invalid email! Must be a valid Gmail like example@gmail.com or example@gmail.in. Try again.")

        # ------------------------
        # Get valid phone
        # ------------------------
        while True:
            phone = input("Enter your phone number: ").strip()
            if phone.isdigit() and len(phone) == 10:
                break
            else:
                print("❌ Invalid phone! Must be exactly 10 digits numeric. Try again.")

        # ------------------------
        # Choose religion
        # ------------------------
        print("\nWhich religion do you want to donate to?")
        religions = ["Hindu", "Muslim", "Sikh", "Christian", "Jain"]
        for idx, r in enumerate(religions, start=1):
            print(f"{idx}. {r}")

        while True:
            rel_choice = input("Enter the number corresponding to your choice: ").strip()
            if rel_choice.isdigit() and 1 <= int(rel_choice) <= len(religions):
                selected_religion = religions[int(rel_choice) - 1]
                break
            else:
                print("❌ Invalid choice! Enter a number between 1 and 5.")

        # ------------------------
        # Personal info
        # ------------------------
        name = input("\nEnter your full name: ").strip()
        gender = input("Enter your gender (M/F/Other): ").strip()

        # ------------------------
        # Donation amount
        # ------------------------
        while True:
            amount = input("Enter the amount you want to donate: ").strip()
            try:
                amount = float(amount)
                if amount <= 0:
                    print("❌ Amount must be greater than 0. Try again.")
                    continue
                break
            except ValueError:
                print("❌ Invalid amount! Must be a numeric value greater than 0.")

        # ------------------------
        # Optional message
        # ------------------------
        message = input("You can add a message or dedication (optional): ").strip()

        # ------------------------
        # Save donation to DB
        # ------------------------
        save_donation(name, gender, email, phone, selected_religion, amount, message)

        # ------------------------
        # Show summary
        # ------------------------
        print("\n✅ Donation saved successfully!")
        print("==============================================")
        print("        Donation Summary")
        print("==============================================")
        print(f"Name       : {name}")
        print(f"Gender     : {gender}")
        print(f"Email      : {email}")
        print(f"Phone      : {phone}")
        print(f"Religion   : {selected_religion}")
        print(f"Amount     : ${amount:.2f}")
        if message != "":
            print(f"Message    : {message}")
        print("==============================================")
        print("Thank you for your generous donation! 🙏")

    elif choice == "3":
        print("\n👋 Exiting... Thank you for visiting!")
        break

    else:
        print("❌ Invalid choice. Please type 1, 2, or 3.")
import sqlite3
DB_FILE = "donations.db"
# Initialize DB and table
def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("""
    CREATE TABLE IF NOT EXISTS donations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        gender TEXT,
        email TEXT,
        phone TEXT,
        religion TEXT,
        amount REAL,
        message TEXT
    )
    """)
    conn.commit()
    conn.close()   
# Save a donation to DB
def save_donation(name, gender, email, phone, religion, amount, message):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("""
    INSERT INTO donations (name, gender, email, phone, religion, amount, message)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (name, gender, email, phone, religion, amount, message))
    conn.commit()
    conn.close()
# Fetch all donations (optional)
def get_all_donations():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT name, religion, amount, message FROM donations")
    all_donations = c.fetchall()
    conn.close()
    return all_donations
import sqlite3
DB_FILE = "donations.db"
# Initialize DB and table
def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("""
    CREATE TABLE IF NOT EXISTS donations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        gender TEXT,
        email TEXT,
        phone TEXT,
        religion TEXT,
        amount REAL
        message TEXT
    )
    """)
    conn.commit()
    conn.close()
# Save a donation to DB
def save_donation(name, gender, email, phone, religion, amount, message):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("""
    INSERT INTO donations (name, gender, email, phone, religion, amount, message)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (name, gender, email, phone, religion, amount, message))
    conn.commit()
    conn.close()
# Fetch all donations (optional)
def get_all_donations():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT name, religion, amount, message FROM donations")
    all_donations = c.fetchall()
    conn.close()
    return all_donations