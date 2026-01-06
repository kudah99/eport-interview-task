"""add_image_urls_to_warranties

Revision ID: add_image_urls_to_warranties
Revises: create_warranties
Create Date: 2025-01-06 00:00:00.000000

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "add_image_urls_to_warranties"
down_revision = "create_warranties"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "warranties",
        sa.Column("image_urls", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("warranties", "image_urls")


