#!/usr/bin/python3
"""
Defines a Board model
"""

from models.base import BaseNode, Base
from models.custom import CustomNode
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship

class Board(BaseNode, Base):
    """
    Defines a board object
    - a name.
    - a list of nodes and their positions.
    - a user_id attached
    """
    __tablename__ = 'boards'
    name = Column(String(64), nullable=True)
    nodes = Column(String(3000), default='{}');
    user_id = Column(String(60), ForeignKey('users.id'), nullable=False)