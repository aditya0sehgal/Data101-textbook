from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pymysql
import time
from flask.json import JSONEncoder
import decimal
import pymongo
from bson import ObjectId
from pymongo import MongoClient
import bson.json_util as json_util
import json
import pandas as pd

class JsonEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        if isinstance(obj, ObjectId):
            return str(obj)
        return json_util.default(obj)


application = Flask(__name__)
CORS(application)
application.json_encoder = JsonEncoder
# publish = False

@application.route('/', methods=['GET'])
def home():
    return render_template("home.html")

@application.route('/sql', methods=['GET'])
def sqlsnippet():
    return render_template("sqlSnippet.html", value = '1Iu-zCunodM-l1xH1sU50Huf6BDWoBBBG7xd_7u8plgk', title = 'SQL Live Coding Tutorial Book')

@application.route('/R', methods=['GET'])
def rsnippet():
    return render_template("sqlSnippet.html", value = '1g4SFwZuRTO5-4uRuNN_pz3UQaqEoDUMXk0QjTFophJk', title = 'R Live Coding Tutorial Book')
# @application.route('/datacamp', methods=['GET'])
# def codeSnippet():
#     return render_template("datacamp.html")
@application.route('/htmleditor', methods=['GET'])
def codeSnippet():
    sheet_id = '1Iu-zCunodM-l1xH1sU50Huf6BDWoBBBG7xd_7u8plgk'
    url = 'https://docs.google.com/spreadsheets/d/'+sheet_id+'/gviz/tq?tqx=out:csv&sheet=Sheet1'
    df=pd.read_csv(url)

    url = 'https://docs.google.com/spreadsheets/d/'+sheet_id+'/gviz/tq?tqx=out:csv&sheet=Sheet2'
    df1=pd.read_csv(url)

    finaldf=pd.merge(df1, df, on="Section" , how = "outer")

    cols = finaldf.columns.difference(['Section','Name','Details'])
    d = (finaldf.groupby(['Section','Name','Details'])[cols]
            .apply(lambda x: x.to_dict(orient='records'))
            .reset_index(name='Snippets')
            .to_json(orient='records'))

    return render_template("datacamp.html",value=d)


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
    return jsonify(json.dumps({"result":details,"cols":field_names,"error":error,"execution":execution_time},cls=JsonEncoder))


@application.route('/mongoTutorialCode', methods=['POST'])
def mongoTutorialCode():
    data=request.get_json()
    sqlcode=data["sqlcode"]
    db=getMongoDbConnection()
    print("got connection")
    start_time = time.time()
    x=eval(sqlcode)
    print(x)
    end_time=time.time()
    execution_time=end_time-start_time
    print(execution_time)
    res=[]
    if(type(x) is pymongo.cursor.Cursor or type(x) is pymongo.command_cursor.CommandCursor): 
        for val in x:
            res.append(val)
    elif type(x) is pymongo.results.InsertOneResult:
        res.append({"_id":x.inserted_id})
    elif type(x) is pymongo.results.InsertManyResult:
        for val in x.inserted_ids:
            res.append({"_id":val})
    elif type(x) is pymongo.results.UpdateResult:
        res.append({"ok":1})
    else:
         res.append(x)
    return jsonify(json.dumps({"result":res,"execution":execution_time},cls=JsonEncoder))

def getMongoDbConnection():
    client = MongoClient('mongodb+srv://db-mongodb-nyc1-62083-a7614619.mongo.ondigitalocean.com',
                     username='Student',
                     password='L46xyu97Zfj0O215')
    # client=MongoClient('mongodb://localhost:27017')
    # myclient = pymongo.MongoClient("mongodb+srv://db-mongodb-nyc1-62083-a7614619.mongo.ondigitalocean.com")
    mydb = client["Mongo336"]
    # mydb=client['livenosql']
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