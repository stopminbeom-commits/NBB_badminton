(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const priorityConfig = [
    { key: 'equal', checkbox: 'equalPlay', select: 'priorityEqual' },
    { key: 'noThree', checkbox: 'noThree', select: 'priorityNoThree' },
    { key: 'rotate', checkbox: 'rotatePartners', select: 'priorityRotate' },
    { key: 'noRest', checkbox: 'noConsecutiveRest', select: 'priorityNoRest' }
  ];
  const recommendedPriorityOrder = count => {
    if (count === 5) return ['rotate', 'equal', 'noRest'];
    if (count === 6) return ['rotate', 'equal', 'noRest', 'noThree'];
    return ['rotate', 'equal', 'noThree', 'noRest'];
  };
  const state = {
    schedule: null,
    settings: null,
    players: null,
    completed: [],
    priorityOrder: priorityConfig.filter(item => $(item.checkbox).checked).map(item => item.key)
  };
  const recommendedGamesPerPlayer = 6;
  const randomNickname = (() => {
    const nicknames = ['민턴','콕콩','스매시','하이','드롭','셔틀','라켓','네트','백핸드','클리어','헤어핀','푸시','점프','리시브','서브','스핀','콕수','콕돌','콕별','셔링','하별','콕곰','콕새'];
    const used = new Set();
    return () => {
      const available = nicknames.filter(nickname => !used.has(nickname));
      const nickname = available[Math.floor(Math.random() * available.length)];
      used.add(nickname);
      return nickname;
    };
  })();
  const initialNames = Array.from({ length: 16 }, randomNickname);
  const inputStyle = document.createElement('style');
  inputStyle.textContent = `.player-fields{grid-template-columns:repeat(4,minmax(0,1fr))!important}.nickname-field{display:block!important}.nickname-input-wrap{display:grid;gap:6px;min-width:0}.nickname-input-label{color:#64748b;font-size:12px;font-weight:800}.nickname-field .nickname-input-wrap input{min-width:0;padding:10px 11px!important;border:1px solid #dbe5ed!important;border-radius:9px!important;background:#fff!important}.nickname-field .nickname-input-wrap input:focus{border-color:#10b981!important;box-shadow:0 0 0 3px #10b98120}.capture-image .actions{display:none!important}.schedule-capture.capture-image{padding:24px;background:#fff;border-radius:18px}.single-court th:nth-child(2),.single-court td.court{display:none!important}#scheduleTable.multi-court{min-width:0}#scheduleTable.multi-court thead{display:none}#scheduleTable.multi-court tbody{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;padding:12px}#scheduleTable.multi-court tr{display:grid;grid-template-columns:1fr 1fr;overflow:hidden;border:1px solid #e2e8f0;border-radius:14px;background:#fff;box-shadow:0 5px 13px #0f172a0a}#scheduleTable.multi-court td{min-height:42px;padding:9px 10px;border:0;border-top:1px solid #eff4f6}#scheduleTable.multi-court td.round,#scheduleTable.multi-court td.court{background:#f1f5f9;color:#475569;font-size:12px}#scheduleTable.multi-court td.court{text-align:right}#scheduleTable.multi-court td.team-a,#scheduleTable.multi-court td.team-b,#scheduleTable.multi-court td.rest{grid-column:1/-1}#scheduleTable.multi-court td.team-a{background:#f0f9ff}#scheduleTable.multi-court td.team-b{background:#fff1f2}#scheduleTable.multi-court td.rest{background:#f8fafc;font-size:12px}#scheduleTable.multi-court td.vs{display:none}@media(max-width:700px){.player-fields{grid-template-columns:repeat(2,minmax(0,1fr))!important}.single-court tr{grid-template-columns:1fr!important}.single-court td.round{grid-column:1/-1}#scheduleTable.multi-court tbody{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:8px}#scheduleTable.multi-court td{padding:8px;font-size:12px}#scheduleTable.multi-court td.team-a:before,#scheduleTable.multi-court td.team-b:before{display:none}}`;
  document.head.append(inputStyle);
  const playerGridStyle = document.createElement('style');
  playerGridStyle.textContent = `.player-fields{grid-template-columns:repeat(var(--player-columns,4),minmax(0,1fr))!important}@media(max-width:700px){.player-fields{grid-template-columns:repeat(2,minmax(0,1fr))!important}}`;
  document.head.append(playerGridStyle);
  const scheduleStyle = document.createElement('style');
  scheduleStyle.textContent = `#scheduleTable.matrix-schedule{min-width:0}#scheduleTable.matrix-schedule th,#scheduleTable.matrix-schedule td{white-space:normal}#scheduleTable.matrix-schedule td.round{width:110px;font-weight:900;background:#f1f5f9;color:#475569}#scheduleTable.matrix-schedule .round-rest{display:block;margin-top:4px;color:#64748b;font-size:11px;font-weight:600}#scheduleTable.matrix-schedule td.single-rest{color:#64748b;font-size:13px}#scheduleTable.matrix-schedule td.court-match{font-weight:800;line-height:1.65}#scheduleTable.matrix-schedule .team-a{color:#0369a1}#scheduleTable.matrix-schedule .match-vs{margin:0 6px;color:#94a3b8;font-size:12px;font-weight:900}#scheduleTable.matrix-schedule .team-b{color:#be123c}@media(max-width:700px){#scheduleTable.matrix-schedule thead{display:none}#scheduleTable.matrix-schedule tbody{display:grid;gap:10px}#scheduleTable.matrix-schedule tr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));overflow:hidden;border:1px solid #e2e8f0;border-radius:15px;background:#fff;box-shadow:0 5px 13px #0f172a0a}#scheduleTable.matrix-schedule td{min-height:52px;padding:10px;border:0;border-top:1px solid #eff4f6}#scheduleTable.matrix-schedule td.round{grid-column:1/-1;width:auto}#scheduleTable.matrix-schedule td.single-rest{grid-column:1/-1;background:#f8fafc}#scheduleTable.matrix-schedule td.court-match:before{content:attr(data-court);display:block;margin-bottom:4px;color:#64748b;font-size:11px;font-weight:900}#scheduleTable.matrix-schedule .match-vs{display:block;margin:1px 0;text-align:center}}`;
  document.head.append(scheduleStyle);
  const constraintAlertStyle = document.createElement('style');
  constraintAlertStyle.textContent = `.report.singles-warning{border-color:#fecdd3!important;background:#fff1f2!important;color:#be123c!important;font-weight:900!important}`;
  document.head.append(constraintAlertStyle);
  const mobileScheduleStyle = document.createElement('style');
  mobileScheduleStyle.textContent = `@media(max-width:700px){#scheduleTable.matrix-schedule tr{grid-template-columns:1fr}#scheduleTable.matrix-schedule td{min-height:0;padding:8px 10px}#scheduleTable.matrix-schedule td.round{padding:8px 10px}#scheduleTable.matrix-schedule td.court-match{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;column-gap:5px}#scheduleTable.matrix-schedule td.court-match:before{grid-column:1/-1;margin-bottom:3px}#scheduleTable.matrix-schedule td.court-match.only-court:before{display:none}#scheduleTable.matrix-schedule .team-a,#scheduleTable.matrix-schedule .team-b{min-width:0;overflow-wrap:anywhere;word-break:break-word;font-size:12px}#scheduleTable.matrix-schedule .team-a{text-align:right}#scheduleTable.matrix-schedule .match-vs{display:block!important;margin:0;text-align:center}#scheduleTable.matrix-schedule .team-b{text-align:left}#scheduleTable.matrix-schedule td.single-rest{padding:7px 10px;font-size:11px}}`;
  document.head.append(mobileScheduleStyle);
  const imageLayoutStyle = document.createElement('style');
  imageLayoutStyle.textContent = `.schedule-capture.capture-image{width:900px;max-width:none;padding:26px 28px}.capture-image .schedule-head{display:flex!important}.capture-image .table-shell{overflow:visible!important;border:1px solid #e4ecf1!important;background:#fff!important}.capture-image #scheduleTable.matrix-schedule{display:table!important;width:100%!important;min-width:0!important;font-size:12px}.capture-image #scheduleTable.matrix-schedule thead{display:table-header-group!important}.capture-image #scheduleTable.matrix-schedule tbody{display:table-row-group!important}.capture-image #scheduleTable.matrix-schedule tr{display:table-row!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important}.capture-image #scheduleTable.matrix-schedule th,.capture-image #scheduleTable.matrix-schedule td{display:table-cell!important;min-height:0!important;padding:8px 10px!important;border:0!important;border-top:1px solid #edf2f5!important;vertical-align:middle!important}.capture-image #scheduleTable.matrix-schedule th{border-top:0!important}.capture-image #scheduleTable.matrix-schedule td.round{width:86px!important}.capture-image #scheduleTable.matrix-schedule td.court-match{line-height:1.45!important}.capture-image #scheduleTable.matrix-schedule td.court-match:before{display:none!important}.capture-image #scheduleTable.matrix-schedule .team-a,.capture-image #scheduleTable.matrix-schedule .team-b{display:inline!important;text-align:initial!important;overflow-wrap:normal!important;word-break:normal!important}.capture-image #scheduleTable.matrix-schedule .match-vs{display:inline!important;margin:0 6px!important}.capture-image #scheduleTable.matrix-schedule .single-rest{display:table-cell!important;background:transparent!important}`;
  document.head.append(imageLayoutStyle);
  const teamCardStyle = document.createElement('style');
  teamCardStyle.textContent = `#scheduleTable.matrix-schedule .team-card{display:inline;min-width:0;padding:0;border:0;border-radius:0;background:transparent;color:#475569!important;line-height:1.45;vertical-align:middle}#scheduleTable.matrix-schedule .player-roster{min-width:0}#scheduleTable.matrix-schedule .player-name{color:inherit!important;font-weight:900}#scheduleTable.matrix-schedule td.court-match.only-court{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;column-gap:10px}#scheduleTable.matrix-schedule td.court-match.only-court .team-a{text-align:right}#scheduleTable.matrix-schedule td.court-match.only-court .team-b{text-align:left}.capture-image #scheduleTable.matrix-schedule .team-card{display:inline!important;text-align:initial!important;overflow-wrap:normal!important;word-break:normal!important}#scheduleTable.matrix-schedule td.single-rest{text-align:left}@media(max-width:700px){#scheduleTable.matrix-schedule td.court-match .team-card{display:block;width:auto;padding:0}#scheduleTable.matrix-schedule .player-name{font-size:11px}#scheduleTable.matrix-schedule td.single-rest{text-align:center}}`;
  document.head.append(teamCardStyle);
  const singleCourtCardStyle = document.createElement('style');
  singleCourtCardStyle.textContent = `#scheduleTable.single-court-card-grid{display:block;min-width:0;border:0;border-collapse:separate;background:transparent}#scheduleTable.single-court-card-grid thead{display:none}#scheduleTable.single-court-card-grid tbody{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}#scheduleTable.single-court-card-grid tr{display:grid;grid-template-columns:1fr;overflow:hidden;border:1px solid #cfe8fb;border-radius:10px;background:#fff;box-shadow:0 3px 9px #0f172a0a}#scheduleTable.single-court-card-grid td{min-height:0;padding:9px 8px;border:0}#scheduleTable.single-court-card-grid td.round{grid-column:1/-1;width:auto;background:linear-gradient(135deg,#e0f2fe,#eff6ff);color:#1e3a5f;font-size:13px;text-align:center}#scheduleTable.single-court-card-grid td.court-match.only-court{grid-column:1/-1;padding:11px 8px;column-gap:7px}#scheduleTable.single-court-card-grid .player-roster{display:flex;flex-direction:column;gap:2px}#scheduleTable.single-court-card-grid .team-a .player-roster{align-items:flex-end}#scheduleTable.single-court-card-grid .team-b .player-roster{align-items:flex-start}#scheduleTable.single-court-card-grid .player-separator{display:none}#scheduleTable.single-court-card-grid td.single-rest{grid-column:1/-1;min-height:35px;padding:7px 8px;border-top:1px solid #edf2f7;color:#64748b;font-size:11px;text-align:center}.capture-image #scheduleTable.single-court-card-grid{display:block!important;font-size:11px!important}.capture-image #scheduleTable.single-court-card-grid thead{display:none!important}.capture-image #scheduleTable.single-court-card-grid tbody{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:8px!important;padding:0!important}.capture-image #scheduleTable.single-court-card-grid tr{display:grid!important;grid-template-columns:1fr!important;overflow:hidden!important;border:1px solid #cfe8fb!important;border-radius:9px!important;background:#fff!important}.capture-image #scheduleTable.single-court-card-grid td{display:block!important;min-height:0!important;padding:7px 6px!important;border:0!important}.capture-image #scheduleTable.single-court-card-grid td.round{width:auto!important;background:#e0f2fe!important;text-align:center!important}.capture-image #scheduleTable.single-court-card-grid td.court-match.only-court{display:grid!important;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)!important;column-gap:4px!important}.capture-image #scheduleTable.single-court-card-grid td.single-rest{display:block!important;padding:5px 6px!important;border-top:1px solid #edf2f7!important;text-align:center!important}@media(max-width:700px){#scheduleTable.single-court-card-grid tbody{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}#scheduleTable.single-court-card-grid td.round{font-size:12px}#scheduleTable.single-court-card-grid td.court-match.only-court{padding:10px 6px;column-gap:5px}#scheduleTable.single-court-card-grid td.single-rest{font-size:10px}.capture-image #scheduleTable.single-court-card-grid tbody{grid-template-columns:repeat(4,minmax(0,1fr))!important}}`;
  document.head.append(singleCourtCardStyle);

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
  function gcd(a, b) {
    while (b) [a, b] = [b, a % b];
    return a;
  }
  function equalRotationRounds(count = participantCount(), courts = courtCount()) {
    const slots = courtPlan(count, courts).slots;
    return slots ? Math.min(60, count / gcd(count, slots)) : 1;
  }
  function updateRoundRecommendation() {
    const count = participantCount(), courts = courtCount();
    const partnerRounds = recommendedRounds(count, courts), equalRounds = equalRotationRounds(count, courts);
    const rounds = count * (count * 3 <= 15 ? 3 : 2);
    $('playerCount').value = count;
    $('courts').value = courts;
    $('rounds').value = rounds;
    $('playerCountHint').textContent = `총 ${count}명`;
    const recommendation = $('roundRecommendation');
    const firstLine = document.createElement('span'), secondLine = document.createElement('span');
    firstLine.textContent = `파트너 순환 최소 ${partnerRounds}라운드 · 균등 출전/휴식 최소 주기 ${equalRounds}라운드`;
    secondLine.textContent = '최소 주기 2~3회 진행 권장';
    recommendation.replaceChildren(firstLine, secondLine);
  }
  function syncPlayerFields() {
    const current = [...document.querySelectorAll('[data-player-name]')].map(input => input.value);
    const count = participantCount(), fields = $('playerFields');
    fields.replaceChildren();
    fields.style.setProperty('--player-columns', count === 5 || count % 3 === 0 ? 3 : 4);
    for (let i = 0; i < count; i++) {
      const label = document.createElement('label'), inputWrap = document.createElement('span'), inputLabel = document.createElement('span'), input = document.createElement('input');
      label.className = 'nickname-field';
      inputWrap.className = 'nickname-input-wrap'; inputLabel.className = 'nickname-input-label'; inputLabel.textContent = '닉네임';
      input.type = 'text'; input.maxLength = 24; input.placeholder = '닉네임 입력'; input.dataset.playerName = 'true';
      input.value = current[i] ?? initialNames[i] ?? '';
      inputWrap.append(inputLabel, input); label.append(inputWrap); fields.append(label);
    }
    applyRecommendedPriorities(count);
    updateRoundRecommendation();
  }
  function applyRecommendedPriorities(count) {
    state.priorityOrder = recommendedPriorityOrder(count);
    priorityConfig.forEach(item => { $(item.checkbox).checked = state.priorityOrder.includes(item.key); });
    syncPriorityControls();
  }
  function syncPriorityControls() {
    state.priorityOrder = state.priorityOrder.filter(key => priorityConfig.some(item => item.key === key && $(item.checkbox).checked));
    priorityConfig.forEach(item => {
      if ($(item.checkbox).checked && !state.priorityOrder.includes(item.key)) state.priorityOrder.push(item.key);
    });
    priorityConfig.forEach(item => {
      const select = $(item.select), active = $(item.checkbox).checked;
      select.disabled = !active;
      if (active) select.value = String(state.priorityOrder.indexOf(item.key) + 1);
    });
  }
  function updatePriorityFromCheck(key) {
    const item = priorityConfig.find(option => option.key === key);
    if ($(item.checkbox).checked) {
      if (!state.priorityOrder.includes(key)) state.priorityOrder.push(key);
    } else {
      state.priorityOrder = state.priorityOrder.filter(existing => existing !== key);
    }
    syncPriorityControls();
  }
  function updatePriorityFromSelect(key) {
    const item = priorityConfig.find(option => option.key === key);
    const current = state.priorityOrder.indexOf(key);
    const requested = Number($(item.select).value) - 1;
    if (current >= 0 && requested >= 0 && requested < state.priorityOrder.length) {
      [state.priorityOrder[current], state.priorityOrder[requested]] = [state.priorityOrder[requested], state.priorityOrder[current]];
    }
    syncPriorityControls();
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
  function doublesPairingKey(game) { return [pairKey(...game.teamA), pairKey(...game.teamB)].sort().join(' / '); }
  function shuffled(items) { const a = [...items]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function streakAfter(history, player) { let n = 0; for (let r = history.length - 1; r >= 0 && history[r].includes(player); r--) n++; return n; }
  function restStreakAfter(history, player) { let n = 0; for (let r = history.length - 1; r >= 0 && !history[r].includes(player); r--) n++; return n; }
  function priorityValue(opts, key) { return opts.priorities?.[key] || 4; }
  function priorityMetrics(metrics, opts) {
    return metrics.filter(metric => opts[metric.key]).sort((a, b) => priorityValue(opts, a.key) - priorityValue(opts, b.key)).reduce((score, metric) => score * 5000 + metric.value, 0);
  }

  function relationshipLoad(selected, partnerCounts, opponentCounts) {
    let load = 0;
    for (let i = 0; i < selected.length; i++) for (let j = i + 1; j < selected.length; j++) {
      load += count(partnerCounts, selected[i], selected[j]) * 6 + count(opponentCounts, selected[i], selected[j]);
    }
    return load;
  }
  function restPairLoad(players, selected, history) {
    const resting = players.filter(player => !selected.includes(player)); let repeats = 0;
    for (let i = 0; i < resting.length; i++) for (let j = i + 1; j < resting.length; j++) {
      for (const previous of history) if (!previous.includes(resting[i]) && !previous.includes(resting[j])) repeats++;
    }
    return repeats;
  }
  function restPairRepeatCount(players, history) {
    const counts = new Map();
    for (const selected of history) {
      const resting = players.filter(player => !selected.includes(player));
      for (let i = 0; i < resting.length; i++) for (let j = i + 1; j < resting.length; j++) add(counts, resting[i], resting[j]);
    }
    return [...counts.values()].reduce((total, value) => total + Math.max(0, value - 1), 0);
  }
  function choosePlayers(players, slots, history, plays, opts, partnerCounts = new Map(), opponentCounts = new Map()) {
    let best = null, bestScore = Infinity;
    const candidates = players.length <= 10 ? 64 : 36;
    for (let trial = 0; trial < candidates; trial++) {
      const selected = shuffled(players).slice(0, slots);
      let score = 0;
      for (const player of selected) {
        if (opts.equal) score += plays.get(player) * (5 - priorityValue(opts, 'equal')) * 80;
        if (opts.noThree && streakAfter(history, player) >= 2) score += (5 - priorityValue(opts, 'noThree')) * 100000;
        const restRun = restStreakAfter(history, player);
        // 오래 쉰 참가자를 더 강하게 우선해 긴 연속 휴식 구간을 끊습니다.
        if (opts.noRest && restRun >= 1) score -= (5 - priorityValue(opts, 'noRest')) * 100000 * restRun * restRun;
      }
      if (opts.rotate) score += relationshipLoad(selected, partnerCounts, opponentCounts) * (5 - priorityValue(opts, 'rotate')) * 500;
      // 휴식 순환: 같은 휴식 조합이 반복되는 경우를 줄여 대기 인원도 고르게 섞습니다.
      if (opts.noRest) score += restPairLoad(players, selected, history) * (5 - priorityValue(opts, 'noRest')) * 300000;
      if (score < bestScore || (score === bestScore && Math.random() < .5)) { best = selected; bestScore = score; }
    }
    return best;
  }
  function selectionKey(selected) { return [...selected].sort().join('\u0001'); }
  function cyclicStreakCount(history, players, resting = false) {
    let repeats = 0;
    for (const player of players) {
      let run = 0;
      const extended = [...history, ...history.slice(0, resting ? 1 : 2)];
      for (const selected of extended) {
        run = (resting ? !selected.includes(player) : selected.includes(player)) ? run + 1 : 0;
        if (run >= (resting ? 2 : 3)) repeats++;
      }
    }
    return repeats;
  }
  function buildBalancedCycle(players, slots, cycleRounds, opts) {
    let best = null, bestScore = Infinity;
    for (let attempt = 0; attempt < 160; attempt++) {
      const cyclePlays = new Map(players.map(p => [p, 0])), cycleHistory = [], selections = [];
      for (let r = 0; r < cycleRounds; r++) {
        const selected = choosePlayers(players, slots, cycleHistory, cyclePlays, opts);
        selected.forEach(p => cyclePlays.set(p, cyclePlays.get(p) + 1));
        cycleHistory.push(selected); selections.push(selected);
      }
      const values = players.map(p => cyclePlays.get(p));
      const spread = Math.max(...values) - Math.min(...values);
      const repeatedGroups = selections.length - new Set(selections.map(selectionKey)).size;
      const score = repeatedGroups * 1000000000000000 + priorityMetrics([
        { key:'equal', value:spread },
        { key:'noThree', value:cyclicStreakCount(cycleHistory, players) },
        { key:'noRest', value:cyclicStreakCount(cycleHistory, players, true) }
      ], opts);
      if (score < bestScore) { bestScore = score; best = selections; }
      if (score === 0) break;
    }
    return best;
  }
  function makeRound(selected, doubleCourts, singleCourts, partnerCounts, opponentCounts, rotate, avoidedPairings = null, previousPartnerPairs = null) {
    let best = null, bestCost = Infinity;
    const patterns = [[0,1,2,3],[0,2,1,3],[0,3,1,2]];
    for (let trial = 0; trial < 70; trial++) {
      const order = shuffled(selected), games = [];
      for (let g = 0; g < doubleCourts; g++) {
        const four = order.slice(g * 4, g * 4 + 4);
        let choice = patterns[0], low = Infinity;
        for (const p of patterns) {
          const [a,b,c,d] = p.map(i => four[i]);
          const candidate = { type:'doubles', teamA:[a,b], teamB:[c,d] };
          const repeatPenalty = avoidedPairings && doubleCourts === 1 && avoidedPairings.has(doublesPairingKey(candidate)) ? 100000 : 0;
          const adjacentPenalty = previousPartnerPairs ? [...partnerPairSet(candidate)].filter(pair => previousPartnerPairs.has(pair)).length * 100000000 : 0;
          const cost = (rotate ? 8 * (count(partnerCounts,a,b) + count(partnerCounts,c,d)) + count(opponentCounts,a,c) + count(opponentCounts,a,d) + count(opponentCounts,b,c) + count(opponentCounts,b,d) : 0) + repeatPenalty + adjacentPenalty;
          if (cost < low) { low = cost; choice = p; }
        }
        const [a,b,c,d] = choice.map(i => four[i]); games.push({ type:'doubles', teamA:[a,b], teamB:[c,d] });
      }
      for (let g = 0; g < singleCourts; g++) { const [a,b] = order.slice(doubleCourts * 4 + g * 2, doubleCourts * 4 + g * 2 + 2); games.push({ type:'singles', teamA:[a], teamB:[b] }); }
      const doubles = games.filter(g => g.type === 'doubles');
      const adjacentPenalty = previousPartnerPairs ? doubles.reduce((sum, game) => sum + [...partnerPairSet(game)].filter(pair => previousPartnerPairs.has(pair)).length * 100000000, 0) : 0;
      const cost = doubles.reduce((sum,g) => sum + (rotate ? 8*(count(partnerCounts,...g.teamA)+count(partnerCounts,...g.teamB)) + g.teamA.reduce((s,a)=>s+g.teamB.reduce((t,b)=>t+count(opponentCounts,a,b),0),0) : 0), 0) + (avoidedPairings && doubles[0] && avoidedPairings.has(doublesPairingKey(doubles[0])) ? 100000 : 0) + adjacentPenalty;
      if (cost < bestCost) { bestCost = cost; best = games; }
    }
    return best;
  }
  function gameFromPattern(selected, pattern) {
    const [a, b, c, d] = pattern.map(index => selected[index]);
    return { type:'doubles', teamA:[a, b], teamB:[c, d] };
  }
  function partnerPairSet(game) {
    if (game.type !== 'doubles') return new Set();
    return new Set([pairKey(...game.teamA), pairKey(...game.teamB)]);
  }
  function gamesPartnerPairSet(games) {
    return new Set(games.flatMap(game => [...partnerPairSet(game)]));
  }
  function patternOrders(length) {
    const patterns = [[0,1,2,3], [0,2,1,3], [0,3,1,2]], orders = [];
    const visit = (picked, remaining) => {
      if (picked.length === length) { orders.push(picked); return; }
      remaining.forEach((pattern, index) => visit([...picked, pattern], [...remaining.slice(0, index), ...remaining.slice(index + 1)]));
    };
    visit([], patterns);
    return orders;
  }
  function repeatCycleScore(games, players) {
    const partners = new Map(), opponents = new Map(); let adjacentRepeats = 0, repeats = 0;
    games.forEach((game, round) => {
      if (round) {
        const previous = partnerPairSet(games[round - 1]);
        partnerPairSet(game).forEach(pair => { if (previous.has(pair)) adjacentRepeats++; });
      }
      addGameCounts(game, partners, opponents);
    });
    partners.forEach(value => { if (value > 1) repeats += value - 1; });
    let missingPartners = 0, missingOpponents = 0;
    for (let i = 0; i < players.length; i++) for (let j = i + 1; j < players.length; j++) {
      if (!count(partners, players[i], players[j])) missingPartners++;
      if (!count(opponents, players[i], players[j])) missingOpponents++;
    }
    // 인접 라운드의 같은 파트너를 최우선으로 제거하고, 그 다음 전체 순환을 비교합니다.
    return adjacentRepeats * 1000000000000 + missingPartners * 100000000 + missingOpponents * 1000000 + repeats;
  }
  function buildRepeatedRestCycleSchedule(players, selections, rounds, plan) {
    const cycles = rounds / selections.length;
    if (!Number.isInteger(cycles) || cycles > 3) return null;
    const orders = patternOrders(cycles); let bestGames = null, bestScore = Infinity;
    const search = (group, chosen) => {
      if (group === selections.length) {
        const games = Array.from({ length: rounds }, (_, round) => gameFromPattern(selections[round % selections.length], chosen[round % selections.length][Math.floor(round / selections.length)]));
        const score = repeatCycleScore(games, players);
        if (score < bestScore) { bestScore = score; bestGames = games; }
        return;
      }
      orders.forEach(order => search(group + 1, [...chosen, order]));
    };
    search(0, []);
    if (!bestGames) return null;
    const plays = new Map(players.map(player => [player, 0])), partnerCounts = new Map(), opponentCounts = new Map(), history = [];
    const roundsOut = bestGames.map(game => {
      const selected = [...game.teamA, ...game.teamB];
      selected.forEach(player => plays.set(player, plays.get(player) + 1));
      addGameCounts(game, partnerCounts, opponentCounts); history.push(selected);
      return { games:[game], resting:players.filter(player => !selected.includes(player)) };
    });
    return { rounds:roundsOut, plays, history, partnerCounts, opponentCounts, plan };
  }
  function addGameCounts(game, partnerCounts, opponentCounts) {
    if (game.type === 'doubles') { add(partnerCounts, ...game.teamA); add(partnerCounts, ...game.teamB); }
    for (const a of game.teamA) for (const b of game.teamB) add(opponentCounts, a, b);
  }
  function eightPlayerPartnerFactors(players) {
    const rotation = [...players], factors = [];
    for (let round = 0; round < 7; round++) {
      factors.push(Array.from({ length: 4 }, (_, index) => [rotation[index], rotation[7 - index]]));
      rotation.splice(1, 0, rotation.pop());
    }
    return factors;
  }
  function eightPlayerOpponentPartitions(factors) {
    const patterns = [[[0,1],[2,3]], [[0,2],[1,3]], [[0,3],[1,2]]];
    const opponents = new Map(); let bestPath = [], bestCoverage = -1;
    const search = (round, path) => {
      if (round === factors.length) {
        if (opponents.size > bestCoverage) { bestCoverage = opponents.size; bestPath = [...path]; }
        return;
      }
      patterns.forEach((pattern, patternIndex) => {
        const changed = [];
        pattern.forEach(([left, right]) => factors[round][left].forEach(a => factors[round][right].forEach(b => {
          const key = pairKey(a, b); opponents.set(key, (opponents.get(key) || 0) + 1); changed.push(key);
        })));
        search(round + 1, [...path, patternIndex]);
        changed.forEach(key => { const next = opponents.get(key) - 1; if (next) opponents.set(key, next); else opponents.delete(key); });
      });
    };
    search(0, []);
    return { patterns, path: bestPath };
  }
  function scheduleOrderScore(games, players, opts) {
    const history = games.map(game => [...game.teamA, ...game.teamB]);
    let third = 0, restRepeats = 0, longestRest = 0;
    players.forEach(player => {
      let run = 0;
      history.forEach(selected => { run = selected.includes(player) ? run + 1 : 0; if (run >= 3) third++; });
      run = 0;
      history.forEach(selected => {
        run = selected.includes(player) ? 0 : run + 1;
        longestRest = Math.max(longestRest, run);
        if (run >= 2) restRepeats++;
      });
    });
    // 같은 횟수의 연속 휴식이라도 4회 연속 휴식이 2회 연속 휴식보다 먼저 해소되도록 합니다.
    const restCost = longestRest > 1 ? (longestRest - 1) * 100000 + restRepeats : 0;
    return priorityMetrics([{ key:'noThree', value:third }, { key:'noRest', value:restCost }], opts);
  }
  function arrangeEightPlayerGames(games, players, opts) {
    // 8인·1코트·16R: 전원 8회 출전, 7명의 서로 다른 파트너/상대를 유지하면서 최장 휴식을 3회로 제한한 순서입니다.
    if (games.length === 16) return [13,8,14,9,2,5,3,15,12,1,0,10,11,7,6,4].map(index => games[index]);
    let best = games, bestScore = Infinity;
    const attempts = opts.noThree ? 12000 : 160;
    for (let attempt = 0; attempt < attempts; attempt++) {
      const candidate = shuffled(games), score = scheduleOrderScore(candidate, players, opts);
      if (score < bestScore) { best = candidate; bestScore = score; if (score === 0) break; }
    }
    return best;
  }
  function generateEightPlayerRotation(players, rounds, opts) {
    const partnerCounts = new Map(), opponentCounts = new Map(), factors = eightPlayerPartnerFactors(players);
    const { patterns, path } = eightPlayerOpponentPartitions(factors), games = [];
    factors.forEach((pairs, round) => patterns[path[round]].forEach(([left, right]) => {
      const game = { type:'doubles', teamA:[...pairs[left]], teamB:[...pairs[right]] };
      games.push(game); addGameCounts(game, partnerCounts, opponentCounts);
    }));
    const plannedPlays = new Map(players.map(player => [player, 7]));
    if (rounds >= 16) {
      [{ type:'doubles', teamA:[players[0], players[1]], teamB:[players[2], players[3]] }, { type:'doubles', teamA:[players[4], players[5]], teamB:[players[6], players[7]] }].forEach(game => {
        games.push(game); addGameCounts(game, partnerCounts, opponentCounts);
        [...game.teamA, ...game.teamB].forEach(player => plannedPlays.set(player, plannedPlays.get(player) + 1));
      });
    }
    for (let round = games.length; round < rounds; round++) {
      const selected = choosePlayers(players, 4, [], plannedPlays, opts, partnerCounts, opponentCounts);
      const [game] = makeRound(selected, 1, 0, partnerCounts, opponentCounts, opts.rotate);
      games.push(game); addGameCounts(game, partnerCounts, opponentCounts);
      selected.forEach(player => plannedPlays.set(player, plannedPlays.get(player) + 1));
    }
    const ordered = arrangeEightPlayerGames(games, players, opts), plays = new Map(players.map(player => [player, 0])), history = [];
    const roundsOut = ordered.map(game => {
      const selected = [...game.teamA, ...game.teamB];
      selected.forEach(player => plays.set(player, plays.get(player) + 1));
      history.push(selected);
      return { games:[game], resting:players.filter(player => !selected.includes(player)) };
    });
    return { rounds:roundsOut, plays, history, partnerCounts, opponentCounts, plan:{ doubles:1, singles:0, courtsUsed:1, slots:4 } };
  }
  function generateOnce(players, courts, rounds, opts) {
    const plan = courtPlan(players.length, courts);
    if (players.length === 8 && plan.doubles === 1 && plan.singles === 0 && opts.rotate && rounds >= 14) return generateEightPlayerRotation(players, rounds, opts);
    const slots = plan.slots, plays = new Map(players.map(p => [p, 0]));
    const partnerCounts = new Map(), opponentCounts = new Map(), history = [], roundsOut = [];
    const selectionCycle = opts.repeatRestCycle
      ? buildBalancedCycle(players, slots, opts.repeatCycleRounds, opts)
      : null;
    const rotatedCycle = selectionCycle && plan.doubles === 1 && plan.singles === 0
      ? buildRepeatedRestCycleSchedule(players, selectionCycle, rounds, plan)
      : null;
    if (rotatedCycle) return rotatedCycle;
    const usedPairingsBySelection = new Map();
    for (let r = 0; r < rounds; r++) {
      const selected = selectionCycle
        ? selectionCycle[r % selectionCycle.length]
        : choosePlayers(players, slots, history, plays, opts, partnerCounts, opponentCounts);
      const key = selectionCycle ? selectionKey(selected) : null;
      const previousPartnerPairs = roundsOut.length ? gamesPartnerPairSet(roundsOut[roundsOut.length - 1].games) : null;
      const games = makeRound(selected, plan.doubles, plan.singles, partnerCounts, opponentCounts, opts.rotate, key ? usedPairingsBySelection.get(key) : null, previousPartnerPairs);
      for (const game of games) {
        addGameCounts(game, partnerCounts, opponentCounts);
      }
      selected.forEach(p => plays.set(p, plays.get(p)+1));
      if (key && games[0]?.type === 'doubles') {
        const used = usedPairingsBySelection.get(key) || new Set();
        used.add(doublesPairingKey(games[0]));
        usedPairingsBySelection.set(key, used);
      }
      history.push(selected); roundsOut.push({ games, resting: players.filter(p => !selected.includes(p)) });
    }
    return { rounds:roundsOut, plays, history, partnerCounts, opponentCounts, plan };
  }
  function evaluate(result, players, opts) {
    const values = players.map(p => result.plays.get(p)); const spread = Math.max(...values)-Math.min(...values);
    let third = 0, restRepeats = 0, longestRest = 0, repeats = 0, missingPartners = 0, missingOpponents = 0;
    for (const p of players) {
      let run=0;
      for(const row of result.history) {
        run=!row.includes(p)?run+1:0;
        longestRest=Math.max(longestRest,run);
        if(run>=2) restRepeats++;
      }
    }
    for (const p of players) { let run=0; for(const row of result.history){run=row.includes(p)?run+1:0;if(run>=3) third++;} }
    for (const v of result.partnerCounts.values()) if (v > 1) repeats += v-1;
    for (let i = 0; i < players.length; i++) for (let j = i + 1; j < players.length; j++) {
      if (!count(result.partnerCounts, players[i], players[j])) missingPartners++;
      if (!count(result.opponentCounts, players[i], players[j])) missingOpponents++;
    }
    return priorityMetrics([
      { key:'equal', value:spread },
      { key:'noThree', value:third },
      { key:'noRest', value:restPairRepeatCount(players, result.history) * 10000000 + (longestRest > 1 ? (longestRest - 1) * 100000 + restRepeats : 0) },
      { key:'rotate', value:missingPartners * 10000 + missingOpponents * 100 + repeats }
    ], opts) + Math.random();
  }
  function buildSchedule(players, courts, rounds, opts) {
    const plan = courtPlan(players.length, courts);
    if (players.length === 8 && plan.doubles === 1 && plan.singles === 0 && opts.rotate && rounds >= 14) return generateOnce(players, courts, rounds, opts);
    if (opts.repeatRestCycle) return generateOnce(players, courts, rounds, opts);
    let best;
    const tries = Math.min(320, Math.max(100, players.length * 12));
    for (let i=0; i<tries; i++) { const candidate = generateOnce(players,courts,rounds,opts); if (!best || evaluate(candidate,players,opts) < evaluate(best,players,opts)) best=candidate; }
    return best;
  }
  function maxStreak(history, p, resting = false) { let run=0,max=0; for(const row of history){run=(resting ? !row.includes(p) : row.includes(p))?run+1:0;max=Math.max(max,run);} return max; }
  function teamCard(members, side) {
    const card = document.createElement('span'), roster = document.createElement('span');
    card.className = `team-card team-${side}`;
    roster.className = 'player-roster';
    members.forEach((player, index) => {
      if (index) {
        const separator = document.createElement('span');
        separator.className = 'player-separator'; separator.textContent = ', ';
        roster.append(separator);
      }
      const name = document.createElement('span');
      name.className = 'player-name';
      name.textContent = player; roster.append(name);
    });
    card.append(roster);
    return card;
  }
  const savedScheduleKey = 'kokmatch.schedule.v1';
  const savedSetupKey = 'kokmatch.setup.v1';
  function storageWrite(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { $('saveStatus').textContent = '저장할 수 없습니다. 브라우저 저장 공간이나 설정을 확인해 주세요.'; return false; }
  }
  function storageRead(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  }
  function saveSetup() {
    const count = Number($('playerCount').value), courts = Number($('courts').value), rounds = Number($('rounds').value);
    if (!Number.isInteger(count) || count < 4 || count > 40 || !Number.isInteger(courts) || courts < 1 || courts > 4 || !Number.isInteger(rounds) || rounds < 1) return;
    const players = readPlayers();
    if (players.length !== count) return;
    storageWrite(savedSetupKey, { count, courts, rounds, players, order: state.priorityOrder });
  }
  function saveSchedule() {
    const result = state.schedule;
    if (!result) return;
    const data = { version:1, players:state.players, settings:state.settings, completed:state.completed,
      result:{ ...result, plays:[...result.plays], partnerCounts:[...result.partnerCounts], opponentCounts:[...result.opponentCounts] } };
    if (storageWrite(savedScheduleKey, data)) {
      $('saveStatus').textContent = '설정과 대진표가 이 브라우저에 저장되었습니다.';
      $('loadSchedule').classList.remove('hidden');
    }
  }
  function restoreSetup(data) {
    if (!data || !Number.isInteger(data.count) || data.count < 4 || data.count > 40 || !Array.isArray(data.players)) return;
    $('playerCount').value = data.count; $('courts').value = data.courts;
    syncPlayerFields();
    [...document.querySelectorAll('[data-player-name]')].forEach((input, i) => { input.value = data.players[i] ?? ''; });
    if (Number.isInteger(data.rounds) && data.rounds > 0) $('rounds').value = data.rounds;
    if (Array.isArray(data.order)) {
      state.priorityOrder = [...new Set(data.order.filter(key => priorityConfig.some(item => item.key === key)))];
      priorityConfig.forEach(item => { $(item.checkbox).checked = state.priorityOrder.includes(item.key); });
      syncPriorityControls();
    }
  }
  function loadSchedule(scroll = true) {
    const data = storageRead(savedScheduleKey);
    try {
      if (!data || data.version !== 1 || !Array.isArray(data.players) || !data.settings || !Array.isArray(data.result.rounds) || !data.result.rounds.length || !Array.isArray(data.completed) || data.completed.length !== data.result.rounds.length) throw new Error('invalid');
      const result = { ...data.result, plays:new Map(data.result.plays), partnerCounts:new Map(data.result.partnerCounts), opponentCounts:new Map(data.result.opponentCounts) };
      restoreSetup({ count:data.players.length, courts:data.settings.courts, rounds:data.settings.rounds, players:data.players, order:priorityConfig.filter(item => data.settings[item.key]).sort((a,b) => data.settings.priorities[a.key] - data.settings.priorities[b.key]).map(item => item.key) });
      state.completed = data.completed.map(Boolean);
      render(result, data.players, data.settings, scroll);
      $('loadSchedule').classList.remove('hidden');
      $('saveStatus').textContent = '저장된 대진표와 진행 상태를 불러왔습니다.';
    } catch { $('saveStatus').textContent = '저장된 대진표를 불러올 수 없습니다.'; }
  }
  function render(result, players, settings, scroll = true) {
    $('scheduleTitle').textContent = '🏸 배드민턴 경기 대진표';
    const games = result.rounds[0].games.length;
    const avg = (settings.rounds*result.plan.slots/players.length).toFixed(1).replace('.0','');
    const format = result.plan.singles ? `복식 ${result.plan.doubles}코트 · 단식 ${result.plan.singles}코트` : '복식';
    const repeatRestLabel = settings.repeatRestCycle ? ' · 휴식 순서 반복' : '';
    $('overview').textContent = `참석 ${players.length}명 · ${settings.courts}코트 중 ${games}코트 사용 · ${format}${repeatRestLabel} · ${settings.rounds}라운드 · 1인 평균 ${avg}게임`;
    const scheduleTable = $('scheduleTable');
    scheduleTable.classList.remove('single-court', 'multi-court', 'single-court-card-grid');
    scheduleTable.classList.add('matrix-schedule');
    if (games === 1) scheduleTable.classList.add('single-court-card-grid');
    const header = scheduleTable.querySelector('thead tr'); header.replaceChildren();
    const courtLabels = result.rounds[0].games.map((game, index) => `${index + 1}코트${game.type === 'singles' ? ' · 단식' : ''}`);
    const headerLabels = games === 1 ? ['라운드', '대진', '휴식 / 대기'] : ['라운드', ...courtLabels];
    headerLabels.forEach(label => { const th = document.createElement('th'); th.textContent = label; header.append(th); });
    const tbody = scheduleTable.querySelector('tbody'); tbody.replaceChildren();
    result.rounds.forEach((round, ri) => {
      const tr = document.createElement('tr');
      const roundCell = document.createElement('td'); roundCell.className = 'round'; roundCell.textContent = `${ri + 1}R`;
      const completeButton = document.createElement('button');
      completeButton.type = 'button'; completeButton.className = 'round-complete no-print';
      completeButton.textContent = state.completed[ri] ? '완료 취소' : '완료';
      completeButton.setAttribute('aria-label', `${ri + 1}라운드 ${state.completed[ri] ? '완료 취소' : '완료'}`);
      completeButton.setAttribute('aria-pressed', String(!!state.completed[ri]));
      completeButton.addEventListener('click', () => {
        state.completed[ri] = !state.completed[ri];
        const done = state.completed[ri];
        completeButton.textContent = done ? '완료 취소' : '완료';
        completeButton.setAttribute('aria-label', `${ri + 1}라운드 ${done ? '완료 취소' : '완료'}`);
        completeButton.setAttribute('aria-pressed', String(done));
        tr.classList.toggle('round-done', done);
        $('roundProgress').textContent = `완료 ${state.completed.filter(Boolean).length} / ${result.rounds.length}라운드`;
        saveSchedule();
      });
      tr.classList.toggle('round-done', !!state.completed[ri]); roundCell.append(completeButton);
      if (games > 1 && round.resting.length) { const rest = document.createElement('small'); rest.className = 'round-rest'; rest.textContent = `휴식: ${round.resting.join(', ')}`; roundCell.append(rest); }
      tr.append(roundCell);
      round.games.forEach((game, gi) => {
        const cell = document.createElement('td'), versus = document.createElement('span');
        cell.className = `court-match${games === 1 ? ' only-court' : ''}`; cell.dataset.court = `${gi + 1}코트${game.type === 'singles' ? ' · 단식' : ''}`;
        versus.className = 'match-vs'; versus.textContent = 'vs';
        cell.append(teamCard(game.teamA, 'a'), versus, teamCard(game.teamB, 'b')); tr.append(cell);
      });
      if (games === 1) { const restCell = document.createElement('td'); restCell.className = 'single-rest'; restCell.textContent = round.resting.join(', ') || '대기자 없음'; tr.append(restCell); }
      tbody.append(tr);
    });
    const verify = $('verifyTable').querySelector('tbody'); verify.replaceChildren();
    const playValues=players.map(p=>result.plays.get(p)); const equal = Math.max(...playValues)-Math.min(...playValues)<=1;
    players.forEach(p => { const streak=maxStreak(result.history,p), restStreak=maxStreak(result.history,p,true), partners=[...result.partnerCounts.keys()].filter(k=>k.split('|').includes(p)).length, opponents=[...result.opponentCounts.keys()].filter(k=>k.split('|').includes(p)).length; const issue=settings.noThree&&streak>2 ? '3연속 출전' : settings.noRest&&restStreak>1 ? '연속 휴식' : ''; const tr=document.createElement('tr'); [[p,''],[`${result.plays.get(p)}회`,''],[`${settings.rounds - result.plays.get(p)}회`,''],[`${streak}회`,streak<=2?'':'status-alert'],[`${restStreak}회`,restStreak<=1?'':'status-alert'],[`${partners}명`,''],[`${opponents}명`,''],[issue||'정상',issue?'status-alert':'status-ok']].forEach(([t,c])=>{const td=document.createElement('td');td.textContent=t;td.className=c;tr.append(td)});verify.append(tr); });
    const warnings=[];
    if (result.plan.doubles < settings.courts) {
      const setup = result.plan.singles
        ? `${result.plan.doubles}복식 + ${result.plan.singles}단식으로 편성했습니다.`
        : `${result.plan.doubles}코트만 복식으로 편성할 수 있어 남은 인원은 대기합니다.`;
      warnings.push(`복식 운용 불가: ${setup}`);
    }
    if (settings.noThree && players.length<=result.plan.slots) warnings.push('모든 참가자가 매 라운드 출전하므로 3연속 출전을 피할 수 없습니다.');
    if (settings.noThree && players.length>result.plan.slots && players.some(p=>maxStreak(result.history,p)>=3)) warnings.push('인원·라운드 조건상 일부 3연속 출전이 발생했습니다.');
    if (settings.noRest && players.length>result.plan.slots && players.some(p=>maxStreak(result.history,p,true)>=2)) warnings.push('인원·라운드 조건상 일부 연속 휴식이 발생했습니다.');
    if (settings.equal && !equal) warnings.push('출전 횟수 차이가 1회를 초과했습니다. 라운드를 늘리거나 조건을 조정해 주세요.');
    const report=$('constraintReport'); const doublesUnavailable=result.plan.doubles<settings.courts; report.className=`report ${warnings.length?'warning':''}${doublesUnavailable?' singles-warning':''}`; report.textContent=warnings.length ? `${doublesUnavailable ? '' : '확인 필요: '}${warnings.join(' ')}` : '검증 완료: 출전 횟수는 균등하게 배분되었고, 적용 가능한 연속 출전 조건을 확인했습니다.';
    state.schedule=result; state.settings=settings; state.players=players;
    $('roundProgress').textContent = `완료 ${state.completed.filter(Boolean).length} / ${result.rounds.length}라운드`;
    $('results').classList.remove('hidden'); if (scroll) $('results').scrollIntoView({behavior:'smooth',block:'start'});
  }
  let pendingGeneration = null;
  function generate() {
    const players=readPlayers(), validation=validateNames(players), notice=$('nicknameNotice');
    const blankIndex=players.findIndex(name => !name);
    if (blankIndex !== -1 || validation.duplicates.length) { notice.className='notice error'; notice.textContent=validation.duplicates.length ? `중복 닉네임: ${validation.duplicates.join(', ')} — 철자를 수정한 뒤 다시 만들어 주세요.` : `참가자 ${blankIndex + 1}의 닉네임을 입력해 주세요.`; return; }
    const courts=courtCount(), rounds=Number($('rounds').value);
    $('courts').value = courts;
    if (!Number.isInteger(rounds)||rounds<1) { notice.className='notice error';notice.textContent='라운드 수를 올바른 정수로 입력해 주세요.';return; }
    notice.className='notice hidden'; notice.textContent='';
    const equalRounds = equalRotationRounds(players.length, courts), plan = courtPlan(players.length, courts);
    const settings={courts,rounds,equal:$('equalPlay').checked,noThree:$('noThree').checked,noRest:$('noConsecutiveRest').checked,rotate:$('rotatePartners').checked,priorities:{equal:Number($('priorityEqual').value),noThree:Number($('priorityNoThree').value),noRest:Number($('priorityNoRest').value),rotate:Number($('priorityRotate').value)},repeatRestCycle:players.length===5&&plan.doubles===1&&plan.singles===0&&rounds>=equalRounds*2&&rounds%equalRounds===0,repeatCycleRounds:equalRounds};
    const create = () => {
      const result = buildSchedule(players,courts,rounds,settings);
      state.completed = result.rounds.map(() => false);
      render(result,players,settings); saveSetup(); saveSchedule();
    };
    if (storageRead(savedScheduleKey)) {
      const dialog = $('replaceDialog');
      if (dialog.open) return;
      pendingGeneration = create; dialog.returnValue = 'cancel'; dialog.showModal();
    } else create();
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
  priorityConfig.forEach(item => {
    $(item.checkbox).addEventListener('change', () => updatePriorityFromCheck(item.key));
    $(item.select).addEventListener('change', () => updatePriorityFromSelect(item.key));
  });
  syncPriorityControls();
  syncPlayerFields();
  const savedSetup = storageRead(savedSetupKey);
  if (storageRead(savedScheduleKey)) loadSchedule(false);
  restoreSetup(savedSetup);
  document.querySelector('.setup-panel').addEventListener('change', saveSetup);
  document.querySelector('.setup-panel').addEventListener('input', saveSetup);
  $('loadSchedule').addEventListener('click', () => { loadSchedule(); saveSetup(); });
  $('replaceDialog').addEventListener('close', () => {
    const create = pendingGeneration; pendingGeneration = null;
    if ($('replaceDialog').returnValue === 'confirm' && create) create();
  });
  $('generate').addEventListener('click',generate);
  $('imageBtn').addEventListener('click',downloadImage);
  $('copyBtn').addEventListener('click',async e=>{try{await navigator.clipboard.writeText(scheduleText());e.currentTarget.textContent='복사 완료';setTimeout(()=>e.currentTarget.textContent='텍스트 복사',1500)}catch{window.prompt('아래 내용을 복사해 주세요.',scheduleText())}});
})();
