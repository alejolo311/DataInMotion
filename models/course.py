#!/usr/bin/python3
"""
Defines a Course model
"""

from models.base import BaseNode, Base
from models.custom import CustomNode
from models.edu_modules import EduModule
from sqlalchemy import Column, String, ForeignKey, Integer
from sqlalchemy.orm import relationship
import json


class Course(BaseNode, Base):
    """
    Defines a Course object
    """
    __tablename__ = 'courses'
    name = Column(String(100), nullable=True)
    description = Column(String(1000), nullable=True)
    module = Column(String(64), nullable=False)
    requirements = Column(String(1000), nullable=True, default='[]')
    template = Column(String(64), nullable=True)
    school = Column(String(64), nullable=True)
    level = Column(Integer, nullable=True, default=0)
    answer = Column(String(100000), nullable=True, default='{}')
