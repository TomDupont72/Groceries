from backend.core.database import engine
from backend.models import Base

def main():
    Base.metadata.create_all(bind=engine)
    print("✅ Database created")

if __name__ == "__main__":
    main()
