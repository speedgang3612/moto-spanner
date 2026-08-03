const STORAGE_KEY = "moto-log-mvp-v1";

const maintenanceCatalog = {
  engineOil: "엔진오일",
  oilFilter: "오일필터",
  airFilter: "에어필터",
  sparkPlug: "점화플러그",
  brakePads: "브레이크패드",
  frontBrakePads: "앞 브레이크패드",
  rearBrakePads: "뒤 브레이크패드",
  brakeFluid: "브레이크액",
  coolant: "냉각수",
  tire: "타이어",
  frontTire: "앞 타이어",
  rearTire: "뒤 타이어",
  battery: "배터리",
  chainLube: "체인 청소/윤활",
  chainSet: "체인/스프로킷",
  driveChain: "드라이브 체인",
  frontSprocket: "앞 스프로킷",
  rearSprocket: "뒤 스프로킷",
  chainSlider: "체인 슬라이더/가이드",
  gearOil: "미션오일",
  driveBelt: "구동벨트",
  beltCaseFilter: "벨트 케이스 필터",
  roller: "웨이트롤러/무브볼",
  slidePiece: "슬라이드 피스",
  variatorPulley: "드라이브 풀리/베리에이터",
  drivenFace: "드리븐 페이스/토크 드라이버",
  clutchShoe: "클러치슈",
  clutchSpring: "클러치 스프링",
  clutchBell: "클러치벨/하우징",
  guideRoller: "가이드 롤러/핀"
};

const maintenanceGroups = {
  engine: { label: "엔진/오일", order: 10 },
  drivetrainChain: { label: "구동계 · 체인 구동", order: 20 },
  drivetrainCvt: { label: "구동계 · 스쿠터 CVT", order: 30 },
  brake: { label: "브레이크", order: 40 },
  cooling: { label: "냉각", order: 50 },
  electrical: { label: "전장", order: 60 },
  tire: { label: "타이어", order: 70 }
};

const maintenanceMeta = {
  engineOil: { group: "engine" },
  oilFilter: { group: "engine" },
  airFilter: { group: "engine" },
  sparkPlug: { group: "engine" },
  brakePads: { group: "brake" },
  frontBrakePads: { group: "brake" },
  rearBrakePads: { group: "brake" },
  brakeFluid: { group: "brake" },
  coolant: { group: "cooling" },
  tire: { group: "tire" },
  frontTire: { group: "tire" },
  rearTire: { group: "tire" },
  battery: { group: "electrical" },
  chainLube: { group: "drivetrainChain" },
  chainSet: { group: "drivetrainChain" },
  driveChain: { group: "drivetrainChain" },
  frontSprocket: { group: "drivetrainChain" },
  rearSprocket: { group: "drivetrainChain" },
  chainSlider: { group: "drivetrainChain" },
  gearOil: { group: "drivetrainCvt" },
  driveBelt: { group: "drivetrainCvt" },
  beltCaseFilter: { group: "drivetrainCvt" },
  roller: { group: "drivetrainCvt" },
  slidePiece: { group: "drivetrainCvt" },
  variatorPulley: { group: "drivetrainCvt" },
  drivenFace: { group: "drivetrainCvt" },
  clutchShoe: { group: "drivetrainCvt" },
  clutchSpring: { group: "drivetrainCvt" },
  clutchBell: { group: "drivetrainCvt" },
  guideRoller: { group: "drivetrainCvt" }
};

const motorcycleDatabase = window.MOTORCYCLE_DATABASE || [];
const CUSTOM_MAKER_VALUE = "__custom_maker__";
const CUSTOM_MODEL_VALUE = "__custom_model__";
const usageProfiles = {
  commute: { label: "출퇴근", kmFactor: 1, monthFactor: 1, chainLubeKm: 800, description: "일반 주행 기준" },
  delivery: { label: "배달/시내", kmFactor: 0.65, monthFactor: 0.8, chainLubeKm: 500, description: "정차/출발과 저속 주행이 많아 짧게 관리" },
  touring: { label: "투어링", kmFactor: 1.15, monthFactor: 1, chainLubeKm: 900, description: "장거리 정속 주행 기준" },
  sport: { label: "스포츠", kmFactor: 0.7, monthFactor: 0.75, chainLubeKm: 600, description: "고회전/고부하 주행 기준" }
};
const quickHistoryItems = ["engineOil", "oilFilter", "airFilter", "frontBrakePads", "rearBrakePads", "brakeFluid", "frontTire", "rearTire", "chainLube", "driveChain", "gearOil", "driveBelt", "roller"];
const today = () => new Date().toISOString().slice(0, 10);
const money = (value) => `${Math.round(value || 0).toLocaleString("ko-KR")}원`;
const km = (value) => `${Math.round(value || 0).toLocaleString("ko-KR")} km`;

const defaultState = {
  activeBikeId: "",
  bikes: [],
  fuelLogs: [],
  maintenanceLogs: [],
  odometerLogs: [],
  customModels: [],
  notificationSettings: {
    maintenanceAlerts: false,
    lastAlertKey: ""
  }
};

let state = loadState();
ensureStateShape();
let cameraStream = null;
let bikeFormOpen = false;

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(defaultState);
  try {
    return JSON.parse(saved);
  } catch {
    return structuredClone(defaultState);
  }
}

