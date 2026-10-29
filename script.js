(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const STORAGE_KEY = 'studyflow-ai-v1';
  const colors = ['lavender', 'mint', 'peach', 'blue', 'yellow'];
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const monday = new Date(today); monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const dateKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const parseDate = s => { const [y,m,d] = s.split('-').map(Number); return new Date(y,m-1,d); };
  const plusDays = (d,n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
  const fmtDate = (s, options = {month:'short',day:'numeric'}) => parseDate(s).toLocaleDateString('en-US', options);
  const escapeHTML = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const todayKey = dateKey(today);
  const initial = {
    subjects: [
      {id:'s1',name:'Data Mining',color:'lavender'},
      {id:'s2',name:'System Analysis & Design',color:'mint'},
      {id:'s3',name:'Business Process Management',color:'peach'}
    ],
    tasks: [
      {id:'t1',title:'Review data cleaning techniques',subject:'Data Mining',type:'Study session',deadline:dateKey(plusDays(today,2)),duration:60,priority:3,preferredDay:'auto',notes:'Review missing values and data transformation.',status:'pending',created:Date.now()-3000,scheduledDate:dateKey(plusDays(today,0)),scheduledTime:'13:00'},
      {id:'t2',title:'Prepare for the chapter quiz',subject:'Business Process Management',type:'Exam',deadline:dateKey(plusDays(today,3)),duration:90,priority:4,preferredDay:'auto',notes:'Focus on key terms and process models.',status:'pending',created:Date.now()-2000,scheduledDate:dateKey(plusDays(today,1)),scheduledTime:'14:15'},
      {id:'t3',title:'Finish system requirements notes',subject:'System Analysis & Design',type:'Assignment',deadline:dateKey(plusDays(today,5)),duration:60,priority:2,preferredDay:'auto',notes:'',status:'pending',created:Date.now()-1000,scheduledDate:dateKey(plusDays(today,2)),scheduledTime:'13:00'}
    ],
    settings:{dailyHours:3,startTime:'13:00'}, selectedDay: Math.max(0, Math.min(6, Math.floor((today-monday)/86400000)))
  };
  let state;
  try { state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || initial; } catch { state = initial; }
  if (!Array.isArray(state.tasks) || !Array.isArray(state.subjects)) state = initial;
  state.settings ||= {dailyHours:3,startTime:'13:00'};
  state.tasks.forEach(t => { if (!t.status) t.status = 'pending'; });
  let toastTimer;
  function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function toast(message){ const el=$('#toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2500); }
  function subjectColor(name){ return state.subjects.find(s=>s.name.toLowerCase()===String(name).toLowerCase())?.color || colors[Math.abs(hash(name))%colors.length]; }
  function hash(str){ return [...String(str)].reduce((a,c)=>a+c.charCodeAt(0),0); }
  function ensureSubject(name){ const found=state.subjects.find(s=>s.name.toLowerCase()===name.toLowerCase()); if(!found) state.subjects.push({id:cryptoId(),name,color:colors[state.subjects.length%colors.length]}); }
  function cryptoId(){ return 'x'+Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
  function priorityLabel(n){ return ({1:'Low',2:'Medium',3:'High',4:'Urgent'})[n]||'Medium'; }
  function priorityClass(n){ return n>=3?'high':n===1?'low':''; }
  function durationText(min){ return min>=60?`${min%60?`${Math.floor(min/60)}h ${min%60}m`:`${min/60}h`}`:`${min}m`; }
  function timeText(time){ if(!time)return 'Unscheduled'; const [h,m]=time.split(':').map(Number); return `${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`; }
  function weekDate(i){return plusDays(monday,i);}
  function taskDate(t){return t.scheduledDate||t.deadline;}
  function isOverdue(t){return t.status!=='completed'&&t.deadline<todayKey;}
  function sortedTasks(tasks){ return [...tasks].sort((a,b)=>a.deadline.localeCompare(b.deadline)||(b.priority-a.priority)||a.title.localeCompare(b.title)); }
  function dueInText(date){const d=Math.round((parseDate(date)-today)/86400000);if(d<0)return `${Math.abs(d)} day${d===-1?'':'s'} overdue`;if(d===0)return 'Due today';if(d===1)return 'Due tomorrow';return `Due in ${d} days`;}
  function renderAll(){renderHeader();renderDashboard();renderPlanner();renderTasks();renderSubjects();renderSubjectOptions();save();}
  function renderHeader(){
    $('#today-label').textContent=today.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
    $('#week-label').textContent=`WEEK OF ${monday.toLocaleDateString('en-US',{month:'short',day:'numeric'}).toUpperCase()}`;
  }
  function taskCard(t, showActions=true){
    const color=subjectColor(t.subject), done=t.status==='completed', missed=t.status==='missed'||isOverdue(t);
    const status=done?'<span class="status-pill done">Completed</span>':missed?'<span class="status-pill missed">Needs attention</span>':'';
    return `<div class="schedule-item"><div class="schedule-time">${escapeHTML(timeText(t.scheduledTime))}<br>${escapeHTML(durationText(t.duration))}</div><div class="schedule-line ${color}"></div><div class="schedule-details"><strong>${escapeHTML(t.title)}</strong><small>${escapeHTML(t.subject)} · ${escapeHTML(t.type)}</small></div><div class="schedule-actions">${status}${showActions?`<button class="tiny-action" data-edit="${t.id}" title="Edit task" aria-label="Edit task">✎</button>`:''}</div></div>`;
  }
  function renderDashboard(){
    const tasks=state.tasks, completed=tasks.filter(t=>t.status==='completed').length, total=tasks.length;
    $('#stat-completed').textContent=completed; $('#completion-caption').textContent=`${completed} of ${total} tasks`;
    $('#completion-bar').style.width=`${total?completed/total*100:0}%`;
    $('#stat-hours').textContent=(tasks.filter(t=>t.status!=='completed').reduce((sum,t)=>sum+t.duration,0)/60).toLocaleString('en-US',{maximumFractionDigits:1});
    $('#stat-deadlines').textContent=tasks.filter(t=>t.status!=='completed'&&t.deadline>=todayKey&&t.deadline<=dateKey(plusDays(today,7))).length;
    const doneDays=new Set(tasks.filter(t=>t.status==='completed').map(t=>t.completedDate).filter(Boolean));
    let streak=0, cursor=new Date(today);
    while(doneDays.has(dateKey(cursor))){streak++;cursor=plusDays(cursor,-1);}
    $('#stat-streak').textContent=streak;
    const dayButtons=weekdays.map((day,i)=>{const d=weekDate(i), key=dateKey(d), has=tasks.some(t=>taskDate(t)===key&&t.status!=='completed');return `<button class="day-button ${state.selectedDay===i?'selected':''} ${has?'has-tasks':''}" data-day="${i}"><span>${shortDays[i]}</span><strong>${d.getDate()}</strong><em></em></button>`;}).join('');
    $('#week-days').innerHTML=dayButtons;
    const chosen=dateKey(weekDate(state.selectedDay));
    const todays=tasks.filter(t=>taskDate(t)===chosen).sort((a,b)=>(a.scheduledTime||'99:99').localeCompare(b.scheduledTime||'99:99'));
    $('#today-schedule').innerHTML=todays.map(t=>taskCard(t)).join('');
    $('#dashboard-empty').classList.toggle('hidden',todays.length>0);
    const upcoming=sortedTasks(tasks.filter(t=>t.status!=='completed'&&t.deadline>=todayKey)).slice(0,4);
    $('#upcoming-count').textContent=upcoming.length;
    $('#upcoming-list').innerHTML=upcoming.length?upcoming.map(t=>`<div class="upcoming-item"><div class="date-block"><strong>${parseDate(t.deadline).getDate()}</strong><small>${parseDate(t.deadline).toLocaleDateString('en-US',{month:'short'})}</small></div><div class="upcoming-info"><strong>${escapeHTML(t.title)}</strong><small>${escapeHTML(t.subject)} · ${escapeHTML(dueInText(t.deadline))}</small></div><span class="priority-tag ${priorityClass(t.priority)}">${priorityLabel(t.priority)}</span></div>`).join(''):'<div class="empty-state"><span>✧</span><h3>No upcoming deadlines</h3><p>Add a task to keep track of what is next.</p></div>';
  }
  function renderPlanner(){
    $('#daily-hours').value=String(state.settings.dailyHours||3); $('#study-start').value=state.settings.startTime||'13:00';
    const days=weekdays.map((day,i)=>{
      const d=weekDate(i), key=dateKey(d), list=state.tasks.filter(t=>taskDate(t)===key).sort((a,b)=>(a.scheduledTime||'99:99').localeCompare(b.scheduledTime||'99:99'));
      return `<section class="calendar-day ${key===todayKey?'today':''}"><div class="calendar-day-head"><small>${day}</small><strong>${d.getDate()}</strong></div><div class="calendar-events">${list.length?list.map(t=>`<button class="calendar-event ${subjectColor(t.subject)}" data-edit="${t.id}" title="Edit ${escapeHTML(t.title)}"><strong>${escapeHTML(t.title)}</strong><small>${escapeHTML(timeText(t.scheduledTime))} · ${escapeHTML(durationText(t.duration))}${t.status==='completed'?' · ✓':''}</small></button>`).join(''):'<div class="calendar-empty">Open day</div>'}</div></section>`;
    }).join('');
    $('#week-calendar').innerHTML=days;
  }
  function renderTasks(){
    const query=$('#task-search').value.trim().toLowerCase(), filter=$('#task-filter').value, sort=$('#task-sort').value;
    let tasks=state.tasks.filter(t=>`${t.title} ${t.subject} ${t.type} ${t.notes}`.toLowerCase().includes(query));
    if(filter==='active')tasks=tasks.filter(t=>t.status!=='completed');
    if(filter==='completed')tasks=tasks.filter(t=>t.status==='completed');
    if(filter==='missed')tasks=tasks.filter(t=>t.status==='missed'||isOverdue(t));
    tasks.sort(sort==='priority'?(a,b)=>b.priority-a.priority:sort==='created'?(a,b)=>b.created-a.created:(a,b)=>a.deadline.localeCompare(b.deadline));
    $('#all-tasks').innerHTML=tasks.length?tasks.map(t=>{
      const done=t.status==='completed', needs=t.status==='missed'||isOverdue(t);
      return `<div class="task-row ${done?'completed':''}"><input class="task-check" type="checkbox" data-complete="${t.id}" ${done?'checked':''} aria-label="Mark ${escapeHTML(t.title)} completed"><div class="task-main"><strong>${escapeHTML(t.title)}</strong><small>${escapeHTML(t.subject)} · ${escapeHTML(t.type)}${t.notes?` · ${escapeHTML(t.notes)}`:''}</small></div><div class="task-meta"><span class="priority-tag ${priorityClass(t.priority)}">${priorityLabel(t.priority)} priority</span><small>Due ${escapeHTML(fmtDate(t.deadline))}${needs&&!done?' · '+escapeHTML(dueInText(t.deadline)):''}</small></div><div class="task-buttons"><button class="tiny-action" data-edit="${t.id}" aria-label="Edit task">✎</button>${needs&&!done?`<button class="tiny-action" data-reschedule="${t.id}" aria-label="Reschedule task" title="Reschedule task">↻</button>`:''}<button class="tiny-action" data-delete="${t.id}" aria-label="Delete task">×</button></div></div>`;
    }).join(''):'<div class="empty-state"><span>☀</span><h3>No tasks found</h3><p>Try another filter or add a new study task.</p><button class="button button-primary" data-open-task>Add a task</button></div>';
  }
  function renderSubjects(){
    $('#subject-grid').innerHTML=state.subjects.length?state.subjects.map(s=>{
      const tasks=state.tasks.filter(t=>t.subject.toLowerCase()===s.name.toLowerCase()), completed=tasks.filter(t=>t.status==='completed').length, pct=tasks.length?Math.round(completed/tasks.length*100):0;
      return `<article class="subject-card"><div class="subject-top"><span class="subject-swatch ${s.color}">◈</span><button class="subject-remove" data-delete-subject="${s.id}" title="Remove subject">×</button></div><h3>${escapeHTML(s.name)}</h3><p>${tasks.length} task${tasks.length===1?'':'s'} assigned</p><div class="subject-progress"><i style="width:${pct}%"></i></div><div class="subject-bottom"><span>${completed} completed</span><strong>${pct}%</strong></div></article>`;
    }).join(''):'<div class="empty-state"><h3>No subjects yet</h3><p>Add a subject to organize your study tasks.</p></div>';
    const deadlines=sortedTasks(state.tasks.filter(t=>t.status!=='completed'));
    $('#all-deadlines').innerHTML=deadlines.length?deadlines.map(t=>`<div class="deadline-row"><div class="deadline-date"><strong>${parseDate(t.deadline).getDate()}</strong><small>${parseDate(t.deadline).toLocaleDateString('en-US',{month:'short'})}</small></div><div class="deadline-info"><strong>${escapeHTML(t.title)}</strong><small>${escapeHTML(t.subject)} · ${escapeHTML(t.type)} · ${escapeHTML(dueInText(t.deadline))}</small></div><span class="priority-tag ${priorityClass(t.priority)}">${priorityLabel(t.priority)}</span></div>`).join(''):'<div class="empty-state"><h3>No deadlines yet</h3><p>Tasks with deadlines will appear here.</p></div>';
  }
  function renderSubjectOptions(){
    $('#subject-options').innerHTML=state.subjects.map(s=>`<option value="${escapeHTML(s.name)}"></option>`).join('');
    $('#task-subject').placeholder=state.subjects.length?'Choose or type a subject':'Enter your subject';
  }
  function switchView(name){
    $$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${name}`));
    $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
    const labels={dashboard:'Dashboard',planner:'Weekly planner',tasks:'My tasks',subjects:'Subjects & deadlines'};
    $('#breadcrumb-current').textContent=labels[name]||'Dashboard';
    if(name==='planner')renderPlanner();if(name==='tasks')renderTasks();if(name==='subjects')renderSubjects();
  }
  function openTaskDialog(task=null){
    $('#task-form').reset();$('#form-error').classList.add('hidden');$('#task-id').value=task?.id||'';
    $('#task-modal-title').textContent=task?'Edit study task':'Add a study task';
    $('#task-title').value=task?.title||'';$('#task-subject').value=task?.subject||'';
    $('#task-type').value=task?.type||'Study session';$('#task-deadline').value=task?.deadline||dateKey(plusDays(today,3));
    $('#task-duration').value=String(task?.duration||60);$('#task-priority').value=String(task?.priority||2);
    $('#task-day').value=task?.preferredDay??'auto';$('#task-notes').value=task?.notes||'';
    $('#task-dialog').showModal();
  }
  function openSubjectDialog(){ $('#subject-form').reset();$('#subject-error').classList.add('hidden');$('#subject-dialog').showModal(); }
  function assignSchedule(task){
    const preferred=task.preferredDay==='auto'?null:Number(task.preferredDay), hours=Number(state.settings.dailyHours||3), maxMinutes=hours*60;
    const start=preferred===null?0:preferred, candidates=[];
    for(let offset=0;offset<21;offset++){
      const dayIndex=(start+offset)%7, date=plusDays(monday,dayIndex+Math.floor((start+offset)/7)*7), key=dateKey(date);
      if(key<todayKey||key>task.deadline)continue;
      if(preferred!==null&&offset===0&&key<todayKey)continue;
      const dayTasks=state.tasks.filter(t=>t.id!==task.id&&taskDate(t)===key&&t.status!=='completed');
      const used=dayTasks.reduce((sum,t)=>sum+t.duration,0);
      if(used+task.duration<=maxMinutes)candidates.push({date:key,dayIndex,used,offset});
    }
    if(!candidates.length){
      // Keep a useful schedule even when the chosen week is full; mark the task as needing attention.
      task.scheduledDate=task.deadline>=todayKey?task.deadline:todayKey;
      task.scheduledTime=state.settings.startTime||'13:00';task.status=task.status==='completed'?'completed':'missed';
      return false;
    }
    candidates.sort((a,b)=>a.offset-b.offset||a.used-b.used);
    const chosen=candidates[0], base=state.settings.startTime||'13:00', [hh,mm]=base.split(':').map(Number);
    const startMinutes=hh*60+mm+chosen.used;
    task.scheduledDate=chosen.date;task.scheduledTime=`${String(Math.floor(startMinutes/60)%24).padStart(2,'0')}:${String(startMinutes%60).padStart(2,'0')}`;
    if(task.status==='missed')task.status='pending';
    return true;
  }
  function generatePlan(){
    state.settings.dailyHours=Number($('#daily-hours').value);state.settings.startTime=$('#study-start').value;
    const tasks=state.tasks.filter(t=>t.status!=='completed').sort((a,b)=>{
      const examA=a.type==='Exam'?1:0, examB=b.type==='Exam'?1:0;
      return (a.deadline.localeCompare(b.deadline))||(b.priority-a.priority)||(examB-examA);
    });
    let scheduled=0, failed=0;
    tasks.forEach(t=>{if(assignSchedule(t))scheduled++;else failed++;});
    renderAll();toast(failed?`Plan generated: ${scheduled} scheduled, ${failed} need more time or an earlier deadline.`:`Your study plan is ready! ${scheduled} task${scheduled===1?'':'s'} scheduled.`);
  }
  function saveTask(event){
    event.preventDefault();const id=$('#task-id').value, title=$('#task-title').value.trim(), subject=$('#task-subject').value.trim(), deadline=$('#task-deadline').value;
    const error=$('#form-error');error.classList.add('hidden');
    if(!title||!subject||!deadline){error.textContent='Please complete the required fields.';error.classList.remove('hidden');return;}
    if(deadline<todayKey){error.textContent='Choose today or a future date for the deadline.';error.classList.remove('hidden');return;}
    const old=state.tasks.find(t=>t.id===id), task={
      id:id||cryptoId(),title,subject,type:$('#task-type').value,deadline,duration:Number($('#task-duration').value),
      priority:Number($('#task-priority').value),preferredDay:$('#task-day').value,notes:$('#task-notes').value.trim(),
      status:old?.status||'pending',created:old?.created||Date.now(),scheduledDate:old?.scheduledDate||'',scheduledTime:old?.scheduledTime||''
    };
    ensureSubject(subject);
    if(!old||old.deadline!==deadline||old.duration!==task.duration||old.preferredDay!==task.preferredDay||!task.scheduledDate){assignSchedule(task);}
    else if(old.status==='completed'){task.completedDate=old.completedDate;}
    if(old){state.tasks=state.tasks.map(t=>t.id===id?task:t);}else state.tasks.push(task);
    $('#task-dialog').close();renderAll();toast(old?'Task updated.':'Task added to your study list.');
  }
  function toggleComplete(id,checked){
    const task=state.tasks.find(t=>t.id===id);if(!task)return;
    task.status=checked?'completed':'pending';
    if(checked)task.completedDate=todayKey;else delete task.completedDate;
    renderAll();toast(checked?'Great work! Task completed.':'Task marked as not completed.');
  }
  function reschedule(id){
    const task=state.tasks.find(t=>t.id===id);if(!task)return;
    task.status='pending';task.preferredDay='auto';
    // Temporarily remove this task from occupancy calculations.
    const previousDate=task.scheduledDate;task.scheduledDate='';
    const ok=assignSchedule(task);
    if(!ok&&task.deadline<todayKey){task.deadline=dateKey(plusDays(today,1));assignSchedule(task);}
    renderAll();toast(ok?`Task rescheduled for ${fmtDate(task.scheduledDate,{weekday:'short',month:'short',day:'numeric'})}.`:'No free slot found. Increase daily study hours or move the deadline.');
  }
  function deleteTask(id){const task=state.tasks.find(t=>t.id===id);if(!task)return;if(!confirm(`Delete "${task.title}"?`))return;state.tasks=state.tasks.filter(t=>t.id!==id);renderAll();toast('Task deleted.');}
  function deleteSubject(id){
    const s=state.subjects.find(x=>x.id===id);if(!s)return;
    const linked=state.tasks.some(t=>t.subject.toLowerCase()===s.name.toLowerCase());
    if(linked){toast('This subject has tasks. Edit or delete those tasks first.');return;}
    if(!confirm(`Remove subject "${s.name}"?`))return;state.subjects=state.subjects.filter(x=>x.id!==id);renderAll();toast('Subject removed.');
  }
  function saveSubject(event){
    event.preventDefault();const name=$('#subject-name').value.trim(), error=$('#subject-error');
    if(!name)return;
    if(state.subjects.some(s=>s.name.toLowerCase()===name.toLowerCase())){error.textContent='This subject already exists.';error.classList.remove('hidden');return;}
    state.subjects.push({id:cryptoId(),name,color:$('#subject-color').value});$('#subject-dialog').close();renderAll();toast('Subject added.');
  }
  // Navigation and delegated interactions
  $$('.nav-item').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));
  $$('[data-go]').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.go)));
  $('#quick-add').addEventListener('click',()=>openTaskDialog());
  $('#tasks-add').addEventListener('click',()=>openTaskDialog());
  $('#subjects-add').addEventListener('click',openSubjectDialog);
  $('#generate-plan').addEventListener('click',generatePlan);
  $('#task-form').addEventListener('submit',saveTask);
  $('#subject-form').addEventListener('submit',saveSubject);
  $$('[data-close]').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.close).close()));
  $('#task-search').addEventListener('input',renderTasks);
  $('#task-filter').addEventListener('change',renderTasks);
  $('#task-sort').addEventListener('change',renderTasks);
  $('#daily-hours').addEventListener('change',()=>state.settings.dailyHours=Number($('#daily-hours').value));
  $('#study-start').addEventListener('change',()=>state.settings.startTime=$('#study-start').value);
  document.addEventListener('click',event=>{
    const target=event.target.closest('button,[data-complete]');if(!target)return;
    if(target.dataset.day!==undefined){state.selectedDay=Number(target.dataset.day);renderDashboard();}
    if(target.dataset.edit){const task=state.tasks.find(t=>t.id===target.dataset.edit);if(task)openTaskDialog(task);}
    if(target.dataset.delete)deleteTask(target.dataset.delete);
    if(target.dataset.reschedule)reschedule(target.dataset.reschedule);
    if(target.dataset.deleteSubject)deleteSubject(target.dataset.deleteSubject);
    if(target.hasAttribute('data-open-task'))openTaskDialog();
  });
  document.addEventListener('change',event=>{
    const el=event.target;if(el.matches('[data-complete]'))toggleComplete(el.dataset.complete,el.checked);
  });
  // Mark scheduled past sessions as missed so the user can reschedule them.
  state.tasks.forEach(t=>{if(t.status==='pending'&&t.scheduledDate<todayKey&&t.deadline>=todayKey)t.status='missed';});
  // Start on dashboard and draw the working app.
  renderAll();
})();