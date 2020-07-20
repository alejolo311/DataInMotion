#!/usr/bin/python3
"""
Sets the header t a mp4 file to math whatsapp requirements
"""

import struct

def get_moov_pos(video):
    """
    Get the position for the moov atom
    """
    count = 0
    while count < len(video):
        chunk = video[count:count + 4]
        if chunk == b'moov':
            return count
        count += 4

def get_stco_pos(video):
    """
    Get the position for the moov atom
    """
    count = 0
    return count + video.find(b'stco')

def set_header(video=None, filename='new_video', vd_format='mp4'):
    new_video = b''
    video_str = None
    wpp_header = b'\x00\x00\x00\x1cftypmp4v\x00\x00\x00\x00mp4vmp42isom\x00\x00\x00\x18beam\x01\x00\x00\x00\x01\x00\x00\x00\x00\x00\x00\x00\x02\x00\x00\x00\x00\x00\x00\x0cloop\x00\x00\x00\x00'
    new_video += wpp_header
    if video:
        video_str = video
    else:
        with open(
            './api/running/media/{}.{}'.format(
                filename, vd_format), 'rb') as file_to:
            video_str = file_to.read()
            print('original size', len(video_str))
    # print(video_str[:2000])
    moov = get_moov_pos(video_str) - 4
    print(moov)
    stco = get_stco_pos(video_str)

    stco_size = struct.unpack('!L', video_str[stco - 4:stco])[0]

    # stco_size = int(video_str[stco - 4:stco], 2)
    print(video_str[stco - 4:stco])
    print(stco_size)
    add = True if len(wpp_header) > moov else False
    delta = len(wpp_header) - moov if len(wpp_header) > moov else moov - len(wpp_header)
    # print(delta)
    repeats = int((stco_size - 16) / 4)
    print(repeats)
    new_video += video_str[moov:stco + 12]
    # print(new_video)
    # print(new_video[700:1200])
    print(video_str[stco - 4: stco + stco_size - 4])
    count = stco + 12
    for i in range(repeats):
        last_val = struct.unpack('!L', video_str[count:count + 4])[0]
        # print(video_str[count:count + 4])
        if add:
            new_val = last_val + delta
        else:
            new_val = last_val - delta
        print(video_str[count:count + 4])
        print('last', last_val)
        print('new', new_val)
        new_val = struct.pack('!L', new_val)
        # print(new_val)
        new_video += new_val
        count += 4
    new_video += video_str[count:]
    with open('./api/running/media/{}-edited.{}'.format(
            filename, vd_format), 'wb') as edited_file:
        edited_file.write(new_video)
        return '/usr/src/app/api/running/media/{}-edited.{}'.format(
            filename, vd_format)
