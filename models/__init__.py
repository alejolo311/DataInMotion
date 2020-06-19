#!/usr/bin/python3
"""
Initializes the models and ORM engine
"""

from models.engine.db_engine import DBEngine
storage = DBEngine()
storage.reload()
