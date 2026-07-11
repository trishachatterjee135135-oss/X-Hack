const authModal = document.getElementById('auth-modal');
const loginBtn = document.getElementById('login-btn');
const authUsernameInput = document.getElementById('auth-username');
const profileNameDisplay = document.querySelector('.user-profile h4');
const avatarDisplay = document.querySelector('.avatar');
const logoutBtn = document.getElementById('logout-btn');

function setActiveUser(name) {
 profileNameDisplay.textContent = name;
 avatarDisplay.textContent = name.charAt(0).toUpperCase();
}

// User Session Management
if (localStorage.getItem('activeUser')) {
 setActiveUser(localStorage.getItem('activeUser'));
 authModal.classList.add('hidden');
}

loginBtn.addEventListener('click', () => {
 const enteredName = authUsernameInput.value.trim();
 if (enteredName) {
 localStorage.setItem('activeUser', enteredName);
 setActiveUser(enteredName);
 authModal.classList.add('hidden');
 showToast(`SESSION INITIALIZED FOR SIGNATURE: ${enteredName.toUpperCase()}`);
 }
});

logoutBtn.addEventListener('click', () => {
 localStorage.removeItem('activeUser');
 authUsernameInput.value = '';
 authModal.classList.remove('hidden');
 authUsernameInput.focus();
});

// Page Navigation System Engine Logic
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.app-page');

navItems.forEach(item => {
 item.addEventListener('click', () => {
 playSound('sound-click');
 navItems.forEach(nav => nav.classList.remove('active'));
 pages.forEach(page => page.classList.add('hidden'));

 item.classList.add('active');
 const targetPage = document.getElementById(item.getAttribute('data-target'));
 if(targetPage) targetPage.classList.remove('hidden');
 });
});

// Workspace Elements Selection Mapping Hooks
const fieldsContainer = document.getElementById('fields-container');
const addFieldBtn = document.getElementById('add-field-btn');
const generateBtn = document.getElementById('generate-btn');
const jsonOutput = document.getElementById('json-output');
const sdkOutputCode = document.getElementById('sdk-output-code');
const copyBtn = document.getElementById('copy-btn');
const scanLine = document.getElementById('scan-line');
const toast = document.getElementById('toast-notification');
const specInput = document.getElementById('spec-input');
const parseSpecBtn = document.getElementById('parse-spec-btn');
const recordInputsContainer = document.getElementById('record-inputs');
const totalRequestsDisplay = document.getElementById('total-requests');
const requestTrendDisplay = document.getElementById('request-trend');
const validationAccuracyDisplay = document.getElementById('validation-accuracy');
const validationStatusDisplay = document.getElementById('validation-status');
const telemetryLog = document.getElementById('telemetry-log');
const activeEndpointsDisplay = document.getElementById('active-endpoints');
const endpointStatusDisplay = document.getElementById('endpoint-status');
const sdkReadBtn = document.getElementById('sdk-read-btn');
const sdkHistoryBtn = document.getElementById('sdk-history-btn');
const sdkLiveOutput = document.getElementById('sdk-live-output');
const historyBtn = document.getElementById('history-btn');
const historyModal = document.getElementById('history-modal');
const closeHistoryBtn = document.getElementById('close-history-btn');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history-btn');
let recordValues = [];
const mockPayloadKey = 'mockingbird.latestPayload';
const mockHistoryKey = 'mockingbird.payloadHistory';
const mockOperationKey = 'mockingbird.totalMockOperations';
const editorDraftKey = 'mockingbird.editorDraft';
let totalMockRequests = Number.parseInt(localStorage.getItem(mockOperationKey), 10) || 0;
let isRestoringDraft = Boolean(localStorage.getItem(editorDraftKey));

function getPayloadHistory() {
 try {
 const history = JSON.parse(localStorage.getItem(mockHistoryKey) || '[]');
 return Array.isArray(history) ? history : [];
 } catch (_) {
 return [];
 }
}

window.MockingbirdSDK = Object.freeze({
 getLatestMockPayload() {
 const payload = localStorage.getItem(mockPayloadKey);
 if (!payload) throw new Error('No mock payload has been provisioned yet.');
 return JSON.parse(payload);
 },
 getMockPayloadHistory() {
 return getPayloadHistory().map(entry => entry.payload);
 }
});

