const sheetId = '1Iu-zCunodM-l1xH1sU50Huf6BDWoBBBG7xd_7u8plgk';
// const sheetId='1MZszw0E8LQr1JRdoJQO45Zk77_OdruCdl04KHFTLbcU'
const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
const query = encodeURIComponent('Select *')
const mime = 'text/x-mysql';
var jsondataquery={}
const storagesectionid="section-id-";
$(document).ready(function () {
    scrollToTap()
  });

  function scrollToTap(){
    $("#maincontent").scrollTop(0);
  }


function showSpinner() 
{
    let spinner = document.getElementById("spinner");
    let waiting=document.getElementById("waiting");
    let mainbody=document.getElementById("mainbody");
    mainbody.style.opacity = "0.3";
    mainbody.style.pointerEvents="none";
    spinner.className = "show";
    waiting.style.display="block";
   
}

function hideSpinner() 
{
    let spinner = document.getElementById("spinner");
    let waiting=document.getElementById("waiting");
    let mainbody=document.getElementById("mainbody");
    mainbody.style.opacity = "1";
    mainbody.style.pointerEvents="auto";
    spinner.className = spinner.className.replace("show", "");
    waiting.style.display="none";
}


function createSqlSnippets(ele,sectionid){
   
    var data=jsondataquery[sectionid]
    var prevsection=sessionStorage.getItem('current-section');
    var prevele=document.getElementById(storagesectionid+prevsection);
    prevele.classList.remove("active");
    ele.classList.add("active");
    sessionStorage.setItem('current-section', sectionid);
    document.getElementById("section-heading").innerHTML=data.name
    document.getElementById("section-description").innerHTML=data.description
    maindiv=document.getElementById("maincontainer");
    maindiv.style.display="block";
    maincontainer.innerHTML=" ";
    if(!("snippets" in data)){
        return;
    }
    var snippetdata=data.snippets
    for(let i=0;i<snippetdata.length;i++){
        txt="";
        txt=txt + "<div class='ws-grey' style='padding:15px;padding-bottom:40px;margin-bottom:40px;box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);'>"
        txt=txt+"<h3>"+parseInt(i+1)+". " + snippetdata[i].title +"</h3>"
        txt=txt+"<textarea id='textarea-"+i+"' wrap='logical' style='display: none;'>"+snippetdata[i].query+"</textarea>"
        txt=txt+"<p>Edit the SQL Statement, and click Run SQL to see the result.</p>"
        if(snippetdata[i].access.toLowerCase()=='no'){
            txt=txt+"<button class='ws-btn disabledbtn' disabled type='button' onclick='sqlCodeSubmit("+i+");'> Run SQL Disabled »</button>" + "<h3>Result:</h3>"
        }
        else{
        txt=txt+"<button class='ws-btn' type='button' onclick='sqlCodeSubmit("+i+");'>Run SQL »</button>" + "<h3>Result:</h3>" 
        }
        txt=txt+"<div id='resultSQL-"+i+"'>"+
        "<div class='w3-white' id='divResultSQL-"+i+"' style='display: block; padding:10px;'>"+
        "  Results will be displayed here" + 
        "</div></div> </div>  ";
        var childiv=document.createElement("div");
        childiv.setAttribute("id","example-"+i);
        childiv.innerHTML=txt;
        maindiv.append(childiv);
        CodeMirror.fromTextArea(document.getElementById('textarea-'+i), {
          resultId:"sql-code-example-"+i,
          mode: mime,
          indentWithTabs: true,
          smartIndent: true,
          lineNumbers: false,
          matchBrackets : true,
          autofocus: true,
          lineWrapping:true,
          extraKeys: {"Ctrl-Space": "autocomplete"}
        });
    }
    scrollToTap()
}

