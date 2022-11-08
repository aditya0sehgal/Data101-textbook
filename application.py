from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pymysql
import time
from flask.json import JSONEncoder
import decimal
import pymongo
from bson import ObjectId
from pymongo import MongoClient


class JsonEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        if isinstance(obj, ObjectId):
            return str(obj)
        return JSONEncoder.default(self, obj)


application = Flask(__name__)
CORS(application)
application.json_encoder = JsonEncoder
# publish = False
 

@application.route('/', methods=['GET'])
def sqlsnippet():
    return render_template("sqlSnippet.html")

@application.route('/codeSnippet', methods=['GET'])
def codeSnippet():
    return render_template("codeSnippet.html")

# @application.route('/codemirror', methods=['GET'])
# def codemirror():
#     return render_template("codemirror.html")

@application.route('/sqlTutorialCode', methods=['POST'])
def sqlTutorialCode():
    data=request.get_json()
    sqlcode=data["sqlcode"]
    error=''
    execution_time=0
    details=[]
    field_names=[]
    conn,cur = getSqlConnection()
    print("Start")
    try:
        cur.execute("SELECT CONNECTION_ID() AS pid;")
        pid=cur.fetchone()['pid']
        print(pid)
        start_time = time.time()
        cur.execute(sqlcode)
        end_time=time.time()
        execution_time=end_time-start_time
        details=cur.fetchall()
        field_names = [i[0] for i in cur.description]
    except pymysql.Error as e:
        print(str(e))
        print(e)
        if(str(e)=="(2013, 'Lost connection to MySQL server during query (timed out)')"):
            conn1,cur1 = getSqlConnection()
            cur1.execute("KILL "+str(pid))
            cur1.close()
            conn1.close()
        print("Errorr")
        error = "Error occured: " + str(e)
    cur.close()
    conn.close()
    return jsonify({"result":details,"cols":field_names,"error":error,"execution":execution_time})


@application.route('/mongoTutorialCode', methods=['POST'])
def mongoTutorialCode():
    data=request.get_json()
    sqlcode=data["sqlcode"]
    db=getMongoDbConnection()
    print("got connection")
    start_time = time.time()
    x=eval(sqlcode)
    end_time=time.time()
    execution_time=end_time-start_time
    print(execution_time)
    res=[]
    if(type(x) is pymongo.cursor.Cursor): 
        for val in x:
            res.append(val)
    else:
         res.append(x)
    return jsonify({"result":res,"execution":execution_time})

def getMongoDbConnection():
    client = MongoClient('mongodb+srv://db-mongodb-nyc1-62083-a7614619.mongo.ondigitalocean.com',
                     username='Student',
                     password='L46xyu97Zfj0O215')
    # myclient = pymongo.MongoClient("mongodb+srv://db-mongodb-nyc1-62083-a7614619.mongo.ondigitalocean.com")
    mydb = client["Mongo336"]
    return mydb


def getSqlConnection():
    conn = pymysql.connect(
    host= "209.97.156.178",
    port = 3307, 
    user = "student", 
    password = "cs336", 
    db = "BarBeerDrinker", 
    read_timeout=30,
    autocommit=True
    )
    cur = conn.cursor(pymysql.cursors.DictCursor)
    return conn,cur

if __name__ == "__main__":
    application.run(port=5001,debug=True)