function updateStoredMetrics() {
 const history = getPayloadHistory();
 totalRequestsDisplay.textContent = totalMockRequests.toLocaleString('en-US');
 activeEndpointsDisplay.textContent = String(history.length);
 endpointStatusDisplay.textContent = history.length
 ? `${history.length} payload${history.length === 1 ? '' : 's'} available to SDK`
 : 'No payload provisioned';
 endpointStatusDisplay.className = `stat-trend ${history.length ? 'positive' : 'stable'}`;
}

if (localStorage.getItem(mockPayloadKey)) {
 requestTrendDisplay.textContent = 'Saved activity loaded from this browser';
}
updateStoredMetrics();

function playSound(id) {
 const sound = document.getElementById(id);
 if(sound) { 
 const playPromise = sound.play();
 if (playPromise !== undefined) {
 playPromise.catch(() => {});
 }
 }
}

function showToast(message) {
 toast.textContent = message;
 toast.classList.remove('hidden');
 setTimeout(() => toast.classList.add('hidden'), 2000);
}

function createFieldRow(name = '', type = 'string') {
 playSound('sound-click');
 const row = document.createElement('div');
 row.className = 'field-row';
 
 row.innerHTML = `
 <input type="text" class="field-name" placeholder="Attribute Key" value="${name}">
 <select class="field-type" aria-label="Attribute Data Type Selector">
 <option value="string" ${type === 'string' ? 'selected' : ''}>Text</option>
 <option value="id" ${type === 'id' ? 'selected' : ''}>ID (Increment)</option>
 <option value="name" ${type === 'name' ? 'selected' : ''}>Full Name</option>
 <option value="email" ${type === 'email' ? 'selected' : ''}>Email</option>
 <option value="status" ${type === 'status' ? 'selected' : ''}>Status Tag</option>
 <option value="number" ${type === 'number' ? 'selected' : ''}>Number</option>
 <option value="boolean" ${type === 'boolean' ? 'selected' : ''}>Boolean</option>
 </select>
 <button type="button" class="btn btn-danger delete-row-btn">✕</button>
 `;
 
 row.querySelector('.delete-row-btn').addEventListener('click', () => {
 playSound('sound-click');
 row.remove();
 updateSchemaWorkspace();
 });

 row.querySelector('.field-name').addEventListener('input', updateSchemaWorkspace);
 row.querySelector('.field-type').addEventListener('change', () => {
 updateSchemaWorkspace();
 });

 fieldsContainer.appendChild(row);
 updateSchemaWorkspace();
}

// Initializing base mock layout options
createFieldRow('id', 'id');
createFieldRow('company_name', 'name');
createFieldRow('support_email', 'email');
createFieldRow('billing_status', 'status');
restoreEditorDraft();

addFieldBtn.addEventListener('click', () => createFieldRow());

parseSpecBtn.addEventListener('click', () => {
 const promptValue = specInput.value.trim();
 if (!promptValue) {
 showToast("SPECIFICATION INPUT CONTEXT EMPTY");
 return;
 }
 
 playSound('sound-beep');
 fieldsContainer.innerHTML = ''; 
 const lowered = promptValue.toLowerCase();
 
 if (lowered.includes('product') || lowered.includes('store') || lowered.includes('item')) {
 createFieldRow('product_id', 'id');
 createFieldRow('product_title', 'name');
 createFieldRow('price', 'number');
 createFieldRow('in_stock', 'boolean');
 } else if (lowered.includes('openapi') || lowered.includes('postman')) {
 createFieldRow('client_id', 'id');
 createFieldRow('access_token', 'name');
 createFieldRow('webhook_url', 'email');
 createFieldRow('is_active', 'boolean');
 } else {
 const words = promptValue.replace(/[^a-zA-Z0-9 ]/g, "").split(/\s+/).filter(w => w.length > 2);
 if (words.length > 0) {
 createFieldRow('id', 'id');
 words.slice(0, 4).forEach((word, idx) => {
 createFieldRow(word.toLowerCase() + "_field", idx === 0 ? 'name' : 'number');
 });
 } else {
 createFieldRow('id', 'id');
 createFieldRow('custom_attribute', 'name');
 }
 }
 showToast("CONTEXT SPECIFICATION PARSED SUCCESSFULLY");
});