function ensureStateShape() {
  state.customModels = state.customModels || [];
  state.bikes = state.bikes || [];
  state.fuelLogs = state.fuelLogs || [];
  state.maintenanceLogs = state.maintenanceLogs || [];
  state.odometerLogs = state.odometerLogs || [];
  state.notificationSettings = state.notificationSettings || { maintenanceAlerts: false, lastAlertKey: "" };
  state.notificationSettings.maintenanceAlerts = Boolean(state.notificationSettings.maintenanceAlerts);
  state.notificationSettings.lastAlertKey = state.notificationSettings.lastAlertKey || "";
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function id(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getBike() {
  return state.bikes.find((bike) => bike.id === state.activeBikeId) || state.bikes[0];
}

function hasBike() {
  return Boolean(getBike());
}

function buildIntervals(bike) {
  const cc = Number(bike.cc);
  const isSmall = cc <= 150;
  const isMiddle = cc > 150 && cc <= 500;
  const profile = usageProfiles[bike.usage] || usageProfiles.commute;
  const usageFactor = profile.kmFactor;
  const monthFactor = profile.monthFactor;
  const oilBase = isSmall ? 1800 : isMiddle ? 3500 : 5000;
  const template = {
    engineOil: { km: Math.round(oilBase * usageFactor), months: Math.max(3, Math.round(6 * monthFactor)) },
    oilFilter: { km: Math.round(oilBase * 2 * usageFactor), months: Math.max(6, Math.round(12 * monthFactor)) },
    airFilter: { km: Math.round((isSmall ? 8000 : 12000) * usageFactor), months: Math.max(9, Math.round(18 * monthFactor)) },
    sparkPlug: { km: Math.round((isSmall ? 8000 : 12000) * usageFactor), months: Math.max(12, Math.round(24 * monthFactor)) },
    brakePads: { km: Math.round((isSmall ? 9000 : 12000) * usageFactor), months: Math.max(12, Math.round(24 * monthFactor)) },
    frontBrakePads: { km: Math.round((isSmall ? 9000 : 12000) * usageFactor), months: Math.max(12, Math.round(24 * monthFactor)) },
    rearBrakePads: { km: Math.round((isSmall ? 9000 : 12000) * usageFactor), months: Math.max(12, Math.round(24 * monthFactor)) },
    brakeFluid: { km: 0, months: Math.max(12, Math.round(24 * monthFactor)) },
    tire: { km: Math.round((isSmall ? 12000 : 10000) * usageFactor), months: Math.max(24, Math.round(48 * monthFactor)) },
    frontTire: { km: Math.round((isSmall ? 12000 : 10000) * usageFactor), months: Math.max(24, Math.round(48 * monthFactor)) },
    rearTire: { km: Math.round((isSmall ? 12000 : 10000) * usageFactor), months: Math.max(24, Math.round(48 * monthFactor)) },
    battery: { km: 0, months: Math.max(24, Math.round(36 * monthFactor)) }
  };

  if (bike.cooling === "liquid") template.coolant = { km: 0, months: Math.max(12, Math.round(24 * monthFactor)) };
  if (bike.transmission === "cvt") {
    template.gearOil = { km: Math.round((isSmall ? 6000 : 10000) * usageFactor), months: Math.max(6, Math.round(12 * monthFactor)) };
    template.driveBelt = { km: Math.round((isSmall ? 20000 : 25000) * usageFactor), months: Math.max(24, Math.round(36 * monthFactor)) };
    template.beltCaseFilter = { km: Math.round((isSmall ? 8000 : 12000) * usageFactor), months: Math.max(12, Math.round(18 * monthFactor)) };
    template.roller = { km: Math.round((isSmall ? 12000 : 16000) * usageFactor), months: Math.max(12, Math.round(24 * monthFactor)) };
    template.slidePiece = { km: Math.round((isSmall ? 12000 : 16000) * usageFactor), months: Math.max(12, Math.round(24 * monthFactor)) };
    template.variatorPulley = { km: Math.round((isSmall ? 24000 : 30000) * usageFactor), months: Math.max(24, Math.round(36 * monthFactor)) };
    template.drivenFace = { km: Math.round((isSmall ? 24000 : 30000) * usageFactor), months: Math.max(24, Math.round(36 * monthFactor)) };
    template.clutchShoe = { km: Math.round((isSmall ? 20000 : 25000) * usageFactor), months: Math.max(18, Math.round(30 * monthFactor)) };
    template.clutchSpring = { km: Math.round((isSmall ? 20000 : 25000) * usageFactor), months: Math.max(18, Math.round(30 * monthFactor)) };
    template.clutchBell = { km: Math.round((isSmall ? 24000 : 30000) * usageFactor), months: Math.max(24, Math.round(36 * monthFactor)) };
    template.guideRoller = { km: Math.round((isSmall ? 24000 : 30000) * usageFactor), months: Math.max(24, Math.round(36 * monthFactor)) };
  } else {
    template.chainLube = { km: profile.chainLubeKm, months: 1 };
    template.chainSet = { km: Math.round(22000 * usageFactor), months: Math.max(24, Math.round(48 * monthFactor)) };
    template.driveChain = { km: Math.round(22000 * usageFactor), months: Math.max(24, Math.round(48 * monthFactor)) };
    template.frontSprocket = { km: Math.round(22000 * usageFactor), months: Math.max(24, Math.round(48 * monthFactor)) };
    template.rearSprocket = { km: Math.round(22000 * usageFactor), months: Math.max(24, Math.round(48 * monthFactor)) };
    template.chainSlider = { km: Math.round(30000 * usageFactor), months: Math.max(24, Math.round(48 * monthFactor)) };
  }

  return { ...template, ...(bike.intervals || {}) };
}

function catalogLabel(item) {
  return maintenanceCatalog[item] || item;
}

function groupForItem(item) {
  const groupKey = maintenanceMeta[item]?.group || "engine";
  return maintenanceGroups[groupKey] || maintenanceGroups.engine;
}

function groupedIntervalEntries(intervals) {
  const groups = {};
  visibleIntervalEntries(intervals).forEach(([item, interval]) => {
    const group = groupForItem(item);
    groups[group.label] = groups[group.label] || { ...group, items: [] };
    groups[group.label].items.push([item, interval]);
  });
  return Object.values(groups).sort((a, b) => a.order - b.order);
}

function visibleIntervalEntries(intervals) {
  return Object.entries(intervals).filter(([item]) => !isLegacyAggregateItem(item));
}

function isLegacyAggregateItem(item) {
  return item === "brakePads" || item === "tire" || item === "chainSet";
}

function lastMaintenance(item, bikeId) {
  return state.maintenanceLogs
    .filter((log) => log.bikeId === bikeId && log.item === item)
    .sort((a, b) => b.odometer - a.odometer || b.date.localeCompare(a.date))[0];
}

function monthsSince(dateText) {
  if (!dateText) return Infinity;
  const from = new Date(dateText);
  const now = new Date();
  return (now.getFullYear() - from.getFullYear()) * 12 + (now.getMonth() - from.getMonth());
}

function addMonths(dateText, months) {
  if (!dateText || !months) return "";
  const date = new Date(dateText);
  date.setMonth(date.getMonth() + Number(months));
  return date.toISOString().slice(0, 10);
}

function dueItems(bike) {
  const intervals = buildIntervals(bike);
  return visibleIntervalEntries(intervals).map(([item, interval]) => {
    const last = lastMaintenance(item, bike.id);
    const baseOdo = last ? Number(last.odometer) : 0;
    const elapsedKm = Math.max(0, Number(bike.odometer) - baseOdo);
    const kmRemaining = interval.km ? interval.km - elapsedKm : Infinity;
    const monthRemaining = interval.months ? interval.months - monthsSince(last?.date) : Infinity;
    const nextOdometer = last && interval.km ? baseOdo + Number(interval.km) : null;
    const nextDate = last && interval.months ? addMonths(last.date, interval.months) : "";
    const isDue = kmRemaining <= 0 || monthRemaining <= 0 || !last;
    const isSoon = !isDue && (kmRemaining <= interval.km * 0.15 || monthRemaining <= 1);
    return { item, label: catalogLabel(item), group: groupForItem(item).label, interval, last, elapsedKm, kmRemaining, monthRemaining, nextOdometer, nextDate, status: isDue ? "due" : isSoon ? "soon" : "ok" };
  }).sort((a, b) => statusRank(a.status) - statusRank(b.status));
}

function statusRank(status) {
  return status === "due" ? 0 : status === "soon" ? 1 : 2;
}

function setDefaults() {
  document.querySelectorAll('input[type="date"]').forEach((input) => {
    if (!input.value) input.value = today();
  });
}

function initBikeModelPicker() {
  const makerSelect = document.querySelector("#makerSelect");
  if (!makerSelect || !motorcycleDatabase.length) return;
  makerSelect.innerHTML = [
    ...motorcycleDatabase.map((brand) => `<option value="${escapeHtml(brand.maker)}">${escapeHtml(brand.maker)} · ${escapeHtml(brand.company)}</option>`),
    ...customMakers().map((maker) => `<option value="${escapeHtml(maker)}">${escapeHtml(maker)} · 직접 추가</option>`),
    `<option value="${CUSTOM_MAKER_VALUE}">+ 목록에 없는 제조사 직접 입력</option>`
  ].join("");
  makerSelect.value = motorcycleDatabase[0].maker;
  renderModelSelect();
  applySelectedModel();
}

function renderModelSelect() {
  const makerSelect = document.querySelector("#makerSelect");
  const modelSelect = document.querySelector("#modelSelect");
  const search = document.querySelector("#modelSearch")?.value.trim().toLowerCase() || "";
  const maker = makerSelect.value;
  const customMakerMode = maker === CUSTOM_MAKER_VALUE;
  toggleDirectInputs(customMakerMode, false);
  if (!modelSelect) return;
  const models = customMakerMode ? [] : modelsForMaker(maker).filter((model) => {
    const haystack = `${model.name} ${model.cc} ${statusLabel(model.status)}`.toLowerCase();
    return haystack.includes(search);
  });
  modelSelect.innerHTML = [
    ...models.map((model) => `<option value="${escapeHtml(model.name)}">${escapeHtml(model.name)} · ${model.cc || "EV"}cc · ${statusLabel(model.status)}</option>`),
    `<option value="${CUSTOM_MODEL_VALUE}">+ 목록에 없는 모델 직접 입력</option>`
  ].join("");
  if (models.length && !models.some((model) => model.name === modelSelect.value)) {
    modelSelect.value = models[0].name;
  } else if (!models.length) {
    modelSelect.value = CUSTOM_MODEL_VALUE;
  }
  applySelectedModel();
}

function selectedModelInfo() {
  const maker = document.querySelector("#makerSelect")?.value;
  const model = document.querySelector("#modelSelect")?.value;
  const brand = motorcycleDatabase.find((entry) => entry.maker === maker);
  const modelInfo = modelsForMaker(maker).find((entry) => entry.name === model);
  return { brand, modelInfo };
}

function applySelectedModel() {
  const { brand, modelInfo } = selectedModelInfo();
  const form = document.querySelector("#bikeForm");
  const meta = document.querySelector("#modelMeta");
  const makerSelect = document.querySelector("#makerSelect");
  const modelSelect = document.querySelector("#modelSelect");
  const customMakerMode = makerSelect?.value === CUSTOM_MAKER_VALUE;
  const customModelMode = customMakerMode || modelSelect?.value === CUSTOM_MODEL_VALUE;
  toggleDirectInputs(customMakerMode, customModelMode);
  if (!form || !modelInfo) return;
  form.elements.cc.value = modelInfo.cc;
  form.elements.transmission.value = modelInfo.transmission;
  form.elements.cooling.value = modelInfo.cooling || inferCoolingForModel(brand, modelInfo);
  meta.textContent = `${brand.company || "직접 추가 제조사"} · ${brand.country || "-"} · ${modelInfo.cc || "전기"}cc · ${statusLabel(modelInfo.status)} 모델`;
}

function statusLabel(status) {
  if (status === "discontinued") return "단종";
  if (status === "custom") return "직접 추가";
  return "현행";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[char]));
}

