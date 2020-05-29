#!/usr/bin/python3
"""
Defines a User node model
"""

from models.base import BaseNode, Base
from models.api import apis
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship

class User(BaseNode, Base):
    """
    This model stores the needed data for the triggers
    """
    __tablename__ = 'users'
    apis = relationship('apis', backref='user')
    password = Column(String(64))

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
