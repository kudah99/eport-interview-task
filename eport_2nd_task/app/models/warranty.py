from datetime import date
from sqlalchemy import Column, Integer, String, Numeric, Date, Text

from app.models.common import DateTimeModelMixin
from app.models.rwmodel import RWModel


class Warranty(RWModel, DateTimeModelMixin):
    __tablename__ = "warranties"

    id = Column(Integer, primary_key=True)
    asset_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    date_purchased = Column(Date, nullable=False)
    cost = Column(Numeric(10, 2), nullable=False)
    department = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, default="Active")
    user_id = Column(Integer, nullable=False)
    user_name = Column(String(255), nullable=False)
    warranty_period_months = Column(Integer, nullable=True)
    warranty_expiry_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)

