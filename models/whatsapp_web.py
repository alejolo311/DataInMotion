#!/usr/bin/python3
"""
Selenium web driver used to send the QR code to the user
"""

from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from PIL import Image
from io import BytesIO
from twilio.rest import Client
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.action_chains import ActionChains
import os
import sys
import time
import traceback
import base64
import random
import json
import models.credentials as mc
from selenium.webdriver.common.keys import Keys
paths = os.environ.get('PATH').split(':')
exists = False
for pat in paths:
    if pat == '/opt/local/':
        exists = True
        break
if exists is False:
    os.environ['PATH'] = os.environ.get('PATH') + ':/usr/src/app/'
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from pyvirtualdisplay import Display

print('Env:', os.environ['PATH'])


class WebWhastapp():
    """
    Selenium Wrapper to whatsapp ops
    """
    def __init__(self, nodeId, outData, instance):
        """
        Defines the web selenium driver handler
        """
        self.instance = instance
        self.instance.write_status(
            'whatsapp_init',
            'Prepare to Scan the QRCode with the Whatsapp Aplication in you Phone')
        self.out_data = outData
        self.node_id = nodeId
        self.last_giphy_search = ''
        self.remove_conf()
        self.remove_verify

    def start_browser(self):
        """
        Start the selenium Firefox driver
        """
        op = Options()
        op.headless = True
        op.set_preference('media.autoplay.default', 0)
        op.set_preference('media.mp4.enabled', True)
        # Executable paths
        gecko_path = '/usr/bin/geckodriver'
        chrome_path = '/usr/src/app/chromedriver'
        # Drivers-----------------------------
        # Firefox
        self.driver = webdriver.Firefox(executable_path=gecko_path, options=op)
        # Chrome
        # self.driver = webdriver.Chrome(options=options)
        # --------------------------------------
        self.driver.set_window_position(0, 0)
        self.driver.set_window_size(1080, 592)
        with open('./api/running/{}.session'.format(self.instance.instance_id), 'w') as session_file:
            conf = {
                'session_id': str(self.driver.session_id),
                'url': str(self.driver.command_executor._url)
            }
            session_file.write(json.dumps(conf))

    def auth(self):
        """
        Open web.whatsapp and checks for the QRcode canvas
        """
        try:
            self.driver.get('https://web.whatsapp.com')
            # self.save_screenshot('init_page')
        except Exception as e:
            return False
        retries = 4
        tries = 0
        while tries < retries:
            try:
                canvas = WebDriverWait(self.driver, 3).until(
                    EC.presence_of_element_located((By.TAG_NAME, 'canvas')))
                location = canvas.location
                size = canvas.size
                qrcode = self.driver.get_screenshot_as_png()
                im = Image.open(BytesIO(qrcode))
                left = location['x']
                top = location['y']
                right = location['x'] + size['width']
                bottom = location['y'] + size['height']
                im = im.crop((left, top, right, bottom))
                im.save('./api/verification_images/{}.png'.format(self.instance.instance_id))
                url = 'web_whatsapp_verify?id=' + self.instance.instance_id
                # self.send_twilio_message(
                #     self.number,
                #     '*Scan with your phone ' + ' the QRcode in the link*')
                # self.send_twilio_message(self.number, str(self.node_id))
                return True
            except TimeoutException:
                print('QRcode not found:')
            except Exception as e:
                print('\t', e)
                retries += 1
                pass
        return False

    def search_contact(self, contact_number):
        """
        Search for a number and click it to focus the messaging view
        Notes: replace this logic with a new one
        ---the browser should search the contact in the search bar at the left
        """
        # self.save_screenshot(name='before_contacts')
        self.contact = contact_number
        box_xpath = '//div[@contenteditable = "true"]'
        max_retries = 10
        count = 0
        while True:
            try:
                print('Selecting input to search contact')
                con_input_span = WebDriverWait(self.driver, 10).until(
                            EC.presence_of_all_elements_located((By.XPATH, box_xpath)))[0]
                con_input = con_input_span.find_element_by_xpath('..')
                # con_input.click()
                con_input = con_input.find_element_by_xpath('..')
                con_input.click()
                con_input_span.click()
                con_input_span.send_keys(contact_number)
                time.sleep(2)
                break
            except Exception as e:
                # self.save_screenshot(name='contact_input')
                traceback.print_exc()
                print(e)
        xpath = '//div[@aria-label="Search results."]'
        count = 0
        while True:
            try:
                contacts = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, xpath)))
                # for cont in contacts:
                #     self.driver.execute_script(
                #         'arguments[0].style.backgroundColor = "blue";', cont)
                c_xpath = '//div[contains(@class, "eJ0yJ")]'
                contact = WebDriverWait(contacts, 10).until(
                    EC.presence_of_element_located((By.XPATH, c_xpath)))
                # print(contact.get_attribute('outerHTML').encode('utf-8'))
                # contact = contacts[0]
                self.remove_verify()
                # parent = contact.find_element_by_xpath('..')
                # parent = parent.find_element_by_xpath('..')
                # parent = parent.find_element_by_xpath('..')
                # parent = parent.find_element_by_xpath('..')
                # parent = parent.find_element_by_xpath('..')
                self.driver.execute_script(
                  'arguments[0].style.backgroundColor = "red";', contact)
                contact.click()
                # parent.click()
                # print(contact.get_attribute('outerHTML').encode('utf-8'))
                # self.save_screenshot(name='contact_selected')
                time.sleep(2)
                break
            except TimeoutException:
                # self.save_screenshot(name='waiting_contact')
                print('trying again to get the contact')
                if count > max_retries:
                    return {'error': "can not find the contact"}
                count += 1
                pass
            except Exception as e:
                traceback.print_exc()
                print('Failed to get the contact', e)
                print(contacts.get_attribute('outerHTML').encode('utf-8'))
                return {'error': "can not find the contact"}

    def send_whatsapp_message(self, message):
        """
        Send a message to the contact focused by search_contact
        """
        # Focus the footer and store the input as msg_box
        footer = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, 'footer')))
        footer.click()
        box_xpath = '//div[@contenteditable = "true"]'
        msg_box = footer.find_elements_by_xpath(box_xpath)[1]
        msg_parent = msg_box.find_element_by_xpath('..')
        msg_parent.send_keys('')
        msg_parent = msg_parent.find_element_by_xpath('..')
        msg_parent.send_keys('')
        msg_box = footer.find_elements_by_xpath(box_xpath)[1]
        msg_box.click()
        mss = message
        for char in mss:
            msg_box.send_keys(char)
        msg_box.send_keys(Keys.RETURN)
        time.sleep(2)
        # self.save_screenshot('message')
        # self.send_twilio_message(self.number,
        #                          'message and Gif sent to *{}*'
        #                          .format(self.contact))

    def send_animated_gif(self, search, select_random=False):
        """
        Query gifs by search, store the url and send them to the admin
        waits for admin to select media
        and send the media to the contact focused by search_contact
        """
        # self.save_screenshot(name='init_gif')
        print("sending gif to {}".format(self.contact))
        self.instance.write_status(
            'sending',
            'Prepare to click the Gif to send<br>Search: {}'.format(search))
        # select the smiley button
        x_xpath = '//span[@data-testid = "smiley"]'
        x_btn = WebDriverWait(self.driver, 30).until(
            EC.presence_of_element_located((By.XPATH, x_xpath)))
        # print(x_btn.get_attribute('outerHTML'))
        print('Smiley pressed')
        # self.save_screenshot(name='smiley')
        x_btn = x_btn.find_element_by_xpath('..')
        x_btn.click()
        # select the gif button
        gif_xpath = '//span[@data-testid = "gif"]'
        gif = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.XPATH, gif_xpath)))
        gif = gif.find_element_by_xpath('..')
        gif.click()
        # self.save_screenshot(name='gif_clicked')
        gif_inp_xpath = '//input[@title = ' +\
            '"Search GIFs via GIPHY"]'
        gif_inp = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.XPATH, gif_inp_xpath)))
        # Query to GIPHY integrated
        gif_inp.send_keys(search)
        time.sleep(3)
        if search != self.last_giphy_search:
            self.remove_conf()
        self.last_giphy_search = search
        config = None
        try:
            file_src = './api/verification_images'
            with open('{}/{}.conf'.format(file_src,
                                          self.node_id), 'r') as conf:
                config = json.loads(conf.read())
        except Exception as e:
            print('Sending media request to admin', e)
        self.video_urls = []
        self.video_divs = []
        self.videos_list = []
        footer = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, 'footer')))
        x_path = '//div[@class = "kpC7S"]'
        divs = WebDriverWait(footer, 10).until(
            EC.presence_of_all_elements_located((By.XPATH, x_path)))
        divs = divs[:3]
        # # self.save_screenshot('giphy')
        self.instance.write_status('collecting', 'Collecting Gifs to choose')
        pos = 0
        for div in divs:
            try:
                self.driver.execute_script("arguments[0].scrollIntoView(false);", div)
                videos = WebDriverWait(div, 10).until(
                    EC.presence_of_all_elements_located((By.TAG_NAME,
                                                         'video')))
                self.videos_list.extend(videos)
                for video in videos:
                    self.video_divs.append(div)
                    src = video.get_attribute('src')
                    print(pos, '{:<30}'.format(src))
                    self.video_urls.append([pos, src])
                    pos += 1
                time.sleep(1)
                # # self.save_screenshot('video_url')
            except Exception as e:
                print(e)
                pass
        # self.save_screenshot('scrolled')
        # Saving video Urls
        with open('./api/verification_images/{}.json'
                  .format(self.instance.instance_id), 'w') as videos_json:
            videos_json.write(json.dumps(self.video_urls))
        count = 0
        if config is None and select_random is False:
            uri = '{}'.format(self.node_id)
            self.instance.write_status('choose_gif', 'Waiting for your choose')
            while True:
                try:
                    print('Waiting for selected gif')
                    file_src = './api/verification_images'
                    with open('{}/{}.conf'.format(file_src,
                              self.instance.instance_id), 'r') as conf:
                        config = json.loads(conf.read())
                        self.instance.write_status('gif_choosed',
                                              'The gif has been selected')
                        # os.remove('{}/{}.conf'.format(file_src,
                        #       self.instance.instance_id))
                    break
                except Exception as e:
                    print('Retrying to get the gif choose')
                    self.instance.write_status('choose_gif', 'Waiting for the selected choose')
                    time.sleep(5)
                    if count > 15:
                        os.remove('{}/{}.conf'.format(file_src,
                               self.instance.instance_id))
                        return {'error': "Failed, the admin never choosed a gif"}
                    count += 1
                    pass
        # End of exception
        r_pos = 0
        if select_random:
            r_pos = random.randrange(0, len(self.video_divs) - 1)
        else:
            r_pos = int(config['pos'])
        div = self.video_divs[r_pos]
        self.driver.execute_script('arguments[0].scrollIntoView(true);', div)
        # self.save_screenshot('after_scroll_to_div')
        vi = self.video_urls[r_pos]
        # --------------------------------
        # Scroll to the video view
        # self.driver.execute_script("arguments[0].scrollIntoView(true);", div)
        vid_xpath = "//video[@src='{}']".format(vi[1])
        print('Searching by XPATH ', vid_xpath)
        video = WebDriverWait(div, 10).until(
            EC.presence_of_element_located((By.XPATH, vid_xpath)))
        par = video.find_element_by_xpath('..')
        par = par.find_element_by_xpath('..')
        par = par.find_element_by_xpath('..')
        print('Video:\n', video.get_attribute('outerHTML'))
        self.driver.execute_script(
            'arguments[0].style.backgroundColor = "blue";', video)
        new_url = '"https://media1.giphy.com/media/3o6EhOYMhOTANYgHMk/giphy-preview.mp4"'
        self.driver.execute_script(
            'arguments[0].src = {};'.format(new_url), video
        )
        self.driver.execute_script("arguments[0].focus();", par)
        # self.save_screenshot('after_focus')
        x_block = '//div[@class="_2vpZx"]'
        block = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.XPATH, x_block)))
        action = ActionChains(self.driver)
        action.move_to_element(block)
        action.click().perform()
        action.move_to_element(video)
        video.click()
        # self.save_screenshot('actions_clicked')
        count = 0
        while True:
            try:
                # self.save_screenshot('waiting_buttonsend')
                btn_xpath = '//span[@data-testid = "send"]'
                button = WebDriverWait(self.driver, 20).until(
                    EC.presence_of_element_located((By.XPATH, btn_xpath)))
                time.sleep(2)
                button = button.find_element_by_xpath('..')
                button.click()
                time.sleep(2)
                # self.save_screenshot('buttonsend_clicked')
                resp = {
                    'media_url': vi[1],
                    'message': 'Gif sended to {}'.format(self.contact)
                }
                return resp
            except TimeoutException:
                print('Timeout Send Button, trying again')
                if count == 3:
                    break
                else:
                    count += 1
            except Exception as e:
                return {'error': str(e)}
        return {}

    def send_gif_from_file(self, filepath):
        """
        Upload a encoded file to Whatsapp
        """
        try:
            span_xpath = '//span[@data-testid="clip"]'
            span = WebDriverWait(self.driver, 20).until(
                EC.presence_of_element_located((By.XPATH, span_xpath))
            )
            print(span.get_attribute('outerHTML'))
            span = span.find_element_by_xpath('..')
            span.click()
            time.sleep(2)
            # self.save_screenshot('after_click_clip_span')
            img_span_xpath = '//span[@data-testid="attach-image-old"]'
            img_span = WebDriverWait(self.driver, 20).until(
                EC.presence_of_element_located((By.XPATH, img_span_xpath))
            )
            parent = span.find_element_by_xpath('..')
            parent = span.find_element_by_xpath('..')
            self.driver.execute_script('arguments[0].focus();', parent)
            # self.save_screenshot('focus_attach_button')

            media_input_xpath = '//input[contains(@accept, "video/mp4")]'
            media_input = WebDriverWait(self.driver, 20).until(
                EC.presence_of_element_located((By.XPATH, media_input_xpath))
            )
            media_input.send_keys(filepath)
            self.driver.execute_script('arguments[0].scrollIntoView(true)', img_span)
            action = ActionChains(self.driver)
            action.move_to_element(parent)
            action.click().perform()
            time.sleep(1)
            count = 0
            while True:
                try:
                    btn_xpath = '//span[@data-testid = "send"]'
                    button = WebDriverWait(self.driver, 20).until(
                        EC.presence_of_element_located((By.XPATH, btn_xpath)))
                    time.sleep(2)
                    button = button.find_element_by_xpath('..')
                    button.click()
                    time.sleep(2)
                    return {'success': 'gif sended'}
                except TimeoutException:
                    print('Timeout Send Button, trying again')
                    if count == 3:
                        break
                    else:
                        count += 1
                except Exception as e:
                    return {'error': str(e)}
            return {}
        except Exception as e:
            print(e)
            traceback.print_exc()
            return {'error': str(e)}

    def close(self):
        """
        Closes Selenium Driver
        """
        self.remove_verify()
        self.remove_conf()
        self.driver.close()
        # self.driver.quit()

    def remove_conf(self):
        """
        Remove conf file from cache
        """
        file_src = './api/verification_images'
        try:
            os.remove('{}/{}.conf'.format(file_src, self.instance.instance_id))
        except Exception as e:
            print("Can't remove png file {}.conf".format(self.instance.instance_id), e)

    def remove_verify(self):
        """
        Remove verify png file from cache
        """
        file_src = './api/verification_images'
        try:
            os.remove('{}/{}.png'.format(file_src, self.instance.instance_id))
        except Exception as e:
            print("Can't remove png file {}.png".format(self.instance.instance_id), e)

    def remove_media(self):
        """
        Remove any saved gif or video for the instance
        """
        file_src = './api/running/media/'
        list_dir = os.listdir(file_src)
        for direct in list_dir:
            if self.instance.instance_id in direct:
                try:
                    os.remove('{}/{}'.format(file_src, direct))
                    print('media removed')
                except Exception as e:
                    print("Can't remove png file {}".format(self.instance.instance_id), e)

    def save_screenshot(self, name="screenshot"):
        """
        Save a screenshot
        """
        dirs = os.listdir('./api/screenshots')
        shot = self.driver.get_screenshot_as_png()
        im = Image.open(BytesIO(shot))
        im.save('./api/screenshots/{:0>4}-{}.png'
                .format(len(dirs), name))

    def set_twilio_client(self, fromNumber):
        """
        Set the client credentials
        """
        self.set_twilio_client = Client(mc.account_sid, mc.auth_token)
        self.twilio_from = fromNumber

    def send_twilio_message(self, contact, message, mediaUrl=None):
        """
        Send a message via twilio
        """
        media_message = self.twilio_client.messages.create(
            body=message,
            from_='whatsapp:+' + str(self.twilio_from),
            to='whatsapp:+' + str(contact)
        )
        if mediaUrl:
            media_message = self.twilio_client.messages.create(
                body=message,
                from_='whatsapp:+' + str(self.twilio_from),
                to='whatsapp:+' + str(contact),
                media_url=mediaUrl
            )
        return media_message