function customMakers() {
  return [...new Set(state.customModels.map((model) => model.maker))].sort((a, b) => a.localeCompare(b));
}

function modelsForMaker(maker) {
  const base = motorcycleDatabase.find((entry) => entry.maker === maker)?.models || [];
  const custom = state.customModels.filter((model) => model.maker === maker);
  return [...base, ...custom].sort((a, b) => a.name.localeCompare(b.name));
}

function toggleDirectInputs(customMakerMode, customModelMode) {
  document.querySelector("#customMakerWrap")?.classList.toggle("hidden", !customMakerMode);
  document.querySelector("#customModelWrap")?.classList.toggle("hidden", !customModelMode);
  const meta = document.querySelector("#modelMeta");
  if (meta && customModelMode) {
    meta.textContent = "목록에 없는 제조사/모델은 직접 입력 후 저장하면 다음 등록 때 다시 표시됩니다.";
  }
}

function rememberCustomModel(model) {
  if (!model.maker || !model.name) return;
  const existsInBase = motorcycleDatabase.some((brand) => brand.maker === model.maker && brand.models.some((entry) => entry.name === model.name));
  const existsInCustom = state.customModels.some((entry) => entry.maker === model.maker && entry.name === model.name);
  if (!existsInBase && !existsInCustom) {
    state.customModels.push({ maker: model.maker, name: model.name, cc: model.cc, transmission: model.transmission, cooling: model.cooling, status: "custom" });
  }
}