// FIXED: Wraps non-standard keys in quotes to prevent TypeScript syntax compilation breaks
function updateDynamicSDK() {
 const rows = document.querySelectorAll('.field-row');
 let typeInterfaceLines = [];
 
 rows.forEach(row => {
 const key = row.querySelector('.field-name').value.trim() || 'unnamed_field';
 const type = row.querySelector('.field-type').value;
 let tsType = 'string';
 if (type === 'number' || type === 'id') tsType = 'number';
 if (type === 'boolean') tsType = 'boolean';
 
 // Validation regex checks for special chars or safe leading variables
 const isSafeValidVar = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
 // JSON.stringify produces a valid quoted property name for quotes,
 // backslashes, and control characters entered by the user.
 const formattedKey = isSafeValidVar ? key : JSON.stringify(key);
 
 typeInterfaceLines.push(` ${formattedKey}: ${tsType};`);
 });

 sdkOutputCode.textContent = `// Browser-Local TypeScript Client

export interface MockTelemetryPayload {\n${typeInterfaceLines.join('\n')}\n}

export const getLatestMockPayload = (): MockTelemetryPayload[] => {
 const payload = window.localStorage.getItem('${mockPayloadKey}');
 if (!payload) throw new Error('No mock payload has been provisioned yet.');
 return JSON.parse(payload) as MockTelemetryPayload[];
};

export const getMockPayloadHistory = (): MockTelemetryPayload[][] => {
 return JSON.parse(window.localStorage.getItem('${mockHistoryKey}') || '[]')
 .map((entry: { payload: MockTelemetryPayload[] }) => entry.payload);
};`;
}

function getRecordCount() {
 const requestedCount = Number.parseInt(document.getElementById('record-count').value, 10);
 return Number.isFinite(requestedCount) ? Math.min(Math.max(requestedCount, 1), 50) : 1;
}

function getSchemaFields() {
 return Array.from(document.querySelectorAll('.field-row')).map(row => ({
 key: row.querySelector('.field-name').value.trim() || 'unnamed_field',
 type: row.querySelector('.field-type').value
 }));
}

function renderRecordInputs() {
 const fields = getSchemaFields();
 const count = getRecordCount();
 recordValues = Array.from({ length: count }, (_, index) => recordValues[index] || {});
 recordInputsContainer.innerHTML = '';

 recordValues.forEach((values, recordIndex) => {
 const card = document.createElement('div');
 card.className = 'record-card';
 const title = document.createElement('h3');
 title.textContent = `Record ${recordIndex + 1}`;
 card.appendChild(title);

 fields.forEach(({ key, type }) => {
 const group = document.createElement('label');
 group.className = 'record-value-group';
 group.textContent = key;
 const input = document.createElement('input');
 input.type = type === 'number' || type === 'id' ? 'number' : 'text';
 input.placeholder = type === 'boolean' ? 'true or false' : `Enter ${key}`;
 input.value = values[key] || '';
 input.addEventListener('input', () => {
 recordValues[recordIndex][key] = input.value;
 updateJsonPreview();
 });
 group.appendChild(input);
 card.appendChild(group);
 });
 recordInputsContainer.appendChild(card);
 });
}

function updateSchemaWorkspace() {
 updateDynamicSDK();
 renderRecordInputs();
 updateJsonPreview();
}

function parseManualValue(value, type, key) {
 if (value.trim() === '') throw new Error(`${key} is required`);

 if (type === 'number' || type === 'id') {
 if (value.trim() === '' || !Number.isFinite(Number(value))) {
 throw new Error(`${key} needs a valid number`);
 }
 return Number(value);
 }

 if (type === 'boolean') {
 if (value.toLowerCase() === 'true') return true;
 if (value.toLowerCase() === 'false') return false;
 throw new Error(`${key} must be true or false`);
 }

 return value;
}

function buildManualPayload() {
 const fields = getSchemaFields();

 if (fields.length === 0) throw new Error('Add at least one schema attribute');

 return recordValues.map(values => {
 const record = Object.create(null);
 fields.forEach(({ key, type }) => {
 record[key] = parseManualValue(values[key] || '', type, key);
 });
 return record;
 });
}

function updateJsonPreview() {
 try {
 jsonOutput.textContent = JSON.stringify(buildManualPayload(), null, 4);
 } catch (error) {
 jsonOutput.textContent = `// ${error.message}`;
 }
 updateValidationTelemetry();
 saveEditorDraft();
}

