"""create_warranties_table

Revision ID: create_warranties
Revises: b2437a6523e3
Create Date: 2024-01-01 00:00:00.000000

"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy import func

# revision identifiers, used by Alembic.
revision = "create_warranties"
down_revision = "b2437a6523e3"
branch_labels = None
depends_on = None


def _timestamps() -> tuple[sa.Column, sa.Column, sa.Column]:
    return (
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            nullable=True,
            server_default=func.now(),
            onupdate=func.current_timestamp(),
        ),
        sa.Column(
            "deleted_at",
            sa.TIMESTAMP(timezone=True),
            nullable=True,
        ),
    )


def _create_warranties_table() -> None:
    op.create_table(
        "warranties",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("asset_name", sa.String(255), nullable=False),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("date_purchased", sa.Date, nullable=False),
        sa.Column("cost", sa.Numeric(10, 2), nullable=False),
        sa.Column("department", sa.String(100), nullable=False),
        sa.Column("status", sa.String(50), nullable=False, server_default="Active"),
        sa.Column("user_id", sa.Integer, nullable=False),
        sa.Column("user_name", sa.String(255), nullable=False),
        sa.Column("warranty_period_months", sa.Integer, nullable=True),
        sa.Column("warranty_expiry_date", sa.Date, nullable=True),
        sa.Column("notes", sa.Text, nullable=True),
        *_timestamps(),
    )
    op.execute(
        """
        CREATE TRIGGER update_warranty_modtime
            BEFORE UPDATE
            ON warranties
            FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
        """
    )


def upgrade() -> None:
    _create_warranties_table()


def downgrade() -> None:
    op.drop_table("warranties")

