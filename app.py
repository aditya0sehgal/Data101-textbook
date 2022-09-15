from flask import Flask, render_template, request
from flask.globals import current_app
from flask.helpers import send_file, send_from_directory
from flask.wrappers import Response
from flask_cors import CORS
import json
import os
import fnmatch
import math
import random

from numpy import rad2deg
from os import path
from datetime import date
import pandas as pd
from io import BytesIO
import pymysql
from pymysql import MySQLError


application = Flask(__name__)
CORS(application)




@application.route('/', methods=['GET'])
def render_index():
    return render_template("homepage.html")

 

@application.route('/sqlsnippet', methods=['GET'])
def sqlsnippet():
    return render_template("sqlSnippet.html")

@application.route('/sqlTutorialCode', methods=['POST'])
def sqlTutorialCode():
    data=request.get_json()
    sqlcode=data["sqlcode"]
    # print(sqlcode)
    error=''
    details=[]
    conn = pymysql.connect(
    host= "209.97.156.178",
    port = 3307, 
    user = "student", 
    password = "cs336", 
    db = "BarBeerDrinker", 
    )
    cur = conn.cursor()
    print("START")
    try:
        cur.execute(sqlcode)
        details=cur.fetchall()
        field_names = [i[0] for i in cur.description]
        details=list(details)
        details = [[str(j) for j in i] for i in details]
        details.insert(0,field_names)
        print(details)
        print(field_names)
    except pymysql.Error as e:
        error = "Error occured: " + str(e)
    return {"result":details,"error":error}

