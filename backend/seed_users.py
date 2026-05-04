"""
Run once to seed default users (bcrypt-hashed passwords).
Usage (from project root):
  Windows:     python backend/seed_users.py
  Linux/macOS: python3 backend/seed_users.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from backend.database import engine, Base
from backend import models
from backend.auth import hash_password


def seed():
    Base.metadata.create_all(bind=engine, tables=[models.User.__table__])
    print("✓ users table ready")

    users = [
        {"username": "admin",       "full_name": "System Administrator",  "password": "admin123",  "role": "admin",  "linked_id": None},
        {"username": "dr_smith",    "full_name": "Dr. Sarah Smith",        "password": "doctor123", "role": "doctor", "linked_id": 1},
        {"username": "dr_jones",    "full_name": "Dr. Marcus Jones",       "password": "doctor123", "role": "doctor", "linked_id": 2},
        {"username": "staff_coord", "full_name": "Coordinator Lisa Chen",  "password": "staff123",  "role": "staff",  "linked_id": 1},
    ]

    with engine.connect() as conn:
        for u in users:
            hashed_pw = hash_password(u["password"])
            existing = conn.execute(
                text("SELECT user_id FROM users WHERE username = :username"),
                {"username": u["username"]}
            ).fetchone()

            if existing:
                conn.execute(
                    text("UPDATE users SET hashed_password = :pw, is_active = 1 WHERE username = :username"),
                    {"pw": hashed_pw, "username": u["username"]}
                )
                print(f"  ↻ Updated: {u['username']}")
            else:
                conn.execute(
                    text("""INSERT INTO users (username, full_name, hashed_password, role, linked_id, is_active)
                            VALUES (:username, :full_name, :pw, :role, :linked_id, 1)"""),
                    {"username": u["username"], "full_name": u["full_name"],
                     "pw": hashed_pw, "role": u["role"], "linked_id": u["linked_id"]}
                )
                print(f"  + Created: {u['username']}")

        conn.commit()

    print("\n✓ All passwords hashed with bcrypt")
    print("\nCredentials:")
    print("  admin       / admin123")
    print("  dr_smith    / doctor123")
    print("  dr_jones    / doctor123")
    print("  staff_coord / staff123")


if __name__ == "__main__":
    seed()
