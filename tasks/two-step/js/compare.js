//---------------------------------------//
// Define experiment parameters.
//---------------------------------------//

// Define transition probabilities.
const trans_probs  = [0.7,0.3];         // [common, uncommon]
const trans_bounds = [0.6,0.8];         // bounds around common

// Define timing parameters.
const choice_duration = 10000;
const feedback_duration = 1200;

// Define randomization parameters.
const randomize_s1 = false;            // randomize left/right position of state 1 bandits
const randomize_s2 = false;            // randomize left/right position of state 2 bandits

// Define quality assurance parameters.
var missed_threshold = 6;
var missed_responses = 0;

//---------------------------------------//
// Define stimulus features.
//---------------------------------------//
// The indices of the rocket and planet colors are mapped.
// That is, the first rocket will lead to the first planet
// under the common transition.

// Define stimulus constants.
const planet_colors = ['#5b7c65','#706081','#7f5d5d','#5f6f81'];
const rocket_colors = ['#48a782','#955db9','#a75248','#486ea7'];
const font_colors = ['#398667','#754198','#aa5349','#416598'];
const color_names = ['green','purple','red','blue'];

// Define stimulus assignments.
const mapping = jsPsych.randomization.shuffle([
    jsPsych.randomization.shuffle([0,1]),
    jsPsych.randomization.shuffle([2,3]),
]).flat();

// Define task stimuli.
const task_info = {
  planet_colors: mapping.slice(0,2).map(function(i) {return planet_colors[i]} ),
  font_colors: mapping.map(function(i) {return font_colors[i]} ),
  planet_names: mapping.slice(0,2).map(function(i) {return color_names[i]} ),
  rocket_colors: mapping.slice(2,4).map(function(i) {return rocket_colors[i]} ),
  rocket_names: mapping.slice(2,4).map(function(i) {return color_names[i]} ),
  aliens: jsPsych.randomization.shuffle([1,2,3,4]).map((j,i) => {
    return './img/aliens_svg/A'+j+'-'+color_names[mapping[i<2?0:1]]+'.svg'
  })
}

// Define practice stimuli.
var practice_info = {
  planet_colors: mapping.slice(2,4).map(function(i) {return planet_colors[i]} ),
  font_colors: mapping.map(function(i) {return font_colors[i]} ),
  planet_names: mapping.slice(2,4).map(function(i) {return color_names[i]} ),
  rocket_colors: mapping.slice(0,2).map(function(i) {return rocket_colors[i]} ),
  rocket_names: mapping.slice(0,2).map(function(i) {return color_names[i]} ),
  aliens: jsPsych.randomization.shuffle([1,2,3,4]).map((j,i) => {
    return './img/aliens_svg/P'+j+'-'+color_names[mapping[i<2?2:3]]+'.svg'
  })
}

// Define images to preload.
var preload_images = task_info['aliens'].concat(practice_info['aliens']);

//---------------------------------------//
// Define reward outcomes.
//---------------------------------------//

// function loadData(filename){
//   return require(filename);
//   // console.log("sending http request to server")
//   // var xhr = new XMLHttpRequest();
//   // console.log('using path: ', filename)
//   // try {
//   //   xhr.open('GET', filename);
//   //   console.log(xhr.text)
//   //   xhr.onreadystatechange = function() {
//   //     alert(xhr.responseText);
//   //   }
//   //   if (xhr.status === 200) {
//   //     xhr.send(null)
//   //     console.log(xhr.responseText)
//   //   }
//   //   return xhr.responseText
//   // } catch (error) {
//   //   console.error(error)
//   // }
//   // xhr.setRequestHeader('Content-Type', 'application/json');
//   // xhr.send(JSON.stringify({filedata: data, filename: filename}));
// }


// Get last session data for subject by guessing name of last data file and loading it
// pull vars embedded in the redcap generated url
var record_id = String(jsPsych.data.getURLVariable('record_id'));
var instance = parseInt(jsPsych.data.getURLVariable('instance'));
var prev_instance = String(instance - 1);
var event_name = String(jsPsych.data.getURLVariable('event_name')).split('_')[0];
var project = String(jsPsych.data.getURLVariable('project'));

  // force record_id to 3 chars
while (record_id.length < 3){
  record_id = '0' + record_id
}
// and session number to 2 chars
while (prev_instance.length < 2){
  prev_instance = '0' + prev_instance
}

console.log('generating what last session data file should be');
var last_session = event_name + prev_instance;
console.log(event_name, last_session);

var last_datafile = 'sub-' + project + record_id + '_ses-' + last_session + '_task-twostep'+ '_beh.json';//dt.getFullYear() + dt.getMonth() + dt.getDay() + dt.getHours() + '.csv'
const last_data_path = '../data/' + last_datafile
console.log("Loading last session data from: ", last_datafile);

// Randomly choose the drifting outcome probabilities for the task.
// Drifts are chosen from a standalone file pre-generated Gaussian random walks.

var drift_ix = jsPsych.randomization.sampleWithoutReplacement([0,1,2,3], 1)[0];