function inferCoolingForModel(brand, model) {
  const name = `${brand?.maker || ""} ${model?.name || ""}`.toLowerCase();
  const cc = Number(model?.cc || 0);
  if (!cc) return "liquid";
  if (/(super cub|monkey|grom|msx|citi ace|daystar|classic 350|meteor 350|hunter 350|bullet 350|v7|v9|bonneville|scrambler icon|sportster|softail|street bob|fat boy|low rider|heritage|road king|street glide|road glide|chief|scout|ftr)/.test(name)) return "air";
  if (/(pcx|adv|forza|nmax|xmax|tmax|ak550|downtown|cruisym|maxsym|burgman|vespa gts|beverly|mp3|zontes|ninja|cbr|yzf|mt-|gsx|v-strom|duke|rc |panigale|multistrada|streetfighter|africa twin|gold wing|r 1250|r 1300|s 1000|m 1000|trident|tiger|daytona|tuono|rs |rsv4)/.test(name)) return "liquid";
  if (cc >= 250) return "liquid";
  if (model?.transmission === "cvt" && cc > 125) return "liquid";
  return "air";
}

function render() {
  const bike = getBike();
  if (!bike) {
    bikeFormOpen = true;
    saveState();
    renderEmptyState();
    return;
  }
  bike.intervals = bike.intervals || buildIntervals(bike);
  saveState();
  renderBikePicker(bike);
  renderDashboard(bike);
  renderGarage(bike);
  renderMaintenanceControls(bike);
  renderOdoHistory(bike);
  renderQuickHistory(bike);
  renderAlertStatus();
  maybeSendMaintenanceNotification(bike);
}

function renderEmptyState() {
  renderBikePicker();
  document.querySelector("#metricOdo").textContent = "0 km";
  document.querySelector("#metricMonthCost").textContent = "0원";
  document.querySelector("#metricFuelEfficiency").textContent = "-";
  document.querySelector("#metricDueCount").textContent = "0개";
  document.querySelector("#maintenanceProfileName").textContent = "바이크를 먼저 등록해 주세요.";
  document.querySelector("#dueList").innerHTML = `<div class="empty">아직 등록된 오토바이가 없습니다. 내 바이크 화면에서 첫 오토바이를 등록하면 정비 예정표가 생성됩니다.</div>`;
  document.querySelector("#recentList").innerHTML = `<div class="empty">아직 기록이 없습니다.</div>`;
  document.querySelector("#bikeList").innerHTML = `<div class="empty">등록된 바이크가 없습니다.</div>`;
  document.querySelector("#currentBikeSummary").innerHTML = `<div class="empty">첫 오토바이를 등록하면 이 화면에서 주행거리, 정비 기준, 최근 기록을 바로 확인할 수 있습니다.</div>`;
  document.querySelector("#currentBikePanel").classList.remove("hidden");
  document.querySelector("#bikeForm").classList.remove("hidden");
  document.querySelector("#toggleBikeForm").textContent = "첫 바이크 등록";
  document.querySelector("#toggleBikeForm").disabled = true;
  document.querySelector("#maintenanceItemSelect").innerHTML = "";
  document.querySelector("#intervalEditor").innerHTML = `<div class="empty">바이크를 등록하면 사용 패턴별 정비 주기를 설정할 수 있습니다.</div>`;
  document.querySelector("#odoHistory").innerHTML = `<div class="empty">계기판 기록이 없습니다.</div>`;
  document.querySelector("#quickHistoryGrid").innerHTML = `<div class="empty">바이크를 등록하면 최근 정비 이력을 입력할 수 있습니다.</div>`;
  document.querySelector("#instantDiagnosis").innerHTML = "";
  renderAlertStatus();
}

function renderBikePicker(activeBike) {
  const select = document.querySelector("#activeBikeSelect");
  if (!state.bikes.length) {
    select.innerHTML = `<option value="">등록된 바이크 없음</option>`;
    select.value = "";
    select.disabled = true;
    return;
  }
  select.disabled = false;
  select.innerHTML = state.bikes.map((bike) => `<option value="${bike.id}">${bike.maker} ${bike.model}</option>`).join("");
  select.value = activeBike?.id || state.activeBikeId;
}

