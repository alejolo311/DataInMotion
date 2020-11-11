#!/usr/bin/python3
"""
Defines a EduModule model
"""

from models.base import BaseNode, Base
import models
import traceback
from models.school import EduSchool
from datetime import datetime
from models.custom import CustomNode
from models.node_flow_test import instancedNode
from models.logger import Logger
from sqlalchemy import Column, String, ForeignKey, Integer
from sqlalchemy.orm import relationship
import json
import uuid
import os


class EduModule(BaseNode, Base):
    """
    Defines an Educational Module object
    """
    __tablename__ = 'edu_modules'
    name = Column(String(80), nullable=True)
    description = Column(String(300), nullable=True)
    school = Column(String(64), ForeignKey('edu_schools.id', ondelete='CASCADE'), nullable=False)
