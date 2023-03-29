
// const sheetId='12iRkOmBHaahLrLbBLvqnzSKzWOsO1xHEQckGvXNpD-o'
const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
const query = encodeURIComponent('Select *')
const mime = 'text/x-mysql';
var jsondataquery={}
const storagesectionid="section-id-";
$(document).ready(function () {
    console.log("helllo")
    init();
    console.log("helllo1")
    scrollToTap();
    initAddedDCLightExercises();
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    console.log("helllo2")
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

function set_storage_section(ele,sectionid){
    var prevsection=sessionStorage.getItem('current-section'+sheetId);
    var prevele=document.getElementById(storagesectionid+prevsection);
    prevele.classList.remove("active");
    ele.classList.add("active");
    sessionStorage.setItem('current-section'+sheetId, sectionid);
    location.reload();
}

async function createSqlSnippets(sectionid){

    console.log(jsondataquery)
    var data=jsondataquery[sectionid]

    document.getElementById("section-heading").innerHTML=data.name
    document.getElementById("section-description").innerHTML=data.description
    if(data.pptslides == ''){
        document.getElementById("pptslides").innerHTML = ''
        document.getElementById("pptslides").style.display = 'none'
    }
    else{
        document.getElementById("pptslides").innerHTML = data.pptslides
        document.getElementById("pptslides").style.display = 'block'
    }

    maindiv=document.getElementById("maincontainer");
    maindiv.style.display="block";
    maincontainer.innerHTML='';
    if(!("snippets" in data)){
        return;
    }
    var snippetdata=data.snippets
    
    for(let i=0;i<snippetdata.length;i++){
        if(snippetdata[i].Type == 'R'){
            let pre_code = snippetdata[i].PreExCode ? snippetdata[i].PreExCode : ''
            txt="<h3>"+parseInt(i+1)+". " + snippetdata[i].Title +"</h3>"
            txt=txt+ '<div data-datacamp-exercise data-lang="r" data-no-lazy-loading data-show-run-button data-height="500">'+
            '<code data-type="pre-exercise-code">'+ pre_code +'</code>'+
            '<code data-type="sample-code">'+
            snippetdata[i].Query+
            '</code>'+
            '<code data-type="solution"> </code>'+
            '<code data-type="sct"> </code>'+
            '<div data-type="hint"> </div>'+
            '</div>';
            var childiv=document.createElement("div");
            childiv.setAttribute("id","example-"+i);
            childiv.innerHTML=txt;
            maindiv.append(childiv);
            
            continue
        }
        else if(snippetdata[i].Type == 'Python'){
            var txt="";
            txt=txt+ '<div data-datacamp-exercise data-lang="python" data-show-run-button data-height="500">'+
            '<code data-type="pre-exercise-code">'+ snippetdata[i].PreExCode +'</code>'+
            '<code data-type="sample-code">'+
            snippetdata[i].Query+
            '</code>'+
            '<code data-type="solution"> </code>'+
            '<code data-type="sct"> </code>'+
            '<div data-type="hint"> </div>'+
            '</div>';
            var childiv=document.createElement("div");
            childiv.setAttribute("id","example-"+i);
            childiv.innerHTML=txt;
            maindiv.append(childiv);
            continue
        }
        txt="";
        txt=txt + "<div class='ws-grey' style='padding:15px;padding-bottom:40px;margin-bottom:0px;box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);'>"
        txt=txt+"<h3>"+parseInt(i+1)+". " + snippetdata[i].Title +"</h3>"
        txt=txt+"<textarea id='textarea-"+i+"' wrap='logical' style='display: none;'>"+snippetdata[i].Query+"</textarea>"
        txt=txt+"<p>Edit the SQL Statement, and click Run SQL to see the result.</p>"
        txt=txt+"<button class='ws-btn' type='button' onclick='sqlCodeSubmit("+i+");'>Run Query »</button>" + "<h3>Result:</h3>" 
        txt=txt+"<div id='resultSQL-"+i+"'>"+
        "<div class='w3-white' id='divResultSQL-"+i+"' style='display: block; padding:10px;'>"+
        "  Results will be displayed here" + 
        "</div></div> </div>  ";
        var childiv=document.createElement("div");
        childiv.setAttribute("id","example-"+i);
        childiv.setAttribute("class","outersnippetdiv");
        if(snippetdata[i].Width){
            childiv.setAttribute("style","width:"+parseFloat(snippetdata[i].Width)*100+"%");
        }
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
    initAddedDCLightExercises();
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    scrollToTap()
}

function sqlCodeSubmit(id){

    showSpinner();
    var resultContainer = document.getElementById("divResultSQL-"+id);
    resultContainer.innerHTML = "";
    var existing_result=jsondataquery[sessionStorage.getItem('current-section'+sheetId)]['snippets'][id].Result
    var type=jsondataquery[sessionStorage.getItem('current-section'+sheetId)]['snippets'][id].Type
    if(existing_result){
        if(type=='mongo'){
            txt = "";
            txt = txt + "<div style='padding:10px;'><div style='margin-bottom:10px;'>Number of Records: " + 1 + "</div>";
            txt=txt+"<div style='margin-bottom:10px;'>Execution Time: " + 0.000012 + " seconds</div>"
            resultContainer.innerHTML = txt + '<div class="" style="height:auto;max-height:600px;overflow-y: auto;"><pre>' + existing_result + '</pre></div>';
            hideSpinner()
            return
        }
        txt = "";
        txt = txt + "<div style='padding:10px;'><div style='margin-bottom:10px;'>Number of Records: " + 1 + "</div>";
        txt=txt+"<div style='margin-bottom:10px;'>Execution Time: " + 0.05 + " seconds</div>"
        txt = txt + "<div class=''><table id='tableresult-"+id+"' class='ws-table-all notranslate'>";
        resultContainer.innerHTML =  txt + "</table></div>";
        $('#tableresult-'+id).DataTable({
            data:[{
                'result':existing_result
            }],
            columns:[{title:'result',data:'result'}],
            columnDefs: [{
                "targets": '_all',
                "defaultContent": "null"
            }],
            paging: false,
            scrollY: 700,
            responsive: true
        });
        hideSpinner()
        return
    }



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
    var type=jsondataquery[sessionStorage.getItem('current-section'+sheetId)]['snippets'][id].Type
    if (type=='mongo'){
        var REST_CALL = "/mongoTutorialCode";
        if(sqlcode.includes("insert") || sqlcode.includes("update") || sqlcode.includes("delete")){
            resultContainer.innerHTML='Please run the above query in the local workbench.'
            hideSpinner();
            return;
        }
    }
    else{
    var REST_CALL = "/sqlTutorialCode";
    }
    var sendData={"sqlcode":sqlcode}
    $.ajax({
        url: REST_CALL,
        data: JSON.stringify(sendData),
        type: 'POST',
        contentType: "application/json",
        success: function(result) {
            // console.log(result)
            result=JSON.parse(result)
            if (type=='mongo'){
                txt = "";
                txt = txt + "<div style='padding:10px;'><div style='margin-bottom:10px;'>Number of Records: " + result['result'].length+ "</div>";
                txt=txt+"<div style='margin-bottom:10px;'>Execution Time: " + parseFloat(result['execution']).toFixed(5) + " seconds</div>"
                resultContainer.innerHTML = txt + '<div class="" style="height:auto;max-height:600px;overflow-y: auto;"><pre>' + JSON.stringify(result['result'], null, 4) + '</pre></div>';
                hideSpinner()
                return
            }
            res=result['result']
            var len=parseInt(res.length)
            cols=[]
            if(len >0){
                for(let i=0;i<result['cols'].length;i++){
                    cols.push({title:result['cols'][i],data:result['cols'][i]})
                }
                txt = "";
                txt = txt + "<div style='padding:10px;'><div style='margin-bottom:10px;'>Number of Records: " + len + "</div>";
                txt=txt+"<div style='margin-bottom:10px;'>Execution Time: " + parseFloat(result['execution']).toFixed(3) + " seconds</div>"
                txt = txt + "<div class=''><table id='tableresult-"+id+"' class='ws-table-all notranslate'>";
                resultContainer.innerHTML =  txt + "</table></div>";
                $('#tableresult-'+id).DataTable({
                    data:result['result'],
                    columns:cols,
                    columnDefs: [{
                        "targets": '_all',
                        "defaultContent": "null"
                    }],
                    paging: false,
                    scrollY: 700,
                    responsive: true
                });
            }
            else{
                resultContainer.innerHTML='Please run the above query in the local workbench.'
            }
            hideSpinner()
        },
        error: function (err) {
            console.log("ERROR")
            console.log(err)
            resultContainer.innerHTML='Please run the above query in the local workbench.'
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
            var data_rows=jsonData.table.rows
            var data_cols=jsonData.table.cols
            if(type=="sections"){
                createSectionJson(data_rows,data_cols)
            }
            else{
                createSqlJson(data_rows,data_cols)
            }
        },
        async:false
    });
}

function createSectionJson(data_rows,data_cols){
    for(let i=0;i<data_rows.length;i++){
        var details=data_rows[i].c
        var sectionid=details[0].v
        if(!(sectionid in jsondataquery)){
            jsondataquery[sectionid]={}
        }
        if(details[2]){
           jsondataquery[sectionid]["description"]=details[2].v
        } 
        else{
            jsondataquery[sectionid]["description"]=""
        }
        if(details[3]){
            jsondataquery[sectionid]["pptslides"]=details[3].v
         } 
         else{
             jsondataquery[sectionid]["pptslides"]=""
         }
        jsondataquery[sectionid]["name"]=details[1].v
        
    }
    createSectionLHS()
}

function createSqlJson(data_rows,data_cols){
    for(let i=0;i<data_rows.length;i++){
        var dictsnip={}
        var details=data_rows[i].c
        for(let j=0;j<data_cols.length;j++){
            if(details[j]){
                dictsnip[data_cols[j].label]=details[j].v
            }
            else{
                dictsnip[data_cols[j].label]=null
            }
        }
        let sectionid=dictsnip["Section"]
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
    var current_key;
    var parentul=document.getElementById("sql-sections");
    for (const [key, value] of Object.entries(jsondataquery)) {
        let li=document.createElement("li");
        if(!("current-section"+sheetId in sessionStorage)|| sessionStorage.getItem("current-section"+sheetId)==key){
            li.setAttribute("class","chapter active");
            licurrent=li;
            sessionStorage.setItem('current-section'+sheetId,key);
            current_key=key
        }
        let a=document.createElement("a");
        li.setAttribute("onclick","set_storage_section(this,'"+key+"');")
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
      createSqlSnippets(current_key);
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

