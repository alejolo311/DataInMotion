#!/usr/bin/python3
"""
Defines a custom node model
"""

from models.base import BaseNode, Base
from sqlalchemy import Column, String

class CustomNode(BaseNode, Base):
    """
    This model stores the needed data for the triggers
    """
    __tablename__ = 'custom_nodes'
    object = Column(String(1000))


    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
