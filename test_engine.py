from backend.main import trigger_batch_risk_scoring
from backend.database import SessionLocal
import traceback

db = SessionLocal()
try:
    trigger_batch_risk_scoring(db=db)
    print("SUCCESS")
except Exception as e:
    traceback.print_exc()
