from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pymysql
import time



application = Flask(__name__)
CORS(application)


 

@application.route('/', methods=['GET'])
def sqlsnippet():
    return render_template("sqlSnippet.html")

# @application.route('/codeSnippet', methods=['GET'])
# def codeSnippet():
#     return render_template("codeSnippet.html")

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
    conn = pymysql.connect(
    host= "209.97.156.178",
    port = 3307, 
    user = "student", 
    password = "cs336", 
    db = "BarBeerDrinker", 
    read_timeout=60
    )
    cur = conn.cursor(pymysql.cursors.DictCursor)
    try:
        start_time = time.time()
        cur.execute(sqlcode)
        end_time=time.time()
        execution_time=end_time-start_time
        details=cur.fetchall()
        field_names = [i[0] for i in cur.description]
        
    except pymysql.Error as e:
        error = "Error occured: " + str(e)
    cur.close()
    conn.close()
    return jsonify({"result":details,"cols":field_names,"error":error,"execution":execution_time})

if __name__ == "__main__":
    application.run(port=5001,debug=True)