function renderDashboard(bike) {
  const logs = state.fuelLogs.filter((log) => log.bikeId === bike.id).sort((a, b) => a.odometer - b.odometer);
  const maint = state.maintenanceLogs.filter((log) => log.bikeId === bike.id);
  const currentMonth = today().slice(0, 7);
  const monthCost = [...logs, ...maint].filter((log) => log.date?.startsWith(currentMonth)).reduce((sum, log) => sum + Number(log.cost || 0), 0);
  const efficiency = fuelEfficiency(logs);
  const due = dueItems(bike);

  document.querySelector("#metricOdo").textContent = km(bike.odometer);
  document.querySelector("#metricMonthCost").textContent = money(monthCost);
  document.querySelector("#metricFuelEfficiency").textContent = efficiency ? `${efficiency.toFixed(1)} km/L` : "-";
  document.querySelector("#metricDueCount").textContent = `${due.filter((item) => item.status !== "ok").length}개`;
  const profile = usageProfiles[bike.usage] || usageProfiles.commute;
  document.querySelector("#maintenanceProfileName").textContent = `${bike.cc}cc · ${labelFor(bike.transmission)} · ${profile.label} · ${profile.description}`;

  document.querySelector("#dueList").innerHTML = renderDueList(due);
  document.querySelector("#recentList").innerHTML = renderRecent(bike);
}

function fuelEfficiency(logs) {
  if (logs.length < 2) return null;
  let distance = 0;
  let liters = 0;
  for (let i = 1; i < logs.length; i += 1) {
    distance += Math.max(0, logs[i].odometer - logs[i - 1].odometer);
    liters += Number(logs[i].liters || 0);
  }
  return liters ? distance / liters : null;
}

function renderDueCard(due) {
  const statusText = due.status === "due" ? "정비 필요" : due.status === "soon" ? "곧 필요" : due.last ? "예정" : "정상";
  const next = due.last
    ? `다음 정비 ${due.nextOdometer ? km(due.nextOdometer) : ""}${due.nextDate ? ` · ${due.nextDate}` : ""}`
    : "최근 정비 이력을 저장하면 다음 정비 km/날짜가 계산됩니다.";
  const remaining = due.last
    ? `${remainingText(due)} · 마지막 ${due.last.date} / ${km(due.last.odometer)}`
    : "아직 정비 기록이 없습니다.";
  const detail = `${remaining}<br />${next}`;
  return `<article class="due-card">
    <div><small class="category-badge">${due.group}</small><strong>${due.label}</strong><span>${detail}</span></div>
    <span class="status ${due.status}">${statusText}</span>
  </article>`;
}

function renderDueList(due) {
  const attention = due.filter((item) => item.status !== "ok");
  const upcoming = due
    .filter((item) => item.status === "ok" && item.last)
    .sort((a, b) => nextDueRank(a) - nextDueRank(b))
    .slice(0, 8);
  const sections = [];
  if (attention.length) {
    sections.push(`<section class="due-section"><h3>정비 필요 / 기록 필요</h3>${attention.map(renderDueCard).join("")}</section>`);
  }
  if (upcoming.length) {
    sections.push(`<section class="due-section"><h3>다음 정비 예정</h3>${upcoming.map(renderDueCard).join("")}</section>`);
  }
  if (!sections.length) {
    return `<div class="empty">최근 정비 이력을 입력하면 다음 정비 예정이 표시됩니다.</div>`;
  }
  return sections.join("");
}

function nextDueRank(due) {
  const kmRank = Number.isFinite(due.kmRemaining) ? due.kmRemaining : Infinity;
  const monthRank = Number.isFinite(due.monthRemaining) ? due.monthRemaining * 1000 : Infinity;
  return Math.min(kmRank, monthRank);
}

function remainingText(due) {
  const kmText = Number.isFinite(due.kmRemaining)
    ? due.kmRemaining <= 0 ? `${km(Math.abs(due.kmRemaining))} 초과` : `${km(due.kmRemaining)} 남음`
    : "";
  const monthText = Number.isFinite(due.monthRemaining)
    ? due.monthRemaining <= 0 ? `${Math.abs(due.monthRemaining)}개월 초과` : `${due.monthRemaining}개월 남음`
    : "";
  return [kmText, monthText].filter(Boolean).join(" / ") || "기간 기준 관리";
}

function renderRecent(bike) {
  const records = [
    ...state.fuelLogs.filter((log) => log.bikeId === bike.id).map((log) => ({ ...log, type: "주유", label: `${log.liters}L · ${money(log.cost)}` })),
    ...state.maintenanceLogs.filter((log) => log.bikeId === bike.id).map((log) => ({ ...log, type: "정비", label: `${catalogLabel(log.item)} · ${money(log.cost)}` })),
    ...state.odometerLogs.filter((log) => log.bikeId === bike.id).map((log) => ({ ...log, type: "계기판", label: `ODO ${km(log.odometer)}` }))
  ].sort((a, b) => b.date.localeCompare(a.date) || Number(b.odometer) - Number(a.odometer)).slice(0, 8);

  if (!records.length) return `<div class="empty">아직 기록이 없습니다.</div>`;
  return records.map((record) => `<article class="record"><strong>${record.date} · ${record.type}</strong>${record.label}<br />${km(record.odometer)} ${record.memo || ""}</article>`).join("");
}

function garageStats(bike) {
  const fuelCount = state.fuelLogs.filter((log) => log.bikeId === bike.id).length;
  const maintenanceCount = state.maintenanceLogs.filter((log) => log.bikeId === bike.id).length;
  const odometerCount = state.odometerLogs.filter((log) => log.bikeId === bike.id).length;
  const dueCount = dueItems(bike).filter((item) => item.status !== "ok").length;
  return { fuelCount, maintenanceCount, odometerCount, dueCount };
}