function saveEditorDraft() {
 if (isRestoringDraft) return;

 try {
 localStorage.setItem(editorDraftKey, JSON.stringify({
 schema: getSchemaFields(),
 recordCount: getRecordCount(),
 values: recordValues,
 updatedAt: new Date().toISOString()
 }));
 } catch (_) {
 // The app remains usable if browser storage is unavailable.
 }
}

function restoreEditorDraft() {
 try {
 const draft = JSON.parse(localStorage.getItem(editorDraftKey) || 'null');
 if (!draft?.schema?.length || !Array.isArray(draft.values)) return;

 isRestoringDraft = true;
 recordValues = draft.values;
 document.getElementById('record-count').value = String(draft.recordCount || draft.values.length || 1);
 fieldsContainer.innerHTML = '';
 draft.schema.forEach(({ key, type }) => createFieldRow(key, type));
 updateSchemaWorkspace();
 isRestoringDraft = false;
 } catch (_) {
 isRestoringDraft = false;
 }
}

function updateValidationTelemetry() {
 const fields = getSchemaFields();
 const totalFields = fields.length * recordValues.length;
 let validFields = 0;

 recordValues.forEach(values => {
 fields.forEach(({ key, type }) => {
 try {
 parseManualValue(values[key] || '', type, key);
 validFields += 1;
 } catch (_) {
 // Invalid fields are counted in the accuracy calculation.
 }
 });
 });

 const accuracy = totalFields === 0 ? 0 : Math.round((validFields / totalFields) * 100);
 const invalidFields = totalFields - validFields;
 validationAccuracyDisplay.textContent = `${accuracy}%`;
 validationStatusDisplay.textContent = invalidFields === 0 && totalFields > 0
 ? 'All record values are valid'
 : `${invalidFields} field${invalidFields === 1 ? '' : 's'} need attention`;
 validationStatusDisplay.className = `stat-trend ${invalidFields === 0 && totalFields > 0 ? 'positive' : 'stable'}`;
}

function addTelemetryRow(method, message) {
 document.getElementById('no-telemetry')?.remove();
 const row = document.createElement('div');
 const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
 row.className = 'log-row';
 row.innerHTML = `<code>[${now}]</code> <span class="badge ${method.toLowerCase()}">${method}</span> ${message}`;
 telemetryLog.prepend(row);
 while (telemetryLog.children.length > 3) telemetryLog.lastElementChild.remove();
}

function recordProvisionedPayload(payload) {
 const recordCount = payload.length;
 localStorage.setItem(mockPayloadKey, JSON.stringify(payload));
 const history = getPayloadHistory();
 const payloadId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
 history.unshift({ id: payloadId, createdAt: new Date().toISOString(), schema: getSchemaFields(), payload });
 localStorage.setItem(mockHistoryKey, JSON.stringify(history));
 totalMockRequests += 1;
 localStorage.setItem(mockOperationKey, String(totalMockRequests));
 requestTrendDisplay.textContent = 'Latest operation: payload provisioned';
 updateStoredMetrics();
 addTelemetryRow('POST', `payload provisioned (${recordCount} record${recordCount === 1 ? '' : 's'})`);
}

function inferSchemaFromPayload(payload) {
 const firstRecord = payload[0] || {};
 return Object.entries(firstRecord).map(([key, value]) => ({
 key,
 type: typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string'
 }));
}

function loadHistoryIntoEditor(entry) {
 const schema = entry.schema?.length ? entry.schema : inferSchemaFromPayload(entry.payload);
 document.getElementById('record-count').value = String(entry.payload.length || 1);
 recordValues = entry.payload.map(record => Object.fromEntries(
 schema.map(({ key }) => [key, record[key] == null ? '' : String(record[key])])
 ));
 fieldsContainer.innerHTML = '';
 schema.forEach(({ key, type }) => createFieldRow(key, type));
 updateSchemaWorkspace();
 historyModal.classList.add('hidden');
 document.querySelector('[data-target="page-generator"]').click();
 showToast('HISTORICAL VALUES LOADED INTO EDITOR');
}