console.log('using ix: ', drift_ix)

const drifts = [drifts_01, drifts_02, drifts_03, drifts_04][drift_ix];

console.log("defining outcomes");
// Define outcomes.
// Evaluate outcomes to define the trial-by-trial outcomes for each bandit.
const outcomes = [];
for (let i=0; i<drifts.length; i++) {
  outcomes.push( drifts[i].map(p => Math.random() < p ? 1 : 0) )
}
console.log('defining transistions');
//---------------------------------------//
// Define transition probabilities.
//---------------------------------------//
// Generate the trial-by-trial state transitions (common or uncommon) using
// the transition probabilities defined above. The while loop ensures that
// the sequence contains a fraction of common transitions within bounds.

while (true) {
  // Generate transition events.
  var transitions = jsPsych.randomization.sampleWithReplacement([1,0], drifts.length, trans_probs);
  // Compute average.
  const avg = transitions.reduce(function(a,b){return a+b}, 0) / transitions.length;
  // Assert average transition probability close to 0.7.
  if (avg > trans_bounds[0] && avg < trans_bounds[1]) { break; }
}

//---------------------------------------//
// Define experiment timeline.
//---------------------------------------//

// Preallocate space.
var TWO_STEP_TASK = [];
console.log('generating trials');
// Iteratively generate trials.
for (let i=0; i < outcomes.length; i++){

  // Define trial.
  const trial = {
    type: jsPsychTwoStepTrial,
    transition: transitions[i],
    outcomes:  outcomes[i],
    rocket_colors: task_info.rocket_colors,
    planet_colors: task_info.planet_colors,
    aliens: task_info.aliens,
    choice_duration: choice_duration,
    feedback_duration: feedback_duration,
    randomize_s1: randomize_s1,
    randomize_s2: randomize_s2,
    data: {
      trial: i+1,
      drifts: drifts[i],
      drift_ix: drift_ix
    },
    on_finish: function(data) {

      // Store number of browser interactions
      data.browser_interactions = jsPsych.data.getInteractionData().filter({trial: data.trial_index}).count();

      // Evaluate missing data
      if ( data.state_1_choice == null || data.state_2_choice == null ) {

        // Set missing data to true.
        data.missing = true;

        // Increment counter. Check if experiment should end.
        missed_responses++;
        if (missed_responses >= missed_threshold) {
          jsPsych.endExperiment();
        }

      } else {

        // Set missing data to false.
        data.missing = false;

      }

    }
  }

  // Define looping node.
  const trial_node = {
    timeline: [trial],
    loop_function: function(data) {
      return data.values()[0].missing;
    }
  }

  // Append trial.
  TWO_STEP_TASK.push(trial_node)
  // console.log('appending trial: ', TWO_STEP_TASK);
}
// var last_drift = experiment_vars[1];
// var TWO_STEP_TASK = experiment_vars[0];
// console.log('loading last drift: ', last_drift);
console.log('task: ', TWO_STEP_TASK.slice(0,100));

  //---------------------------------------//
  // Define transition screens.
  //---------------------------------------//
console.log('defining ready screens');
// Define ready screen.
var READY_01 = {
  type: jsPsychTwoStepInstructions,
  pages: [
    "<p>Great job! You've finished the instructions.</p><p>We'll get started with the real game now.</p>",
    "<p>In the real game, you will see new planets, aliens, and rocket ships.</p><p>However, the rules of the game <b>have not changed</b>.</p>",
    "Get ready to begin <b>Block 1/2</b>. It will take ~8 minutes.<br>Press next when you're ready to start.",
  ]
}

var READY_02 = {
  type: jsPsychTwoStepInstructions,
  pages: [
    "Take a break for a few moments and press any button when you are ready to continue.",
    "Get ready to begin <b>Block 2/2</b>. It will take ~8 minutes.<br>Press next when you're ready to start.",
  ]
}

//---------------------------------------//
// Define end of experiment screens.
//---------------------------------------//

// Define finish screen.
const instructions_04 = {
  type: jsPsychTwoStepInstructions,
  pages: [
    "<p>Great job! You've finished the task.</p><p>Before you finish, we have a couple of short questions for you.</p>",
  ]
}

const final_page = {
  type: jsPsychTwoStepInstructions,
  pages: [
    "<p>Thank you for your help in our research!</p><p>You may now close this window.</p>",
  ]
}

// Define comprehension check.
const quiz_04 = {
  type: jsPsychTwoStepComprehension,
  prompts: [
    `Which rocket ship went mostly to the <b><font color='${task_info.font_colors[0]}'>${task_info.planet_names[0]}</font></b> planet?`,
    `Which rocket ship went mostly to the <b><font color='${task_info.font_colors[1]}'>${task_info.planet_names[1]}</font></b> planet?`,
  ],
  options: [
    task_info.rocket_names,
    task_info.rocket_names,
  ],
  correct: [
    task_info.rocket_names[0],
    task_info.rocket_names[1],
  ]
}

var FINISHED = [
  instructions_04,
  quiz_04,
  final_page
];
