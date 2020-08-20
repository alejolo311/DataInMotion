#!/usr/bin/python3
"""
Media delivery route por nodes api
"""

import io
from api.v1.nodes import app_nodes
from flask import send_file


@app_nodes.route('/media/<gifname>')
def media(gifname):
    """
    Return a binary data object
    """
    path = './api/running/media/{}'.format(gifname)
    with open(path, 'rb') as byteFile:
        return send_file(
            io.BytesIO(byteFile.read()),
            attachment_filename='media.mp4',
            mimetype='video/mp4'
        )