function renderHistory() {
 const history = getPayloadHistory();
 historyList.innerHTML = '';

 if (history.length === 0) {
 historyList.textContent = 'No payloads have been saved yet.';
 return;
 }

 history.forEach(entry => {
 const item = document.createElement('article');
 item.className = 'history-item';
 const createdAt = new Date(entry.createdAt).toLocaleString();
 item.innerHTML = `<strong>${entry.payload.length} record${entry.payload.length === 1 ? '' : 's'}</strong><span>${createdAt}</span>`;
 const actions = document.createElement('div');
 actions.className = 'history-actions';
 const editBtn = document.createElement('button');
 editBtn.type = 'button';
 editBtn.className = 'btn btn-secondary btn-small';
 editBtn.textContent = 'LOAD INTO EDITOR';
 editBtn.addEventListener('click', () => loadHistoryIntoEditor(entry));
 const useBtn = document.createElement('button');
 useBtn.type = 'button';
 useBtn.className = 'btn btn-secondary btn-small';
 useBtn.textContent = 'USE IN SDK';
 useBtn.addEventListener('click', () => {
 localStorage.setItem(mockPayloadKey, JSON.stringify(entry.payload));
 sdkLiveOutput.textContent = JSON.stringify(entry.payload, null, 4);
 historyModal.classList.add('hidden');
 showToast('HISTORICAL PAYLOAD LOADED INTO SDK');
 });
 actions.append(editBtn, useBtn);
 item.appendChild(actions);
 historyList.appendChild(item);
 });
}

document.getElementById('record-count').addEventListener('input', updateSchemaWorkspace);

generateBtn.addEventListener('click', () => {
 playSound('sound-beep');
 scanLine.classList.remove('scanning');
 void scanLine.offsetWidth;
 scanLine.classList.add('scanning');

 setTimeout(() => {
 try {
 const payload = buildManualPayload();
 jsonOutput.textContent = JSON.stringify(payload, null, 4);
 recordProvisionedPayload(payload);
 } catch (error) {
 showToast(error.message.toUpperCase());
 return;
 }
 playSound('sound-success');
 showToast("INPUT PAYLOAD PROVISIONED");
 updateDynamicSDK();
 }, 400);
});

copyBtn.addEventListener('click', () => {
 if (!navigator.clipboard?.writeText) {
 showToast("CLIPBOARD ACCESS UNAVAILABLE");
 return;
 }

 navigator.clipboard.writeText(jsonOutput.textContent)
 .then(() => showToast("PAYLOAD COPIED TO SYSTEM CLIPBOARD"))
 .catch(() => showToast("CLIPBOARD ACCESS UNAVAILABLE"));
});

sdkReadBtn.addEventListener('click', () => {
 try {
 const payload = window.MockingbirdSDK.getLatestMockPayload();
 sdkLiveOutput.textContent = JSON.stringify(payload, null, 4);
 } catch (_) {
 sdkLiveOutput.textContent = '// No payload is available. Provision a valid payload first.';
 showToast('PROVISION A PAYLOAD FIRST');
 return;
 }

 totalMockRequests += 1;
 localStorage.setItem(mockOperationKey, String(totalMockRequests));
 updateStoredMetrics();
 requestTrendDisplay.textContent = 'Latest operation: SDK read';
 addTelemetryRow('GET', 'latest payload read by browser-local SDK');
 showToast('SDK PAYLOAD READ COMPLETED');
});

sdkHistoryBtn.addEventListener('click', () => {
 const payloadHistory = window.MockingbirdSDK.getMockPayloadHistory();
 if (payloadHistory.length === 0) {
 sdkLiveOutput.textContent = '// No payload history is available. Provision a valid payload first.';
 showToast('NO PAYLOAD HISTORY AVAILABLE');
 return;
 }

 sdkLiveOutput.textContent = JSON.stringify(payloadHistory, null, 4);
 totalMockRequests += 1;
 localStorage.setItem(mockOperationKey, String(totalMockRequests));
 updateStoredMetrics();
 requestTrendDisplay.textContent = 'Latest operation: SDK history read';
 addTelemetryRow('GET', 'payload history read by browser-local SDK');
 showToast('SDK HISTORY READ COMPLETED');
});

historyBtn.addEventListener('click', () => {
 renderHistory();
 historyModal.classList.remove('hidden');
});

closeHistoryBtn.addEventListener('click', () => historyModal.classList.add('hidden'));

clearHistoryBtn.addEventListener('click', () => {
 localStorage.removeItem(mockHistoryKey);
 localStorage.removeItem(mockPayloadKey);
 updateStoredMetrics();
 sdkLiveOutput.textContent = '// History cleared. Provision a payload to make a new SDK response available.';
 renderHistory();
 showToast('PAYLOAD HISTORY CLEARED');
});


