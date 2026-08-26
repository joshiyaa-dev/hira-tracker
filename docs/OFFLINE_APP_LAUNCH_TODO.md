# Hira AI Gym Trainer TODO

This is the master checklist for turning Hira AI into a full gym trainer APK: technical build items, trainer logic, lifestyle coaching, and daily product flow.

## 1) Product Definition

- [ ] Define Hira AI as a gym trainer, not a general chatbot.
- [ ] Make the app speak like a coach, not a casual assistant.
- [ ] Make every answer depend on user body type, goal, workout, and food state.
- [ ] Support beginners, intermediates, advanced lifters, and home-only users.
- [ ] Support fat loss, muscle gain, strength, recomposition, and general fitness.
- [ ] Support male and female users without changing the core flow.
- [ ] Support users who do gym, home workout, or mixed workout.
- [ ] Support users who want streak tracking and daily accountability.

## 2) User Onboarding

- [ ] Collect name.
- [ ] Collect age.
- [ ] Collect weight.
- [ ] Collect height.
- [ ] Collect body type.
- [ ] Collect fitness goal.
- [ ] Collect gym experience level.
- [ ] Collect home workout availability.
- [ ] Collect injury or restriction flags.
- [ ] Collect diet preference.
- [ ] Collect daily time available.
- [ ] Collect training frequency.
- [ ] Collect wake-up and sleep timing.
- [ ] Collect full-body photo.
- [ ] Collect voice preference.
- [ ] Collect language preference if needed later.
- [ ] Save onboarding profile locally.
- [ ] Show privacy explanation before saving photo or memory.

## 3) Main Screens

- [ ] Welcome screen.
- [ ] Login or guest start screen.
- [ ] Onboarding wizard.
- [ ] Profile summary screen.
- [ ] Main chat screen.
- [ ] Today coach screen.
- [ ] Workout screen.
- [ ] Food screen.
- [ ] Home workout screen.
- [ ] YouTube helper screen.
- [ ] Memory timeline screen.
- [ ] Streak screen.
- [ ] Settings screen.
- [ ] Offline diagnostics screen.
- [ ] Data backup and restore screen.
- [ ] App lock screen.

## 4) Chatbot Behavior

- [ ] Answer as a personal trainer.
- [ ] Use the user profile in every response.
- [ ] Use the workout done today in every response.
- [ ] Use food logs in every response.
- [ ] Use previous chat memory in every response.
- [ ] Explain the reason behind each suggestion.
- [ ] Give short answers when the user wants quick help.
- [ ] Give longer coaching when the user asks for detail.
- [ ] Recognize leg day, chest day, back day, shoulder day, arm day, core day, and full-body day.
- [ ] Recognize rest day and recovery day.
- [ ] Recognize pre-workout and post-workout questions.
- [ ] Recognize home workout questions.

## 5) Voice System

- [ ] Add microphone input.
- [ ] Add speech-to-text.
- [ ] Add text-to-speech.
- [ ] Add voice reply button.
- [ ] Add push-to-talk mode.
- [ ] Add optional auto-listen mode.
- [ ] Make voice work quickly in the gym.
- [ ] Make voice useful with sweaty hands and busy environments.
- [ ] Allow voice commands for food, workout, and reminders.

## 6) Memory System

- [ ] Store the onboarding profile.
- [ ] Store workout history.
- [ ] Store meal history.
- [ ] Store streak history.
- [ ] Store chat summaries.
- [ ] Store user preferences.
- [ ] Store photo references securely.
- [ ] Store model preference and app settings.
- [ ] Summarize old conversations into compact memory.
- [ ] Retrieve important past events on demand.
- [ ] Forget or clear memory when user requests it.

## 7) Workout Intelligence

- [ ] Detect what workout was done today.
- [ ] Detect what workout was done yesterday.
- [ ] Detect muscle groups hit this week.
- [ ] Suggest the next best workout.
- [ ] Suggest split plans for push/pull/legs, upper/lower, bro split, or full body.
- [ ] Suggest beginner workouts.
- [ ] Suggest intermediate workouts.
- [ ] Suggest advanced workouts.
- [ ] Suggest gym workouts with equipment.
- [ ] Suggest home workouts without equipment.
- [ ] Suggest band workouts.
- [ ] Suggest core, mobility, warm-up, and cooldown work.
- [ ] Suggest safe regressions when user is tired or sore.
- [ ] Suggest safer form cues.
- [ ] Suggest sets, reps, rest, and intensity.
- [ ] Keep workout advice practical and simple.

## 8) Food Intelligence

- [ ] Suggest pre-workout meals.
- [ ] Suggest post-workout meals.
- [ ] Suggest rest-day meals.
- [ ] Suggest cutting meals.
- [ ] Suggest bulking meals.
- [ ] Suggest muscle-building meals.
- [ ] Suggest low-fat meals when needed.
- [ ] Suggest high-protein meals when needed.
- [ ] Suggest low-cost Indian meal options.
- [ ] Suggest quick meals before gym.
- [ ] Show calories.
- [ ] Show protein.
- [ ] Show carbs.
- [ ] Show fat.
- [ ] Show why the meal is good for training.
- [ ] Show whether the meal may cause tiredness.
- [ ] Show whether the meal supports recovery.
- [ ] Show the food image.
- [ ] Give food alternatives if the first choice is not available.

