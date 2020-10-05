"""empty message

Revision ID: 2eeb0358560e
Revises: 2779009f1ed1
Create Date: 2020-10-05 00:08:45.506397

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2eeb0358560e'
down_revision = '2779009f1ed1'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_foreign_key(None, 'custom_nodes', 'boards', ['board_id'], ['id'], ondelete='CASCADE')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'custom_nodes', type_='foreignkey')
    # ### end Alembic commands ###
