#!/usr/bin/python3
"""
Defines an API node model
"""

from models.base import BaseNode, Base
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship

class API(BaseNode, Base):
    """
    This model stores the needed data for the triggers
    """
    __tablename__ = 'apis'
    url = Column(String(64))
    endpoint = Column(String(64))
    user_id = Column(String(60),
                     ForeignKey('User.id'),
                     nullable=False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
