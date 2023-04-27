
// const sheetId='12iRkOmBHaahLrLbBLvqnzSKzWOsO1xHEQckGvXNpD-o'
const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
const query = encodeURIComponent('Select *')
const mime = 'text/x-mysql';
// var jsondataquery={}
const storagesectionid="section-id-";
var cache = {}
var current_section_id;
$(document).ready(function () {
    console.log("helllo")
    // init();
    newlhs()
    // createSectionLHS();
    console.log("helllo1")
    // scrollToTap();
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

function set_storage_section(event,ele,sectionid){
    event.stopPropagation();
    showSpinner()

    let parent = ele.getAttribute("data-parent")

    var prevsection = JSON.parse(sessionStorage.getItem('current-section'+sheetId))['key'];
    var prevele = document.getElementById(storagesectionid+prevsection);
    prevele.classList.remove("active");
    ele.classList.add("active");
    let active = {"key":sectionid, "parent": parent }
    sessionStorage.setItem('current-section'+sheetId, JSON.stringify(active));

    if(parent != current_section_id){

        document.getElementById("maincontent").innerHTML = ''
        handleSectionClick(parent)
    }
    if(parent != sectionid){

    let elmntToView = document.getElementById("section-"+sectionid);
    elmntToView.scrollIntoView();
    } 
    current_section_id = parent
    hideSpinner()

    // location.reload();

}

async function createSqlSnippets(sectionid){

    console.log(sectionid)
    var data=jsondataquery[sectionid]

    createMainPage(data,sectionid,false)

    document.getElementById("section-heading").innerHTML=data.Name
    document.getElementById("section-description").innerHTML=data.Details
    if(data.Slides == ''){
        document.getElementById("pptslides").innerHTML = ''
        document.getElementById("pptslides").style.display = 'none'
    }
    else{
        document.getElementById("pptslides").innerHTML = data.Slides
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
            txt="<h2>"+parseInt(i+1)+". " + snippetdata[i].Title +"</h2>"
            txt=txt+ '<div data-datacamp-exercise data-lang="r" data-no-lazy-load data-show-run-button data-height="500">'+
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
        txt=txt+"<h2>"+parseInt(i+1)+". " + snippetdata[i].Title +"</h2>"
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


function handleSectionClick(sectionid){

    document.getElementById("maincontent").innerHTML = ' '
    var data=jsondataquery[sectionid]

    if(sectionid in cache){
        document.getElementById("maincontent").innerHTML = cache[sectionid]
    }
    else{
        if(data.parent in cache){
            document.getElementById("maincontent").innerHTML = cache[data.parent]
        }
        else{
            let divcontent = createMainPage(data,sectionid,false)
            cache[sectionid] = divcontent.innerHTML
            cache[data.parent] = divcontent.innerHTML
        }
    }
    initAddedDCLightExercises();
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    // scrollToTap()
}

function createMainPage(data,sectionid,child){
    let mdiv= document.getElementById("maincontent")
    let topdata = generate_content(data,sectionid)
    mdiv.append(topdata)
    for (let val in data.child){
        createMainPage(data['child'][val],val,true)
    }
    return mdiv
}

function generate_content(data,sectionid){
    let maindiv = document.createElement('div');
    maindiv.setAttribute("id","section-"+sectionid)
    let header = document.createElement('h2');
    header.setAttribute("class","section-heading")
    let dashed = document.createElement('hr');
    dashed.setAttribute("class","dashed")
    let boundless = document.createElement('h2');
    boundless.setAttribute("class","boundless-heading")
    let boundlessDetails = document.createElement('div');
    boundlessDetails.setAttribute("class","boundlessDetails")
    let pptslidediv =  document.createElement('div');
    pptslidediv.setAttribute("id","pptslides-"+sectionid)
    let detailsdiv =  document.createElement('div');
    detailsdiv.setAttribute("class","section-description")
    let snippetdiv = document.createElement('div');
    snippetdiv.setAttribute("id","snippets-"+sectionid)

    header.innerHTML = sectionid + ". "+ data.Name
    detailsdiv.innerHTML = data.Details

    if(data.Slides == ''){
        pptslidediv.innerHTML = ''
        pptslidediv.setAttribute("style","display:none;")
    }
    else{
        pptslidediv.innerHTML = data.Slides
        pptslidediv.setAttribute("style","display:block;")
    }

    if(!("snippets" in data)){
        return;
    }
    var snippetdata=data.snippets
    for(let i=0;i<snippetdata.length;i++){
        if(snippetdata[i].Type == 'R'){
            let pre_code = snippetdata[i].PreExCode ? snippetdata[i].PreExCode : ''
            let details = snippetdata[i].Details ? snippetdata[i].Details : ''
            if(snippetdata[i].Title == " " ){
                txt="<h3 class='snippet-header'>"+parseInt(i+1)+". " + snippetdata[i].Title +"</h3>"
            }
            else{
                txt = ""
            }
            txt=txt+ '<div data-datacamp-exercise data-lang="r" data-no-lazy-load data-show-run-button data-height="500">'+
            '<code data-type="pre-exercise-code">'+ pre_code +'</code>'+
            '<code data-type="sample-code">'+
            snippetdata[i].Query+
            '</code>'+
            '<code data-type="solution"> </code>'+
            '<code data-type="sct"> </code>'+
            '<div data-type="hint"> </div>'+
            '</div>';
            txt = txt + "<div class='section-description'>" + details + "</div>"
            var childiv=document.createElement("div");
            childiv.setAttribute("id","example-"+i);
            childiv.innerHTML=txt;
            snippetdiv.append(childiv);
            
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
            snippetdiv.append(childiv);
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
        snippetdiv.append(childiv);
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

    maindiv.append(header)
    maindiv.append(dashed)
    maindiv.append(pptslidediv)
    maindiv.append(detailsdiv)

    if(data.BoundlessDataset == ''){
        console.log("n")
    }
    else{
        boundless.innerHTML = "Boundless Analytics";
        let link = document.createElement("a");
        link.setAttribute("href","http://209.97.156.178:8082/getsingleDatasetNames?name="+data.BoundlessDataset)
        link.setAttribute("target","_blank")
        link.innerHTML = "Boundless Analytics for dataset : " + data.BoundlessDataset
        boundlessDetails.append(link)
        maindiv.append(boundless)
        maindiv.append(boundlessDetails)
    } 

    maindiv.append(snippetdiv)
    return maindiv
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



async function init(){
    var sheetName= 'Sheet1';
    var url = `${base}&sheet=${sheetName}&tq=${query}`
    console.log("1")
    var sqlsnipp= await fetchGoogleSheetsData(url,"sqlsnippets")
    console.log(sqlsnipp)
    console.log("2")
    sheetName = 'Sheet2';
    url = `${base}&sheet=${sheetName}&tq=${query}`
    var sections = await fetchGoogleSheetsData(url,"sections")
    console.log("3")
}



async function fetchGoogleSheetsData(url,type){
    var res;
    await $.ajax({
        url: url,
        success: function(result) {
            const jsonData = JSON.parse(result.substring(47).slice(0, -2));
            res = jsonData
            console.log("hello inside")
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
    return res
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
        console.log(value)
        let li=document.createElement("li");
        if(!("current-section"+sheetId in sessionStorage)|| sessionStorage.getItem("current-section"+sheetId)==key){
            li.setAttribute("class","chapter active");
            licurrent=li;
            sessionStorage.setItem('current-section'+sheetId,key);
            current_key=key
        }
        let a=document.createElement("a");
        li.setAttribute("onclick","set_storage_section(event,this,'"+key+"');")
        li.setAttribute("id",storagesectionid+key)
        let i=document.createElement("i");
        i.setAttribute("class","fa fa-check");
        let b=document.createElement("b")
        b.innerHTML=parseInt(key)+". "
        let textNode = document.createTextNode(" "+value.Name);
        a.append(i);
        a.append(b);
        a.append(textNode)
        li.append(a)
        parentul.append(li);
      }
      createSqlSnippets(current_key);
}

function newlhs(){
    var current_key;
    var current_parent;
    const buildLI = (data,key) => {
        const li = document.createElement('li');
        if(!("current-section"+sheetId in sessionStorage)|| JSON.parse(sessionStorage.getItem('current-section'+sheetId))['key']==key){
            li.setAttribute("class","chapter active");
            licurrent=li;
            let active = {"key":key, "parent": data.parent }
            sessionStorage.setItem('current-section'+sheetId,JSON.stringify(active));
            current_key=key
            current_parent = data.parent
            current_section_id = data.parent
        }
        let a=document.createElement("a");
        li.setAttribute("onclick","set_storage_section(event,this,'"+key+"');")
        li.setAttribute("data-parent",data.parent)
        li.setAttribute("id",storagesectionid+key)
        let i=document.createElement("i");
        i.setAttribute("class","fa fa-check");
        let b=document.createElement("b")
        b.innerHTML=key+". "
        let textNode = document.createTextNode(" "+data.Name);
        a.append(i);
        a.append(b);
        a.append(textNode)
        li.append(a)
        if(data.child) li.appendChild(buildUL(data.child));
        return li;
      };
      
      const buildUL = (data) => {
        const ul = document.createElement('ul');
        for(let d in data) {
            ul.appendChild(buildLI(data[d],d));
        }
        // data.forEach(d => {
        //   ul.appendChild(buildLI(d));    
        // });
        return ul;
      };
     document.getElementById("sql-sections").append(buildUL(jsondataquery))
     handleSectionClick(current_parent);
    //   console.log(buildUL(jsondataquery))
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

