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