function renderGarage(bike) {
  const stats = garageStats(bike);
  const profile = usageProfiles[bike.usage] || usageProfiles.commute;
  document.querySelector("#currentBikePanel").classList.remove("hidden");
  document.querySelector("#toggleBikeForm").disabled = false;
  document.querySelector("#toggleBikeForm").textContent = bikeFormOpen ? "등록 폼 닫기" : "+ 바이크 추가";
  document.querySelector("#bikeForm").classList.toggle("hidden", !bikeFormOpen);
  document.querySelector("#currentBikeSummary").innerHTML = `<article class="current-bike-card">
    <div>
      <span class="category-badge">선택됨</span>
      <strong>${escapeHtml(bike.maker)} ${escapeHtml(bike.model)}</strong>
      <p>${bike.year || "-"}년식 · ${bike.cc}cc · ${labelFor(bike.transmission)} · ${labelFor(bike.cooling)} · ${profile.label}</p>
    </div>
    <div class="garage-metrics">
      <article><span>현재 주행거리</span><strong>${km(bike.odometer)}</strong></article>
      <article><span>주의 정비</span><strong>${stats.dueCount}개</strong></article>
      <article><span>주유 기록</span><strong>${stats.fuelCount}건</strong></article>
      <article><span>정비 기록</span><strong>${stats.maintenanceCount}건</strong></article>
    </div>
    <div class="garage-recent">
      <h3>최근 내역</h3>
      ${renderRecent(bike)}
    </div>
  </article>`;
  renderBikes(bike);
}

function renderBikes(activeBike = getBike()) {
  const container = document.querySelector("#bikeList");
  if (!state.bikes.length) {
    container.innerHTML = `<div class="empty">등록된 바이크가 없습니다.</div>`;
    return;
  }
  container.innerHTML = state.bikes.map((bike) => `<article class="bike-card">
    <div><strong>${bike.maker} ${bike.model}</strong>${bike.year || "-"}년식 · ${bike.cc}cc · ${km(bike.odometer)}</div>
    <div class="bike-actions">
      ${bike.id === activeBike?.id ? `<span class="status ok">선택됨</span>` : `<button data-select-bike="${bike.id}">선택</button>`}
      <button data-delete-bike="${bike.id}">삭제</button>
    </div>
  </article>`).join("");
}

function renderMaintenanceControls(bike) {
  const intervals = buildIntervals(bike);
  const grouped = groupedIntervalEntries(intervals);
  const options = grouped.map((group) => `<optgroup label="${group.label}">
    ${group.items.map(([key]) => `<option value="${key}">${catalogLabel(key)}</option>`).join("")}
  </optgroup>`).join("");
  document.querySelector("#maintenanceItemSelect").innerHTML = options;
  document.querySelector("#intervalEditor").innerHTML = grouped.map((group) => `<section class="interval-group">
    <h3>${group.label}</h3>
    ${group.items.map(([item, interval]) => `<div class="interval-row">
      <strong>${catalogLabel(item)}</strong>
      <label>km<input data-interval="${item}" data-field="km" type="number" min="0" value="${interval.km || 0}" /></label>
      <label>개월<input data-interval="${item}" data-field="months" type="number" min="0" value="${interval.months || 0}" /></label>
    </div>`).join("")}
  </section>`).join("");
}

function renderQuickHistory(bike) {
  const container = document.querySelector("#quickHistoryGrid");
  if (!container || !bike) return;
  const intervals = buildIntervals(bike);
  const quickIntervals = Object.fromEntries(visibleIntervalEntries(intervals));
  container.innerHTML = groupedIntervalEntries(quickIntervals).map((group) => `<section class="quick-history-group">
    <h3>${group.label}</h3>
    ${group.items.map(([item]) => `<div class="quick-history-row">
      <label><input type="checkbox" data-history-check="${item}" /> ${catalogLabel(item)}</label>
      <label>마지막 날짜<input type="date" data-history-date="${item}" value="${today()}" /></label>
      <label>마지막 km<input type="number" min="0" data-history-odo="${item}" value="${bike.odometer || 0}" /></label>
    </div>`).join("")}
  </section>`).join("");
}

function renderOdoHistory(bike) {
  const logs = state.odometerLogs.filter((log) => log.bikeId === bike.id).sort((a, b) => b.date.localeCompare(a.date));
  document.querySelector("#odoHistory").innerHTML = logs.length
    ? logs.map((log) => `<article class="record"><strong>${log.date}</strong>ODO ${km(log.odometer)} · TRIP ${log.trip || "-"}<br />${log.memo || ""}</article>`).join("")
    : `<div class="empty">계기판 사진 기록이 없습니다.</div>`;
}

function renderInstantDiagnosis(odometer) {
  const bike = getBike();
  if (!bike || !odometer) {
    document.querySelector("#instantDiagnosis").innerHTML = "";
    return;
  }
  const simulatedBike = { ...bike, odometer: Number(odometer) };
  const due = dueItems(simulatedBike).filter((item) => item.status !== "ok").slice(0, 5);
  const container = document.querySelector("#instantDiagnosis");
  if (!due.length) {
    container.innerHTML = `<article class="due-card"><div><strong>현재 주행거리 기준 정비 상태</strong><span>${km(odometer)} 기준으로 급한 정비 항목이 없습니다.</span></div><span class="status ok">정상</span></article>`;
    return;
  }
  container.innerHTML = due.map(renderDueCard).join("");
}

function labelFor(value) {
  return {
    cvt: "스쿠터/CVT",
    manual: "메뉴얼",
    dct: "DCT",
    liquid: "수랭",
    air: "공랭",
    commute: "출퇴근",
    delivery: "배달/시내",
    touring: "투어링",
    sport: "스포츠"
  }[value] || value;
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function updateBikeOdometer(bikeId, odometer) {
  const bike = state.bikes.find((entry) => entry.id === bikeId);
  if (bike) bike.odometer = Math.max(Number(bike.odometer || 0), Number(odometer || 0));
}

document.querySelectorAll(".nav-tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-tab, .view").forEach((node) => node.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#${button.dataset.view}`).classList.add("active");
  });
});

document.querySelector("#activeBikeSelect").addEventListener("change", (event) => {
  state.activeBikeId = event.target.value;
  saveState();
  render();
});

