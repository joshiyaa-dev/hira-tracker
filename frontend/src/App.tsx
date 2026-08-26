import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Dumbbell,
  Home,
  Mic,
  Music2,
  PlayCircle,
  Salad,
  Save,
  Settings,
  Sparkles,
  StopCircle,
  Target,
  Youtube,
} from 'lucide-react';
import {
  buildCoachReply,
  bodyTypeCopy,
  calculateTargets,
  defaultMemory,
  detectFocus,
  focusLabel,
  hydrateMemory,
  nextFocus,
  recommendFood,
  recommendHomeWorkout,
  recommendWorkout,
  serializeMemory,
  type ChatMessage,
  type Focus,
  type MemoryState,
  type Profile,
} from './trainer';
import FormCoach from './components/FormCoach';
import ExerciseLibrary from './components/ExerciseLibrary';
import WorkoutTimers from './components/WorkoutTimers';
import ProgressCharts from './components/ProgressCharts';
import MealPlanner from './components/MealPlanner';

const storageKey = 'hira.ai.memory.v1';

const quickPrompts = [
  'What should I eat before leg workout today?',
  'Give me a home workout for chest day.',
  'I feel sore and tired, what should I do?',
  'What video should I watch for squats?',
  'Suggest a high protein meal for cutting.',
  'What should I do after gym today?',
];

const navItems: Array<{ key: Focus; label: string; icon: React.ReactNode }> = [
  { key: 'full-body', label: 'Coach', icon: <Brain size={16} /> },
  { key: 'legs', label: 'Workout', icon: <Dumbbell size={16} /> },
  { key: 'home', label: 'Home', icon: <Home size={16} /> },
  { key: 'recovery', label: 'Food', icon: <Salad size={16} /> },
  { key: 'core', label: 'Memory', icon: <Sparkles size={16} /> },
  { key: 'push', label: 'Settings', icon: <Settings size={16} /> },
];

function useHiraMemory() {
  const [memory, setMemory] = useState<MemoryState>(() => hydrateMemory(localStorage.getItem(storageKey)));

  useEffect(() => {
    localStorage.setItem(storageKey, serializeMemory(memory));
  }, [memory]);

  return [memory, setMemory] as const;
}

function speak(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.lang = 'en-US';
  window.speechSynthesis.speak(utterance);
}

function getSpeechRecognition() {
  const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!Recognition) return null;
  return new Recognition();
}

