#!/usr/bin/python3
"""
Defines a User node model
"""

from models.base import BaseNode, Base
from models.custom import CustomNode
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship

class User(BaseNode, Base):
    """
    This model stores the needed data for the triggers
    """
    __tablename__ = 'users'
    email = Column(String(64))
    password = Column(String(64))
    name = Column(String(64))
    nodes = relationship('CustomNode', backref='users')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
