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

# import flask_monitoringdashboard as dashboard



# def analytics_log():
#     print(time.strftime("%A, %d. %B %Y %I:%M:%S %p"))



# scheduler = BackgroundScheduler()
# scheduler.add_job(func=print_date_time, trigger="interval", seconds=60)
# scheduler.start()

# # Shut down the scheduler when exiting the app
# atexit.register(lambda: scheduler.shutdown())

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
# dashboard.bind(application)




@application.route('/', methods=['GET'])
def home():
    return render_template("home.html")





@application.route('/html_editor', methods=['GET'])
def html_editor():
    return render_template("latex.html")

@application.route('/sql', methods=['GET'])
def sqlsnippet():
    return render_template("sqlSnippet.html", value = '1Iu-zCunodM-l1xH1sU50Huf6BDWoBBBG7xd_7u8plgk', title = 'SQL Live Coding Tutorial Book')

# @application.route('/Rdata101', methods=['GET'])
# def Rdata101():
#     return render_template("sqlSnippet.html", value = '1g4SFwZuRTO5-4uRuNN_pz3UQaqEoDUMXk0QjTFophJk', title = 'R Live Coding Tutorial Book')



@application.route('/Rdata101practice', methods=['GET'])
def practiceSection():
    # Original sheet for the textbook. Uncomment below while pushing.
    sheet_id = '1g4SFwZuRTO5-4uRuNN_pz3UQaqEoDUMXk0QjTFophJk'

    # Copy of actual sheet for coding and testing. Comment below while pushing.
    # sheet_id = '163hgBq_WSWhle4DpVszEfgnbJtznqbalXQeMkLmLdtQ'

    sheet_name = 'Sheet1'
    url = 'https://docs.google.com/spreadsheets/d/'+sheet_id+'/gviz/tq?tqx=out:csv&sheet='+sheet_name
    df=pd.read_csv(url)
    df.fillna('', inplace=True)
    sheet_name = 'Sheet3'
    url = 'https://docs.google.com/spreadsheets/d/'+sheet_id+'/gviz/tq?tqx=out:csv&sheet='+sheet_name
    df1=pd.read_csv(url)
    df1.fillna('', inplace=True)

    df.drop(df.columns[df.columns.str.contains('unnamed',case = False)],axis = 1, inplace = True)
    df1.drop(df1.columns[df1.columns.str.contains('unnamed',case = False)],axis = 1, inplace = True)

    cols = df.columns.difference(['Section'])
    # print("1", cols)
    d = (df.groupby(['Section'])[cols]
            .apply(lambda x: x.to_dict('records')).to_dict())
    # print("2")
    d = {str(k):v for k,v in d.items()}
    # print("3", df1.columns)

    df1=df1.set_index('Section')
    # print("4")

    # new code for ignoring row
    if 'Ignore' in df1.columns:
        df1 = df1[df1['Ignore'] != 'yes']

    sections = df1.to_dict('index')
    sections = {str(k):v for k,v in sections.items()}


    final_dict = {}
    prev = {}
    prev_key = 0
    curr = {}
    for key in sections.keys():
        sections[key]['child'] = {}
        sections[key]['parent'] = key
        if key in d:

            sections[key]['snippets'] = d[key]
        else :
            sections[key]['snippets'] = {}
        count = key.count('.')
        curr = prev
        s = key

        if count > 0:
            sections[key]['parent'] = prev_key
            for i in range(count-1):
                s = s.rsplit('.', 1)[0]
                curr = curr['child'][s]
            curr['child'][key] = sections[key]
        else:
            final_dict[key] = sections[key]
            prev = final_dict[key]
            prev_key = key

    res = json.dumps(final_dict)
    return render_template("datacamp.html",value=res,title = 'R Live Coding Tutorial Book', sheetId= sheet_id)