function App() {
  const [memory, setMemory] = useHiraMemory();
  const [input, setInput] = useState('');
  const [activeFocus, setActiveFocus] = useState<Focus>(memory.focus || 'full-body');
  const [status, setStatus] = useState('Ready to coach.');
  const [recording, setRecording] = useState(false);
  const [lastReply, setLastReply] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [profileDraft, setProfileDraft] = useState<Profile>(memory.profile || defaultMemory.profile);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setProfileDraft(memory.profile);
  }, [memory.profile]);

  const profile = memory.profile;
  const targets = useMemo(() => calculateTargets(profile), [profile]);
  const currentWorkout = useMemo(() => recommendWorkout(profile, activeFocus), [profile, activeFocus]);
  const currentFood = useMemo(() => recommendFood(profile, activeFocus), [profile, activeFocus]);
  const currentHome = useMemo(() => recommendHomeWorkout(profile), [profile]);
  const profileBodyNote = bodyTypeCopy[profile.bodyType];

  const saveProfile = () => {
    setMemory((current) => ({
      ...current,
      profile: profileDraft,
      summaries: [...current.summaries, `Profile saved for ${profileDraft.name} at ${new Date().toLocaleTimeString()}`].slice(-20),
    }));
    setStatus('Profile saved.');
  };

  const updateFocus = (focus: Focus) => {
    setActiveFocus(focus);
    setMemory((current) => ({ ...current, focus }));
    setStatus(`Switched to ${focusLabel(focus)}.`);
  };

  const submitPrompt = (value: string) => {
    const text = value.trim();
    if (!text) return;

    const focus = detectFocus(text) || activeFocus;
    const reply = buildCoachReply(profile, text, focus);
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', text, timestamp: Date.now(), focus };
    const coachMessage: ChatMessage = { id: crypto.randomUUID(), role: 'coach', text: reply.reply, timestamp: Date.now(), focus };

    setMemory((current) => ({
      ...current,
      focus,
      streak: current.streak + 1,
      messages: [...current.messages, userMessage, coachMessage].slice(-60),
      workoutLog: [...current.workoutLog, `${new Date().toLocaleDateString()}: ${reply.workout.title}`].slice(-30),
      foodLog: [...current.foodLog, `${new Date().toLocaleDateString()}: ${reply.food.food.name}`].slice(-30),
      summaries: [...current.summaries, reply.memoryLine].slice(-30),
    }));

    setLastReply(reply.reply);
    setStatus(`Coach answered for ${focusLabel(focus)}.`);
    if (memory.autoSpeak) speak(reply.reply);
    setInput('');
  };

  const sendQuickPrompt = (prompt: string) => {
    setInput(prompt);
    submitPrompt(prompt);
  };

  const startVoiceInput = () => {
    const recognition = getSpeechRecognition();
    if (!recognition) {
      setStatus('Speech recognition is not available in this browser.');
      return;
    }

    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      setRecording(true);
      setStatus('Listening...');
    };
    recognition.onerror = () => {
      setRecording(false);
      setStatus('Voice input failed.');
    };
    recognition.onend = () => setRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      setInput(transcript);
      submitPrompt(transcript);
    };
    recognition.start();
  };

  const stopVoiceInput = () => {
    recognitionRef.current?.stop?.();
    setRecording(false);
    setStatus('Voice input stopped.');
  };

  const exportMemory = () => {
    const blob = new Blob([serializeMemory(memory)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'hira-ai-memory.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus('Memory exported.');
  };

  const clearMemory = () => {
    if (!window.confirm('Clear all Hira AI memory?')) return;
    setMemory(defaultMemory);
    localStorage.removeItem(storageKey);
    setActiveFocus('full-body');
    setProfileDraft(defaultMemory.profile);
    setStatus('Memory cleared.');
  };

  const loadPhoto = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const photo = String(reader.result || '');
      setProfileDraft((current) => ({ ...current, photo }));
      setStatus('Photo loaded.');
    };
    reader.readAsDataURL(file);
  };

  const selectedVideoQuery = currentWorkout.youtubeQuery;
  const selectedVideoUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(selectedVideoQuery)}`;
  const foodVideoUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${currentFood.food.name} gym nutrition`)}`;

  return (
    <div className="app-shell" style={{ fontSize: `${memory.fontScale * 16}px` }}>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Hira AI for gym streaks</p>
          <h1>Complete trainer for gym, home workout, food, and recovery.</h1>
          <p className="hero-text">
            Hira AI remembers the user, listens by voice, answers like a coach, and guides every day with food, training, and streak logic.
          </p>
          <div className="hero-pills">
            <span>{profile.name}</span>
            <span>{profile.goal.replace('-', ' ')}</span>
            <span>{focusLabel(activeFocus)}</span>
            <span>{memory.streak} day streak</span>
          </div>
        </div>
        <div className="hero-card">
          <img src={profile.photo || currentFood.food.image} alt="Profile or food" />
          <div>
            <strong>{currentFood.food.name}</strong>
            <p>{currentFood.message}</p>
          </div>
        </div>
      </section>

      <section className="layout-grid">
        <article className="panel">
          <h2>Onboarding</h2>
          <div className="form-grid">
            <label>
              Name
              <input value={profileDraft.name} onChange={(e) => setProfileDraft({ ...profileDraft, name: e.target.value })} />
            </label>
            <label>
              Age
              <input type="number" value={profileDraft.age} onChange={(e) => setProfileDraft({ ...profileDraft, age: Number(e.target.value) })} />
            </label>
            <label>
              Weight
              <input type="number" value={profileDraft.weight} onChange={(e) => setProfileDraft({ ...profileDraft, weight: Number(e.target.value) })} />
            </label>
            <label>
              Height
              <input type="number" value={profileDraft.height} onChange={(e) => setProfileDraft({ ...profileDraft, height: Number(e.target.value) })} />
            </label>
            <label>
              Body type
              <select value={profileDraft.bodyType} onChange={(e) => setProfileDraft({ ...profileDraft, bodyType: e.target.value as Profile['bodyType'] })}>
                <option value="ectomorph">Ectomorph</option>
                <option value="mesomorph">Mesomorph</option>
                <option value="endomorph">Endomorph</option>
                <option value="athletic">Athletic</option>
              </select>
            </label>
            <label>
              Goal
              <select value={profileDraft.goal} onChange={(e) => setProfileDraft({ ...profileDraft, goal: e.target.value as Profile['goal'] })}>
                <option value="fat-loss">Fat loss</option>
                <option value="muscle-gain">Muscle gain</option>
                <option value="strength">Strength</option>
                <option value="recomp">Recomp</option>
                <option value="general-fitness">General fitness</option>
              </select>
            </label>
            <label>
              Experience
              <select value={profileDraft.experience} onChange={(e) => setProfileDraft({ ...profileDraft, experience: e.target.value as Profile['experience'] })}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
            <label>
              Daily time
              <select value={profileDraft.timeMinutes} onChange={(e) => setProfileDraft({ ...profileDraft, timeMinutes: Number(e.target.value) as Profile['timeMinutes'] })}>
                <option value={20}>20 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </label>
          </div>
          <label className="photo-upload">
            Full-body photo
            <input type="file" accept="image/*" onChange={(e) => loadPhoto(e.target.files?.[0] || null)} />
          </label>
          <div className="action-row">
            <button className="primary-btn" onClick={saveProfile}>
              <Save size={16} /> Save profile
            </button>
            <button className="ghost-btn" onClick={() => updateFocus(nextFocus(activeFocus))}>
              Next focus <ArrowRight size={16} />
            </button>
          </div>
        </article>

        <article className="panel coach-panel">
          <h2>Voice coach</h2>
          <div className="chat-box">
            {memory.messages.slice(-8).map((message) => (
              <div key={message.id} className={`bubble ${message.role}`}>
                <strong>{message.role}</strong>
                <p>{message.text}</p>
              </div>
            ))}
          </div>
          <div className="quick-row">
            {quickPrompts.map((prompt) => (
              <button key={prompt} className="chip" onClick={() => sendQuickPrompt(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
          <div className="composer">
            <textarea
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about food, workout, home exercise, video, recovery, or streak..."
            />
            <div className="action-row">
              <button className="primary-btn" onClick={() => submitPrompt(input)}>
                Coach me
              </button>
              <button className="ghost-btn" onClick={recording ? stopVoiceInput : startVoiceInput}>
                {recording ? <StopCircle size={16} /> : <Mic size={16} />} {recording ? 'Stop voice' : 'Voice in'}
              </button>
              <button className="ghost-btn" onClick={() => speak(lastReply || status)}>
                <Music2 size={16} /> Voice out
              </button>
            </div>
            <p className="status-line">{status}</p>
          </div>
        </article>
      </section>

      <section className="focus-bar panel">
        {navItems.map((item) => (
          <button key={item.key} className={item.key === activeFocus ? 'chip active' : 'chip'} onClick={() => updateFocus(item.key)}>
            {item.icon} {item.label}
          </button>
        ))}
      </section>

      <section className="layout-grid compact">
        <article className="panel card-stack">
          <div className="card-header">
            <h2>Workout plan</h2>
            <button className="ghost-btn small" onClick={() => updateFocus('legs')}>
              <Target size={16} /> Legs day
            </button>
          </div>
          <p>{currentWorkout.subtitle}</p>
          <p className="quote">{profileBodyNote}</p>
          <div className="card-image-row">
            <img src={currentWorkout.exercises[0]?.image} alt={currentWorkout.exercises[0]?.name} />
            <div>
              <strong>{currentWorkout.title}</strong>
              <p>{currentWorkout.note}</p>
              <a href={selectedVideoUrl} target="_blank" rel="noreferrer" className="link-btn">
                <Youtube size={16} /> Open YouTube demo
              </a>
            </div>
          </div>
          <div className="item-list">
            {currentWorkout.exercises.map((exercise) => (
              <div key={exercise.name} className="item-card">
                <div>
                  <strong>{exercise.name}</strong>
                  <p>{exercise.muscle} • {exercise.sets} x {exercise.reps} • {exercise.rest}</p>
                  <p>{exercise.cue}</p>
                </div>
                <span>{exercise.homeVersion}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel card-stack">
          <div className="card-header">
            <h2>Food guidance</h2>
            <button className="ghost-btn small" onClick={() => updateFocus('recovery')}>
              <Salad size={16} /> Recovery
            </button>
          </div>
          <p>{currentFood.message}</p>
          <div className="card-image-row">
            <img src={currentFood.food.image} alt={currentFood.food.name} />
            <div>
              <strong>{currentFood.food.name}</strong>
              <p>{currentFood.food.note}</p>
              <p>{currentFood.message}</p>
            </div>
          </div>
          <div className="macro-row">
            <span>{currentFood.food.calories} cal</span>
            <span>{currentFood.food.protein}g protein</span>
            <span>{currentFood.food.carbs}g carbs</span>
            <span>{currentFood.food.fat}g fat</span>
          </div>
          <a href={foodVideoUrl} target="_blank" rel="noreferrer" className="link-btn">
            <PlayCircle size={16} /> Watch food context video
          </a>
          <p className="quote">
            {currentFood.food.mealTag === 'pre-workout'
              ? 'Good before gym and should not make you tired.'
              : 'Good for gym recovery and daily health.'}
          </p>
        </article>
      </section>

      <section className="layout-grid compact">
        <article className="panel card-stack">
          <div className="card-header">
            <h2>Home workout</h2>
            <button className="ghost-btn small" onClick={() => updateFocus('home')}>
              <Home size={16} /> Home only
            </button>
          </div>
          <p>{currentHome.subtitle}</p>
          <div className="item-list">
            {currentHome.exercises.map((exercise) => (
              <div key={exercise.name} className="item-card">
                <div>
                  <strong>{exercise.name}</strong>
                  <p>{exercise.muscle} • {exercise.sets} x {exercise.reps}</p>
                  <p>{exercise.homeVersion}</p>
                </div>
                <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(currentHome.youtubeQuery)}`} target="_blank" rel="noreferrer">
                  Video
                </a>
              </div>
            ))}
          </div>
        </article>

        <article className="panel card-stack">
          <div className="card-header">
            <h2>Memory and streak</h2>
            <button className="ghost-btn small" onClick={() => setShowMore((current) => !current)}>
              <Sparkles size={16} /> {showMore ? 'Less' : 'More'}
            </button>
          </div>
          <div className="streak-grid">
            <div>
              <strong>{memory.streak}</strong>
              <span>day streak</span>
            </div>
            <div>
              <strong>{memory.messages.length}</strong>
              <span>chat turns</span>
            </div>
            <div>
              <strong>{memory.workoutLog.length}</strong>
              <span>workout logs</span>
            </div>
            <div>
              <strong>{memory.foodLog.length}</strong>
              <span>food logs</span>
            </div>
          </div>
          {showMore && (
            <div className="timeline">
              {memory.summaries.slice(-8).map((summary, index) => (
                <div key={`${summary}-${index}`} className="timeline-item">
                  <CheckCircle2 size={14} /> {summary}
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <FormCoach />

      <section className="panel">
        <div className="card-header">
          <h2>Exercise library</h2>
        </div>
        <ExerciseLibrary onStartTracked={(name) => {
          window.dispatchEvent(new CustomEvent('hira-track-exercise', { detail: name }));
          document.querySelector('.formcoach-panel')?.scrollIntoView({ behavior: 'smooth' });
        }} />
      </section>

      <section className="panel">
        <div className="card-header">
          <h2>Workout timers</h2>
        </div>
        <WorkoutTimers />
      </section>

      <section className="panel">
        <div className="card-header">
          <h2>Progress</h2>
        </div>
        <ProgressCharts />
      </section>

      <section className="panel">
        <div className="card-header">
          <h2>Meal planner</h2>
        </div>
        <MealPlanner />
      </section>

      <section className="panel settings-panel">
        <div className="card-header">
          <h2>Settings</h2>
          <div className="action-row">
            <button className="ghost-btn small" onClick={() => setMemory((current) => ({ ...current, autoSpeak: !current.autoSpeak }))}>
              {memory.autoSpeak ? 'Auto speak on' : 'Auto speak off'}
            </button>
            <button className="ghost-btn small" onClick={exportMemory}>
              <Save size={16} /> Export memory
            </button>
            <button className="ghost-btn small danger" onClick={clearMemory}>
              Reset all
            </button>
          </div>
        </div>
        <div className="slider-row">
          <label>
            Font size
            <input
              type="range"
              min="0.9"
              max="1.15"
              step="0.01"
              value={memory.fontScale}
              onChange={(e) => setMemory((current) => ({ ...current, fontScale: Number(e.target.value) }))}
            />
          </label>
          <div>
            <p>{profileBodyNote}</p>
            <p>{targets.protein}g protein target / {targets.calories} cal target</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
