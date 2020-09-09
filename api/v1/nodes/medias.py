#!/usr/bin/python3
"""
Media delivery route por nodes api
"""

import io
from api.v1.nodes import app_nodes
from flask import send_file, make_response


@app_nodes.route('/media/<gifname>')
def media(gifname):
    """
    Return a binary data object
    """
    try:
        path = './api/running/media/{}'.format(gifname)
        with open(path, 'rb') as byteFile:
            resp = make_response(
                send_file(
                    io.BytesIO(byteFile.read()),
                    as_attachment=False,
                    attachment_filename='media.mp4',
                    mimetype='video/mp4'
                )
            )
            resp.headers['Accept-Ranges'] = 'bytes'
            return resp
    except:
        return 'Failed'