## 9) Home Workout Intelligence

- [ ] Detect when the user cannot go to gym.
- [ ] Offer no-equipment plans.
- [ ] Offer bodyweight plans.
- [ ] Offer resistance-band plans.
- [ ] Offer short home workouts.
- [ ] Offer beginner home workouts.
- [ ] Offer intermediate home workouts.
- [ ] Offer advanced home workouts.
- [ ] Offer fat-loss home plans.
- [ ] Offer muscle-building home plans.
- [ ] Offer mobility-only days.

## 10) YouTube And Browser Support

- [ ] Suggest a matching YouTube video for each exercise.
- [ ] Suggest a matching YouTube video for home workouts.
- [ ] Suggest a matching video for warm-up and form fixes.
- [ ] Suggest trusted exercise demos.
- [ ] Open Chrome or browser links safely when requested.
- [ ] Avoid sending users to random unrelated videos.

## 11) Gym Logic And Lifestyle Logic

- [ ] Understand gym streaks.
- [ ] Understand missed days.
- [ ] Understand recovery days.
- [ ] Understand sleep quality.
- [ ] Understand soreness.
- [ ] Understand energy level.
- [ ] Understand motivation level.
- [ ] Understand food timing.
- [ ] Understand hydration.
- [ ] Understand travel or festival days.
- [ ] Understand days when the user eats outside.
- [ ] Understand days when the user skips gym.
- [ ] Give practical advice, not only model output.

## 12) AI Model Plan

- [ ] Pick one main on-device model.
- [ ] Pick one tiny fallback model.
- [ ] Auto-start the model when the app starts.
- [ ] Use bundled model first.
- [ ] Use local cache second.
- [ ] Use remote pack only if needed.
- [ ] Keep model loading fast.
- [ ] Keep model failure safe.
- [ ] Keep output structured for food, workout, and memory tasks.
- [ ] Keep prompts trainer-style and strict.

## 13) Data And Privacy

- [ ] Store profile and logs locally.
- [ ] Encrypt sensitive data.
- [ ] Allow backup export.
- [ ] Allow backup import.
- [ ] Allow delete-all-data.
- [ ] Allow clear chat memory.
- [ ] Allow clear workout history.
- [ ] Allow clear meal history.
- [ ] Show a privacy notice.

## 14) Settings

- [ ] Add AI mode control.
- [ ] Add voice control.
- [ ] Add font size control.
- [ ] Add theme control.
- [ ] Add model enable/disable.
- [ ] Add model diagnostics.
- [ ] Add export/import.
- [ ] Add data clear.
- [ ] Add streak reset handling.
- [ ] Add app lock.

## 15) APK Build Work

- [ ] Remove old screens that do not fit Hira AI.
- [ ] Build the onboarding flow.
- [ ] Build the coach chat flow.
- [ ] Build workout suggestion flow.
- [ ] Build meal suggestion flow.
- [ ] Build home workout flow.
- [ ] Build YouTube helper flow.
- [ ] Build memory flow.
- [ ] Build voice flow.
- [ ] Build settings flow.
- [ ] Build diagnostics flow.
- [ ] Test on low-end device.
- [ ] Test on mid-range device.
- [ ] Test on high-end device.
- [ ] Test offline mode.
- [ ] Test with no internet.
- [ ] Test with one user profile.
- [ ] Test with multiple user profiles.
- [ ] Test with gym day and rest day.
- [ ] Test with home day only.
- [ ] Test with food logging.
- [ ] Test with workout logging.
- [ ] Test with voice input and voice output.
- [ ] Build release APK.
- [ ] Install APK on phone.
- [ ] Verify all trainer flows work.

## 16) Non-Technical Product Work

- [ ] Decide Hira AI brand tone.
- [ ] Decide onboarding wording.
- [ ] Decide streak philosophy.
- [ ] Decide workout naming style.
- [ ] Decide food suggestion style.
- [ ] Decide motivational tone.
- [ ] Decide when to be short and when to be detailed.
- [ ] Decide how to handle lazy days.
- [ ] Decide how to handle off-plan eating.
- [ ] Decide how to handle body image safety.
- [ ] Decide how to handle beginner confusion.

## 17) Definition Of Done

- [ ] User can onboard fully.
- [ ] User can speak to Hira AI.
- [ ] Hira AI can speak back.
- [ ] Hira AI remembers the user.
- [ ] Hira AI knows workout history.
- [ ] Hira AI knows food history.
- [ ] Hira AI gives workout advice.
- [ ] Hira AI gives food advice.
- [ ] Hira AI gives home workout advice.
- [ ] Hira AI gives YouTube suggestions.
- [ ] Hira AI can run as a full APK.
- [ ] Hira AI feels like a true personal trainer.
