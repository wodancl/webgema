function call_img(e){
    let data = {};
    let timeget=new Date(e);
    console.log(timeget)
    data.time = timeget;
            $.ajax({
                  type: 'POST',
                  data: JSON.stringify(data),
                  contentType: 'application/json',
                  url: '/img_map',	
                  dataType: 'json',					
                  success: function(data) {
                  }, 
                  complete: function (data) {
            
                      var json = eval(JSON.parse(data.responseText));
                      console.log(json)
                      for (var i = 0; i < json.length; i++){
                          var img= json[i].img
                      console.log(img)
                      document.getElementById("content").innerHTML = img;


                      }      
                      }
  });
}