document.querySelector("#makerSelect").addEventListener("change", () => {
  document.querySelector("#modelSearch").value = "";
  renderModelSelect();
});

document.querySelector("#modelSearch").addEventListener("input", renderModelSelect);
document.querySelector("#modelSelect").addEventListener("change", applySelectedModel);

document.querySelector("#enableMaintenanceAlerts").addEventListener("click", enableMaintenanceAlerts);
document.querySelector("#saveQuickHistory").addEventListener("click", saveQuickHistory);
document.querySelector("#toggleBikeForm").addEventListener("click", () => {
  bikeFormOpen = !bikeFormOpen;
  render();
});

document.querySelector("#bikeForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = formData(event.currentTarget);
  const { brand, modelInfo } = selectedModelInfo();
  const customMakerMode = data.maker === CUSTOM_MAKER_VALUE;
  const customModelMode = customMakerMode || data.model === CUSTOM_MODEL_VALUE;
  const maker = customMakerMode ? data.customMaker.trim() : brand?.maker || data.maker;
  const modelName = customModelMode ? data.customModel.trim() : modelInfo?.name || data.model;
  if (!maker || !modelName) {
    alert("제조사와 모델명을 입력해 주세요.");
    return;
  }
  const bike = {
    id: id("bike"),
    maker,
    model: modelName,
    company: brand?.company || "",
    modelStatus: customModelMode ? "custom" : modelInfo?.status || "current",
    year: Number(data.year),
    cc: Number(data.cc),
    odometer: Number(data.odometer),
    transmission: data.transmission,
    cooling: data.cooling,
    usage: data.usage,
    intervals: {}
  };
  rememberCustomModel({ maker, name: modelName, cc: Number(data.cc), transmission: data.transmission, cooling: data.cooling });
  bike.intervals = buildIntervals(bike);
  state.bikes.push(bike);
  state.activeBikeId = bike.id;
  bikeFormOpen = false;
  event.currentTarget.reset();
  initBikeModelPicker();
  setDefaults();
  render();
});

document.querySelector("#fuelForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const bike = getBike();
  if (!bike) return alert("먼저 오토바이를 등록해 주세요.");
  const data = formData(event.currentTarget);
  state.fuelLogs.push({ id: id("fuel"), bikeId: bike.id, ...data, odometer: Number(data.odometer), liters: Number(data.liters), cost: Number(data.cost) });
  updateBikeOdometer(bike.id, data.odometer);
  event.currentTarget.reset();
  setDefaults();
  render();
});

document.querySelector("#maintenanceForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const bike = getBike();
  if (!bike) return alert("먼저 오토바이를 등록해 주세요.");
  const data = formData(event.currentTarget);
  state.maintenanceLogs.push({ id: id("maint"), bikeId: bike.id, ...data, odometer: Number(data.odometer), cost: Number(data.cost || 0), completed: true });
  updateBikeOdometer(bike.id, data.odometer);
  event.currentTarget.reset();
  setDefaults();
  render();
});

document.querySelector("#intervalEditor").addEventListener("change", (event) => {
  const input = event.target;
  if (!input.dataset.interval) return;
  const bike = getBike();
  bike.intervals = bike.intervals || buildIntervals(bike);
  bike.intervals[input.dataset.interval] = bike.intervals[input.dataset.interval] || {};
  bike.intervals[input.dataset.interval][input.dataset.field] = Number(input.value);
  render();
});

document.querySelector("#startCamera").addEventListener("click", startCamera);
document.querySelector("#captureDash").addEventListener("click", captureDashboard);
document.querySelector("#stopCamera").addEventListener("click", stopCamera);

document.querySelector("#odometerForm").elements.odometer.addEventListener("input", (event) => {
  renderInstantDiagnosis(event.target.value);
});

document.querySelector("#odometerForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const bike = getBike();
  if (!bike) return alert("먼저 오토바이를 등록해 주세요.");
  const data = formData(event.currentTarget);
  state.odometerLogs.push({ id: id("odo"), bikeId: bike.id, date: today(), odometer: Number(data.odometer), trip: Number(data.trip || 0), memo: data.memo });
  updateBikeOdometer(bike.id, data.odometer);
  event.currentTarget.reset();
  render();
  renderInstantDiagnosis(data.odometer);
});

document.querySelector("#exportJson").addEventListener("click", () => download("moto-log-backup.json", JSON.stringify(state, null, 2), "application/json"));
document.querySelector("#exportCsv").addEventListener("click", () => download("moto-log-records.csv", toCsv(), "text/csv;charset=utf-8"));

document.querySelector("#importJson").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const text = await file.text();
  state = JSON.parse(text);
  saveState();
  render();
});

document.addEventListener("click", (event) => {
  const bikeId = event.target.dataset?.selectBike;
  const deleteBikeId = event.target.dataset?.deleteBike;
  if (deleteBikeId) {
    deleteBike(deleteBikeId);
    return;
  }
  if (!bikeId) return;
  state.activeBikeId = bikeId;
  render();
});

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function deleteBike(bikeId) {
  const bike = state.bikes.find((entry) => entry.id === bikeId);
  if (!bike) return;
  const ok = confirm(`${bike.maker} ${bike.model}와 관련 기록을 삭제할까요?`);
  if (!ok) return;
  state.bikes = state.bikes.filter((entry) => entry.id !== bikeId);
  state.fuelLogs = state.fuelLogs.filter((entry) => entry.bikeId !== bikeId);
  state.maintenanceLogs = state.maintenanceLogs.filter((entry) => entry.bikeId !== bikeId);
  state.odometerLogs = state.odometerLogs.filter((entry) => entry.bikeId !== bikeId);
  state.activeBikeId = state.bikes[0]?.id || "";
  render();
}

