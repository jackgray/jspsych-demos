// load last session's data

console.log("testing 123")
var test = $(document).ready(function(){
    $.getJSON( "/aliens-manifest.json", function( data ) {
    console.log(data);
    const subj_stats = data;
    $("#text").html(data["text"]);
  }).fail(function(){
      console.log("An error has occurred.")
  });
});
console.log("it's probably working: ", test["text"])