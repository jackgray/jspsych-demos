// Initialize jsPsych.
var jsPsych = initJsPsych({
  on_finish: function() {

    // Add interactions to the data variable
    var interaction_data = jsPsych.data.getInteractionData();
    jsPsych.data.get().addToLast({interactions: interaction_data.json()});

    // Display jsPsych data in viewport.
    //jsPsych.data.displayData();

    // redirect to cute animal picture on completion
    window.location = "https://i.pinimg.com/736x/a9/9a/e9/a99ae98c6d1ecf3f34f9051902b34387--beagles-beagle-puppies.jpg"
  }
});