@application.route('/Rdata101', methods=['GET'])
def Rdata101():
    # Original sheet for the textbook. Uncomment below while pushing.
    sheet_id = '1g4SFwZuRTO5-4uRuNN_pz3UQaqEoDUMXk0QjTFophJk'

    # Copy of actual sheet for coding and testing. Comment below while pushing.
    # sheet_id = '163hgBq_WSWhle4DpVszEfgnbJtznqbalXQeMkLmLdtQ'

    sheet_name = 'Sheet1'
    url = 'https://docs.google.com/spreadsheets/d/'+sheet_id+'/gviz/tq?tqx=out:csv&sheet='+sheet_name
    df=pd.read_csv(url)
    df.fillna('', inplace=True)
    sheet_name = 'Sheet2'
    url = 'https://docs.google.com/spreadsheets/d/'+sheet_id+'/gviz/tq?tqx=out:csv&sheet='+sheet_name
    df1=pd.read_csv(url)
    df1.fillna('', inplace=True)

    df.drop(df.columns[df.columns.str.contains('unnamed',case = False)],axis = 1, inplace = True)
    df1.drop(df1.columns[df1.columns.str.contains('unnamed',case = False)],axis = 1, inplace = True)

    cols = df.columns.difference(['Section'])
    d = (df.groupby(['Section'])[cols]
            .apply(lambda x: x.to_dict('records')).to_dict())
    d = {str(k):v for k,v in d.items()}

    df1=df1.set_index('Section')

    # new code for ignoring row
    if 'Ignore' in df1.columns:
        # ignore_rows = df1['Ignore'] == 'yes'
        # df1 = df1[~ignore_rows]
        df1 = df1[df1['Ignore'] != 'yes']
        
    sections = df1.to_dict('index')
    sections = {str(k):v for k,v in sections.items()}


    final_dict = {}
    prev = {}
    prev_key = 0
    curr = {}
    for key in sections.keys():
        sections[key]['child'] = {}
        sections[key]['parent'] = key
        if key in d:

            sections[key]['snippets'] = d[key]
        else :
            sections[key]['snippets'] = {}
        count = key.count('.')
        curr = prev
        s = key

        if count > 0:
            sections[key]['parent'] = prev_key
            for i in range(count-1):
                s = s.rsplit('.', 1)[0]
                curr = curr['child'][s]
            curr['child'][key] = sections[key]
        else:
            final_dict[key] = sections[key]
            prev = final_dict[key]
            prev_key = key

    res = json.dumps(final_dict)
    return render_template("datacamp.html",value=res,title = 'R Live Coding Tutorial Book', sheetId= sheet_id)

@application.route('/R', methods=['GET'])
def main_r_page():
    return render_template("main-r.html")

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



@application.route('/test', methods=['GET'])
def test():
    sheet_id = '1g4SFwZuRTO5-4uRuNN_pz3UQaqEoDUMXk0QjTFophJk'
    sheet_name = 'Sheet1'
    url = 'https://docs.google.com/spreadsheets/d/'+sheet_id+'/gviz/tq?tqx=out:csv&sheet='+sheet_name
    df=pd.read_csv(url)
    df.fillna('', inplace=True)
    sheet_name = 'Sheet2'
    url = 'https://docs.google.com/spreadsheets/d/'+sheet_id+'/gviz/tq?tqx=out:csv&sheet='+sheet_name
    df1=pd.read_csv(url)
    df1.fillna('', inplace=True)

    df.drop(df.columns[df.columns.str.contains('unnamed',case = False)],axis = 1, inplace = True)
    df1.drop(df1.columns[df1.columns.str.contains('unnamed',case = False)],axis = 1, inplace = True)

    cols = df.columns.difference(['Section'])
    d = (df.groupby(['Section'])[cols]
            .apply(lambda x: x.to_dict('records')).to_dict())
    d = {str(k):v for k,v in d.items()}

    df1=df1.set_index('Section')

    sections = df1.to_dict('index')
    sections = {str(k):v for k,v in sections.items()}


    final_dict = {}
    prev = {}
    prev_key = 0
    curr = {}
    for key in sections.keys():
        sections[key]['child'] = {}
        sections[key]['parent'] = key
        if key in d:

            sections[key]['snippets'] = d[key]
        else :
            sections[key]['snippets'] = {}
        count = key.count('.')
        curr = prev
        s = key

        if count > 0:
            sections[key]['parent'] = prev_key
            for i in range(count-1):
                s = s.rsplit('.', 1)[0]
                curr = curr['child'][s]
            curr['child'][key] = sections[key]
        else:
            final_dict[key] = sections[key]
            prev = final_dict[key]
            prev_key = key

    res = json.dumps(final_dict)
    return render_template("datacamp.html",value=res,title = 'R Live Coding Tutorial Book', sheetId= sheet_id)


@application.route('/highchart', methods=['GET'])
def highcharts():
    return render_template("highcharts.html")

# @application.route('/htmleditor', methods=['GET'])
# def htmleditor():
#     return render_template("htmleditor.html")

# @application.route('/datacamp', methods=['GET'])
# def codeSnippet():
#     sheet_id = '1aX7hU251jONPZsAbcqMOoZBjqDs_0pwuI2OfSPmtApk'
#     url = 'https://docs.google.com/spreadsheets/d/'+sheet_id+'/gviz/tq?tqx=out:csv&sheet=Sheet1'
#     df=pd.read_csv(url)

#     url = 'https://docs.google.com/spreadsheets/d/'+sheet_id+'/gviz/tq?tqx=out:csv&sheet=Sheet2'
#     df1=pd.read_csv(url)

#     finaldf=pd.merge(df1, df, on="Section" , how = "outer")

#     cols = finaldf.columns.difference(['Section','Name','Details'])
#     d = (finaldf.groupby(['Section','Name','Details'])[cols]
#             .apply(lambda x: x.to_dict(orient='records'))
#             .reset_index(name='Snippets')
#             .to_json(orient='records'))

#     return render_template("datacamp.html",value=d)



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
#use_reloader=False