function sqlCodeSubmit(id){
    showSpinner();

    var resultContainer = document.getElementById("divResultSQL-"+id);
    resultContainer.innerHTML = "";

    var sqlcode=''
    var ele=document.getElementById("sql-code-example-"+id);
    var cloned=ele.cloneNode(true);
    var elements = cloned.getElementsByClassName('cm-comment');
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
    let allele=cloned.getElementsByClassName("CodeMirror-line");
    for(let i=0;i<allele.length;i++){
        sqlcode=sqlcode+allele[i].innerText+' ';
    }
    sqlcode=sqlcode.replace(/\s\s+/g, ' ')
    sqlcode=sqlcode.replace(/[\u200B-\u200D\uFEFF]/g, '');
    statement_type=sqlcode.split(" ")[0].toLowerCase();
    console.log(sqlcode)
    if(statement_type == "update" || statement_type == "insert" || statement_type == "upsert"){

        resultContainer.innerHTML="Cannot execute this query. Access Denied";
        hideSpinner()
        return
            
        
    }
    var REST_CALL = "/sqlTutorialCode";
    var sendData={"sqlcode":sqlcode}
    $.ajax({
        url: REST_CALL,
        data: JSON.stringify(sendData),
        type: 'POST',
        contentType: "application/json",
        success: function(result) {
            console.log(result);
            res=result['result']
            console.log(res)
            var len=parseInt(res.length)-1;
            console.log(len);
            if(len >=0){
                txt = "";
                txt = txt + "<div style='padding:10px;'><div style='margin-bottom:10px;'>Number of Records: " + len + "</div>";
                txt=txt+"<div style='margin-bottom:10px;'>Execution Time: " + result['execution'] + " seconds</div>"
                txt = txt + "<div class='table-scrollable'><table class='ws-table-all notranslate'><tr>";
                
                for (j = 0; j < res[0].length; j++) {
                    txt = txt + "<th>" + res[0][j] + "</th>";  
                }
                txt = txt + "</tr>";
                for (i = 1; i < len+1; i++) {
                    txt = txt + "<tr>";       
                    for (j = 0; j < res[0].length; j++) {
                        if (res[i][j] == null) {
                            txt = txt + "<td><i>null</i></td>";  
                        } else {
                            txt = txt + "<td>" + res[i][j] + "</td>";
                        }                                    
                    }
                    txt = txt + "</tr>";       
                }
                resultContainer.innerHTML =  txt + "</table></div></div>";
            }
            else{
            resultContainer.innerHTML= result['error']
            }
            hideSpinner()
        },
        error: function (err) {
            console.log("ERROR")
            console.log(err)
            hideSpinner()
        },
        dataType: 'json',
    });
}



function init(){
    var sheetName= 'Sheet1';
    var url = `${base}&sheet=${sheetName}&tq=${query}`
    fetchGoogleSheetsData(url,"sqlsnippets")
    sheetName = 'Sheet2';
    url = `${base}&sheet=${sheetName}&tq=${query}`
    fetchGoogleSheetsData(url,"sections")
}



async function fetchGoogleSheetsData(url,type){
    $.ajax({
        url: url,
        success: function(result) {
            const jsonData = JSON.parse(result.substring(47).slice(0, -2));
            console.log(jsonData)
            var data_rows=jsonData.table.rows
            var data_cols=jsonData.table.cols
            if(type=="sections"){
                createSectionJson(data_rows)
            }
            else{
                createSqlJson(data_rows)
            }
        },
        async:false
    });
}

function createSectionJson(data_rows){
    for(let i=0;i<data_rows.length;i++){
        var details=data_rows[i].c
        var sectionid=details[0].v
        if(!(sectionid in jsondataquery)){
            jsondataquery[sectionid]={}
        }
        jsondataquery[sectionid]["name"]=details[1].v
        jsondataquery[sectionid]["description"]=details[2].v
    }
    createSectionLHS()
}

function createSqlJson(data_rows){
    for(let i=0;i<data_rows.length;i++){
        var dictsnip={}
        var details=data_rows[i].c
        var sectionid=details[2].v
        dictsnip["title"]=details[0].v;
        dictsnip["query"]=details[1].v;
        dictsnip["access"]=details[3].v;
        if(sectionid in jsondataquery){
            if("snippets" in jsondataquery[sectionid]){
                jsondataquery[sectionid]["snippets"].push(dictsnip)
            }
            else{
                jsondataquery[sectionid]["snippets"]=[dictsnip]
            }
        }
        else{
            jsondataquery[sectionid]={"snippets":[dictsnip]}
        }
    }
}

function createSectionLHS(){
    var licurrent;
    var parentul=document.getElementById("sql-sections");
    for (const [key, value] of Object.entries(jsondataquery)) {
        let li=document.createElement("li");
        if(!("current-section" in sessionStorage)|| sessionStorage.getItem("current-section")==key){
            li.setAttribute("class","chapter active");
            licurrent=li;
            sessionStorage.setItem('current-section',key);

        }
        let a=document.createElement("a");
        li.setAttribute("onclick","createSqlSnippets(this,'"+key+"');")
        li.setAttribute("id",storagesectionid+key)
        let i=document.createElement("i");
        i.setAttribute("class","fa fa-check");
        let b=document.createElement("b")
        b.innerHTML=parseInt(key)+1
        let textNode = document.createTextNode(" "+value.name);
        a.append(i);
        a.append(b);
        a.append(textNode)
        li.append(a)
        parentul.append(li);
      }
      licurrent.click();
}


function toggleLHS(ele){
    var lhs=document.getElementsByClassName("book-summary")[0];
    var rhs=document.getElementsByClassName("book-body")[0];
    let lhs_width=lhs.offsetWidth;
    if(lhs_width > 1){
    lhs.style.width="0px";
    rhs.style.left="50px";
    ele.style.left="30px";
    }
    else{
        lhs.style.width="300px";
        rhs.style.left="300px";
        ele.style.left="270px";
    }
}