#!/usr/bin/python3
"""
Defines a User node model
"""

from models.base import BaseNode, Base
from models.custom import CustomNode
from models.board import Board
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship

class User(BaseNode, Base):
    """
    This model stores the needed data for the triggers
    """
    __tablename__ = 'users'
    email = Column(String(64), default='')
    password = Column(String(64), default='')
    name = Column(String(64), default='')
    nodes = relationship('CustomNode', backref='user')
    boards = relationship('Board', backref='user')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
