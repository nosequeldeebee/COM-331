#!/usr/bin/env python

from imapclient import IMAPClient
import time

import RPi.GPIO as GPIO

HOSTNAME = 'imap.gmail.com'
USERNAME = '...@gmail.com'
PASSWORD = '...'
MAILBOX = 'Inbox'

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)

buzzerpin = 2

GPIO.setup(buzzerpin, GPIO.OUT) #buzzer
GPIO.setup(18, GPIO.OUT) #LEDs
GPIO.setup(23, GPIO.OUT)
GPIO.setup(24, GPIO.OUT)


server = IMAPClient(HOSTNAME, use_uid=True, ssl=True)
server.login(USERNAME, PASSWORD)
print('Logging in as ' + USERNAME)

def buzz():

	#Dot Dot Dot
	GPIO.output(buzzerpin,GPIO.HIGH)
	time.sleep(.1)
	GPIO.output(buzzerpin,GPIO.LOW)
	time.sleep(.1)
	GPIO.output(buzzerpin,GPIO.HIGH)
	time.sleep(.1)
	GPIO.output(buzzerpin,GPIO.LOW)
	time.sleep(.1)
	GPIO.output(buzzerpin,GPIO.HIGH)
	time.sleep(.1)

	#Dash Dash Dah
	GPIO.output(buzzerpin,GPIO.LOW)
	time.sleep(.2)
	GPIO.output(buzzerpin,GPIO.HIGH)
	time.sleep(.2)
	GPIO.output(buzzerpin,GPIO.LOW)
	time.sleep(.2)
	GPIO.output(buzzerpin,GPIO.HIGH)
	time.sleep(.2)
	GPIO.output(buzzerpin,GPIO.LOW)
	time.sleep(.2)
	GPIO.output(buzzerpin,GPIO.HIGH)
	time.sleep(.2)
	GPIO.output(buzzerpin,GPIO.LOW)
	time.sleep(.7)

def blink():

    for i in range (0, 3):
        GPIO.output(24, GPIO.HIGH)
        time.sleep(.2)
        GPIO.output(24, GPIO.LOW)
        time.sleep(.2)

try:
    while True:

        blink()
        select_info = server.select_folder(MAILBOX)
        print('%d messages in INBOX' % select_info['EXISTS'])

        folder_status = server.folder_status(MAILBOX, 'UNSEEN')
        newmails = int(folder_status['UNSEEN'])

        print "You have", newmails, "new emails!"

        if newmails > 0:
            GPIO.output(18, True)
            GPIO.output(23, False)
            buzz()
        else:
            GPIO.output(18, False)
            GPIO.output(23, True)

        time.sleep(3)

except KeyboardInterrupt:
    print "\nYou quit the program"
except:
    print "\nAn error has occurred"

finally:
    GPIO.cleanup()
