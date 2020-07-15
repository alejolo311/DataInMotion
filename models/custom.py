#!/usr/bin/python3
"""
Defines a custom node model
"""

from hashlib import sha1
import hmac
import random
import re
import traceback
import codecs
import time
from urllib.parse import quote
import base64
import os
import models
from models.base import BaseNode, Base
from sqlalchemy import Column, String, Integer, ForeignKey
import json
import requests
from models.auth import Auth
from models.whatsapp_web import WebWhastapp
from inspect import currentframe as ctf
from inspect import getframeinfo as gfi

auth = Auth()


class CustomNode(BaseNode, Base):
    """
    This model stores the needed data for the nodes
    """
    __tablename__ = 'custom_nodes'
    user_id = Column(String(60), ForeignKey('users.id'), nullable=False)
    name = Column(String(60))
    work_type = Column(String(20), default='request')
    api_url = Column(String(500), default='')
    api_endpoint = Column(String(100), default='')
    string = Column(String(1000))
    headers = Column(String(500), default='{}')
    innodes = Column(String(2000), default='[]')
    data = Column(String(2000), default='{}')
    outnodes = Column(String(2000), default='[]')
    analisis_mode = Column(String(20), default='JSON')
    analisis_params = Column(String(100000), default='[]')
    trigger = Column(String(5))
    timeout = Column(Integer, default=0)
    inner_connections = Column(String(2000), default='')
    color = Column(String(16), default='#9bfa18')
    board_id = Column(String(60), default='')

    def __init__(self, *args, **kwargs):
        """
        initializes a new CustomNode
        """
        super().__init__(*args, **kwargs)

    def __str__(self):
        """
        CustomNode string representation
        """
        return json.dumps(self.__dict__)

    def set_caller_node(self, caller_id):
        """
        Set the id for the inception node
        """
        self.inner_connections = caller_id

    def write_status(self, status, message):
        """
        Write the running status to the running file
        """
        test_file = {'messages': []}
        try:
            with open('./api/running/{}.test'
                      .format(self.inner_connections), 'r') as test:
                test_file = json.loads(test.read())
        except Exception as e:
            print(e)
        with open('./api/running/{}.test'
                  .format(self.inner_connections), 'w') as test:
            test_file['node_id'] = str(self.id)
            test_file['status'] = status
            test_file['messages'].append(message)
            test.write(json.dumps(test_file))

    def run_node_task(self, caller_data, logger, inception):
        """
        This function is a recursion to run a work flow and collect
        all the data fetched and proccessed by this flow
        @caller_data: this tuple contains in [0] the data retrieved
        by the previous node and in [1] contains a dict with the
        collected data from the previous nodeS
        Three to four steps are runned:
        - first: data is collected by running the innodes tasks
        - second: if the node is request, the data is fetched by the
        parameters setted in the node
        - third: for all the nodes, the data collected until now is
        procesed depending on the node configuration
        - fourth: the collected data is passed to the outnodes
        and collected again by each outnode iteration
        """
        self.set_caller_node(inception)
        self.write_status('running_node', 'Running: {}'.format(self.name))
        logger.log(self.name, 'Running task')
        acc_data = {self.name: {'acc-params': {},
                                'acc-data': {},
                                'acc-json': {}}}
        if 'acc-params' in caller_data[1].keys():
            for key in caller_data[1]['acc-params'].keys():
                c = 'acc-params'
                acc_data[self.name][c][key] = caller_data[1][c][key]
        if 'acc-data' in caller_data[1].keys():
            for key in caller_data[1]['acc-data'].keys():
                c = 'acc-data'
                acc_data[self.name][c][key] = caller_data[1][c][key]
        if 'acc-json' in caller_data[1]:
            for key in caller_data[1]['acc-json'].keys():
                c = 'acc-json'
                acc_data[self.name][c][key] = caller_data[1][c][key]
        if type(caller_data[0]) == dict:
            for key in caller_data[0].keys():
                acc_data[self.name]['acc-data'][key] = caller_data[0][key]
        else:
            acc_data[self.name]['acc-data']['content'] = caller_data[0]
        params = acc_data.copy()
        self.logger = logger
        # print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        # print('\t\tRun', self.name, 'task\nParams:\n', params)
        # print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        data = caller_data[0]
        json_log = {}
        complete = None
        tmp_data = None
        time = ''  # tag for the nounce generated values
        rand = ''
        #
        # Innodes Section
        #
        # Executes the innodes attached to this node
        # and collect the retrieved data in acc_data and in_data
        in_data = []
        if type(params) == dict:
            for dt in params.keys():
                in_data.append(params[dt])
        if len(json.loads(self.innodes)) > 0:
            logger.log(self.name, 'Checking innodes')
            innodes = json.loads(self.innodes)
            node = models.storage.get(CustomNode, innodes[0])
            print('Innode conection')
            print(self.name, '->', node.name)
            print('acc_params', acc_data[self.name]['acc-params'].keys())
            print('acc_data', acc_data[self.name]['acc-data'].keys())
            print('acc_json', acc_data[self.name]['acc-json'].keys())
            data, json_log = node.run_node_task((data,
                                                 acc_data[self.name]),
                                                logger, self.inner_connections)
            if type(data) == dict:
                for key in data:
                    print(self.name,
                          'appending ->',
                          key,
                          '<- from ',
                          node.name,
                          'output')
                    acc_data[self.name]['acc-data'][key] = data[key]
            in_data.append(data)
        #
        # Request section
        #
        # Handles the request if the worker is request
        # take in count the headers
        # and the behavior give by the innodes-data response
        if self.work_type == 'request':
            pars = {}
            for key in params.keys():
                for k in params[key]['acc-data'].keys():
                    pars[k] = params[key]['acc-data'][k]
                for k in params[key]['acc-json'].keys():
                    pars[k] = params[key]['acc-json'][k]
                for k in params[key]['acc-params'].keys():
                    pars[k] = params[key]['acc-params'][k]
            tmp_url = self.api_url
            # Cheking if the url comes from the caller node
            # and set it to this node
            if self.api_url == 'input':
                url_parts = None
                if ('string' in pars.keys() and 'http' in pars['string'][:8]):
                    url_parts = pars['string'].split('?')
                elif 'url' in pars.keys():
                    print(pars.keys())
                    print(pars['url'])
                    url_parts = pars['url'].split('?')
                if url_parts:
                    self.api_url = 'GET ' + url_parts[0]
                    dt = {}
                    if len(url_parts) > 1:
                        for parm in url_parts[1].split('&'):
                            dt[parm.split('=')[0]] = parm.split('=')[1]
                    self.data = json.dumps(dt)
                    self.save()
            # ----------------------------------------------
            # Setting up the INIT command for the twitter upload
            if self.analisis_mode == 'media_twitter':
                print(self.name, pars.keys())
                for key in data:
                    pars[key] = data[key]
                if 'raw' not in pars.keys():
                    return {'result': False}, json_log
                da = base64.decodestring(pars['raw'].encode('utf-8'))
                upload_data = {}
                upload_data['command'] = "INIT"
                upload_data['total_bytes'] = str(len(da))
                content_type = None
                for head in pars['headers'].keys():
                    if head.lower() == 'content-type':
                        content_type = pars['headers'][head]
                upload_data['media_type'] = content_type
                self.data = json.dumps(upload_data)
                self.save()
            # --------------------------------------------------
            logger.log(self.name, 'Request mode')
            headers = {}
            tmp_headers = self.headers
            tmp_data = self.data
            need_auth = False
            for head in json.loads(self.headers):
                if 'auth' in head:
                    need_auth = True
                    break
            # Generating the pars collected data
            pars = {}
            for key in acc_data.keys():
                for k in acc_data[key]['acc-data'].keys():
                    pars[k] = acc_data[key]['acc-data'][k]
                for k in acc_data[key]['acc-json'].keys():
                    pars[k] = acc_data[key]['acc-json'][k]
                for k in acc_data[key]['acc-params'].keys():
                    pars[k] = acc_data[key]['acc-params'][k]
            # Adding the values from data
            if type(data) == dict:
                print(self.name, data.keys())
                for key in data:
                    pars[key] = data[key]
            else:
                # if the data is an string add it
                # with the key content to pars
                print(data)
                pars['content'] = str(data)
            print(pars.keys())
            print(self.name, self.data)
            for key in pars.keys():
                patt = '*{}*'.format(key)
                if patt in self.data:
                    if type(pars[key]) == str:
                        print(self.name, 'replacing', patt, 'for', pars[key])
                        print(self.data)
                        self.data = self.data.replace(
                            patt, pars[key].replace('\n', ' '))
            print(self.name, self.data)
            if need_auth:
                heads = {}
                heads['data'] = json.loads(self.headers)
                # generating the oauth nonce and timestamp
                for h in heads['data'].keys():
                    if heads['data'][h] == 'random':
                        heads['data'][h] = auth.gen_nonce()
                    elif heads['data'][h] == 'time':
                        heads['data'][h] = auth.get_time()
                # --------------------------------------
                # Removing discuss
                # ---------------------------------------
                t = 'Replacing ' + ' in '
                logger.log(self.name, t)
                dat = self.data
                print(self.name, 'replacing', dat)
                dat = json.loads(dat.encode('utf-8'))
                self.data = json.dumps(dat)
                heads['url'] = self.api_url
                self.save()
                # ---------------------------------------
                # Remove no auth keys in headers
                hs = heads['data'].copy()
                keys = heads['data'].keys()
                for key in keys:
                    if 'auth' not in key:
                        del hs[key]
                # ------------------------------
                # Adding the data to send to the headers
                heads['data'] = hs.copy()
                if type(dat) == dict:
                    for key in dat:
                        heads['data'][key] = dat[key]
                # ------------------------------
                # Checking if the url is complete
                if len(heads['url'].split(' ')) > 1:
                    method, url = heads['url'].split(' ')
                else:
                    method = 'GET'
                    url = heads['url']
                    self.api_url = '{} {}'.format(method, self.api_url)
                # --------------------------------
                # Extract the signature keys from headers
                try:
                    sk = 'Signature_keys'
                    keys = json.loads(json.loads(tmp_headers)[sk])
                except Exception as e:
                    print(e)
                # ------------------
                # Generating the oauth signature
                signature = auth.gen_sig(keys['key1'],
                                         keys['key2'],
                                         heads['data'],
                                         url,
                                         method)
                heads['data']['oauth_signature'] = signature
                hs = {}
                h = heads['data'].copy()
                for key in dat:
                    if key in heads['data'].keys():
                        del h[key]
                heads['data'] = h.copy()
                # generating the Auth headers and store them in hs
                hs['Authorization'] = auth.gen_header(heads['data'])
                for key in json.loads(tmp_headers).keys():
                    if 'auth' not in key:
                        hs[key] = json.loads(tmp_headers)[key]
                if 'Signature_keys' in hs:
                    del hs['Signature_keys']
                self.headers = json.dumps(hs)
            data, json_log = self.request(json.loads(self.data))
            if type(data) == dict:
                for key in data:
                    print(self.name, 'saving', key, 'in Data')
                    acc_data[self.name]['acc-data'][key] = data[key]
            # Restore the change data to the original state
            self.headers = tmp_headers
            self.data = tmp_data
            self.api_url = tmp_url
            self.save()
            # End of request auth processing -----------------
            # ----------all this section should be moved to a single function
        #
        # Sender Data Section
        #
        if self.work_type == 'sender':
            pars = {}
            for key in params.keys():
                for k in params[key]['acc-json'].keys():
                    pars[k] = params[key]['acc-json'][k]
                for k in params[key]['acc-params'].keys():
                    pars[k] = params[key]['acc-params'][k]
                for k in params[key]['acc-data'].keys():
                    pars[k] = params[key]['acc-data'][k]
            try:
                data = self.web_whatsapp(pars)
            except Exception as e:
                print(e)
                data = {'error': str(e)}
                pass
            # data = self.send_message(pars)
        #
        # Proccess Data Section
        #
        # determines action depending on the work_type
        # and also the analisis mode
        # when the node is both Request and has an analisis_mode setted
        # the data to be processed is stored with the key "request_data" to be
        # proccesed by processResponse() function and then
        # removed from the pars
        # When analisis_mode is media_player
        #     a value with the key "raw" or "url" is stored
        #     in the json_log for this node
        # After Processing the json_log for the node is stored
        # depending on the type of the responsed data
        try:
            pars = {}
            for key in params.keys():
                for k in params[key]['acc-json'].keys():
                    pars[k] = params[key]['acc-json'][k]
                for k in params[key]['acc-params'].keys():
                    pars[k] = params[key]['acc-params'][k]
                for k in params[key]['acc-data'].keys():
                    pars[k] = params[key]['acc-data'][k]
            if self.analisis_mode == 'media_twitter':
                logger.log(self.name, 'Upload data to Twitter')
                data = self.upload_media_twitter(pars)
            else:
                logger.log(self.name, 'Proccess mode ' + self.analisis_mode)
                print(self.name, params.keys())
                if self.analisis_mode == 'media_player':
                    if 'url' in pars.keys():
                        json_log['url'] = pars['url']
                    elif 'raw' in pars.keys():
                        json_log['raw'] = pars['raw']
                elif self.analisis_mode == 'replace':
                    data = self.processResponse(pars)
                elif self.analisis_mode and self.analisis_mode != '':
                    if self.analisis_mode != 'none':
                        print(self.name, self.analisis_mode)
                        if self.work_type == 'request':
                            pars['request_data'] = data
                        data = self.processResponse(pars)
                        if self.work_type == 'request':
                            del pars['request_data']
                else:
                    print(self.name,
                          'request response no processed',
                          data.keys())
        except Exception as e:
            traceback.print_exc()
        if self.analisis_mode == 'comparision':
            print('{:<80}'.format(json.dumps(data)[:200]))
        if self.work_type == 'request':
            logger.log(self.name, str(type(data)))
            index = 0
            try:
                for key in data.keys():
                    json_log[key] = data[key]
            except Exception as e:
                traceback.print_exc()
                json_log = data
            if self.analisis_params == '[]':
                if type(json_log) == list:
                    logger.json_log[self.name] = json_log.copy()
                else:
                    logger.json_log[self.name] = json_log
            else:
                logger.json_log[self.name] = data.copy()
        else:
            logger.json_log[self.name] = data
        ####
        # OutNodes Section
        ####
        # ==================================
        # Now ask if this node has outnodes execute them
        # collect all data from the flow in the object pars
        # then exectue one by one the outnodes and collect the data from them
        if len(json.loads(self.outnodes)) > 0 and len(data) > 0:
            if self.analisis_mode == 'comparision':
                try:
                    if data['result'] is False:
                        return data, json_log
                    else:
                        print('comparision true')
                except Exception as e:
                    print(e)
            outnodes = json.loads(self.outnodes)
            for da in in_data:
                if type(da) == str:
                    acc_data[self.name]['acc-data']['content'] = da
            if type(json_log) == dict:
                for key in json_log.keys():
                    acc_data[self.name]['acc-json'][key] = json_log[key]
            if type(data) == dict:
                for key in data.keys():
                    acc_data[self.name]['acc-data'][key] = data[key]
            else:
                acc_data[self.name]['acc-data']['string'] = data
            # Outnode Cycle
            for nod in outnodes:
                node = models.storage.get(CustomNode, nod)
                comp = None
                if node.analisis_mode == 'comparision':
                    comp, comp2 = node.run_node_task((
                        data,
                        acc_data[self.name]),
                        logger, self.inner_connections)
                    # print('comparission result type', type(comp))
                    if 'result' in comp.keys():
                        if comp['result'] is False:
                            pass
                else:
                    print('Outnode')
                    print(self.name, '->', node.name)
                    print(acc_data[self.name]['acc-data'].keys())
                    print(acc_data[self.name]['acc-json'].keys())
                    print(acc_data[self.name]['acc-params'].keys())
                    comp, comp2 = node.run_node_task((
                        data,
                        acc_data[self.name]),
                        logger, self.inner_connections)
                if type(comp) == dict:
                    if 'result' in comp.keys():
                        if comp['result'] is False:
                            pass
                    print(node.name,
                          'outnode run result',
                          json.dumps(comp)[:50])
                    co = comp.copy()
                    for key in co.keys():
                        print(node.name, key)
                        acc_data[self.name]['acc-params'][key] = co[key]
            # Outnodes cycle end
            if type(json_log) == dict:
                print(self.name, json_log.keys())
        return data, json_log

    def web_whatsapp(self, outData):
        """
        Use selenium to send the QR code and then the messages
        """
        if 'content' in outData.keys():
            message = outData['content']
        else:
            return {'error_{}'.format(self.name): 'message content not found'}
        web = WebWhastapp(self.id, outData)
        admin = json.loads(self.data)['admin']
        gif = json.loads(self.data)['gif']
        data = outData['contacts_list']
        number_list = [num for num in data.keys()]

        web.start_browser()
        web.number = admin
        if not web.auth():
            return {
                'error': 'QRCode not found, may be the connection is loose'
            }
        self.write_status('verifying', 'Waiting for user to scan the code')
        web.send_twilio_message(admin, 'Message to send: {}'.format(message))
        pos = 0
        for contact in number_list:
            web.search_contact(contact)
            if pos == 0:
                self.write_status(
                    'sending', 'Sending message to {}'.format(contact))
                pos += 1
            print(gif)
            if gif != '':
                web.send_animated_gif(gif, self, select_random=False)
            web.send_whatsapp_message(message)
            self.write_status('sent', 'Message sent to {}'.format(contact))
        web.close()
        return {}

    def send_message(self, outData):
        """
        parse the data in self and in out data and use that to send
        whatsapp mesagges
        """
        headers = json.loads(self.headers)
        data = json.loads(self.data)
        content = data["message"]
        content = self.parse_string(content, outData)
        from twilio.rest import Client
        account_sid = headers["account_ssid"]
        auth_token = headers["auth_token"]
        wppStatus = {}
        client = Client(account_sid, auth_token)
        number_list = json.loads(data["numbers_list"])
        # content = '{}\n{}'.format(content, outData['url'])
        for number in number_list:
            if 'url' in outData.keys():
                media_message = client.messages.create(
                    from_='whatsapp:+' + str(data['from']),
                    to='whatsapp:+' + str(number),
                    media_url=[outData['url']]
                )
            message = client.messages.create(
                body=content,
                from_='whatsapp:+' + str(data['from']),
                to='whatsapp:+' + str(number),
            )
            wppStatus[number] = {}
            wppStatus[number]['status'] = message.status
            wppStatus[number]['media'] = 'https://api.twilio.com' +\
                                         message.subresource_uris['media']
            wppStatus[number]['error'] = str(message.error_code) +\
                ' , ' + str(message.error_message)
        return wppStatus

    def request(self, data):
        """
        Makes a request depending on the node data, headers, and method
        """
        if len(self.api_url) <= 0:
            # print('No URL defined')
            return (None, None)
        url_complete = self.api_url.split(' ')
        protocol, url = None, None
        if len(url_complete) > 1:
            protocol, url = url_complete[0], url_complete[1]
        else:
            protocol = 'GET'
            url = url_complete[0]
        print(self.name, protocol, url)
        headers = {}
        rp, response = None, None
        if self.headers != '{}':
            headers = json.loads(self.headers)
            # # print(headers)
        # print(headers, type(headers), '\n',
        #    protocol, url, '\n', data, type(data))
        self.logger.log(self.name, 'Request parameters:')
        self.logger.log(self.name, self.api_url)
        self.logger.log(self.name,
                        json.dumps(json.loads(self.headers),
                                   indent=2)[:200])
        self.logger.log(self.name,
                        json.dumps(json.loads(self.data),
                                   indent=2)[:200])
        self.write_status('running_node',
                          '{} (Request):<br>{}'.format(self.name, url))
        try:
            if protocol == 'GET':
                response = requests.get(url, params=data, headers=headers)
            elif protocol == 'POST':
                response = requests.post(url, params=data, headers=headers)
        except Exception as e:
            print('\033[31mRequest Error\033[0m', e)
            return {'error': str(e)}, {'error': str(e)}
        if response.status_code >= 200 and response.status_code < 300:
            try:
                # print(self.name, json.dumps(response.json(), indent=2))
                rp = response.json()
            except Exception as e:
                # print(e)
                rp = response.content
        else:
            rp = response
            try:
                rp = {'error': rp.reason,
                      'message': rp.json()['errors'][0]['message'],
                      'code': rp.status_code}
            except Exception as e:
                # pri(e)
                rp = {'error': rp.reason,
                      'message': str(rp.content),
                      'code': rp.status_code}
        if 'Content-Type' in response.headers.keys():
            ct = response.headers['Content-Type']
            if type(rp) == bytes and ct.split(';')[0] != 'text/html':
                bytes_content = base64.b64encode(rp)
                rp = dict()
                rp['raw'] = bytes_content.decode('utf-8')
            elif ct.split(';')[0] == 'text/html' and type(rp) == bytes:
                content = rp
                rp = dict()
                rp['html-content'] = content.decode('utf-8')
            if type(rp) == dict:
                rp['headers'] = dict(response.headers)
        # print(type(rp))
        return rp, rp

    def processResponse(self, response):
        """
        Process the received result from request to
        the formated output fields defined by
        analisis_mode: scrapping, parse json
        analisis_params: {key:, stop_val:, path}
        """
        resp = {}
        if type(self.analisis_params) != dict:
            params = json.loads(self.analisis_params)
        else:
            params = self.analisis_params
        #
        # Analisis mode Comparision
        #
        if self.analisis_mode == 'comparision':
            self.logger.log(self.name, 'Comparission mode')
            self.logger.log(self.name, 'Cheking analisis_params\n')
            self.logger.log(self.name, json.dumps(params))
            print(self.name, response.keys())
            cond = None
            val1 = None
            val2 = None
            for par in params:
                if par is None:
                    continue
                if 'key' in par:
                    val1 = par['key']
                if 'comp' in par:
                    val2 = par['comp']
                if 'cond' in par:
                    cond = par['cond']
            self.logger.log(self.name, '{} {} {}'.format(val1, val2, cond))
            self.logger.log(self.name, 'val1 type {}'.format(type(val1)))
            val1 = response[val1]
            self.logger.log(self.name,
                            'Comparision Object type\n{}'.format(type(val1)))
            self.logger.log(self.name, '{}'.format(val1))
            index = None
            occurr = []
            res = False
            if type(val1) == dict:
                lis = json.dumps(list(val1.keys()))
                res = eval('"{}" {} {}'.format(val2, cond, lis))
            elif type(val1) == list:
                for el in val1:
                    if val2.lower() in json.dumps(el).lower():
                        res = True
                        self.logger.log(self.name, 'found ocurrence')
                        self.logger.log(self.name, json.dumps(el, indent=2))
                        occurr.append(el)
            if val1 and type(val1) != dict and type(val1) != list:
                if cond == 'in':
                    res = eval('"{}" {} "{}"'.format(val2, cond, val1))
                    occurr = val1
                else:
                    res = eval(val1 + ' ' + cond + ' ' + val2)
            self.logger.log(self.name, json.dumps([res, occurr]))
            return {'result': res, 'occurrences': occurr}
        #
        # Analisis mode HTML
        #
        if self.analisis_mode == 'HTML':
            # Procesing the data when analisis_node is HTML
            # first process the html to remove bad spacing
            # then use the analisis_params to detect
            # occurrences in the html
            print(self.name,
                  'html-content in response',
                  'html-content' in response.keys())
            if 'html-content' in response.keys():
                for conf in params:
                    # Extracting wildcards and replacing
                    # them in the conf occurrences
                    conf['occurrence'] = conf['occurrence'].replace('*', '===')
                    f = '==='
                    occ = conf['occurrence']
                    wildcards_index = [m.start() for m in re.finditer(f, occ)]
                    wildcards = []
                    print(conf['occurrence'], wildcards_index)
                    for i in range(0, len(wildcards_index), 2):
                        start = wildcards_index[i] + len('===')
                        buffer = ''
                        while start < len('occurrence'):
                            char = conf['occurrence'][start]
                            end = conf['occurrence'][start:start + len('===')]
                            if end != '===':
                                buffer += char
                            else:
                                break
                            start += 1
                        wildcards.append(buffer)
                    for wild in wildcards:
                        if '==={}==='.format(wild) in conf['occurrence']:
                            if wild in response.keys():
                                occ = conf['occurrence']
                                f = '==={}==='.format(wild)
                                w = response[wild]
                                occ = occ['occurrence'].replace(f, w)
                                conf['occurrence'] = occ
                    # Finish wildcards extraction
                    print('wildcards', wildcards)
                    print(conf['occurrence'])
                    print(self.name, type(conf))
                    if type(conf) == str:
                        print(self.name, json.loads(conf))
                        conf = json.loads(conf)
                    else:
                        print(self.name, conf)
                    occurrences = []
                    tmp = response['html-content']
                    tmp = tmp.replace('  ', '')
                    tmp = tmp.replace('><', '> <')
                    tmp = tmp.replace('\n', ' ')
                    tmp = tmp.replace('  ', '')
                    tmp = tmp.replace('><', '> <')
                    occ = conf['occurrence']
                    indexes = [m.start() for m in re.finditer(occ, tmp)]
                    print(self.name, 'Occurrences indexes', indexes)
                    for index in indexes:
                        start = index + len(conf['occurrence'])
                        buffer = ''
                        while True:
                            if start >= len(tmp):
                                break
                            char = tmp[start]
                            end = tmp[start:start + len(conf['stop'])]
                            # print(self.name, 'checking end', end)
                            if end != conf['stop']:
                                buffer += char
                                start += 1
                            else:
                                break
                        if buffer != '':
                            occurrences.append(buffer)
                    if len(occurrences) > 0:
                        return {'occurrences': occurrences}
                    return response
        #
        # Analisis mode Statistics
        #
        if self.analisis_mode == 'statistics':
            statistics = json.loads(self.analisis_params)
            samples, params = statistics[0]['samples'], \
                statistics[0]['parameters']
            print(self.name, 'Checking Statistics params')
            print('Samples\n', samples)
            print('Parameters\n', params)
            try:
                results = {}
                print(response.keys())
                average = 0
                for sample in samples.keys():
                    try:
                        samp = int(sample)
                        average += samp
                    except Exception as e:
                        average += int(response[sample])
                        pass
                results['sample'] = average / len(samples.keys())
                results['scores'] = {}
                for param in params.keys():
                    print(response[param])
                    # apply simple three rule
                    # pop -> population
                    # percent = (pop * 100%) / sample
                    sample = results['sample']
                    pop = int(response[param])
                    percent = (pop * 100) / sample
                    results['scores'][param] = {}
                    results['scores'][param]['value'] = \
                        '{:.2f}'.format(percent)
                    sign = '+'
                    if sample > pop:
                        sign = '-'
                    results['scores'][param]['diff'] = \
                        '{}{:.2f}'.format(sign, 100 - percent)
                    int_dif = sample - pop
                    results['scores'][param]['int_diff'] = \
                        '{}'.format(int(int_dif))
                print(results)
                return results
            except Exception as e:
                print('Failed: ', e)
                pass
        ######
        #
        # Contacts_list mode
        #
        #####
        if self.analisis_mode == 'contacts_list':
            return {'contacts_list': json.loads(self.data)}
        if params and len(params) > 0 and self.analisis_mode == 'JSON':
            ######
            #
            # JSON  value Extraction
            #
            #######
            # obj must be set as response object
            if self.work_type == 'request':
                response = response['request_data']
            print('Json proccess')
            # Extracting the data using the path setted in the
            # analisis_params
            for param in params:
                if param is None:
                    continue
                print(self.name, 'Extracting value from', param['path'])
                paths = param['path'].split('/')
                obj = response.copy()
                last = len(paths) - 1
                for i, path in enumerate(paths):
                    index = None
                    try:
                        index = int(path)
                        obj = obj[index]
                    except Exception as e:
                        print(self.name, ':', e)
                        if type(obj) == dict and path in obj.keys():
                            obj = obj[path]
                        elif path == 'random' and type(obj) == list:
                            print(self.name, 'choose random value')
                            le = len(obj) - 1
                            if le > 0:
                                pos = random.randint(0, le)
                                obj = obj[pos]
                                print(self.name, str(obj)[:50])
                    try:
                        print(path.encode('utf-8'))
                        print(obj.encode('utf-8'))
                    except Exception as e:
                        print(e)
                if last == i:
                    if obj is not None:
                        resp[param['key']] = obj
            # ------------------------------------------------------
            if self.analisis_mode == 'get_updates':
                # Checks a list or a dict
                # and determines whatever is a new record in the data
                obj = resp[param['key']]
                count = json.loads(self.data)['count']
                t = param['key'] + ' length is ' + str(len(obj))
                self.logger.log(self.name, t)
                if len(obj) > int(count):
                    # print('there is a new record')
                    # print(obj[len(obj) - 1])
                    # TODO
                    # set the counter to the new value
                    data = json.loads(self.data)
                    data['count'] = int(len(obj)) - 1
                    self.data = json.dumps(data)
                    self.save()
                    return obj[len(obj) - 1]
                else:
                    return {}
            if self.work_type == 'request':
                frameinfo = gfi(ctf())
                if len(resp) < 1:
                    return {}
            return resp
        else:
            if self.analisis_mode == 'replace':
                parsed = self.parse_string(self.string, response)
                return parsed
            return response

    def check_status(self, processing_info, data):
        """
        Check the status of the uploaded media
        if success return the obtained data
        if state is not defined
        run again recursively
        """
        if processing_info is None:
            return data
        state = processing_info['state']
        if state == u'failed':
            self.logger.log(self.name, str(state))
            return data
        if state == u'succeeded':
            return data
        cas = processing_info['check_after_secs']
        time.sleep(cas)
        ds = {}
        ds['command'] = 'STATUS'
        ds['media_id'] = data['media_id']
        headers = json.loads(self.headers)
        headers['oauth_nonce'] = auth.gen_nonce()
        headers['oauth_timestamp'] = auth.get_time()
        keys = json.loads(headers['Signature_keys'])
        del headers['Signature_keys']
        method, url = self.api_url.split(' ')
        method = 'GET'
        for key in ds:
            headers[key] = ds[key]
        signature = auth.gen_sig(keys['key1'],
                                 keys['key2'],
                                 headers,
                                 url,
                                 method)
        for key in ds:
            del headers[key]
        headers['oauth_signature'] = signature
        newHeaders = {}
        newHeaders['Authorization'] = auth.gen_header(headers)
        res = requests.get(url, headers=newHeaders, params=ds)
        processing_info = res.json().get('processing_info', None)
        self.check_status(processing_info)

    def upload_media_twitter(self, data):
        """
        Uploads media data to Twitter
        send APPEND command to POST media/upload
        with the chunked data
        at the end send the FINALIZE command an waits
        for a success response
        """
        sent_bytes = 0
        segment = 0
        dt = base64.decodestring(data['raw'].encode('utf-8'))
        while sent_bytes < len(dt):
            chunk = dt[sent_bytes:sent_bytes + (1000000)]
            ds = {}
            ds['command'] = 'APPEND'
            ds['media_id'] = data['media_id']
            ds['segment_index'] = segment
            files = {}
            files['media'] = chunk
            headers = json.loads(self.headers)
            headers['oauth_nonce'] = auth.gen_nonce()
            headers['oauth_timestamp'] = auth.get_time()
            keys = json.loads(headers['Signature_keys'])
            del headers['Signature_keys']
            method, url = self.api_url.split(' ')
            # pri(url, method)
            for key in ds:
                headers[key] = ds[key]
            signature = auth.gen_sig(keys['key1'],
                                     keys['key2'],
                                     headers,
                                     url,
                                     method)
            for key in ds:
                del headers[key]
            headers['oauth_signature'] = signature
            newHeaders = {}
            newHeaders['Authorization'] = auth.gen_header(headers)
            self.logger.log(self.name, json.dumps(newHeaders, indent=2))
            self.logger.log(self.name, json.dumps(ds, indent=2))
            res = requests.post(url,
                                headers=newHeaders,
                                params=ds,
                                files=files)
            if res.status_code < 200 or res.status_code > 299:
                self.logger.log(self.name, 'error: ' + str(res.reason))
            print(len(chunk))
            sent_bytes += len(chunk)
            print(sent_bytes)
            self.logger.log(self.name,
                            'Append: ({}/{}) {}'.format(sent_bytes,
                                                        len(dt),
                                                        res.status_code))
            self.logger.log(self.name, str(res.content))
            segment += 1
        ds = {}
        ds['command'] = 'FINALIZE'
        ds['media_id'] = data['media_id']
        headers = json.loads(self.headers)
        headers['oauth_nonce'] = auth.gen_nonce()
        headers['oauth_timestamp'] = auth.get_time()
        keys = json.loads(headers['Signature_keys'])
        del headers['Signature_keys']
        method, url = self.api_url.split(' ')
        for key in ds:
            headers[key] = ds[key]
        signature = auth.gen_sig(keys['key1'],
                                 keys['key2'],
                                 headers,
                                 url,
                                 method)
        for key in ds:
            del headers[key]
        headers['oauth_signature'] = signature
        newHeaders = {}
        newHeaders['Authorization'] = auth.gen_header(headers)
        self.logger.log(self.name, json.dumps(newHeaders, indent=2))
        self.logger.log(self.name, json.dumps(ds, indent=2))
        res = requests.post(url, headers=newHeaders, params=ds)
        if res.status_code < 200 or res.status_code > 299:
            self.logger.log(self.name, 'error: ' + str(res.reason))
            self.logger.log(self.name, 'error: ' + json.dumps(res.json()))
            data['raw'] = data['raw']
        if 'processing_info' in res.json().keys():
            self.check_status(res.json().get('processing_info', None), data)
        else:
            print(res.json())
            return res.json()

    def colors(self):
        """
        returns a list of color
        """
        return ['#f32e9c', '#932989', '#9bfa18', '#ef912f', '#f9463a']

    def parse_data(self, params):
        """
        Parse the params to take the extends the data object
        """
        data = json.loads(self.data)
        if type(params) == dict:
            for key in params.keys():
                data[key] = params[key]
        return data  # add also the incoming params

    def parse_string(self, format_string, data):
        """
        Search patterns and replace values in the string
        """
        print(self.name, 'replacing string')
        keys = ['{' + k + '}' for k in data.keys()]
        resp = format_string
        for i, k in enumerate(keys):
            print(self.name, 'parse_string: ', k, str(data[k[1:-1]])[:50])
            conds = [k in resp and (type(data[k[1:-1]]) == str)]
            conds.append(type(data[k[1:-1]]) == int)
            conds.append(type(data[k[1:-1]]) == float)
            if conds[0] or conds[1] or conds[2]:
                resp = resp.replace(str(k), str(data[k[1:-1]]))
        return resp

    def parse_endpoint(self):
        """
        Search patterns and replace values in the endpoint
        """
        keys = ['{' + k + '}' for k in self.parse_data({}).keys()]
        resp = self.api_endpoint
        for k in keys:
            resp = resp.replace(k, self.parse_data({})[k[1:-1]])
        return resp
