(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const state = { schedule: null, settings: null };
  const defaultRounds = 8;

  function parsePlayers(raw) {
    return raw.split(/[\n,]+/).map(v => v.trim()).filter(Boolean);
  }
  function editDistance(a, b) {
    const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) { let before = prev[0]; prev[0] = i; for (let j = 1; j <= b.length; j++) { const old = prev[j]; prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, before + (a[i - 1] === b[j - 1] ? 0 : 1)); before = old; } }
    return prev[b.length];
  }
  function validateNames(players) {
    const duplicates = players.filter((p, i) => players.findIndex(q => q.toLocaleLowerCase() === p.toLocaleLowerCase()) !== i);
    const similar = [];
    for (let i = 0; i < players.length; i++) for (let j = i + 1; j < players.length; j++) if (players[i].length >= 3 && players[j].length >= 3 && editDistance(players[i], players[j]) <= 1) similar.push(`${players[i]} / ${players[j]}`);
    return { duplicates: [...new Set(duplicates)], similar };
  }
  function pairKey(a, b) { return a < b ? `${a}|${b}` : `${b}|${a}`; }
  function count(map, a, b) { return map.get(pairKey(a, b)) || 0; }
  function add(map, a, b) { const k = pairKey(a, b); map.set(k, (map.get(k) || 0) + 1); }
  function shuffled(items) { const a = [...items]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function streakAfter(history, player) { let n = 0; for (let r = history.length - 1; r >= 0 && history[r].includes(player); r--) n++; return n; }

  function choosePlayers(players, slots, history, plays, noThree) {
    const ordered = shuffled(players).sort((a, b) => {
      const aThird = noThree && streakAfter(history, a) >= 2 ? 1 : 0;
      const bThird = noThree && streakAfter(history, b) >= 2 ? 1 : 0;
      if (aThird !== bThird) return aThird - bThird;
      const av = plays.get(a), bv = plays.get(b);
      return av - bv || Math.random() - .5;
    });
    const safe = ordered.filter(p => !(noThree && streakAfter(history, p) >= 2));
    return (safe.length >= slots ? safe : ordered).slice(0, slots);
  }
  function makeRound(selected, courts, partnerCounts, opponentCounts, rotate) {
    let best = null, bestCost = Infinity;
    const patterns = [[0,1,2,3],[0,2,1,3],[0,3,1,2]];
    for (let trial = 0; trial < 70; trial++) {
      const order = shuffled(selected), games = [];
      for (let g = 0; g < courts; g++) {
        const four = order.slice(g * 4, g * 4 + 4);
        let choice = patterns[0], low = Infinity;
        for (const p of patterns) {
          const [a,b,c,d] = p.map(i => four[i]);
          const cost = rotate ? 8 * (count(partnerCounts,a,b) + count(partnerCounts,c,d)) + count(opponentCounts,a,c) + count(opponentCounts,a,d) + count(opponentCounts,b,c) + count(opponentCounts,b,d) : 0;
          if (cost < low) { low = cost; choice = p; }
        }
        const [a,b,c,d] = choice.map(i => four[i]); games.push({ teamA:[a,b], teamB:[c,d] });
      }
      const cost = games.reduce((sum,g) => sum + (rotate ? 8*(count(partnerCounts,...g.teamA)+count(partnerCounts,...g.teamB)) + g.teamA.reduce((s,a)=>s+g.teamB.reduce((t,b)=>t+count(opponentCounts,a,b),0),0) : 0), 0);
      if (cost < bestCost) { bestCost = cost; best = games; }
    }
    return best;
  }
  function generateOnce(players, courts, rounds, opts) {
    const gamesPerRound = Math.min(courts, Math.floor(players.length / 4));
    const slots = gamesPerRound * 4, plays = new Map(players.map(p => [p, 0]));
    const partnerCounts = new Map(), opponentCounts = new Map(), history = [], roundsOut = [];
    for (let r = 0; r < rounds; r++) {
      const selected = choosePlayers(players, slots, history, plays, opts.noThree && players.length > slots);
      const games = makeRound(selected, gamesPerRound, partnerCounts, opponentCounts, opts.rotate);
      for (const game of games) {
        add(partnerCounts, ...game.teamA); add(partnerCounts, ...game.teamB);
        for (const a of game.teamA) for (const b of game.teamB) add(opponentCounts, a, b);
      }
      selected.forEach(p => plays.set(p, plays.get(p)+1));
      history.push(selected); roundsOut.push({ games, resting: players.filter(p => !selected.includes(p)) });
    }
    return { rounds:roundsOut, plays, history, partnerCounts, opponentCounts };
  }
  function evaluate(result, players, opts) {
    const values = players.map(p => result.plays.get(p)); const spread = Math.max(...values)-Math.min(...values);
    let third = 0, repeats = 0;
    for (const p of players) { let run=0; for(const row of result.history){run=row.includes(p)?run+1:0;if(run>=3) third++;} }
    for (const v of result.partnerCounts.values()) if (v > 1) repeats += v-1;
    return spread*10000 + (opts.noThree ? third*1000 : 0) + (opts.rotate ? repeats*5 : 0) + Math.random();
  }
  function buildSchedule(players, courts, rounds, opts) {
    let best;
    const tries = Math.min(320, Math.max(100, players.length * 12));
    for (let i=0; i<tries; i++) { const candidate = generateOnce(players,courts,rounds,opts); if (!best || evaluate(candidate,players,opts) < evaluate(best,players,opts)) best=candidate; }
    return best;
  }
  function maxStreak(history, p) { let run=0,max=0; for(const row of history){run=row.includes(p)?run+1:0;max=Math.max(max,run);} return max; }
  function render(result, players, settings) {
    $('scheduleTitle').textContent = `🏸 ${settings.name} 배드민턴 경기 대진표`;
    const games = result.rounds[0].games.length;
    const avg = (settings.rounds*games*4/players.length).toFixed(1).replace('.0','');
    $('overview').textContent = `참석 ${players.length}명 · ${settings.courts}코트 중 ${games}코트 사용 · 복식 · ${settings.rounds}라운드 · 1인 평균 ${avg}게임`;
    const tbody = $('scheduleTable').querySelector('tbody'); tbody.replaceChildren();
    result.rounds.forEach((round, ri) => round.games.forEach((game, gi) => {
      const tr=document.createElement('tr');
      const cells=[[`라운드 ${ri+1}`,'round'],[`${gi+1}코트`,'court'],[game.teamA.join(', '), ''],['vs','vs'],[game.teamB.join(', '),''],[gi===0 ? (round.resting.join(', ') || '대기자 없음') : '', 'rest']];
      cells.forEach(([text, cls])=>{const td=document.createElement('td');td.textContent=text;td.className=cls;tr.append(td);}); tbody.append(tr);
    }));
    const verify = $('verifyTable').querySelector('tbody'); verify.replaceChildren();
    const playValues=players.map(p=>result.plays.get(p)); const equal = Math.max(...playValues)-Math.min(...playValues)<=1;
    players.forEach(p => { const streak=maxStreak(result.history,p), partners=[...result.partnerCounts.keys()].filter(k=>k.split('|').includes(p)).length; const status=streak<=2?'정상':'3연속 발생'; const cls=streak<=2?'status-ok':'status-alert'; const tr=document.createElement('tr'); [[p,''],[`${result.plays.get(p)}회`,''],[`${settings.rounds-result.plays.get(p)}회`,''],[`${streak}회`,streak<=2?'':'status-alert'],[`${partners}명`,''],[status,cls]].forEach(([t,c])=>{const td=document.createElement('td');td.textContent=t;td.className=c;tr.append(td)});verify.append(tr); });
    const warnings=[];
    if (settings.noThree && players.length<=games*4) warnings.push('모든 참가자가 매 라운드 출전하므로 3연속 출전을 피할 수 없습니다.');
    if (settings.noThree && players.length>games*4 && players.some(p=>maxStreak(result.history,p)>=3)) warnings.push('인원·라운드 조건상 일부 3연속 출전이 발생했습니다.');
    if (settings.equal && !equal) warnings.push('출전 횟수 차이가 1회를 초과했습니다. 라운드를 늘리거나 조건을 조정해 주세요.');
    const report=$('constraintReport'); report.className=`report ${warnings.length?'warning':''}`; report.textContent=warnings.length ? `확인 필요: ${warnings.join(' ')}` : '검증 완료: 출전 횟수는 균등하게 배분되었고, 적용 가능한 연속 출전 조건을 확인했습니다.';
    state.schedule=result; state.settings=settings; $('results').classList.remove('hidden'); $('results').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function generate() {
    const players=parsePlayers($('players').value), validation=validateNames(players), notice=$('nicknameNotice');
    if (players.length<4 || validation.duplicates.length) { notice.className='notice error'; notice.textContent=validation.duplicates.length ? `중복 닉네임: ${validation.duplicates.join(', ')} — 철자를 수정한 뒤 다시 만들어 주세요.` : '복식 대진표는 참가자 4명 이상부터 만들 수 있습니다.'; return; }
    const courts=Number($('courts').value), rounds=Number($('rounds').value)||defaultRounds;
    if (!Number.isInteger(courts)||courts<1||!Number.isInteger(rounds)||rounds<1) { notice.className='notice error';notice.textContent='코트 수와 라운드 수를 올바른 정수로 입력해 주세요.';return; }
    notice.className=validation.similar.length?'notice':'notice hidden'; notice.textContent=validation.similar.length?`닉네임 확인 요청: 유사한 표기가 있습니다 (${validation.similar.join(', ')}). 서로 다른 닉네임이라면 그대로 생성할 수 있습니다.`:'';
    const settings={name:$('eventName').value.trim()||'오늘의',courts,rounds,equal:$('equalPlay').checked,noThree:$('noThree').checked,rotate:$('rotatePartners').checked};
    render(buildSchedule(players,courts,rounds,settings),players,settings);
  }
  function scheduleText() { const s=state.schedule, set=state.settings; if(!s)return ''; let text=`🏸 ${set.name} 배드민턴 경기 대진표\n참석 ${Object.keys(Object.fromEntries(s.plays)).length}명 · ${set.courts}코트 · ${set.rounds}라운드\n\n`; s.rounds.forEach((r,i)=>{text+=`[라운드 ${i+1}]\n`;r.games.forEach((g,j)=>text+=`${j+1}코트  ${g.teamA.join(', ')} vs ${g.teamB.join(', ')}\n`);text+=`휴식: ${r.resting.join(', ')||'없음'}\n\n`;});return text; }
  function downloadCsv() { if(!state.schedule)return; let csv='라운드,코트,팀 A,팀 B,휴식/대기\n';state.schedule.rounds.forEach((r,i)=>r.games.forEach((g,j)=>csv+=`${i+1},${j+1},"${g.teamA.join(' · ')}","${g.teamB.join(' · ')}","${j===0?r.resting.join(' · '):''}"\n`));const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='badminton-schedule.csv';a.click();URL.revokeObjectURL(a.href); }
  $('generate').addEventListener('click',generate);
  $('printBtn').addEventListener('click',()=>window.print());
  $('csvBtn').addEventListener('click',downloadCsv);
  $('copyBtn').addEventListener('click',async e=>{try{await navigator.clipboard.writeText(scheduleText());e.currentTarget.textContent='복사 완료';setTimeout(()=>e.currentTarget.textContent='텍스트 복사',1500)}catch{window.prompt('아래 내용을 복사해 주세요.',scheduleText())}});
  $('shareBtn').addEventListener('click',async()=>{const data={title:$('scheduleTitle').textContent,text:scheduleText()};if(navigator.share){try{await navigator.share(data)}catch{}}else{try{await navigator.clipboard.writeText(scheduleText());alert('대진표를 클립보드에 복사했습니다.')}catch{window.prompt('아래 내용을 복사해 주세요.',scheduleText())}}});
})();
