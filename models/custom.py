#!/usr/bin/python3
"""
Defines a custom node model
"""

from hashlib import sha1
import hmac, random, codecs, time
from urllib.parse import quote
import base64
import os
import models
from models.base import BaseNode, Base
from sqlalchemy import Column, String, Integer, ForeignKey
import json
import requests
from models.auth import Auth

auth = Auth()

class CustomNode(BaseNode, Base):
    """
    This model stores the needed data for the nodes
    """
    __tablename__ = 'custom_nodes'
    user_id = Column(String(60), ForeignKey('users.id'), nullable=False)
    name = Column(String(60))
    work_type = Column(String(20), default='request') # Request or process
    api_url = Column(String(100), default='') # Format 'GET https://example.com
    api_endpoint = Column(String(100), default='') # Format 'users/{id}/nodes' this depends on self.data
    string = Column(String(200))
    headers = Column(String(500), default='{}') # Format { key1:value1, key2:value2 }
    innodes = Column(String(2000), default='[]') # Format [ id1, id2, id3 ]
    # Query data will store a JSON string
    data = Column(String(2000), default='{}') # Format { key1:value1, key2:value2 }
    outnodes = Column(String(2000), default='[]') # Format [ id1, id2, id3 ]
    analisis_mode = Column(String(20), default='JSON') # scrapping, JSON, comparision (for the triggers)
                                                       # work_type == process and analisis_mode == 'comparision'
                                                       # analisis_params format should be
                                                       # [{value1:, value2:, cond:}]
                                                       # and the Response will be Boolean True or false
    analisis_params = Column(String(2000), default='[]') # format [{ key: 'field', stop_val: '>' , path: ''}]
    trigger = Column(String(5)) # True or False
    timeout = Column(Integer, default=0)
    inner_connections = Column(String(2000), default='') # Format {outnodes}
    color = Column(String(16), default='#9bfa18') # Default node color
    # content = Column(String(16), default='', nullable=True) # this will store the inode request response



    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)


    def __str__(self):
        return json.dumps(self.__dict__)


    def request(self, data):
        """
        Makes a request using the model data and a 
        """
        print('------------------------------')
        print('\tRequest by', self.name)
        print('------------------------------')

        if len(self.api_url) <= 0:
            print('No URL defined')
            return (None, None)
        protocol, url = self.api_url.split(' ')
        headers = {}
        response = None
        url += self.parse_endpoint()
        if self.headers != '{}':
            headers = json.loads(self.headers)
            # print(headers)
        print(headers, type(headers), '\n', protocol, url, '\n', data, type(data))
        try:
            if protocol == 'GET':
                response = requests.get(url, params=data, headers=headers)
            elif protocol == 'POST':
                response = requests.post(url, params=data, headers=headers)
            print('\033[34m*************Response*********')
            #print('*{:<30}*'.format(str(response.content)))
            print('*{:<30}*'.format(str(response.json())))
            #print('*{:<30}*\033[0m'.format(str(response.reason)))
            print('*******************************\033[0m')
        except Exception as e:
            # print('An error has ocurred while requesting, maybe there are not internet connection')
            print('\033[31mRequest Error\033[0m', e)
        if response.status_code == 200:
            try:
                print(self.name, json.dumps(response.json(), indent=2))
                response = response.json()
            except Exception as e:
                print(e)
                response = response.content
        else:
            response = {'error': response.reason, 'message': response.json()['errors'][0]['message'], 'code': response.status_code}
        # print(response.json())
        # print(response.json())
        return response, response


    def processResponse(self, response):
        """
        Process the received result from request to the formated output fields defined by
        analisis_mode: scrapping, parse json
        analisis_params: {key:, stop_val:, path}
        """
        resp = {}
        # print(type(self.analisis_params) == dict)
        if type(self.analisis_params) != dict:
            params = json.loads(self.analisis_params)
        else:
            params = self.analisis_params
        print('\033[33mprocessing:\033[0m ', self.name)
        # print(self.analisis_mode)
        if self.analisis_mode == 'comparision':
            print('##  Comparission mode  ##')
            # print('processing input', params, response)
            cond = None
            val1 = None
            val2 = None
            for par in params:
                if 'value1' in par:
                    val1 = par['value1']
                if 'value2' in par:
                    val2 = par['value2']
                if 'cond' in par:
                    cond = par['cond']
            print(val1, cond, val2)
            res = eval(val1 + ' ' + cond + ' ' + val2)
            print(res)
            if res == None:
                return False
            return res
        if self.analisis_mode == 'gen_signature':
            print('==========Gen Signature=============')

            r  = response
            print(r)
            method, url = r['url'].split(' ')
            data = json.loads(self.data)
            sign = auth.gen_sig(data['key1'], data['key2'], r['data'], url, method)
            print(sign)
            print('====================================')
            return sign
        # this process extracts the data from the reponse object
        if len(params) > 0:
            for param in params:
                # print(json.dumps(param, indent=2))
                paths = param['path'].split('/')
                print('paths: ', paths)
                obj = response
                last = len(paths) - 1
                for i, path in enumerate(paths):
                    try:
                        index = int(path)
                        obj = obj[index]
                    except:
                        if path in obj:
                            obj = obj[path]
                    if last == i:
                        resp[param['key']] = obj
            if self.analisis_mode == 'replace':
                parsed = self.parse_string(self.api_endpoint, resp)
                print('\033[36mparsed string:\033[0m\n\t', parsed,)
                return parsed
            return resp
        else:
            return response


    def run_node_task(self, params):
        """
        If response is an empty dict, makes the request with the stored data,
        if the task is called from another node process it will use the data comming that node
        """
        print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        print('\t\tRun', self.name, 'task\nParams:\n', params)
        print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        data = {}
        inn_resp = {}
        complete = None
        rand = ''
        time = '' # tag for the nounce generated values
        if len(json.loads(self.innodes)) > 0:
            innodes = json.loads(self.innodes)
            node = models.storage.get(CustomNode, innodes[0])
            if node.analisis_mode == 'gen_signature':
                heads = {}
                heads['data'] = json.loads(self.headers)
                for h in heads['data'].keys():
                    if heads['data'][h] == 'random':
                        rand = h
                        heads['data'][h] = auth.gen_nonce()
                    elif heads['data'][h] == 'time':
                        time = h
                        heads['data'][h] = auth.get_time()
                heads['url'] = self.api_url
                self.data = json.dumps({'status': params})
                heads['data']['status'] = params
                print('incoming params to', node.name, '\n', heads)
                data, inn_resp = node.run_node_task(heads)
                headers = json.loads(self.headers)
                if rand in headers:
                    headers[rand] = heads['data'][rand]
                if time in headers:
                    headers[time] = heads['data'][time]
                headers['status'] = params
                headers['oauth_signature'] = data
                self.headers = json.dumps(headers)
                self.save()
            else:
                data, inn_resp = node.run_node_task(params)
            
            # print(data)
        # Handles the request if the worker is request
        # take in count the headers
        # and the behavior give by the innodes-data response
        if self.work_type == 'request':
            print('.......................')
            print('Request from', self.name)
            print('data:', data, '\nparams:', params)
            headers = {}
            tmp_headers = self.headers
            if self.analisis_mode == 'auth':
                headers['Authorization'] = auth.gen_header(json.loads(self.headers))
                print('headers: ', self.headers)
                print('___result_headers___')
                print(headers)
                self.headers = json.dumps(headers)
            print('.......................')
            data, inn_resp = self.request(self.parse_data(data))
            self.headers = tmp_headers
            # search signature an delete it from model, also restart nounce 'random' tag
            headers = json.loads(self.headers)
            if 'oauth_signature' in headers:
                del headers['oauth_signature']
            if rand in headers:
                headers[rand] = 'random'
            if time in headers:
                headers[time] = 'time'
            self.headers = json.dumps(headers)
            self.save()
            print(data)
        # Set this variable to be able to call multiple innodes
        # print('data before process\n\033[35m', data, complete, '\033[0m')
        # The data here is filtered by the analisis_params parameters
        if len(params) > 0:
            data = self.parse_data(params)
        data = self.processResponse(data)
        # ==================================
        # Now ask if this node has outnodes execute them
        # This needs a way to handle efectively the recursion
        # sucessive nodes are processed in queu system
        # the returned data for each node determines the flow
        if len(json.loads(self.outnodes)) > 0:
            outnodes = json.loads(self.outnodes)
            print(self.name, inn_resp)
            for nod in outnodes:
                node = models.storage.get(CustomNode, nod)
                if node.analisis_mode == 'comparision':
                    parms = json.loads(node.analisis_params)
                    # print(type(data), data, dir(data), data.get(list(data.keys())[0]))
                    # clean the value1 variable from the existing dict
                    # ==================================
                    for i, par in enumerate(parms):
                        if 'value1' in par:
                            del parms[i]
                    # ==================================
                    # append the value1 from the first key in the actual data content
                    parms.append({'value1': data.get(list(data.keys())[0])})
                    node.analisis_params = json.dumps(parms)
                    node.save()
                    print(node.analisis_params)
                    data, comp = node.run_node_task(data)
                    print(node.name + ' response:', data)
                    if data is False:
                        break
                else:
                    # print(inn_resp)
                    if len(inn_resp) <= 0:
                        inn_resp = data
                    print('outnode', node.name, data, inn_resp)
                    data = node.run_node_task(inn_resp)[0]
                if type(data) == dict:
                    data = self.parse_data(data)
        # print('after processing\n\033[34m', data, complete, '\033[0m')
        # print(data, complete)
        print('\033[32mresponse from', self.name, '\033[0m')
        print('\t', data)
        return data, inn_resp


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
        return data # add also the incoming params


    def parse_string(self, format_string, data):
        """
        Search patterns and replace values in the endpoint
        """
        keys = [ '{' + k + '}' for k in data.keys()]
        # print(format, data)
        resp = format_string
        for i, k in enumerate(keys):
            resp = resp.replace(k, data[k[1:-1]])
        # print(format_string)
        # print('parsed response', resp)
        return resp


    def parse_endpoint(self):
        """
        Search patterns and replace values in the endpoint
        """
        keys = [ '{' + k + '}' for k in self.parse_data({}).keys()]
        resp = self.api_endpoint
        for k in keys:
            resp = resp.replace(k, self.parse_data({})[k[1:-1]])
        return resp
