(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const state = { schedule: null, settings: null };
  const recommendedGamesPerPlayer = 6;
  const randomNickname = (() => {
    const starts = ['콕콩','스매시','하이','드롭','셔틀','라켓','네트','백','클리어','헤어핀','드라이브','푸시','리시브','점프','민턴','콕'];
    const ends = ['고수','왕','러너','스타','러버','킬러','마스터','챔프','플레이어','요정','폭격기','수비수','번개','친구','코치','메이트'];
    const used = new Set();
    return () => {
      let nickname;
      do { nickname = `${starts[Math.floor(Math.random() * starts.length)]}${ends[Math.floor(Math.random() * ends.length)]}`; } while (used.has(nickname));
      used.add(nickname);
      return nickname;
    };
  })();
  const initialNames = Array.from({ length: 16 }, randomNickname);
  const inputStyle = document.createElement('style');
  inputStyle.textContent = `.player-fields{grid-template-columns:repeat(4,minmax(0,1fr))!important}.nickname-field{display:block!important}.nickname-input-wrap{display:grid;gap:6px;min-width:0}.nickname-input-label{color:#64748b;font-size:12px;font-weight:800}.nickname-field .nickname-input-wrap input{min-width:0;padding:10px 11px!important;border:1px solid #dbe5ed!important;border-radius:9px!important;background:#fff!important}.nickname-field .nickname-input-wrap input:focus{border-color:#10b981!important;box-shadow:0 0 0 3px #10b98120}.capture-image .actions{display:none!important}.schedule-capture.capture-image{padding:24px;background:#fff;border-radius:18px}.single-court th:nth-child(2),.single-court td.court{display:none!important}#scheduleTable.multi-court{min-width:0}#scheduleTable.multi-court thead{display:none}#scheduleTable.multi-court tbody{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;padding:12px}#scheduleTable.multi-court tr{display:grid;grid-template-columns:1fr 1fr;overflow:hidden;border:1px solid #e2e8f0;border-radius:14px;background:#fff;box-shadow:0 5px 13px #0f172a0a}#scheduleTable.multi-court td{min-height:42px;padding:9px 10px;border:0;border-top:1px solid #eff4f6}#scheduleTable.multi-court td.round,#scheduleTable.multi-court td.court{background:#f1f5f9;color:#475569;font-size:12px}#scheduleTable.multi-court td.court{text-align:right}#scheduleTable.multi-court td.team-a,#scheduleTable.multi-court td.team-b,#scheduleTable.multi-court td.rest{grid-column:1/-1}#scheduleTable.multi-court td.team-a{background:#f0f9ff}#scheduleTable.multi-court td.team-b{background:#fff1f2}#scheduleTable.multi-court td.rest{background:#f8fafc;font-size:12px}#scheduleTable.multi-court td.vs{display:none}@media(max-width:700px){.player-fields{grid-template-columns:repeat(2,minmax(0,1fr))!important}.single-court tr{grid-template-columns:1fr!important}.single-court td.round{grid-column:1/-1}#scheduleTable.multi-court tbody{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:8px}#scheduleTable.multi-court td{padding:8px;font-size:12px}#scheduleTable.multi-court td.team-a:before,#scheduleTable.multi-court td.team-b:before{display:none}}`;
  document.head.append(inputStyle);
  const scheduleStyle = document.createElement('style');
  scheduleStyle.textContent = `#scheduleTable.matrix-schedule{min-width:0}#scheduleTable.matrix-schedule th,#scheduleTable.matrix-schedule td{white-space:normal}#scheduleTable.matrix-schedule td.round{width:110px;font-weight:900;background:#f1f5f9;color:#475569}#scheduleTable.matrix-schedule .round-rest{display:block;margin-top:4px;color:#64748b;font-size:11px;font-weight:600}#scheduleTable.matrix-schedule td.single-rest{color:#64748b;font-size:13px}#scheduleTable.matrix-schedule td.court-match{font-weight:800;line-height:1.65}#scheduleTable.matrix-schedule .team-a{color:#0369a1}#scheduleTable.matrix-schedule .match-vs{margin:0 6px;color:#94a3b8;font-size:12px;font-weight:900}#scheduleTable.matrix-schedule .team-b{color:#be123c}@media(max-width:700px){#scheduleTable.matrix-schedule thead{display:none}#scheduleTable.matrix-schedule tbody{display:grid;gap:10px}#scheduleTable.matrix-schedule tr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));overflow:hidden;border:1px solid #e2e8f0;border-radius:15px;background:#fff;box-shadow:0 5px 13px #0f172a0a}#scheduleTable.matrix-schedule td{min-height:52px;padding:10px;border:0;border-top:1px solid #eff4f6}#scheduleTable.matrix-schedule td.round{grid-column:1/-1;width:auto}#scheduleTable.matrix-schedule td.single-rest{grid-column:1/-1;background:#f8fafc}#scheduleTable.matrix-schedule td.court-match:before{content:attr(data-court);display:block;margin-bottom:4px;color:#64748b;font-size:11px;font-weight:900}#scheduleTable.matrix-schedule .match-vs{display:block;margin:1px 0;text-align:center}}`;
  document.head.append(scheduleStyle);
  const constraintAlertStyle = document.createElement('style');
  constraintAlertStyle.textContent = `.report.singles-warning{border-color:#fecdd3!important;background:#fff1f2!important;color:#be123c!important;font-weight:900!important}`;
  document.head.append(constraintAlertStyle);
  const mobileScheduleStyle = document.createElement('style');
  mobileScheduleStyle.textContent = `@media(max-width:700px){#scheduleTable.matrix-schedule tr{grid-template-columns:1fr}#scheduleTable.matrix-schedule td.court-match{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;column-gap:7px}#scheduleTable.matrix-schedule td.court-match:before{grid-column:1/-1;margin-bottom:4px}#scheduleTable.matrix-schedule .team-a,#scheduleTable.matrix-schedule .team-b{min-width:0;overflow-wrap:anywhere;word-break:break-word}#scheduleTable.matrix-schedule .team-a{text-align:right}#scheduleTable.matrix-schedule .match-vs{display:block!important;margin:0;text-align:center}#scheduleTable.matrix-schedule .team-b{text-align:left}}`;
  document.head.append(mobileScheduleStyle);
  const imageLayoutStyle = document.createElement('style');
  imageLayoutStyle.textContent = `.schedule-capture.capture-image{width:900px;max-width:none;padding:26px 28px}.capture-image .schedule-head{display:flex!important}.capture-image .table-shell{overflow:visible!important;border:1px solid #e4ecf1!important;background:#fff!important}.capture-image #scheduleTable.matrix-schedule{display:table!important;width:100%!important;min-width:0!important;font-size:12px}.capture-image #scheduleTable.matrix-schedule thead{display:table-header-group!important}.capture-image #scheduleTable.matrix-schedule tbody{display:table-row-group!important}.capture-image #scheduleTable.matrix-schedule tr{display:table-row!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important}.capture-image #scheduleTable.matrix-schedule th,.capture-image #scheduleTable.matrix-schedule td{display:table-cell!important;min-height:0!important;padding:8px 10px!important;border:0!important;border-top:1px solid #edf2f5!important;vertical-align:middle!important}.capture-image #scheduleTable.matrix-schedule th{border-top:0!important}.capture-image #scheduleTable.matrix-schedule td.round{width:86px!important}.capture-image #scheduleTable.matrix-schedule td.court-match{line-height:1.45!important}.capture-image #scheduleTable.matrix-schedule td.court-match:before{display:none!important}.capture-image #scheduleTable.matrix-schedule .team-a,.capture-image #scheduleTable.matrix-schedule .team-b{display:inline!important;text-align:initial!important;overflow-wrap:normal!important;word-break:normal!important}.capture-image #scheduleTable.matrix-schedule .match-vs{display:inline!important;margin:0 6px!important}.capture-image #scheduleTable.matrix-schedule .single-rest{display:table-cell!important;background:transparent!important}`;
  document.head.append(imageLayoutStyle);

  function participantCount() {
    const value = Number($('playerCount').value);
    return Math.max(4, Math.min(40, Number.isInteger(value) ? value : 4));
  }
  function courtCount() {
    const value = Number($('courts').value);
    return Math.max(1, Math.min(4, Number.isInteger(value) ? value : 1));
  }
  function courtPlan(count, courts) {
    const doubles = Math.min(courts, Math.floor(count / 4));
    const remaining = count - doubles * 4;
    const singles = remaining >= 2 && doubles < courts ? 1 : 0;
    return { doubles, singles, courtsUsed: doubles + singles, slots: doubles * 4 + singles * 2 };
  }
  function recommendedRounds(count = participantCount(), courts = courtCount()) {
    const plan = courtPlan(count, courts);
    return Math.min(60, Math.ceil((count * (count - 1)) / plan.slots));
  }
  function updateRoundRecommendation() {
    const count = participantCount(), courts = courtCount(), rounds = recommendedRounds(count, courts);
    $('playerCount').value = count;
    $('courts').value = courts;
    $('rounds').value = rounds;
    $('playerCountHint').textContent = `총 ${count}명`;
    $('roundRecommendation').textContent = `모든 참가자와 1회 파트너 기준 추천 ${rounds}라운드`;
  }
  function syncPlayerFields() {
    const current = [...document.querySelectorAll('[data-player-name]')].map(input => input.value);
    const count = participantCount(), fields = $('playerFields');
    fields.replaceChildren();
    for (let i = 0; i < count; i++) {
      const label = document.createElement('label'), inputWrap = document.createElement('span'), inputLabel = document.createElement('span'), input = document.createElement('input');
      label.className = 'nickname-field';
      inputWrap.className = 'nickname-input-wrap'; inputLabel.className = 'nickname-input-label'; inputLabel.textContent = '닉네임';
      input.type = 'text'; input.maxLength = 24; input.placeholder = '닉네임 입력'; input.dataset.playerName = 'true';
      input.value = current[i] ?? initialNames[i] ?? '';
      inputWrap.append(inputLabel, input); label.append(inputWrap); fields.append(label);
    }
    updateRoundRecommendation();
  }
  function readPlayers() {
    return [...document.querySelectorAll('[data-player-name]')].map(input => input.value.trim());
  }
  function validateNames(players) {
    const duplicates = players.filter((p, i) => players.findIndex(q => q.toLocaleLowerCase() === p.toLocaleLowerCase()) !== i);
    return { duplicates: [...new Set(duplicates)] };
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
  function makeRound(selected, doubleCourts, singleCourts, partnerCounts, opponentCounts, rotate) {
    let best = null, bestCost = Infinity;
    const patterns = [[0,1,2,3],[0,2,1,3],[0,3,1,2]];
    for (let trial = 0; trial < 70; trial++) {
      const order = shuffled(selected), games = [];
      for (let g = 0; g < doubleCourts; g++) {
        const four = order.slice(g * 4, g * 4 + 4);
        let choice = patterns[0], low = Infinity;
        for (const p of patterns) {
          const [a,b,c,d] = p.map(i => four[i]);
          const cost = rotate ? 8 * (count(partnerCounts,a,b) + count(partnerCounts,c,d)) + count(opponentCounts,a,c) + count(opponentCounts,a,d) + count(opponentCounts,b,c) + count(opponentCounts,b,d) : 0;
          if (cost < low) { low = cost; choice = p; }
        }
        const [a,b,c,d] = choice.map(i => four[i]); games.push({ type:'doubles', teamA:[a,b], teamB:[c,d] });
      }
      for (let g = 0; g < singleCourts; g++) { const [a,b] = order.slice(doubleCourts * 4 + g * 2, doubleCourts * 4 + g * 2 + 2); games.push({ type:'singles', teamA:[a], teamB:[b] }); }
      const cost = games.filter(g => g.type === 'doubles').reduce((sum,g) => sum + (rotate ? 8*(count(partnerCounts,...g.teamA)+count(partnerCounts,...g.teamB)) + g.teamA.reduce((s,a)=>s+g.teamB.reduce((t,b)=>t+count(opponentCounts,a,b),0),0) : 0), 0);
      if (cost < bestCost) { bestCost = cost; best = games; }
    }
    return best;
  }
  function generateOnce(players, courts, rounds, opts) {
    const plan = courtPlan(players.length, courts);
    const slots = plan.slots, plays = new Map(players.map(p => [p, 0]));
    const partnerCounts = new Map(), opponentCounts = new Map(), history = [], roundsOut = [];
    for (let r = 0; r < rounds; r++) {
      const selected = choosePlayers(players, slots, history, plays, opts.noThree && players.length > slots);
      const games = makeRound(selected, plan.doubles, plan.singles, partnerCounts, opponentCounts, opts.rotate);
      for (const game of games) {
        if (game.type === 'doubles') { add(partnerCounts, ...game.teamA); add(partnerCounts, ...game.teamB); }
        for (const a of game.teamA) for (const b of game.teamB) add(opponentCounts, a, b);
      }
      selected.forEach(p => plays.set(p, plays.get(p)+1));
      history.push(selected); roundsOut.push({ games, resting: players.filter(p => !selected.includes(p)) });
    }
    return { rounds:roundsOut, plays, history, partnerCounts, opponentCounts, plan };
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
    $('scheduleTitle').textContent = '🏸 배드민턴 경기 대진표';
    const games = result.rounds[0].games.length;
    const avg = (settings.rounds*result.plan.slots/players.length).toFixed(1).replace('.0','');
    const format = result.plan.singles ? `복식 ${result.plan.doubles}코트 · 단식 ${result.plan.singles}코트` : '복식';
    $('overview').textContent = `참석 ${players.length}명 · ${settings.courts}코트 중 ${games}코트 사용 · ${format} · ${settings.rounds}라운드 · 1인 평균 ${avg}게임`;
    const scheduleTable = $('scheduleTable');
    scheduleTable.classList.remove('single-court', 'multi-court');
    scheduleTable.classList.add('matrix-schedule');
    const header = scheduleTable.querySelector('thead tr'); header.replaceChildren();
    const courtLabels = result.rounds[0].games.map((game, index) => `${index + 1}코트${game.type === 'singles' ? ' · 단식' : ''}`);
    const headerLabels = games === 1 ? ['라운드', '대진', '휴식 / 대기'] : ['라운드', ...courtLabels];
    headerLabels.forEach(label => { const th = document.createElement('th'); th.textContent = label; header.append(th); });
    const tbody = scheduleTable.querySelector('tbody'); tbody.replaceChildren();
    result.rounds.forEach((round, ri) => {
      const tr = document.createElement('tr');
      const roundCell = document.createElement('td'); roundCell.className = 'round'; roundCell.textContent = `${ri + 1}R`;
      if (games > 1 && round.resting.length) { const rest = document.createElement('small'); rest.className = 'round-rest'; rest.textContent = `휴식: ${round.resting.join(', ')}`; roundCell.append(rest); }
      tr.append(roundCell);
      round.games.forEach((game, gi) => {
        const cell = document.createElement('td'), teamA = document.createElement('span'), versus = document.createElement('span'), teamB = document.createElement('span');
        cell.className = 'court-match'; cell.dataset.court = `${gi + 1}코트${game.type === 'singles' ? ' · 단식' : ''}`;
        teamA.className = 'team-a'; teamA.textContent = game.teamA.join(', ');
        versus.className = 'match-vs'; versus.textContent = 'vs';
        teamB.className = 'team-b'; teamB.textContent = game.teamB.join(', ');
        cell.append(teamA, versus, teamB); tr.append(cell);
      });
      if (games === 1) { const restCell = document.createElement('td'); restCell.className = 'single-rest'; restCell.textContent = round.resting.join(', ') || '대기자 없음'; tr.append(restCell); }
      tbody.append(tr);
    });
    const verify = $('verifyTable').querySelector('tbody'); verify.replaceChildren();
    const playValues=players.map(p=>result.plays.get(p)); const equal = Math.max(...playValues)-Math.min(...playValues)<=1;
    players.forEach(p => { const streak=maxStreak(result.history,p), partners=[...result.partnerCounts.keys()].filter(k=>k.split('|').includes(p)).length; const status=streak<=2?'정상':'3연속 발생'; const cls=streak<=2?'status-ok':'status-alert'; const tr=document.createElement('tr'); [[p,''],[`${result.plays.get(p)}회`,''],[`${settings.rounds - result.plays.get(p)}회`,''],[`${streak}회`,streak<=2?'':'status-alert'],[`${partners}명`,''],[status,cls]].forEach(([t,c])=>{const td=document.createElement('td');td.textContent=t;td.className=c;tr.append(td)});verify.append(tr); });
    const warnings=[];
    if (result.plan.doubles < settings.courts) {
      const setup = result.plan.singles
        ? `${result.plan.doubles}복식 + ${result.plan.singles}단식으로 편성했습니다.`
        : `${result.plan.doubles}코트만 복식으로 편성할 수 있어 남은 인원은 대기합니다.`;
      warnings.push(`복식 운용 불가: ${setup}`);
    }
    if (settings.noThree && players.length<=result.plan.slots) warnings.push('모든 참가자가 매 라운드 출전하므로 3연속 출전을 피할 수 없습니다.');
    if (settings.noThree && players.length>result.plan.slots && players.some(p=>maxStreak(result.history,p)>=3)) warnings.push('인원·라운드 조건상 일부 3연속 출전이 발생했습니다.');
    if (settings.equal && !equal) warnings.push('출전 횟수 차이가 1회를 초과했습니다. 라운드를 늘리거나 조건을 조정해 주세요.');
    const report=$('constraintReport'); const doublesUnavailable=result.plan.doubles<settings.courts; report.className=`report ${warnings.length?'warning':''}${doublesUnavailable?' singles-warning':''}`; report.textContent=warnings.length ? `${doublesUnavailable ? '' : '확인 필요: '}${warnings.join(' ')}` : '검증 완료: 출전 횟수는 균등하게 배분되었고, 적용 가능한 연속 출전 조건을 확인했습니다.';
    state.schedule=result; state.settings=settings; $('results').classList.remove('hidden'); $('results').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function generate() {
    const players=readPlayers(), validation=validateNames(players), notice=$('nicknameNotice');
    const blankIndex=players.findIndex(name => !name);
    if (blankIndex !== -1 || validation.duplicates.length) { notice.className='notice error'; notice.textContent=validation.duplicates.length ? `중복 닉네임: ${validation.duplicates.join(', ')} — 철자를 수정한 뒤 다시 만들어 주세요.` : `참가자 ${blankIndex + 1}의 닉네임을 입력해 주세요.`; return; }
    const courts=courtCount(), rounds=Number($('rounds').value);
    $('courts').value = courts;
    if (!Number.isInteger(rounds)||rounds<1) { notice.className='notice error';notice.textContent='라운드 수를 올바른 정수로 입력해 주세요.';return; }
    notice.className='notice hidden'; notice.textContent='';
    const settings={courts,rounds,equal:$('equalPlay').checked,noThree:$('noThree').checked,rotate:$('rotatePartners').checked};
    render(buildSchedule(players,courts,rounds,settings),players,settings);
  }
  function scheduleText() {
    const s = state.schedule, set = state.settings;
    if (!s) return '';
    let text = `🏸 배드민턴 경기 대진표\n참석 ${s.plays.size}명 · ${set.courts}코트 · ${set.rounds}라운드\n\n`;
    const isSingleCourt = s.rounds[0].games.length === 1;
    s.rounds.forEach((round, index) => {
      text += `[라운드 ${index + 1}]\n`;
      round.games.forEach((game, courtIndex) => {
        const prefix = isSingleCourt ? '' : `${courtIndex + 1}코트  `;
        text += `${prefix}${game.teamA.join(', ')} vs ${game.teamB.join(', ')}\n`;
      });
      text += `휴식: ${round.resting.join(', ') || '없음'}\n\n`;
    });
    return text;
  }
  function downloadCsv() { if(!state.schedule)return; let csv='라운드,코트,팀 A,팀 B,휴식/대기\n';state.schedule.rounds.forEach((r,i)=>r.games.forEach((g,j)=>csv+=`${i+1},${j+1},"${g.teamA.join(' · ')}","${g.teamB.join(' · ')}","${j===0?r.resting.join(' · '):''}"\n`));const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='badminton-schedule.csv';a.click();URL.revokeObjectURL(a.href); }
  async function downloadImage() {
    if (!state.schedule || !window.html2canvas) return;
    const button = $('imageBtn'), capture = $('scheduleCapture'), original = button.textContent;
    button.disabled = true; button.textContent = '이미지 준비 중'; capture.classList.add('capture-image');
    try {
      const canvas = await window.html2canvas(capture, { backgroundColor: '#f8fafc', scale: 2, useCORS: true });
      const link = document.createElement('a'); link.download = 'badminton-schedule.png'; link.href = canvas.toDataURL('image/png'); link.click();
    } catch { alert('이미지 저장에 실패했습니다. 다시 시도해 주세요.'); }
    finally { capture.classList.remove('capture-image'); button.disabled = false; button.textContent = original; }
  }
  // 숫자를 지우거나 여러 자리 수를 입력하는 동안에는 값을 강제로 보정하지 않습니다.
  $('playerCount').addEventListener('change',syncPlayerFields);
  $('playerCount').addEventListener('blur',syncPlayerFields);
  // 코트 수도 여러 자리 값을 입력하는 동안에는 즉시 보정하지 않습니다.
  $('courts').addEventListener('change',updateRoundRecommendation);
  $('courts').addEventListener('blur',updateRoundRecommendation);
  syncPlayerFields();
  $('generate').addEventListener('click',generate);
  $('imageBtn').addEventListener('click',downloadImage);
  $('copyBtn').addEventListener('click',async e=>{try{await navigator.clipboard.writeText(scheduleText());e.currentTarget.textContent='복사 완료';setTimeout(()=>e.currentTarget.textContent='텍스트 복사',1500)}catch{window.prompt('아래 내용을 복사해 주세요.',scheduleText())}});
})();
