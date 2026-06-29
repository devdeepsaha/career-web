const GUEST_WORKSPACE_KEY = 'potho_guest_workspace_v1';
const GUEST_OWNER = 'Guest workspace';
const GUEST_TTL_DAYS = 7;
const GUEST_TTL_MS = GUEST_TTL_DAYS * 24 * 60 * 60 * 1000;

const emptyWorkspace = () => ({
    created_at: null,
    updated_at: null,
    expires_at: null,
    roadmaps: [],
    savedQuestions: [],
    questionAttempts: [],
    mockTests: [],
    savedScholarships: [],
    scholarshipProfile: null,
});

const expiresAtFor = (createdAt) => new Date(new Date(createdAt).getTime() + GUEST_TTL_MS).toISOString();

const readJson = (key, fallback) => {
    try {
        return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch {
        return fallback;
    }
};

export const clearGuestWorkspace = () => {
    const prefixes = [
        'resource_vault_Guest workspace',
        'study_timer_Guest workspace',
        'scholarship_finder_profile_v1_guest',
        'scholarship_finder_results_v1_guest',
    ];
    localStorage.removeItem(GUEST_WORKSPACE_KEY);
    localStorage.removeItem('guest_mode');
    Object.keys(localStorage).forEach((key) => {
        if (prefixes.some((prefix) => key.startsWith(prefix))) localStorage.removeItem(key);
    });
    Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('scholarship_detail_') || key === 'last_scholarship_detail' || key.startsWith('scholarship_finder_results_v1_guest')) {
            sessionStorage.removeItem(key);
        }
    });
    window.dispatchEvent(new CustomEvent('potho-guest-workspace-updated'));
};

export const ensureGuestWorkspaceFresh = () => {
    const workspace = readJson(GUEST_WORKSPACE_KEY, null);
    if (!workspace) return true;
    if (workspace.expires_at && Date.now() > new Date(workspace.expires_at).getTime()) {
        clearGuestWorkspace();
        return false;
    }
    return true;
};

const withTimestamps = (workspace) => {
    const createdAt = workspace.created_at || new Date().toISOString();
    const updatedAt = new Date().toISOString();
    return {
        ...emptyWorkspace(),
        ...workspace,
        created_at: createdAt,
        updated_at: updatedAt,
        expires_at: workspace.expires_at || expiresAtFor(createdAt),
    };
};

const writeWorkspace = (workspace) => {
    localStorage.setItem(GUEST_WORKSPACE_KEY, JSON.stringify(withTimestamps(workspace)));
    window.dispatchEvent(new CustomEvent('potho-guest-workspace-updated'));
};

export const getGuestWorkspace = () => {
    if (!ensureGuestWorkspaceFresh()) return emptyWorkspace();
    const workspace = withTimestamps(readJson(GUEST_WORKSPACE_KEY, emptyWorkspace()));
    if (!workspace.created_at || !workspace.expires_at) writeWorkspace(workspace);
    return workspace;
};

export const touchGuestWorkspace = () => {
    const workspace = getGuestWorkspace();
    writeWorkspace(workspace);
    return workspace;
};

export const getGuestExpiryLabel = () => {
    const workspace = getGuestWorkspace();
    if (!workspace.expires_at) return '7 days';
    const remaining = Math.max(0, new Date(workspace.expires_at).getTime() - Date.now());
    const days = Math.max(1, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
    return `${days} day${days === 1 ? '' : 's'}`;
};

export const addGuestWorkspaceItem = (collection, item, dedupeKey = null) => {
    const workspace = getGuestWorkspace();
    const items = Array.isArray(workspace[collection]) ? workspace[collection] : [];
    const nextItem = {
        ...item,
        guest_id: item.guest_id || crypto.randomUUID?.() || `${collection}-${Date.now()}`,
        created_at: item.created_at || new Date().toISOString(),
    };
    const shouldDedupe = dedupeKey && nextItem?.[dedupeKey] !== undefined && nextItem?.[dedupeKey] !== null && nextItem?.[dedupeKey] !== '';
    const nextItems = shouldDedupe
        ? [nextItem, ...items.filter((existing) => existing?.[dedupeKey] !== nextItem?.[dedupeKey])]
        : [nextItem, ...items];
    workspace[collection] = nextItems.slice(0, 100);
    writeWorkspace(workspace);
    return nextItem;
};

export const setGuestScholarshipProfile = (profile) => {
    const workspace = getGuestWorkspace();
    workspace.scholarshipProfile = { ...profile, updated_at: new Date().toISOString() };
    writeWorkspace(workspace);
};

const postJson = async (endpoint, payload) => {
    const response = await fetch(`${import.meta.env.VITE_APP_API_URL || 'http://localhost:5000'}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return response.ok;
};

const putJson = async (endpoint, payload) => {
    const response = await fetch(`${import.meta.env.VITE_APP_API_URL || 'http://localhost:5000'}${endpoint}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return response.ok;
};

const copyLocalList = (from, to) => {
    const source = readJson(from, []);
    if (!Array.isArray(source) || !source.length) return;
    const current = readJson(to, []);
    const merged = [...source, ...current].filter(Boolean);
    const unique = Array.from(new Map(merged.map((item) => [item.id || item.createdAt || JSON.stringify(item), item])).values());
    localStorage.setItem(to, JSON.stringify(unique));
};

const migrateLocalOnlyGuestData = (user) => {
    const owner = user?.id || user?.email || user?.name;
    if (!owner) return;
    copyLocalList(`resource_vault_${GUEST_OWNER}`, `resource_vault_${owner}`);
    copyLocalList(`study_timer_${GUEST_OWNER}_sessions`, `study_timer_${owner}_sessions`);
    for (const key of ['duration', 'seconds', 'topic']) {
        const value = localStorage.getItem(`study_timer_${GUEST_OWNER}_${key}`);
        if (value && !localStorage.getItem(`study_timer_${owner}_${key}`)) {
            localStorage.setItem(`study_timer_${owner}_${key}`, value);
        }
    }
};

export const migrateGuestWorkspaceToAccount = async (user) => {
    const workspace = getGuestWorkspace();
    const hasServerData = ['roadmaps', 'savedQuestions', 'questionAttempts', 'mockTests', 'savedScholarships']
        .some((key) => Array.isArray(workspace[key]) && workspace[key].length);

    migrateLocalOnlyGuestData(user);

    if (!hasServerData && !workspace.scholarshipProfile) {
        localStorage.removeItem('guest_mode');
        return { migrated: 0 };
    }

    let migrated = 0;
    if (workspace.scholarshipProfile) {
        const ok = await putJson('/student-profile', workspace.scholarshipProfile);
        if (ok) migrated += 1;
    }

    for (const roadmap of workspace.roadmaps || []) {
        if (await postJson('/roadmaps', roadmap)) migrated += 1;
    }
    for (const question of workspace.savedQuestions || []) {
        if (await postJson('/saved-questions', question)) migrated += 1;
    }
    for (const attempt of workspace.questionAttempts || []) {
        if (await postJson('/question-attempts', attempt)) migrated += 1;
    }
    for (const mock of workspace.mockTests || []) {
        if (await postJson('/mock-tests', mock)) migrated += 1;
    }
    for (const scholarship of workspace.savedScholarships || []) {
        if (await postJson('/saved-scholarships', scholarship)) migrated += 1;
    }

    localStorage.removeItem(GUEST_WORKSPACE_KEY);
    localStorage.removeItem('guest_mode');
    return { migrated };
};
