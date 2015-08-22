var ref = new Firebase("https://cdnsviewer.firebaseio.com/");


function selectText(containerid) {
    containerid =  containerid || 'codeGeneratedContainer';
    $('#codeGeneratedContainer').removeClass('animated zoomInUp').addClass('animated zoomInUp');
    if (document.selection) {
        var range = document.body.createTextRange();
        range.moveToElementText(document.getElementById(containerid));
        range.select();
    } else if (window.getSelection()) {
        var range = document.createRange();
        range.selectNode(document.getElementById(containerid));
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    }
}

function validateUrl(url,cb){
  $.ajax({
    type: 'GET',
    url: url,
    success: function(){
      cb(true);
    },
    error: function() {
      cb(false);
    }
  });
}

function addUrl($input,cb){
  //console.log('addUrl.handler');
  var url = $input.val();
  if(url == null || url == ''){
    return;
  }
  validateUrl(url,function(isValid){
      if(isValid)ref.push(url);
      cb(isValid);
  })
  $input.val('');
}


var selectionItems = [];
var textAreaItems = [];

function renderTextAreaItems(){
  var arr = [];
  for(var x in textAreaItems){
    var val = textAreaItems[x];
    var tag ='';
    if(val.indexOf('.css')!==-1){
      tag += "&lt;link rel='stylesheet' type='text/css' href='"+val+"'>&lt;/script&gt;";
    }else{
      tag += "&lt;script type='text/javascript' src='"+val+"'>&lt;/script&gt;";
    }
    arr.push(
      $('<li/>').html(tag)
    )
  }
  $('ul.code').empty().append(arr);
}

function selectionListItemClickHandler(){
  var url = $(this).html();
  //console.log('selection click '+url);
  for(var x in textAreaItems) {
    if(textAreaItems[x] == url){
      textAreaItems.splice(x,1);
      renderTextAreaItems();
      $(this).removeClass('active');
      return;
    }
  }
  $(this).addClass('active');
  textAreaItems.push(url);
  renderTextAreaItems();
}
function resultListItemClickHandler(){
  var arr = [], val = $(this).html();
  selectionItems.forEach(function(v){
    if(val == v) val = null;//omit equal.
  });
  if(val==null) return;
  selectionItems.push(val);
  var li = $('<li/>')
    .html(val)
    .click(selectionListItemClickHandler);
  arr.push(li);
  $(this).detach();
  $('ul.selectionList').append(arr);
}
function searchLibrary($input){
  var txt = $input.val();
  var $list = $('ul.list');
  if(txt == '' || txt == null){
    $list.empty();
    return;
  }

  //console.log('search.handler');

  ref.orderByValue().once('value',function(snap){
    var arr =[];

    //console.info(snap);

    snap.forEach(function(data){
        if(data.val().toString().toLowerCase().indexOf(txt.toString().toLowerCase()) !== -1) {
          arr.push(
            $('<li/>')
              .html(data.val())
              .click(resultListItemClickHandler)
          );
        }
        //console.log(data.val()+' == '+txt);
    });

      if(arr.length == 0){
          arr.push(
            $('<li/>').html('No Results')

          );
      }
      $list.empty().append(arr);
    //  console.log(arr);

  });

}

function showMessage(msg){
  var elem = $('input.searchAdd');
  var attr = elem.attr('placeholder');
  console.info(msg);
  elem.attr('placeholder',msg);

  elem.removeClass('animated flash').addClass('animated flash');

  setTimeout(function(){
      elem.attr('placeholder',attr);
  },3000)
}

//INPUT search or add
$(function(){
  var data = {
    'add':{
      name:'Add'
      ,txt:'Write a valid url and press enter'
      ,fn:addUrl
    },
    'search':{
      name:'Search'
      ,txt:'Search js,css by name'
      ,fn:searchLibrary
    }
    ,current: 'search'
  };
  var $input = $('input.searchAdd');
  var $title = $('a.searchAdd');
  function searchAddClickHandler(){
      var name = data.current;
      //
      $title.html(name);
      $input
        .attr('placeholder',data[name].txt)
        .off('keyup')
        .keyup(function(e) {
            //console.log(String.fromCharCode(e.which));
            if(e.which == 13) {
              data[name].fn($input,function(res){
                console.info(name+' - cb: '+res);
                //add
                if(name == 'add'){
                  var msg = res==true?'Added':'Invalid Url';
                  showMessage(msg);
                }
              });
            }else{
              if(name == 'search'){
                data[name].fn($input,function(res){});
              }
            }
      });

      data.current = (data.current=='search')?'add':'search';
  }
  $title.click(searchAddClickHandler);
  searchAddClickHandler();
});