function toCsv() {
  const rows = [["type", "bike", "date", "odometer", "item", "liters", "cost", "memo"]];
  for (const bike of state.bikes) {
    for (const log of state.fuelLogs.filter((entry) => entry.bikeId === bike.id)) rows.push(["fuel", `${bike.maker} ${bike.model}`, log.date, log.odometer, "", log.liters, log.cost, log.memo || ""]);
    for (const log of state.maintenanceLogs.filter((entry) => entry.bikeId === bike.id)) rows.push(["maintenance", `${bike.maker} ${bike.model}`, log.date, log.odometer, catalogLabel(log.item), "", log.cost, log.memo || ""]);
    for (const log of state.odometerLogs.filter((entry) => entry.bikeId === bike.id)) rows.push(["odometer", `${bike.maker} ${bike.model}`, log.date, log.odometer, "", "", "", log.memo || ""]);
  }
  return rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
}

function saveQuickHistory() {
  const bike = getBike();
  if (!bike) return;
  const checks = [...document.querySelectorAll("[data-history-check]")].filter((input) => input.checked);
  if (!checks.length) {
    alert("저장할 정비 항목을 선택해 주세요.");
    return;
  }
  for (const check of checks) {
    const item = check.dataset.historyCheck;
    const date = document.querySelector(`[data-history-date="${item}"]`)?.value || today();
    const odometer = Number(document.querySelector(`[data-history-odo="${item}"]`)?.value || bike.odometer || 0);
    state.maintenanceLogs.push({
      id: id("maint"),
      bikeId: bike.id,
      date,
      item,
      odometer,
      cost: 0,
      shop: "초기 이력",
      memo: "최근 정비 이력 빠른 입력",
      completed: true
    });
    updateBikeOdometer(bike.id, odometer);
  }
  render();
}

async function startCamera() {
  const status = document.querySelector("#cameraStatus");
  const video = document.querySelector("#cameraStream");
  if (!navigator.mediaDevices?.getUserMedia) {
    status.textContent = "이 브라우저에서는 카메라 직접 촬영을 지원하지 않습니다.";
    return;
  }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });
    video.srcObject = cameraStream;
    video.style.display = "block";
    document.querySelector("#photoPreview").style.display = "none";
    status.textContent = "계기판 숫자가 선명하게 보이도록 맞춘 뒤 촬영해 주세요.";
  } catch (error) {
    status.textContent = "카메라 권한을 열 수 없습니다. 브라우저 권한 설정을 확인해 주세요.";
  }
}

async function captureDashboard() {
  const status = document.querySelector("#cameraStatus");
  if (!hasBike()) {
    status.textContent = "먼저 오토바이를 등록해 주세요.";
    return;
  }
  const video = document.querySelector("#cameraStream");
  const canvas = document.querySelector("#cameraCanvas");
  const preview = document.querySelector("#photoPreview");
  if (!cameraStream || !video.videoWidth) {
    status.textContent = "먼저 카메라를 켜 주세요.";
    return;
  }
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
  preview.src = imageDataUrl;
  preview.style.display = "block";
  status.textContent = "촬영 완료. 주행거리 인식 결과를 확인해 주세요.";

  const recognized = await recognizeDashboardOdometer(imageDataUrl);
  if (recognized?.odometer) {
    document.querySelector("#odometerForm").elements.odometer.value = recognized.odometer;
    if (recognized.trip) document.querySelector("#odometerForm").elements.trip.value = recognized.trip;
    renderInstantDiagnosis(recognized.odometer);
    status.textContent = "계기판 인식 완료. 값이 맞는지 확인하면 됩니다.";
  } else {
    status.textContent = "MVP에서는 촬영 후 주행거리를 확인 입력합니다. OCR API를 연결하면 이 값이 자동 입력됩니다.";
  }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }
  document.querySelector("#cameraStream").style.display = "none";
  document.querySelector("#cameraStatus").textContent = "카메라가 꺼졌습니다. 언제든 다시 켤 수 있습니다.";
}

async function recognizeDashboardOdometer(imageDataUrl) {
  void imageDataUrl;
  return null;
}

async function enableMaintenanceAlerts() {
  if (!("Notification" in window)) {
    document.querySelector("#alertStatus").textContent = "이 브라우저는 알림을 지원하지 않습니다.";
    return;
  }
  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  state.notificationSettings.maintenanceAlerts = permission === "granted";
  saveState();
  renderAlertStatus();
  if (permission === "granted") maybeSendMaintenanceNotification(getBike(), true);
}

function renderAlertStatus() {
  const status = document.querySelector("#alertStatus");
  const button = document.querySelector("#enableMaintenanceAlerts");
  if (!status || !button) return;
  const enabled = state.notificationSettings.maintenanceAlerts && "Notification" in window && Notification.permission === "granted";
  button.textContent = enabled ? "알림 켜짐" : "알림 켜기";
  status.textContent = enabled
    ? "앱을 열었을 때 정비 필요 항목이 있으면 브라우저 알림으로 알려줍니다."
    : "정비 완료 기록을 저장하면 다음 교체 주행거리와 날짜가 자동 계산됩니다.";
}

function maybeSendMaintenanceNotification(bike, force = false) {
  if (!bike || !state.notificationSettings.maintenanceAlerts || !("Notification" in window) || Notification.permission !== "granted") return;
  const due = dueItems(bike).filter((item) => item.status === "due");
  if (!due.length) return;
  const key = `${today()}-${bike.id}-${due.map((item) => item.item).join("|")}`;
  if (!force && state.notificationSettings.lastAlertKey === key) return;
  state.notificationSettings.lastAlertKey = key;
  saveState();
  new Notification(`${bike.maker} ${bike.model} 정비 알림`, {
    body: due.slice(0, 3).map((item) => item.label).join(", ") + (due.length > 3 ? ` 외 ${due.length - 3}개` : ""),
    tag: `moto-log-${bike.id}`
  });
}

initBikeModelPicker();
setDefaults();
render();
