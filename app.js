/**
 * app.js - Main Application Logic (Part 1: Core, State, Utils)
 * Кабинет партнёра - Partner Cabinet Prototype
 */

// =============================================================================
// APPLICATION STATE
// =============================================================================

const App = {
    currentUser: null,
    currentRole: 'operator_partner',
    currentRoute: 'login',
    theme: 'light',
    contracts: [...MockData.contracts],
    auditLog: [...MockData.auditEvents],
    integrationLog: [...MockData.crmIntegrationLog],
    consentBank: [],

    // Contract form state
    contractForm: {
        id: null,
        productType: 'travel',
        generalContractId: null,
        blankType: 'electronic',
        paperBlankId: null,
        personResidencyMode: 'resident',
        territories: [],
        program: 'base',
        variant: 'standard',
        purpose: 'tourism',
        sportType: '',
        amount: 30000,
        startDate: '',
        endDate: '',
        persons: [],
        corporateClientCompany: '',
        corporateDiscountPercent: 0,
        corporateDmsNumber: '',
        corporateCardNumber: '',
        corporateAlliance: false,
        nonresidentConsentFile: null,
        kdpConfirmed: false
    },

    // CRM Simulator settings
    crmSimulator: {
        mode: 'auto', // auto, ok, fail
        failReason: 'AML_HIT',
        latency: 500,
        timeoutChance: 5,
        amlEnabled: true
    },

    // Settings
    settings: {
        maxPersons: 5,
        maxTerritories: 3,
        enablePartnerAdmin: true
    }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const Utils = {
    // Format date to display
    formatDate(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU').format(amount) + ' ₸';
    },

    // Calculate days between dates
    daysBetween(start, end) {
        if (!start || !end) return 0;
        const s = new Date(start);
        const e = new Date(end);
        const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
        return diff > 0 ? diff : 0;
    },

    // Get tomorrow's date
    getTomorrow() {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    },

    // Get today's date
    getToday() {
        return new Date().toISOString().split('T')[0];
    },

    // Add days to ISO date and return ISO date
    addDays(dateStr, days) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        d.setDate(d.getDate() + days);
        return d.toISOString().split('T')[0];
    },

    // Age in full years by date of birth
    getAge(birthDate) {
        if (!birthDate) return null;
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        const dayDiff = today.getDate() - birth.getDate();
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;
        return age;
    },

    // Generate unique ID
    generateId(prefix = 'id') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    // Validate IIN (basic)
    validateIIN(iin) {
        return /^\d{12}$/.test(iin);
    },

    // Get initials from name
    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    // Sleep/delay
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Tabler-like system icon set
    getSystemIcon(name, options = {}) {
        const size = Number(options.size) || 16;
        const strokeWidth = options.strokeWidth || 1.8;
        const className = options.className ? ` class="${options.className}"` : '';
        const base = `<svg${className} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">`;

        switch (name) {
            case 'download':
                return `${base}<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><path d="M7 11l5 5 5-5"/><path d="M12 4v12"/></svg>`;
            case 'xmark-circle':
                return `${base}<path d="M12 3a9 9 0 1 0 9 9a9 9 0 0 0-9-9"/><path d="m10 10 4 4"/><path d="m14 10-4 4"/></svg>`;
            case 'nosign':
                return `${base}<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="m8 8 8 8"/></svg>`;
            case 'pencil':
                return `${base}<path d="M7 21h10"/><path d="M5 21l2.5-2.5"/><path d="M17.5 3.5a2.121 2.121 0 1 1 3 3L9 18l-4 1 1-4z"/></svg>`;
            case 'xmark':
                return `${base}<path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>`;
            default:
                return `${base}<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/></svg>`;
        }
    },

    getProductMeta(productId) {
        const product = (MockData.productCatalog || []).find(p => p.id === productId);
        if (product) return product;
        if (productId === 'travel') return { id: 'travel', code: 'ВЗР', shortName: 'ВЗР', name: 'Выезжающие за рубеж', layout: 'travel' };
        if (productId === 'mandatory') return { id: 'mandatory', code: 'ОСТ', shortName: 'ОСТ', name: 'Обязательное страхование туриста', layout: 'basic' };
        return { id: productId, code: productId?.toUpperCase() || '-', shortName: productId || '-', name: productId || '-', layout: 'basic' };
    },

    getProductLabel(productId, options = {}) {
        const meta = this.getProductMeta(productId);
        if (options.full) return `${meta.code} · ${meta.name}`;
        return meta.shortName || meta.code || meta.id;
    },

    isTravelProduct(productId) {
        return this.getProductMeta(productId).layout === 'travel';
    }
};

// =============================================================================
// PERMISSION SYSTEM
// =============================================================================

const Permissions = {
    // Check if current role has permission
    can(permission) {
        const roleId = (App.currentRole && MockData.roles[App.currentRole])
            ? App.currentRole
            : App.currentUser?.role;
        const role = MockData.roles[roleId];
        if (!role) return false;
        const perm = role.permissions[permission];
        if (perm === 'conditional') {
            // Handle conditional permissions
            if (permission === 'adminUsers' && roleId === 'partner_admin') {
                const company = this.getCurrentCompany();
                return company?.enablePartnerUserAdmin || false;
            }
        }
        return !!perm;
    },

    // Get current user's company
    getCurrentCompany() {
        if (!App.currentUser) return null;
        return MockData.tourCompanies.find(c => c.id === App.currentUser.companyId);
    },

    // Get current user's region
    getCurrentRegion() {
        if (!App.currentUser) return null;
        return MockData.regions.find(r => r.id === App.currentUser.regionId);
    },

    // Get scope for current role
    getScope() {
        const role = MockData.roles[App.currentRole];
        return role?.scope || 'company';
    },

    // Filter contracts by scope
    filterByScope(contracts) {
        const scope = this.getScope();
        const role = MockData.roles[App.currentRole];

        if (scope === 'global' && role.permissions.viewAll) {
            return contracts;
        }

        if (scope === 'region' && App.currentUser?.regionId) {
            const regionCompanyIds = MockData.tourCompanies
                .filter(c => c.regionId === App.currentUser.regionId)
                .map(c => c.id);
            return contracts.filter(c => regionCompanyIds.includes(c.companyId));
        }

        if (scope === 'company' && App.currentUser?.companyId) {
            return contracts.filter(c => c.companyId === App.currentUser.companyId);
        }

        return [];
    },

    // Check if can void/cancel contract
    canVoidContract(contract) {
        if (!this.can('voidBeforeStart')) return false;
        const today = Utils.getToday();
        return contract.startDate > today;
    },

    canCancelContract(contract) {
        if (!this.can('cancelBeforeStart')) return false;
        const today = Utils.getToday();
        return contract.startDate > today;
    },

    // Filter users by scope (for admin)
    filterUsersByScope(users) {
        const scope = this.getScope();

        if (scope === 'global') return users;

        if (scope === 'region' && App.currentUser?.regionId) {
            return users.filter(u => u.regionId === App.currentUser.regionId);
        }

        if (scope === 'company' && App.currentUser?.companyId) {
            return users.filter(u => u.companyId === App.currentUser.companyId);
        }

        return [];
    },

    // Mask sensitive data for observer role
    maskSensitiveData(data) {
        if (!MockData.roles[App.currentRole]?.permissions.maskSensitive) {
            return data;
        }
        return {
            ...data,
            email: '***@***.kz',
            phone: '***'
        };
    }
};

// =============================================================================
// CURRENCY TICKER
// =============================================================================

const CurrencyTicker = {
    rates: {
        USD: { rate: 475.50, change: 0.8 },
        EUR: { rate: 515.20, change: -0.3 },
        RUB: { rate: 5.12, change: 1.2 }
    },

    init() {
        this.updateDisplay();
        // Simulate rate updates every 10 seconds
        setInterval(() => this.simulateUpdate(), 10000);
    },

    simulateUpdate() {
        Object.keys(this.rates).forEach(currency => {
            // Random change between -0.5% and +0.5%
            const delta = (Math.random() - 0.5) * 0.01 * this.rates[currency].rate;
            this.rates[currency].rate = Math.round((this.rates[currency].rate + delta) * 100) / 100;
            this.rates[currency].change = Math.round((delta / this.rates[currency].rate) * 1000) / 10;
        });
        this.updateDisplay();
    },

    updateDisplay() {
        Object.entries(this.rates).forEach(([currency, data]) => {
            const rateEl = document.getElementById(`rate${currency}`);
            const changeEl = document.getElementById(`change${currency}`);

            if (rateEl) {
                rateEl.textContent = data.rate.toFixed(2);
                // Trigger pulse animation
                rateEl.classList.add('updating');
                setTimeout(() => rateEl.classList.remove('updating'), 300);
            }

            if (changeEl) {
                const isPositive = data.change >= 0;
                changeEl.textContent = `${isPositive ? '+' : ''}${data.change.toFixed(1)}%`;
                changeEl.className = `currency-change ${isPositive ? 'positive' : 'negative'}`;
            }
        });
    }
};

// =============================================================================
// TOAST NOTIFICATIONS
// =============================================================================

const Toast = {
    container: null,
    isPaused: false,

    init() {
        this.container = document.getElementById('toastContainer');
    },

    pauseAll() {
        if (this.isPaused) return;
        this.isPaused = true;

        this.container?.querySelectorAll('.toast').forEach(toast => {
            const state = toast._toastState;
            if (!state || state.removing || state.paused) return;

            clearTimeout(state.dismissId);
            state.remaining = Math.max(0, state.remaining - (Date.now() - state.startedAt));
            state.paused = true;
            toast.classList.add('paused');
        });
    },

    resumeAll() {
        if (!this.isPaused) return;
        this.isPaused = false;

        this.container?.querySelectorAll('.toast').forEach(toast => {
            const state = toast._toastState;
            if (!state || state.removing || !state.paused) return;

            state.paused = false;
            toast.classList.remove('paused');
            this.scheduleDismiss(toast, state.remaining);
        });
    },

    scheduleDismiss(toast, delayMs) {
        const state = toast._toastState;
        if (!state || state.removing) return;

        clearTimeout(state.dismissId);
        state.remaining = Math.max(0, delayMs);
        state.startedAt = Date.now();

        state.dismissId = setTimeout(() => {
            this.removeToast(toast);
        }, state.remaining);
    },

    removeToast(toast) {
        const state = toast._toastState;
        if (!state || state.removing) return;

        state.removing = true;
        clearTimeout(state.dismissId);
        toast.classList.remove('active');
        toast.classList.add('removing');

        state.removeId = setTimeout(() => {
            toast.remove();
        }, 280);
    },

    show(message, type = 'info', duration = 4000) {
        if (!this.container) return;

        const safeDuration = Math.max(1200, duration);
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.style.setProperty('--toast-duration', `${safeDuration}ms`);
        toast._toastState = {
            dismissId: null,
            removeId: null,
            startedAt: Date.now(),
            remaining: safeDuration,
            paused: false,
            removing: false
        };

        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 9 9a9 9 0 0 0-9-9"/><path d="m9 12 2 2 4-4"/></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 9 9a9 9 0 0 0-9-9"/><path d="M10 10l4 4"/><path d="M14 10l-4 4"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"/></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9h.01"/><path d="M11 12h1v4h1"/><path d="M12 3a9 9 0 1 0 9 9a9 9 0 0 0-9-9"/></svg>'
        };

        const titles = {
            success: 'Успешно',
            error: 'Ошибка',
            warning: 'Внимание',
            info: 'Информация'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <div class="toast-content">
                <div class="toast-title">${titles[type] || titles.info}</div>
                <div class="toast-message">${Utils.escapeHtml(message)}</div>
            </div>
        `;

        // Hover/focus over any toast pauses all current notifications
        toast.addEventListener('mouseenter', () => this.pauseAll());
        toast.addEventListener('mouseleave', () => this.resumeAll());
        toast.addEventListener('focusin', () => this.pauseAll());
        toast.addEventListener('focusout', () => this.resumeAll());

        this.container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('active');
        });

        // Start countdown (or wait in pause mode)
        if (this.isPaused) {
            toast._toastState.paused = true;
            toast.classList.add('paused');
        } else {
            this.scheduleDismiss(toast, safeDuration);
        }
    },

    success(message) { this.show(message, 'success'); },
    error(message) { this.show(message, 'error', 6000); },
    warning(message) { this.show(message, 'warning'); },
    info(message) { this.show(message, 'info'); }
};

// =============================================================================
// AUDIT LOG
// =============================================================================

const AuditLog = {
    add(action, objectType, objectId, details) {
        const event = {
            id: Utils.generateId('ae'),
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            userId: App.currentUser?.id || 'system',
            action,
            objectType,
            objectId,
            details
        };
        App.auditLog.unshift(event);
        this.render();
    },

    render() {
        const container = document.getElementById('auditLogContent');
        if (!container) return;

        const events = App.auditLog.slice(0, 50);

        if (events.length === 0) {
            container.innerHTML = '<div class="text-center text-secondary p-5">Журнал пуст</div>';
            return;
        }

        container.innerHTML = events.map(e => {
            const user = MockData.users.find(u => u.id === e.userId);
            return `
                <div class="integration-log-item">
                    <div class="integration-log-header">
                        <span class="font-medium">${Utils.escapeHtml(e.action)}</span>
                        <span class="integration-log-time">${e.timestamp}</span>
                    </div>
                    <div class="text-xs text-secondary">
                        ${user ? Utils.escapeHtml(user.name) : 'Система'} • 
                        ${Utils.escapeHtml(e.objectType)}: ${Utils.escapeHtml(e.objectId || '-')}
                    </div>
                    ${e.details ? `<div class="text-xs mt-2">${Utils.escapeHtml(e.details)}</div>` : ''}
                </div>
            `;
        }).join('');
    }
};

// =============================================================================
// MODAL & DRAWER MANAGEMENT
// =============================================================================

const Modal = {
    show(modalId) {
        document.getElementById('modalBackdrop')?.classList.add('active');
        document.getElementById(modalId)?.classList.add('active');
    },

    hide(modalId) {
        document.getElementById('modalBackdrop')?.classList.remove('active');
        document.getElementById(modalId)?.classList.remove('active');
    },

    confirm(title, body, onConfirm) {
        document.getElementById('confirmModalTitle').textContent = title;
        document.getElementById('confirmModalBody').innerHTML = body;

        const okBtn = document.getElementById('confirmModalOk');
        const newOkBtn = okBtn.cloneNode(true);
        okBtn.parentNode.replaceChild(newOkBtn, okBtn);
        newOkBtn.id = 'confirmModalOk';

        newOkBtn.addEventListener('click', () => {
            onConfirm();
            this.hide('confirmModal');
        });

        this.show('confirmModal');
    }
};

const Drawer = {
    toggle(drawerId) {
        const drawer = document.getElementById(drawerId);
        const backdrop = document.getElementById(drawerId.replace('Drawer', 'DrawerBackdrop'));

        drawer?.classList.toggle('active');
        backdrop?.classList.toggle('active');
    },

    open(drawerId) {
        document.getElementById(drawerId.replace('Drawer', 'DrawerBackdrop'))?.classList.add('active');
        document.getElementById(drawerId)?.classList.add('active');
    },

    close(drawerId) {
        document.getElementById(drawerId.replace('Drawer', 'DrawerBackdrop'))?.classList.remove('active');
        document.getElementById(drawerId)?.classList.remove('active');
    }
};

// =============================================================================
// THEME MANAGEMENT
// =============================================================================

const Theme = {
    init() {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const saved = localStorage.getItem('theme');

        App.theme = saved || (prefersDark ? 'dark' : 'light');
        this.apply();

        // Listen for system changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                App.theme = e.matches ? 'dark' : 'light';
                this.apply();
            }
        });
    },

    toggle() {
        App.theme = App.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', App.theme);
        this.apply();
    },

    apply() {
        document.documentElement.setAttribute('data-theme', App.theme);

        const sunIcon = document.querySelector('.sun-icon');
        const moonIcon = document.querySelector('.moon-icon');

        if (App.theme === 'dark') {
            sunIcon?.classList.add('hidden');
            moonIcon?.classList.remove('hidden');
        } else {
            sunIcon?.classList.remove('hidden');
            moonIcon?.classList.add('hidden');
        }
    }
};

// =============================================================================
// CUSTOM SELECTS (Project-native dropdowns)
// =============================================================================

const CustomSelect = {
    instances: new Map(),
    initialized: false,

    init() {
        if (this.initialized) return;
        this.initialized = true;

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-select')) {
                this.closeAll();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeAll();
        });
    },

    initWithin(root = document) {
        this.init();
        this.cleanup();
        root.querySelectorAll('select.form-select:not([data-no-custom-select])').forEach(select => {
            this.enhance(select);
        });
    },

    syncWithin(root = document) {
        root.querySelectorAll('select.form-select[data-custom-select-id]').forEach(select => {
            this.syncSelect(select);
        });
    },

    syncSelect(select) {
        const instance = this.instances.get(select);
        if (!instance) return;
        this.renderOptions(select, instance.dropdown);
        this.updateLabel(select, instance.label);
        this.updateDisabled(select, instance.trigger);
    },

    cleanup() {
        for (const [select, instance] of this.instances.entries()) {
            if (document.contains(select)) continue;
            instance.observer?.disconnect();
            this.instances.delete(select);
        }
    },

    enhance(select) {
        if (!select || this.instances.has(select)) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select';
        wrapper.setAttribute('data-custom-select-id', Utils.generateId('cselect'));

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'custom-select-trigger';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');

        const label = document.createElement('span');
        label.className = 'custom-select-trigger-label';

        const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        chevron.setAttribute('class', 'custom-select-chevron');
        chevron.setAttribute('viewBox', '0 0 24 24');
        chevron.setAttribute('fill', 'none');
        chevron.setAttribute('stroke', 'currentColor');
        chevron.setAttribute('stroke-width', '2');
        const chevronPath = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        chevronPath.setAttribute('points', '6 9 12 15 18 9');
        chevron.appendChild(chevronPath);

        const dropdown = document.createElement('div');
        dropdown.className = 'custom-select-dropdown';
        dropdown.setAttribute('role', 'listbox');
        dropdown.tabIndex = -1;

        trigger.append(label, chevron);
        wrapper.append(trigger, dropdown);
        select.insertAdjacentElement('afterend', wrapper);
        select.classList.add('custom-select-native');

        const onOptionClick = (e) => {
            const optionEl = e.target.closest('.custom-select-option');
            if (!optionEl || optionEl.classList.contains('disabled')) return;
            const value = optionEl.dataset.value;
            if (select.value !== value) {
                select.value = value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
                this.updateLabel(select, label);
            }
            this.close(wrapper, trigger);
        };

        const onTriggerClick = () => {
            if (trigger.disabled) return;
            if (wrapper.classList.contains('open')) {
                this.close(wrapper, trigger);
                return;
            }
            this.open(wrapper, trigger);
        };

        trigger.addEventListener('click', onTriggerClick);
        dropdown.addEventListener('click', onOptionClick);
        dropdown.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close(wrapper, trigger);
        });

        select.addEventListener('change', () => {
            this.updateLabel(select, label);
            this.highlightSelected(select, dropdown);
        });

        const observer = new MutationObserver(() => {
            this.syncSelect(select);
        });
        observer.observe(select, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['disabled', 'label', 'selected']
        });

        const instance = { wrapper, trigger, label, dropdown, observer };
        this.instances.set(select, instance);
        select.dataset.customSelectId = wrapper.dataset.customSelectId;
        this.syncSelect(select);
    },

    renderOptions(select, dropdown) {
        const fragments = [];
        Array.from(select.children).forEach(node => {
            if (node.tagName === 'OPTGROUP') {
                const group = document.createElement('div');
                group.className = 'custom-select-group';
                group.textContent = node.label || '';
                fragments.push(group);
                Array.from(node.children).forEach(option => fragments.push(this.createOptionElement(option, select.value)));
            } else if (node.tagName === 'OPTION') {
                fragments.push(this.createOptionElement(node, select.value));
            }
        });
        dropdown.innerHTML = '';
        fragments.forEach(item => dropdown.appendChild(item));
    },

    createOptionElement(option, selectedValue) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'custom-select-option';
        button.dataset.value = option.value;
        button.textContent = option.textContent || '';
        if (option.disabled) button.classList.add('disabled');
        if (option.value === selectedValue) button.classList.add('selected');
        return button;
    },

    updateLabel(select, label) {
        const selectedOption = select.selectedOptions[0];
        label.textContent = selectedOption?.textContent || 'Выберите...';
    },

    updateDisabled(select, trigger) {
        trigger.disabled = !!select.disabled;
    },

    highlightSelected(select, dropdown) {
        dropdown.querySelectorAll('.custom-select-option').forEach(el => {
            el.classList.toggle('selected', el.dataset.value === select.value);
        });
    },

    open(wrapper, trigger) {
        this.closeAll();
        wrapper.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
    },

    close(wrapper, trigger) {
        wrapper.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
    },

    closeAll() {
        document.querySelectorAll('.custom-select.open').forEach(wrapper => {
            const trigger = wrapper.querySelector('.custom-select-trigger');
            this.close(wrapper, trigger);
        });
    }
};

// =============================================================================
// CRM SIMULATOR (Mock API)
// =============================================================================

const CRMSimulator = {
    async activate(contract) {
        const settings = App.crmSimulator;
        const requestId = Utils.generateId('req');

        // Log request
        const logEntry = {
            id: Utils.generateId('crm'),
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            requestId,
            contractId: contract.id,
            action: 'activate',
            requestPayload: {
                externalId: contract.externalId,
                type: contract.type,
                persons: contract.persons?.length || 0,
                territories: contract.territories
            },
            responseStatus: 'PENDING',
            responsePayload: null,
            latencyMs: null
        };
        App.integrationLog.unshift(logEntry);

        // Simulate latency
        const startTime = Date.now();
        await Utils.sleep(settings.latency);

        // Check for timeout
        if (Math.random() * 100 < settings.timeoutChance) {
            logEntry.responseStatus = 'TIMEOUT';
            logEntry.responsePayload = { error: 'Integration timeout' };
            logEntry.latencyMs = Date.now() - startTime;
            return { success: false, reason: 'INTEGRATION_TIMEOUT', reasonText: MockData.reasonCodes.INTEGRATION_TIMEOUT.description };
        }

        // Determine response
        let success = true;
        let failReason = null;

        if (settings.mode === 'fail') {
            success = false;
            failReason = settings.failReason;
        } else if (settings.mode === 'auto') {
            // Auto mode: check for issues
            if (settings.amlEnabled && Math.random() < 0.1) {
                success = false;
                failReason = 'AML_HIT';
            } else if (!contract.kdpConfirmed) {
                success = false;
                failReason = 'KDP_MISSING';
            } else if (Math.random() < 0.05) {
                success = false;
                failReason = 'CRM_VALIDATION_ERROR';
            }
        }

        logEntry.latencyMs = Date.now() - startTime;

        if (success) {
            const crmId = `CRM-${100000 + Math.floor(Math.random() * 900000)}`;
            const company = MockData.tourCompanies.find(c => c.id === contract.companyId);
            const policyNumber = `${company?.prefix || 'POL'}-${contract.type === 'travel' ? 'VZR' : 'OST'}-${new Date().getFullYear()}-${String(App.contracts.length + 1).padStart(5, '0')}`;

            logEntry.responseStatus = 'OK';
            logEntry.responsePayload = {
                status: 'Active',
                crmId,
                policyNumber,
                pdfLink: `#/pdf/${contract.id}`
            };

            return {
                success: true,
                crmId,
                policyNumber,
                pdfLink: logEntry.responsePayload.pdfLink
            };
        } else {
            const reasonInfo = MockData.reasonCodes[failReason] || MockData.reasonCodes.CRM_VALIDATION_ERROR;
            logEntry.responseStatus = 'FAIL';
            logEntry.responsePayload = {
                status: 'Rejected',
                reasonCode: failReason,
                reasonText: reasonInfo.title
            };

            return {
                success: false,
                reason: failReason,
                reasonText: reasonInfo.description
            };
        }
    }
};

// Make globally available
window.App = App;
window.Utils = Utils;
window.Permissions = Permissions;
window.Toast = Toast;
window.AuditLog = AuditLog;
window.Modal = Modal;
window.Drawer = Drawer;
window.Theme = Theme;
window.CustomSelect = CustomSelect;
window.CRMSimulator = CRMSimulator;

// =============================================================================
// ROUTER
// =============================================================================

const Router = {
    routes: {
        'login': { template: 'loginPageTemplate', requiresAuth: false, title: 'Вход' },
        'dashboard': { template: 'dashboardPageTemplate', requiresAuth: true, title: 'Сводка' },
        'new-contract': { template: 'newContractPageTemplate', requiresAuth: true, title: 'Оформление', permission: 'create' },
        'contracts': { template: 'contractsPageTemplate', requiresAuth: true, title: 'Договоры' },
        'reports': { template: 'reportsPageTemplate', requiresAuth: true, title: 'Отчёты', permission: 'reports' },
        'admin': { template: 'adminPageTemplate', requiresAuth: true, title: 'Админ', permission: 'adminUsers', anyPermissions: ['adminUsers', 'adminBlanks', 'adminSettings'] },
        'test-lab': { template: 'testLabPageTemplate', requiresAuth: true, title: 'Test Lab' }
    },

    canAccessRoute(routeName) {
        const route = this.routes[routeName];
        if (!route) return false;

        if (route.requiresAuth && !App.currentUser) return false;

        if (Array.isArray(route.anyPermissions) && route.anyPermissions.length > 0) {
            return route.anyPermissions.some(permission => Permissions.can(permission));
        }

        if (route.permission) {
            return Permissions.can(route.permission);
        }

        return true;
    },

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    },

    navigate(route) {
        window.location.hash = `#/${route}`;
    },

    handleRoute() {
        const hash = window.location.hash.slice(2) || 'login';
        const route = this.routes[hash];

        if (!route) {
            this.navigate('dashboard');
            return;
        }

        if (route.requiresAuth && !App.currentUser) {
            this.navigate('login');
            return;
        }

        if (!this.canAccessRoute(hash)) {
            Toast.error('Нет доступа к этому разделу');
            this.navigate('dashboard');
            return;
        }

        App.currentRoute = hash;
        this.render(hash, route);
        this.updateNav(hash);
    },

    render(routeName, route) {
        const template = document.getElementById(route.template);
        const main = document.getElementById('mainContent');
        const sidebar = document.getElementById('sidebar');
        const navbar = document.getElementById('navbar');

        if (!template || !main) return;

        main.innerHTML = '';
        main.appendChild(template.content.cloneNode(true));
        this.applyPageTransition(main.firstElementChild);

        // Show/hide sidebar and navbar based on route
        if (routeName === 'login') {
            sidebar?.classList.add('hidden');
            navbar?.classList.add('hidden');
            main.classList.add('no-sidebar');
        } else {
            sidebar?.classList.remove('hidden');
            navbar?.classList.remove('hidden');
            main.classList.remove('no-sidebar');
        }

        // Initialize page-specific logic
        Pages[routeName]?.init?.();
        CustomSelect.initWithin(main);
    },

    applyPageTransition(pageRoot) {
        if (!pageRoot) return;
        pageRoot.classList.remove('page-transition-enter');
        // Force reflow to reliably restart animation on every route change.
        void pageRoot.offsetWidth;
        pageRoot.classList.add('page-transition-enter');
    },

    updateNav(current) {
        document.querySelectorAll('[data-nav]').forEach(link => {
            const routeName = link.dataset.nav;
            const isVisible = this.canAccessRoute(routeName);
            link.classList.toggle('hidden', !isVisible);
            link.classList.toggle('active', isVisible && routeName === current);
        });
    }
};

// =============================================================================
// ROLE SIMULATOR
// =============================================================================

const RoleSimulator = {
    init() {
        this.render();
        this.bindEvents();
        this.updateUI();
    },

    render() {
        const dropdown = document.getElementById('roleDropdown');
        if (!dropdown) return;

        dropdown.innerHTML = Object.entries(MockData.roles).map(([id, role]) => `
            <button class="role-option ${App.currentRole === id ? 'active' : ''}" data-role="${id}">
                <div class="role-option-name">${Utils.escapeHtml(role.name)}</div>
                <div class="role-option-desc">${Utils.escapeHtml(role.description)}</div>
            </button>
        `).join('');
    },

    bindEvents() {
        const trigger = document.getElementById('roleTrigger');
        const dropdown = document.getElementById('roleDropdown');
        const simulator = document.getElementById('roleSimulator');

        trigger?.addEventListener('click', () => {
            const isActive = dropdown?.classList.toggle('active');
            simulator?.classList.toggle('active', isActive);
            trigger.setAttribute('aria-expanded', isActive);
        });

        dropdown?.addEventListener('click', (e) => {
            const option = e.target.closest('.role-option');
            if (option) {
                this.setRole(option.dataset.role);
                dropdown.classList.remove('active');
                simulator?.classList.remove('active');
            }
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.role-simulator')) {
                dropdown?.classList.remove('active');
                simulator?.classList.remove('active');
            }
        });
    },

    setRole(roleId) {
        App.currentRole = roleId;

        // Find a matching user for this role
        const user = MockData.users.find(u => u.role === roleId);
        if (user) {
            App.currentUser = user;
        }

        this.updateUI();
        Router.handleRoute(); // Re-render current page with new permissions

        AuditLog.add('role_switch', 'role', roleId, `Переключение на роль: ${MockData.roles[roleId].name}`);
        Toast.info(`Роль изменена: ${MockData.roles[roleId].name}`);
    },

    updateUI() {
        const role = MockData.roles[App.currentRole];
        if (!role) return;

        // Update trigger button
        document.getElementById('currentRoleName').textContent = role.name.split(' ')[0];

        // Update role info in sidebar
        document.getElementById('roleInfoName').textContent = role.name;
        document.getElementById('roleInfoDesc').textContent = role.description;
        document.getElementById('roleInfoScope').textContent = `Scope: ${role.scope}`;

        // Update dropdown active state
        document.querySelectorAll('.role-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.role === App.currentRole);
        });

        // Update nav visibility
        Router.updateNav(App.currentRoute);
    }
};

window.Router = Router;
window.RoleSimulator = RoleSimulator;

// =============================================================================
// PAGES - Page-specific initialization and logic
// =============================================================================

const Pages = {
    // LOGIN PAGE
    'login': {
        init() {
            const loginBrandmark = document.getElementById('loginBrandmark');
            const navBrandmark = document.querySelector('#navbar .brandmark');
            if (loginBrandmark && navBrandmark) {
                loginBrandmark.innerHTML = navBrandmark.innerHTML;
            }

            const emailInput = document.getElementById('loginEmail');
            const passwordInput = document.getElementById('loginPassword');
            const emailPopover = document.getElementById('loginEmailPopover');
            const passwordPopover = document.getElementById('loginPasswordPopover');

            const setFieldMessage = (input, popover, message = '') => {
                if (!input || !popover) return;
                popover.textContent = message;
                const hasMessage = Boolean(message);
                popover.classList.toggle('visible', hasMessage);
                input.classList.toggle('error', hasMessage);
            };

            const validateEmail = () => {
                const value = (emailInput?.value || '').trim();
                // Email is optional for demo login flow; validate only if user entered it.
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    setFieldMessage(emailInput, emailPopover, 'Формат email некорректный');
                    return false;
                }
                setFieldMessage(emailInput, emailPopover, '');
                return true;
            };

            const validatePassword = () => {
                // Password is optional for demo login flow.
                setFieldMessage(passwordInput, passwordPopover, '');
                return true;
            };

            emailInput?.addEventListener('blur', validateEmail);
            emailInput?.addEventListener('input', () => {
                if (emailPopover?.classList.contains('visible')) validateEmail();
            });
            passwordInput?.addEventListener('blur', validatePassword);
            passwordInput?.addEventListener('input', () => {
                if (passwordPopover?.classList.contains('visible')) validatePassword();
            });

            document.getElementById('loginForm')?.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = (emailInput?.value || '').trim();
                validateEmail();
                validatePassword();

                // Password is ignored; default login is always superadmin.
                let user = MockData.users.find(u => u.role === 'owner');
                if (!user) return;

                if (user) {
                    App.currentUser = user;
                    App.currentRole = user.role;
                    RoleSimulator.updateUI();
                    AuditLog.add('login', 'session', Utils.generateId('sess'), `Вход пользователя ${user.name}${email ? ` (email: ${email})` : ''}`);
                    Toast.success(`Добро пожаловать, ${user.name}!`);
                    Router.navigate('dashboard');
                }
            });
        }
    },

    // DASHBOARD PAGE
    'dashboard': {
        init() {
            const contracts = Permissions.filterByScope(App.contracts);

            // Update stats
            const active = contracts.filter(c => c.status === 'active').length;
            const pending = contracts.filter(c => c.status === 'pending').length;
            const draft = contracts.filter(c => c.status === 'draft').length;
            const totalPremium = contracts.filter(c => c.status === 'active').reduce((sum, c) => sum + (c.premium || 0), 0);

            document.getElementById('statActiveContracts').textContent = active;
            document.getElementById('statPendingContracts').textContent = pending;
            document.getElementById('statDraftContracts').textContent = draft;
            document.getElementById('statTotalPremium').textContent = Utils.formatCurrency(totalPremium);

            // Render recent contracts
            const recent = contracts.slice(0, 5);
            const tbody = document.getElementById('recentContractsTable');

            tbody.innerHTML = recent.map(c => {
                const statusInfo = MockData.contractStatuses[c.status];
                const person = c.persons?.[0];
                return `
                    <tr>
                        <td><span class="font-medium">${c.policyNumber || c.id}</span></td>
                        <td>${Utils.getProductLabel(c.type)}</td>
                        <td>${person ? `${person.lastName} ${person.firstName}` : '-'}</td>
                        <td>${Utils.formatDate(c.startDate)} - ${Utils.formatDate(c.endDate)}</td>
                        <td><span class="status-badge" style="color: ${statusInfo.color}; background: ${statusInfo.color}15">${statusInfo.name}</span></td>
                        <td>${Utils.formatCurrency(c.premium || 0)}</td>
                    </tr>
                `;
            }).join('');
        }
    },

    // CONTRACTS PAGE
    'contracts': {
        init() {
            this.populateProductFilter();
            this.render();
            this.bindEvents();

            // Hide create button for observer
            if (!Permissions.can('create')) {
                document.getElementById('newContractBtn')?.classList.add('hidden');
            }
        },

        populateProductFilter() {
            const typeSelect = document.getElementById('contractTypeFilter');
            if (!typeSelect) return;

            typeSelect.innerHTML = '<option value="">Все</option>' +
                (MockData.productCatalog || []).map(product =>
                    `<option value="${product.id}">${product.shortName || product.code || product.name}</option>`
                ).join('');
        },

        render(filters = {}) {
            let contracts = Permissions.filterByScope(App.contracts);

            // Apply filters
            if (filters.search) {
                const q = filters.search.toLowerCase();
                contracts = contracts.filter(c =>
                    (c.policyNumber || '').toLowerCase().includes(q) ||
                    (c.id || '').toLowerCase().includes(q) ||
                    (c.corporateClientCompany || '').toLowerCase().includes(q) ||
                    (c.corporateAlliance ? 'альянс' : '').includes(q) ||
                    c.persons?.some(p =>
                        p.lastName?.toLowerCase().includes(q) ||
                        p.firstName?.toLowerCase().includes(q) ||
                        p.iin?.includes(q)
                    )
                );
            }
            if (filters.status) contracts = contracts.filter(c => c.status === filters.status);
            if (filters.type) contracts = contracts.filter(c => c.type === filters.type);
            if (filters.dateFrom) contracts = contracts.filter(c => c.createdAt >= filters.dateFrom);
            if (filters.dateTo) contracts = contracts.filter(c => c.createdAt <= filters.dateTo);

            const tbody = document.getElementById('contractsTableBody');
            const empty = document.getElementById('contractsEmptyState');

            if (contracts.length === 0) {
                tbody.innerHTML = '';
                empty?.classList.remove('hidden');
                return;
            }

            empty?.classList.add('hidden');

            tbody.innerHTML = contracts.map(c => {
                const statusInfo = MockData.contractStatuses[c.status];
                const person = c.persons?.[0];
                const canVoid = Permissions.canVoidContract(c) && c.status === 'active';
                const canCancel = Permissions.canCancelContract(c) && c.status === 'active';

                return `
                    <tr>
                        <td>
                            <div class="font-medium">${c.policyNumber || c.externalId || c.id}</div>
                            <div class="text-xs text-tertiary">${c.id}</div>
                        </td>
                        <td>
                            <span class="badge ${Utils.isTravelProduct(c.type) ? 'badge-primary' : 'badge-info'}">${Utils.getProductLabel(c.type)}</span>
                            ${c.corporateAlliance ? '<span class="badge badge-warning" style="margin-left: 6px;">К Альянс</span>' : ''}
                        </td>
                        <td>${person ? `${person.lastName} ${person.firstName}` : '-'}</td>
                        <td>${c.territories?.map(t => MockData.countries.find(ct => ct.code === t)?.name || t).join(', ') || '-'}</td>
                        <td>${Utils.formatDate(c.startDate)} - ${Utils.formatDate(c.endDate)}</td>
                        <td><span class="status-badge" style="color: ${statusInfo.color}; background: ${statusInfo.color}15">${statusInfo.name}</span></td>
                        <td>${Utils.formatCurrency(c.premium || 0)}</td>
                        <td>
                            <div class="flex gap-2">
                                ${c.status === 'active' ? `<button class="btn btn-ghost btn-sm btn-icon table-action-btn" onclick="Pages['contracts'].downloadPdf('${c.id}')" title="Скачать PDF" aria-label="Скачать PDF">${Utils.getSystemIcon('download', { size: 16 })}</button>` : ''}
                                ${canVoid ? `<button class="btn btn-ghost btn-sm btn-icon table-action-btn" onclick="Pages['contracts'].voidContract('${c.id}')" title="Испортить" aria-label="Испортить">${Utils.getSystemIcon('xmark-circle', { size: 16 })}</button>` : ''}
                                ${canCancel ? `<button class="btn btn-ghost btn-sm btn-icon table-action-btn" onclick="Pages['contracts'].cancelContract('${c.id}')" title="Расторгнуть" aria-label="Расторгнуть">${Utils.getSystemIcon('nosign', { size: 16 })}</button>` : ''}
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        },

        bindEvents() {
            document.getElementById('contractFilterBtn')?.addEventListener('click', () => {
                this.render({
                    search: document.getElementById('contractSearchInput')?.value,
                    status: document.getElementById('contractStatusFilter')?.value,
                    type: document.getElementById('contractTypeFilter')?.value,
                    dateFrom: document.getElementById('contractDateFrom')?.value,
                    dateTo: document.getElementById('contractDateTo')?.value
                });
            });

            // Live search
            document.getElementById('contractSearchInput')?.addEventListener('input', Utils.debounce((e) => {
                this.render({ search: e.target.value });
            }, 300));
        },

        downloadPdf(contractId) {
            Toast.success('PDF загружен (mock)');
            AuditLog.add('download_pdf', 'contract', contractId, 'Скачивание полиса');
        },

        voidContract(contractId) {
            const contract = App.contracts.find(c => c.id === contractId);
            if (!contract) return;

            if (contract.startDate <= Utils.getToday()) {
                Toast.error('Нельзя испортить договор: период страхования уже начался');
                return;
            }

            Modal.confirm('Испортить договор', `Вы уверены, что хотите пометить договор ${contract.policyNumber || contractId} как испорченный?`, () => {
                contract.status = 'voided';
                contract.voidedAt = Utils.getToday();
                AuditLog.add('void_contract', 'contract', contractId, 'Договор помечен как испорченный');
                Toast.warning('Договор помечен как испорченный');
                this.render();
            });
        },

        cancelContract(contractId) {
            const contract = App.contracts.find(c => c.id === contractId);
            if (!contract) return;

            if (contract.startDate <= Utils.getToday()) {
                Toast.error('Нельзя расторгнуть: период страхования уже начался');
                return;
            }

            Modal.confirm('Расторгнуть договор', `Вы уверены, что хотите расторгнуть договор ${contract.policyNumber || contractId}?`, () => {
                contract.status = 'cancelled';
                contract.cancelledAt = Utils.getToday();
                contract.cancellationReason = 'Расторгнут по требованию';
                AuditLog.add('cancel_contract', 'contract', contractId, 'Договор расторгнут');
                Toast.warning('Договор расторгнут');
                this.render();
            });
        }
    },

    // NEW CONTRACT PAGE
    'new-contract': {
        init() {
            this.resetForm();
            this.renderPersons();
            this.renderProductPicker();
            this.populateSelects();
            this.applyProductLayout({ immediate: true });
            this.bindEvents();
            this.updateDaysFromDates();
            this.updateReview();
        },

        getProductOptions() {
            const company = Permissions.getCurrentCompany();
            const catalog = (MockData.productCatalog && MockData.productCatalog.length > 0)
                ? MockData.productCatalog
                : [
                    { id: 'travel', code: 'ВЗР', shortName: 'ВЗР', icon: '✈︎', name: 'Выезжающие за рубеж', description: '', audience: '', layout: 'travel', defaultAmount: 30000, theme: 'ocean', recommended: true },
                    { id: 'mandatory', code: 'ОСТ', shortName: 'ОСТ', icon: '🛡', name: 'Обязательное страхование туриста', description: '', audience: '', layout: 'basic', defaultAmount: 30000, theme: 'sunset', recommended: false }
                ];

            return catalog.map(product => ({
                ...product,
                available: !company || company.generalContracts.some(gc => gc.product === product.id)
            }));
        },

        getDefaultProduct() {
            const productOptions = this.getProductOptions();
            return productOptions.find(p => p.available && p.recommended)
                || productOptions.find(p => p.available)
                || productOptions[0]
                || { id: 'travel', shortName: 'ВЗР', defaultAmount: 30000, layout: 'travel', available: true };
        },

        renderProductPicker() {
            const picker = document.getElementById('productPicker');
            if (!picker) return;

            const productOptions = this.getProductOptions();
            const activeProduct = productOptions.find(p => p.id === App.contractForm.productType && p.available) || this.getDefaultProduct();
            App.contractForm.productType = activeProduct.id;

            picker.innerHTML = productOptions.map(product => `
                <button
                    type="button"
                    class="product-option theme-${product.theme || 'ocean'} ${product.id === App.contractForm.productType ? 'active' : ''}"
                    data-product-id="${product.id}"
                    role="option"
                    aria-selected="${product.id === App.contractForm.productType ? 'true' : 'false'}"
                    ${product.available ? '' : 'disabled'}>
                    <div class="product-option-icon">${Utils.escapeHtml(product.icon || '🧩')}</div>
                    <div class="product-option-content">
                        <div class="product-option-head">
                            <span class="product-option-code">${product.code || product.shortName || product.id}</span>
                        </div>
                        <div class="product-option-name">${Utils.escapeHtml(product.name || product.id)}</div>
                    </div>
                    <div class="product-option-check" aria-hidden="true">✓</div>
                </button>
            `).join('');

            const hint = document.getElementById('productPickerHint');
            if (hint) {
                hint.textContent = activeProduct.available
                    ? `Выбран продукт: ${activeProduct.code}`
                    : 'Для выбранного продукта нет доступного генерального договора';
            }
        },

        applyProductLayout(options = {}) {
            const showTravelFields = Utils.isTravelProduct(App.contractForm.productType);
            const vzrFields = document.getElementById('vzrFields');
            const multiTripHint = document.getElementById('multiTripHint');
            const sportTypeGroup = document.getElementById('sportTypeGroup');
            if (!vzrFields) return;

            if (options.immediate) {
                vzrFields.classList.toggle('hidden', !showTravelFields);
                multiTripHint?.classList.toggle('hidden', !showTravelFields || !String(App.contractForm.program).startsWith('multi_'));
                sportTypeGroup?.classList.toggle('hidden', !(showTravelFields && App.contractForm.purpose === 'sport'));
                return;
            }

            vzrFields.classList.add('switching');
            window.setTimeout(() => {
                vzrFields.classList.toggle('hidden', !showTravelFields);
                multiTripHint?.classList.toggle('hidden', !showTravelFields || !String(App.contractForm.program).startsWith('multi_'));
                sportTypeGroup?.classList.toggle('hidden', !(showTravelFields && App.contractForm.purpose === 'sport'));
                window.requestAnimationFrame(() => {
                    vzrFields.classList.remove('switching');
                });
            }, 90);
        },

        selectProduct(productId) {
            const product = this.getProductOptions().find(item => item.id === productId);
            if (!product || !product.available) {
                Toast.warning('Этот продукт пока недоступен для текущей компании');
                return;
            }

            if (App.contractForm.productType === productId) return;

            App.contractForm.productType = productId;
            App.contractForm.amount = product.defaultAmount || 30000;
            App.contractForm.amountCurrency = 'USD';
            App.contractForm.generalContractId = null;

            this.renderProductPicker();
            this.applyProductLayout();
            this.populateSelects();
            this.updateReview();

            AuditLog.add('select_product', 'product', productId, `Выбран продукт: ${product.code}`);
        },

        resetForm() {
            const defaultProduct = this.getDefaultProduct();
            const tomorrow = Utils.getTomorrow();
            const defaultEnd = Utils.addDays(tomorrow, 6);
            App.contractForm = {
                id: Utils.generateId('cnt'),
                externalId: Utils.generateId('ext'),
                productType: defaultProduct.id,
                generalContractId: null,
                blankType: 'electronic',
                paperBlankId: null,
                personResidencyMode: 'resident',
                territories: [],
                program: 'base',
                variant: 'standard',
                purpose: 'tourism',
                sportType: '',
                amount: defaultProduct.defaultAmount || 30000,
                amountCurrency: 'USD',
                startDate: tomorrow,
                endDate: defaultEnd,
                persons: [],
                corporateClientCompany: '',
                corporateDiscountPercent: 0,
                corporateDmsNumber: '',
                corporateCardNumber: '',
                corporateAlliance: false,
                nonresidentConsentFile: null,
                kdpConfirmed: false,
                issueDate: Utils.getToday()
            };
            const startDateInput = document.getElementById('startDate');
            const endDateInput = document.getElementById('endDate');
            const minStartDate = Utils.getTomorrow();

            if (startDateInput) {
                startDateInput.min = minStartDate;
                startDateInput.value = tomorrow;
            }

            if (endDateInput) {
                endDateInput.min = tomorrow;
                endDateInput.value = defaultEnd;
            }

            document.getElementById('daysCount').value = 7;
            document.getElementById('territoryHint').textContent = '';
            const countInput = document.getElementById('manualPersonsCountInput');
            if (countInput) {
                countInput.max = String(App.settings.maxPersons || 5);
            }
            const ageGroupSelect = document.getElementById('calculatorAgeGroupSelect');
            if (ageGroupSelect) ageGroupSelect.value = 'u1';
            this.setPersonResidencyMode('resident');
            this.iinLookupInProgress = false;
        },

        populateSelects() {
            const company = Permissions.getCurrentCompany();

            // General contracts
            const gcSelect = document.getElementById('generalContractSelect');
            if (gcSelect) {
                const contracts = company?.generalContracts?.filter(gc =>
                    gc.product === App.contractForm.productType
                ) || [];

                if (contracts.length === 0) {
                    gcSelect.disabled = true;
                    gcSelect.innerHTML = '<option value="">Нет доступного генерального договора для выбранного продукта</option>';
                    App.contractForm.generalContractId = null;
                } else {
                    gcSelect.disabled = false;
                    gcSelect.innerHTML = contracts.map(gc =>
                        `<option value="${gc.id}">${gc.number} (${Utils.getProductLabel(gc.product)})</option>`
                    ).join('');

                    if (!contracts.some(gc => gc.id === App.contractForm.generalContractId)) {
                        App.contractForm.generalContractId = contracts[0]?.id || null;
                    }

                    gcSelect.value = App.contractForm.generalContractId || '';
                }
            }

            // Paper blanks
            const pbSelect = document.getElementById('paperBlankSelect');
            if (pbSelect && company) {
                const blanks = company.paperBlanks.filter(b => b.status === 'free');
                pbSelect.innerHTML = blanks.map(b =>
                    `<option value="${b.id}">Серия ${b.series} № ${b.number}</option>`
                ).join('');
                if (blanks.length > 0 && !blanks.some(b => b.id === App.contractForm.paperBlankId)) {
                    App.contractForm.paperBlankId = blanks[0].id;
                }
                pbSelect.value = App.contractForm.paperBlankId || blanks[0]?.id || '';
            }

            const blankTypeSelect = document.getElementById('blankTypeSelect');
            if (blankTypeSelect) {
                blankTypeSelect.value = App.contractForm.blankType || 'electronic';
                document.getElementById('paperBlankGroup')?.classList.toggle('hidden', blankTypeSelect.value !== 'paper');
            }

            // Countries
            const territorySelect = document.getElementById('territorySelect');
            if (territorySelect) {
                const popular = MockData.countries.filter(c => c.popular);
                const other = MockData.countries.filter(c => !c.popular);
                territorySelect.innerHTML = `
                    <option value="">Выберите страну...</option>
                    <optgroup label="Популярные">
                        ${popular.map(c => `<option value="${c.code}">${c.name}</option>`).join('')}
                    </optgroup>
                    <optgroup label="Все страны">
                        ${other.map(c => `<option value="${c.code}">${c.name}</option>`).join('')}
                    </optgroup>
                `;
            }

            // Programs
            const programSelect = document.getElementById('programSelect');
            if (programSelect) {
                programSelect.innerHTML = MockData.programs.map(p =>
                    `<option value="${p.id}">${p.name}</option>`
                ).join('');
                if (!MockData.programs.some(p => p.id === App.contractForm.program)) {
                    App.contractForm.program = MockData.programs[0]?.id || 'base';
                }
                programSelect.value = App.contractForm.program;
            }

            // Variants
            const variantSelect = document.getElementById('variantSelect');
            if (variantSelect) {
                const variants = MockData.programVariants.filter(v => ['standard', 'plus'].includes(v.id));
                variantSelect.innerHTML = variants.map(v =>
                    `<option value="${v.id}">${v.name}</option>`
                ).join('');
                if (!variants.some(v => v.id === App.contractForm.variant)) {
                    App.contractForm.variant = variants[0]?.id || 'standard';
                }
                variantSelect.value = App.contractForm.variant;
            }

            // Purpose
            const purposeSelect = document.getElementById('purposeSelect');
            if (purposeSelect) {
                purposeSelect.innerHTML = MockData.purposeOfTrip.map(p =>
                    `<option value="${p.id}">${p.name}</option>`
                ).join('');
                if (!MockData.purposeOfTrip.some(p => p.id === App.contractForm.purpose)) {
                    App.contractForm.purpose = 'tourism';
                }
                purposeSelect.value = App.contractForm.purpose;
            }

            const sportTypeSelect = document.getElementById('sportTypeSelect');
            if (sportTypeSelect) {
                sportTypeSelect.innerHTML = MockData.sportTypes.map(s =>
                    `<option value="${s.id}">${s.name}</option>`
                ).join('');
                if (!MockData.sportTypes.some(s => s.id === App.contractForm.sportType)) {
                    App.contractForm.sportType = MockData.sportTypes[0]?.id || '';
                }
                sportTypeSelect.value = App.contractForm.sportType;
            }

            // Amount
            const amountSelect = document.getElementById('amountSelect');
            if (amountSelect) {
                amountSelect.innerHTML = MockData.insuranceAmounts.map(a =>
                    `<option value="${a.value}" data-currency="${a.currency}">${a.label}</option>`
                ).join('');
                const match = Array.from(amountSelect.options).find(option =>
                    Number(option.value) === Number(App.contractForm.amount) &&
                    option.dataset.currency === (App.contractForm.amountCurrency || 'USD')
                );
                if (match) {
                    match.selected = true;
                } else {
                    amountSelect.value = String(App.contractForm.amount || 30000);
                }
            }

            const selectedGeneralContract = company?.generalContracts?.find(gc => gc.id === App.contractForm.generalContractId) || null;
            const corporateEnabled = !!(selectedGeneralContract?.corporateBenefitsEnabled && Utils.isTravelProduct(App.contractForm.productType));
            if (!corporateEnabled) {
                App.contractForm.corporateClientCompany = '';
                App.contractForm.corporateDiscountPercent = 0;
                App.contractForm.corporateDmsNumber = '';
                App.contractForm.corporateCardNumber = '';
                App.contractForm.corporateAlliance = false;
            }
            document.getElementById('corporateDiscountGroup')?.classList.toggle('hidden', !corporateEnabled);
            document.getElementById('sportTypeGroup')?.classList.toggle('hidden', !(App.contractForm.purpose === 'sport' && Utils.isTravelProduct(App.contractForm.productType)));

            const corpClientInput = document.getElementById('corpClientCompanyInput');
            if (corpClientInput) {
                corpClientInput.value = App.contractForm.corporateClientCompany || '';
                corpClientInput.disabled = false;
                corpClientInput.readOnly = false;
            }
            const corpDiscountInput = document.getElementById('corpDiscountInput');
            if (corpDiscountInput) {
                corpDiscountInput.value = Number(App.contractForm.corporateDiscountPercent || 0);
                corpDiscountInput.disabled = false;
                corpDiscountInput.readOnly = false;
            }
            const corpDmsInput = document.getElementById('corpDmsContractInput');
            if (corpDmsInput) {
                corpDmsInput.value = App.contractForm.corporateDmsNumber || '';
                corpDmsInput.disabled = false;
                corpDmsInput.readOnly = false;
            }
            const corpCardInput = document.getElementById('corpCardInput');
            if (corpCardInput) {
                corpCardInput.value = App.contractForm.corporateCardNumber || '';
                corpCardInput.disabled = false;
                corpCardInput.readOnly = false;
            }
            const corpAllianceCheckbox = document.getElementById('corpAllianceCheckbox');
            if (corpAllianceCheckbox) {
                corpAllianceCheckbox.checked = !!App.contractForm.corporateAlliance;
                corpAllianceCheckbox.disabled = false;
            }

            CustomSelect.syncWithin(document.getElementById('mainContent'));
        },

        bindEvents() {
            // Product selection
            document.getElementById('productPicker')?.addEventListener('click', (e) => {
                const option = e.target.closest('.product-option');
                if (!option) return;
                this.selectProduct(option.dataset.productId);
            });

            // Blank type change
            document.getElementById('blankTypeSelect')?.addEventListener('change', (e) => {
                App.contractForm.blankType = e.target.value;
                document.getElementById('paperBlankGroup')?.classList.toggle('hidden', e.target.value !== 'paper');
                this.updateReview();
            });

            document.getElementById('paperBlankSelect')?.addEventListener('change', (e) => {
                App.contractForm.paperBlankId = e.target.value || null;
                this.updateReview();
            });

            // Territory selection
            document.getElementById('territorySelect')?.addEventListener('change', (e) => {
                if (e.target.value && App.contractForm.territories.length < App.settings.maxTerritories) {
                    if (!App.contractForm.territories.includes(e.target.value)) {
                        App.contractForm.territories.push(e.target.value);
                        this.renderTerritories();
                        this.updateReview();
                    }
                    e.target.value = '';
                    CustomSelect.syncSelect(e.target);
                } else if (App.contractForm.territories.length >= App.settings.maxTerritories) {
                    Toast.warning(`Максимум ${App.settings.maxTerritories} страны`);
                    e.target.value = '';
                    CustomSelect.syncSelect(e.target);
                }
            });

            // Program change
            document.getElementById('programSelect')?.addEventListener('change', (e) => {
                App.contractForm.program = e.target.value;
                const isMulti = e.target.value.startsWith('multi_');
                const hintBlock = document.getElementById('multiTripHint');
                hintBlock?.classList.toggle('hidden', !isMulti);
                if (isMulti) {
                    const selectedProgram = MockData.programs.find(p => p.id === e.target.value);
                    const badge = hintBlock?.querySelector('.badge');
                    if (badge) badge.textContent = selectedProgram?.hint || 'Многократные поездки в течение года';
                }
                this.updateReview();
            });

            document.getElementById('variantSelect')?.addEventListener('change', (e) => {
                App.contractForm.variant = e.target.value;
                this.updateReview();
            });

            document.getElementById('purposeSelect')?.addEventListener('change', (e) => {
                App.contractForm.purpose = e.target.value;
                const isSport = App.contractForm.purpose === 'sport' && Utils.isTravelProduct(App.contractForm.productType);
                if (isSport && !App.contractForm.sportType) {
                    App.contractForm.sportType = MockData.sportTypes[0]?.id || '';
                    const sportTypeSelect = document.getElementById('sportTypeSelect');
                    if (sportTypeSelect) sportTypeSelect.value = App.contractForm.sportType;
                }
                document.getElementById('sportTypeGroup')?.classList.toggle('hidden', !isSport);
                CustomSelect.syncSelect(document.getElementById('sportTypeSelect'));
                this.updateReview();
            });

            document.getElementById('amountSelect')?.addEventListener('change', (e) => {
                const selected = e.target.selectedOptions[0];
                App.contractForm.amount = Number(e.target.value);
                App.contractForm.amountCurrency = selected?.dataset.currency || 'USD';
                this.updateReview();
            });

            document.getElementById('generalContractSelect')?.addEventListener('change', (e) => {
                App.contractForm.generalContractId = e.target.value || null;
                this.populateSelects();
                this.updateReview();
            });

            // Dates
            document.getElementById('startDate')?.addEventListener('change', (e) => {
                App.contractForm.startDate = this.normalizeStartDate(e.target.value);
                e.target.value = App.contractForm.startDate;
                this.updateDaysFromDates();
                this.updateReview();
            });

            document.getElementById('endDate')?.addEventListener('change', (e) => {
                App.contractForm.endDate = e.target.value;
                this.updateDaysFromDates();
                this.updateReview();
            });

            document.getElementById('daysCount')?.addEventListener('input', (e) => {
                const days = Number(e.target.value);
                if (Number.isNaN(days) || days < 1) return;
                this.updateEndDateFromDays(days);
                this.updateReview();
            });

            // KDP + IIN flow
            document.getElementById('personModeResidentBtn')?.addEventListener('click', () => this.setPersonResidencyMode('resident'));
            document.getElementById('personModeNonresidentBtn')?.addEventListener('click', () => this.setPersonResidencyMode('nonresident'));
            document.getElementById('requestKdpBtn')?.addEventListener('click', () => this.lookupIIN());
            document.getElementById('iinInput')?.addEventListener('input', (e) => {
                e.target.value = String(e.target.value || '').replace(/\D/g, '').slice(0, 12);
                if (e.target.value.length === 12) {
                    this.lookupIIN({ silentValidation: true });
                }
            });
            document.getElementById('iinInput')?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.lookupIIN();
                }
            });

            document.getElementById('addManualPersonBtn')?.addEventListener('click', () => this.addManualPerson());
            document.getElementById('addNonresidentBtn')?.addEventListener('click', () => this.addNonresident());
            document.getElementById('addManualPersonsBatchBtn')?.addEventListener('click', () => this.addManualPersonsBatch());
            document.getElementById('downloadNonresidentConsentBtn')?.addEventListener('click', () => this.downloadNonresidentConsentForm());
            document.getElementById('nonresidentConsentFileInput')?.addEventListener('change', (e) => this.handleNonresidentConsentUpload(e));

            document.getElementById('sportTypeSelect')?.addEventListener('change', (e) => {
                App.contractForm.sportType = e.target.value || '';
                this.updateReview();
            });

            document.getElementById('corpClientCompanyInput')?.addEventListener('input', (e) => {
                App.contractForm.corporateClientCompany = e.target.value || '';
                this.updateReview();
            });
            document.getElementById('corpDiscountInput')?.addEventListener('input', (e) => {
                const discount = Number(e.target.value);
                App.contractForm.corporateDiscountPercent = Number.isFinite(discount) ? Math.max(0, Math.min(100, discount)) : 0;
                this.updateReview();
            });
            document.getElementById('corpDmsContractInput')?.addEventListener('input', (e) => {
                App.contractForm.corporateDmsNumber = e.target.value || '';
                this.updateReview();
            });
            document.getElementById('corpCardInput')?.addEventListener('input', (e) => {
                App.contractForm.corporateCardNumber = e.target.value || '';
                this.updateReview();
            });
            document.getElementById('corpAllianceCheckbox')?.addEventListener('change', (e) => {
                App.contractForm.corporateAlliance = !!e.target.checked;
                this.updateReview();
            });

            // Save draft
            document.getElementById('saveDraftBtn')?.addEventListener('click', () => this.saveDraft());

            // Activate
            document.getElementById('activateBtn')?.addEventListener('click', () => this.activate());
        },

        renderTerritories() {
            const container = document.getElementById('territoriesContainer');
            container.innerHTML = App.contractForm.territories.map(code => {
                const country = MockData.countries.find(c => c.code === code);
                return `
                    <span class="territory-chip">
                        <span class="territory-chip-label">${country?.name || code}</span>
                        <button class="tag-remove" onclick="Pages['new-contract'].removeTerritory('${code}')" aria-label="Удалить">${Utils.getSystemIcon('xmark', { size: 12, strokeWidth: 2.1 })}</button>
                    </span>
                `;
            }).join('');
            document.getElementById('territoryHint').textContent = '';
            this.applyCountryRules();
        },

        removeTerritory(code) {
            App.contractForm.territories = App.contractForm.territories.filter(t => t !== code);
            this.renderTerritories();
            this.updateReview();
        },

        normalizeStartDate(value) {
            const minStart = Utils.getTomorrow();
            if (value && value < minStart) {
                Toast.warning('Дата начала автоматически сдвинута на следующий день от даты выписки');
                return minStart;
            }
            return value;
        },

        updateDaysFromDates() {
            const days = Utils.daysBetween(App.contractForm.startDate, App.contractForm.endDate);
            document.getElementById('daysCount').value = days;
            const endDateInput = document.getElementById('endDate');
            if (endDateInput && App.contractForm.startDate) {
                endDateInput.min = App.contractForm.startDate;
            }
        },

        updateEndDateFromDays(days) {
            if (!App.contractForm.startDate) return;
            const normalizedDays = Math.max(1, Number(days) || 1);
            const endDate = Utils.addDays(App.contractForm.startDate, normalizedDays - 1);
            App.contractForm.endDate = endDate;
            const endDateInput = document.getElementById('endDate');
            if (endDateInput) endDateInput.value = endDate;
        },

        resolveCountryRules() {
            const selectedCountries = App.contractForm.territories;
            let requiredMinAmount = 10000;
            let requiredCurrency = 'USD';
            let maxRateFactor = 1;

            selectedCountries.forEach(code => {
                const rule = MockData.countryRules[code] || MockData.countryRules.DEFAULT;
                if (rule.minAmount > requiredMinAmount) {
                    requiredMinAmount = rule.minAmount;
                    requiredCurrency = rule.currency || 'USD';
                }
                maxRateFactor = Math.max(maxRateFactor, rule.rateFactor || 1);
            });

            return {
                minAmount: requiredMinAmount,
                currency: requiredCurrency,
                rateFactor: maxRateFactor
            };
        },

        applyCountryRules() {
            const { minAmount, currency } = this.resolveCountryRules();
            const amountHint = document.getElementById('amountHint');

            if (!amountHint) return;

            if (App.contractForm.territories.length === 0) {
                amountHint.textContent = '';
                return;
            }

            const amountTooLow = (Number(App.contractForm.amount) || 0) < minAmount;
            const currencyMismatch = (Number(App.contractForm.amount) || 0) === minAmount && (App.contractForm.amountCurrency || 'USD') !== currency;
            if (amountTooLow || currencyMismatch) {
                App.contractForm.amount = minAmount;
                App.contractForm.amountCurrency = currency;
                const amountSelect = document.getElementById('amountSelect');
                if (amountSelect) {
                    const targetOption = Array.from(amountSelect.options).find(option =>
                        Number(option.value) === minAmount && option.dataset.currency === currency
                    ) || Array.from(amountSelect.options).find(option => Number(option.value) === minAmount);

                    if (targetOption) {
                        targetOption.selected = true;
                    }
                    CustomSelect.syncSelect(amountSelect);
                }
                Toast.info(`Сумма скорректирована: минимум ${minAmount.toLocaleString('ru-RU')} ${currency} для выбранных стран`);
            }

            amountHint.textContent = `Минимально допустимо для выбранной территории: ${minAmount.toLocaleString('ru-RU')} ${currency}`;
        },

        setPersonResidencyMode(mode = 'resident') {
            const normalizedMode = mode === 'nonresident' ? 'nonresident' : 'resident';
            App.contractForm.personResidencyMode = normalizedMode;

            const residentBtn = document.getElementById('personModeResidentBtn');
            const nonresidentBtn = document.getElementById('personModeNonresidentBtn');
            const residentPanel = document.getElementById('residentModePanel');
            const nonresidentPanel = document.getElementById('nonresidentModePanel');

            if (residentBtn) {
                residentBtn.classList.toggle('active', normalizedMode === 'resident');
                residentBtn.setAttribute('aria-selected', String(normalizedMode === 'resident'));
            }
            if (nonresidentBtn) {
                nonresidentBtn.classList.toggle('active', normalizedMode === 'nonresident');
                nonresidentBtn.setAttribute('aria-selected', String(normalizedMode === 'nonresident'));
            }
            residentPanel?.classList.toggle('hidden', normalizedMode !== 'resident');
            nonresidentPanel?.classList.toggle('hidden', normalizedMode !== 'nonresident');
        },

        splitFullName(fullName) {
            const normalized = String(fullName || '').trim().replace(/\s+/g, ' ');
            if (!normalized) return null;
            const parts = normalized.split(' ');
            return {
                lastName: parts[0] || '',
                firstName: parts[1] || '',
                middleName: parts.slice(2).join(' ')
            };
        },

        ensurePersonLimit(requestedCount = 1) {
            const available = App.settings.maxPersons - App.contractForm.persons.length;
            if (available <= 0) {
                Toast.error(`Максимум ${App.settings.maxPersons} застрахованных`);
                return 0;
            }
            return Math.min(requestedCount, available);
        },

        getAgeGroupByBirthDate(birthDate) {
            const age = Utils.getAge(birthDate);
            if (age === null || Number.isNaN(age)) return null;
            if (age < 1) return 'u1';
            if (age > 64) return 'o64';
            return '1_64';
        },

        getAgeGroupLabel(group) {
            if (group === 'u1') return 'До 1 года';
            if (group === 'o64') return 'Старше 64 лет';
            return '1-64';
        },

        randomBirthDateForGroup(group = '1_64') {
            const now = new Date();
            let start;
            let end;
            if (group === 'u1') {
                end = now.getTime();
                start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate() + 1).getTime();
            } else if (group === 'o64') {
                end = new Date(now.getFullYear() - 65, now.getMonth(), now.getDate()).getTime();
                start = new Date(1940, 0, 1).getTime();
            } else {
                end = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).getTime();
                start = new Date(now.getFullYear() - 64, now.getMonth(), now.getDate()).getTime();
            }
            const stamp = Math.floor(Math.random() * (end - start + 1)) + start;
            return new Date(stamp).toISOString().split('T')[0];
        },

        buildPersonCardPayload(base = {}) {
            return {
                iin: base.iin || '',
                lastName: base.lastName || '',
                firstName: base.firstName || '',
                middleName: base.middleName || '',
                birthDate: base.birthDate || '',
                docType: base.docType || 'manual',
                docNumber: base.docNumber || '',
                residency: base.residency || 'resident',
                verificationMode: base.verificationMode || (Utils.validateIIN(String(base.iin || '')) ? 'iin_kdp' : 'resident_no_iin'),
                kdpStatus: base.kdpStatus || (Utils.validateIIN(String(base.iin || '')) ? 'confirmed' : 'not_required'),
                paperConsentUploaded: !!base.paperConsentUploaded,
                consentFileName: base.consentFileName || '',
                isCalculatedOnly: !!base.isCalculatedOnly
            };
        },

        generateRandomKazakhPerson(iin) {
            const maleLastNames = ['Каримов', 'Сериков', 'Жумабеков', 'Турсунов', 'Ахметов', 'Нургалиев', 'Касымов', 'Сапаров'];
            const femaleLastNames = ['Каримова', 'Серикова', 'Жумабекова', 'Турсунова', 'Ахметова', 'Нургалиева', 'Касымова', 'Сапарова'];
            const maleFirstNames = ['Мухамеджан', 'Ержан', 'Нуржан', 'Алихан', 'Дастан', 'Бауыржан', 'Арман', 'Рустем'];
            const femaleFirstNames = ['Айгерим', 'Аружан', 'Динара', 'Жанель', 'Асем', 'Мадина', 'Назым', 'Сауле'];
            const maleMiddleNames = ['Ерланович', 'Серикович', 'Нурланович', 'Маратович', 'Кайратович', 'Бекетович', 'Жанатович'];
            const femaleMiddleNames = ['Ерлановна', 'Сериковна', 'Нурлановна', 'Маратовна', 'Кайратовна', 'Бекетовна', 'Жанатовна'];

            const isFemale = Math.random() >= 0.5;
            const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
            const randomBirthDate = () => {
                // Realistic range for insured adults
                const start = new Date('1960-01-01T00:00:00Z').getTime();
                const end = new Date('2007-12-31T00:00:00Z').getTime();
                const stamp = Math.floor(Math.random() * (end - start + 1)) + start;
                return new Date(stamp).toISOString().split('T')[0];
            };

            return {
                iin,
                lastName: isFemale ? pick(femaleLastNames) : pick(maleLastNames),
                firstName: isFemale ? pick(femaleFirstNames) : pick(maleFirstNames),
                middleName: isFemale ? pick(femaleMiddleNames) : pick(maleMiddleNames),
                birthDate: randomBirthDate(),
                docType: 'id_card',
                docNumber: '0' + iin.substring(0, 8),
                residency: 'resident',
                verificationMode: 'iin_kdp',
                kdpStatus: 'confirmed',
                isCalculatedOnly: false
            };
        },

        async lookupIIN(options = {}) {
            if (this.iinLookupInProgress) return;
            const iin = document.getElementById('iinInput')?.value;
            if (!Utils.validateIIN(iin)) {
                if (!options.silentValidation) {
                    Toast.error('Некорректный ИИН (должен содержать 12 цифр)');
                }
                return;
            }
            if (App.contractForm.persons.some(person => String(person.iin) === iin)) {
                if (!options.silentValidation) {
                    Toast.warning('Застрахованный с таким ИИН уже добавлен');
                }
                return;
            }

            if (App.contractForm.persons.length >= App.settings.maxPersons) {
                Toast.error(`Максимум ${App.settings.maxPersons} застрахованных`);
                return;
            }
            this.iinLookupInProgress = true;

            const requestBtn = document.getElementById('requestKdpBtn');
            const requestBtnLabel = requestBtn?.querySelector('.action-inline-btn-label');
            try {
                if (requestBtn) {
                    requestBtn.disabled = true;
                    if (requestBtnLabel) requestBtnLabel.textContent = 'Ожидание КДП...';
                }

                if (this.isCorporateKdpBypassEnabled()) {
                    Toast.info('Для корпоративного сертификата КДП не требуется. Запрашиваем данные из госбазы...');
                } else {
                    Toast.info('Запрашиваем КДП. После подтверждения автоматически запрашиваем данные из госбазы...');
                }
                const kdpApproved = await this.requestKDP({ fromIinFlow: true });
                if (!kdpApproved) {
                    Toast.error('Не удалось подтвердить КДП. Добавление застрахованного отменено');
                    return;
                }

                if (!this.isCorporateKdpBypassEnabled()) {
                    Toast.info('КДП получено. Запрашиваем данные из госбазы...');
                }
                // Mock ESBD lookup after KDP confirmation
                const person = MockData.esbdDatabase[iin];
                if (person) {
                    App.contractForm.persons.push(this.buildPersonCardPayload({
                        iin,
                        ...person,
                        residency: 'resident',
                        verificationMode: 'iin_kdp',
                        kdpStatus: 'confirmed',
                        isCalculatedOnly: false
                    }));
                    this.renderPersons();
                    this.updateReview();
                    document.getElementById('iinInput').value = '';
                    AuditLog.add('esbd_lookup', 'person', iin, 'Запрос данных из ЕСБД');
                    Toast.success('Данные получены из ЕСБД');
                } else {
                    const randomPerson = this.generateRandomKazakhPerson(iin);
                    App.contractForm.persons.push(this.buildPersonCardPayload(randomPerson));
                    this.renderPersons();
                    this.updateReview();
                    document.getElementById('iinInput').value = '';
                    Toast.info('Лицо добавлено');
                }
            } finally {
                if (requestBtn) {
                    requestBtn.disabled = false;
                    if (requestBtnLabel) requestBtnLabel.textContent = 'Запросить КДП';
                }
                this.iinLookupInProgress = false;
            }
        },

        addManualPerson() {
            const fullName = document.getElementById('manualPersonNameInput')?.value?.trim() || '';
            const birthDate = Utils.getDateValue('manualBirthDateInput');
            if (!fullName) {
                Toast.error('Введите ФИО');
                return;
            }
            if (!birthDate) {
                Toast.error('Укажите дату рождения');
                return;
            }

            const ageGroup = this.getAgeGroupByBirthDate(birthDate);
            if (!ageGroup) {
                Toast.error('Не удалось определить возраст');
                return;
            }

            if (ageGroup === '1_64') {
                Toast.warning('Ручное добавление доступно для возрастов до 1 года и старше 64 лет');
                return;
            }

            const parsedName = this.splitFullName(fullName);
            if (!parsedName || !parsedName.firstName) {
                Toast.error('Укажите Фамилию и Имя');
                return;
            }

            if (!this.ensurePersonLimit(1)) return;

            App.contractForm.persons.push(this.buildPersonCardPayload({
                ...parsedName,
                iin: '',
                birthDate,
                docType: 'manual_age_only',
                docNumber: '',
                residency: 'resident',
                verificationMode: 'resident_no_iin',
                kdpStatus: 'not_required',
                isCalculatedOnly: false
            }));
            const nameInput = document.getElementById('manualPersonNameInput');
            if (nameInput) nameInput.value = '';
            Utils.setDateValue('manualBirthDateInput', '', { silent: true });
            this.renderPersons();
            this.updateReview();
            Toast.success('Резидент без ИИН добавлен');
        },

        downloadNonresidentConsentForm() {
            const template = [
                'БЛАНК СОГЛАСИЯ НА ОБРАБОТКУ ПЕРСОНАЛЬНЫХ ДАННЫХ (КДП)',
                '',
                '1. ФИО застрахованного: ___________________________',
                '2. Дата рождения: ___________________________',
                '3. Документ: ___________________________',
                '4. Подтверждаю согласие на обработку персональных данных.',
                '',
                'Подпись: ____________________   Дата: ____________________'
            ].join('\n');
            const blob = new Blob([template], { type: 'text/plain;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `kdp_nonresident_form_${Utils.getToday()}.txt`;
            link.click();
            URL.revokeObjectURL(link.href);
            Toast.success('Бланк согласия скачан');
        },

        handleNonresidentConsentUpload(event) {
            const file = event?.target?.files?.[0];
            if (!file) {
                App.contractForm.nonresidentConsentFile = null;
                return;
            }
            const maxFileSize = 15 * 1024 * 1024;
            if (file.size > maxFileSize) {
                Toast.error('Файл превышает 15 МБ');
                event.target.value = '';
                App.contractForm.nonresidentConsentFile = null;
                return;
            }
            App.contractForm.nonresidentConsentFile = {
                name: file.name,
                size: file.size,
                type: file.type || 'application/octet-stream',
                uploadedAt: new Date().toISOString()
            };
            App.consentBank.unshift({
                id: Utils.generateId('consent'),
                contractDraftId: App.contractForm.id,
                fileName: file.name,
                size: file.size,
                uploadedAt: new Date().toISOString()
            });
            Toast.success(`Файл загружен: ${file.name}`);
            AuditLog.add('upload_consent', 'contract', App.contractForm.id, `Загружено согласие: ${file.name}`);
        },

        addNonresident() {
            const fullName = document.getElementById('nonresidentNameInput')?.value?.trim() || '';
            const birthDate = Utils.getDateValue('nonresidentBirthDateInput');
            if (!fullName) {
                Toast.error('Введите ФИО');
                return;
            }
            if (!birthDate) {
                Toast.error('Укажите дату рождения');
                return;
            }

            const parsedName = this.splitFullName(fullName);
            if (!parsedName || !parsedName.firstName) {
                Toast.error('Укажите Фамилию и Имя');
                return;
            }
            if (!App.contractForm.nonresidentConsentFile) {
                Toast.error('Загрузите подписанный бланк согласия для нерезидента');
                return;
            }

            if (!this.ensurePersonLimit(1)) return;

            App.contractForm.persons.push(this.buildPersonCardPayload({
                ...parsedName,
                iin: '',
                birthDate,
                docType: 'nonresident_profile',
                docNumber: '',
                residency: 'nonresident',
                verificationMode: 'nonresident_min',
                kdpStatus: 'not_required',
                paperConsentUploaded: true,
                consentFileName: App.contractForm.nonresidentConsentFile.name,
                isCalculatedOnly: false
            }));

            const nameInput = document.getElementById('nonresidentNameInput');
            if (nameInput) nameInput.value = '';
            Utils.setDateValue('nonresidentBirthDateInput', '', { silent: true });
            const fileInput = document.getElementById('nonresidentConsentFileInput');
            if (fileInput) fileInput.value = '';
            App.contractForm.nonresidentConsentFile = null;
            this.renderPersons();
            this.updateReview();
            Toast.success('Нерезидент добавлен');
        },

        createCalculatorPerson(group = '1_64', index = 0) {
            const suffix = App.contractForm.persons.length + 1 + index;
            return this.buildPersonCardPayload({
                iin: '',
                lastName: 'Расчётный',
                firstName: `Участник ${suffix}`,
                middleName: '',
                birthDate: this.randomBirthDateForGroup(group),
                docType: 'manual_age_only',
                docNumber: '',
                residency: 'resident',
                verificationMode: 'calculator',
                kdpStatus: 'not_required',
                isCalculatedOnly: true
            });
        },

        addManualPersonsBatch() {
            const group = document.getElementById('calculatorAgeGroupSelect')?.value || 'u1';
            const rawCount = document.getElementById('manualPersonsCountInput')?.value;
            const requested = Number(rawCount);

            if (!Number.isInteger(requested) || requested < 1) {
                Toast.error('Укажите корректное количество (минимум 1)');
                return;
            }

            const toAdd = this.ensurePersonLimit(requested);
            if (!toAdd) return;
            for (let i = 0; i < toAdd; i += 1) {
                App.contractForm.persons.push(this.createCalculatorPerson(group, i));
            }

            if (toAdd < requested) {
                Toast.warning(`Добавлено ${toAdd}. Достигнут лимит ${App.settings.maxPersons}`);
            } else {
                Toast.success(`Добавлено в расчёт (${this.getAgeGroupLabel(group)}): ${toAdd}`);
            }

            const countInput = document.getElementById('manualPersonsCountInput');
            if (countInput) countInput.value = '';

            this.renderPersons();
            this.updateReview();
        },

        hasIinPerson() {
            return App.contractForm.persons.some(person => Utils.validateIIN(String(person.iin || '')));
        },

        getSelectedGeneralContract() {
            const company = Permissions.getCurrentCompany();
            return company?.generalContracts?.find(gc => gc.id === App.contractForm.generalContractId) || null;
        },

        isCorporateBenefitsEnabled() {
            const gc = this.getSelectedGeneralContract();
            return !!(gc?.corporateBenefitsEnabled && Utils.isTravelProduct(App.contractForm.productType));
        },

        isCorporateDiscountApplied() {
            if (!this.isCorporateBenefitsEnabled()) return false;
            const f = App.contractForm;
            return !!(
                String(f.corporateClientCompany || '').trim() &&
                String(f.corporateDmsNumber || '').trim() &&
                Number(f.corporateDiscountPercent || 0) >= 0 &&
                Number(f.corporateDiscountPercent || 0) <= 100
            );
        },

        isCorporateBlockTouched() {
            const f = App.contractForm;
            return !!(
                String(f.corporateClientCompany || '').trim() ||
                String(f.corporateDmsNumber || '').trim() ||
                String(f.corporateCardNumber || '').trim() ||
                Number(f.corporateDiscountPercent || 0) > 0 ||
                f.corporateAlliance
            );
        },

        isCorporateKdpBypassEnabled() {
            return this.isCorporateDiscountApplied();
        },

        getPersonVerificationLabel(person) {
            if (person.verificationMode === 'iin_kdp') return 'ИИН + КДП';
            if (person.verificationMode === 'resident_no_iin') return 'Без ИИН';
            if (person.verificationMode === 'nonresident_min') return 'Нерезидент';
            return 'Калькуляция';
        },

        isPersonReadyForActivation(person) {
            if (!person) return false;
            const hasName = !!(person.lastName && person.firstName);
            const hasBirthDate = !!person.birthDate;
            const ageGroup = this.getAgeGroupByBirthDate(person.birthDate);
            const corporateKdpBypass = this.isCorporateKdpBypassEnabled();

            if (person.verificationMode === 'iin_kdp') {
                if (corporateKdpBypass) return Utils.validateIIN(String(person.iin || ''));
                return Utils.validateIIN(String(person.iin || '')) && person.kdpStatus === 'confirmed';
            }
            if (person.verificationMode === 'resident_no_iin') {
                return hasName && hasBirthDate && (ageGroup === 'u1' || ageGroup === 'o64');
            }
            if (person.verificationMode === 'nonresident_min') {
                return hasName && hasBirthDate && !!person.paperConsentUploaded;
            }
            if (person.verificationMode === 'calculator') {
                return hasBirthDate;
            }
            return false;
        },

        renderPersons() {
            const container = document.getElementById('personsContainer');
            const formatAge = (birthDate) => {
                const age = Utils.getAge(birthDate);
                if (age === null || Number.isNaN(age)) return '-';
                const mod10 = age % 10;
                const mod100 = age % 100;
                let suffix = 'лет';
                if (mod10 === 1 && mod100 !== 11) suffix = 'год';
                else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) suffix = 'года';
                return `${age} ${suffix}`;
            };
            const getResidencyLabel = (residency) => residency === 'nonresident' ? 'Нерезидент' : 'Резидент';
            const isNoIin = (person) => !Utils.validateIIN(String(person.iin || ''));
            const corporateBypass = this.isCorporateKdpBypassEnabled();
            const getDetails = (person) => {
                if (person.verificationMode === 'iin_kdp') {
                    if (corporateBypass) return 'Корпоративный сертификат: КДП по ИИН не требуется';
                    return person.kdpStatus === 'confirmed'
                        ? 'КДП подтверждено, данные готовы к оформлению'
                        : 'Ожидается подтверждение КДП';
                }
                if (person.verificationMode === 'resident_no_iin') return 'Резидент без ИИН. Добавлен по возрастному исключению';
                if (person.verificationMode === 'nonresident_min') {
                    return person.paperConsentUploaded
                        ? `Нерезидент. Бумажное согласие загружено (${person.consentFileName || 'файл'})`
                        : 'Нерезидент. Требуется загрузка бумажного согласия';
                }
                return 'Расчётная запись из калькулятора';
            };

            container.innerHTML = App.contractForm.persons.map((p, idx) => `
                <div class="person-card ${isNoIin(p) ? 'person-card-no-iin' : ''} ${p.residency === 'nonresident' ? 'person-card-nonresident' : ''}" data-person-idx="${idx}" style="animation-delay: ${Math.min(idx * 26, 140)}ms;">
                    <div class="person-card-avatar ${isNoIin(p) ? 'person-card-avatar-no-iin' : ''} ${p.residency === 'nonresident' ? 'person-card-avatar-nonresident' : ''}">${Utils.getInitials(p.lastName + ' ' + p.firstName)}</div>
                    <div class="person-card-info">
                        <div class="person-card-name">${p.lastName} ${p.firstName} ${p.middleName || ''}</div>
                        <div class="person-card-meta">
                            <span class="person-pill person-pill-age ${isNoIin(p) ? 'person-pill-age-no-iin' : ''}">Возраст: ${formatAge(p.birthDate)}</span>
                            <span class="person-pill ${p.residency === 'nonresident' ? 'person-pill-nonresident' : ''}">${getResidencyLabel(p.residency)}</span>
                            <span class="person-pill person-pill-source">${this.getPersonVerificationLabel(p)}</span>
                            <span class="person-pill ${isNoIin(p) ? 'person-pill-no-iin' : ''}">${Utils.validateIIN(String(p.iin || '')) ? `ИИН: ${p.iin}` : 'Без ИИН'}</span>
                            <span class="person-pill">${Utils.formatDate(p.birthDate)}</span>
                            <span class="person-pill person-pill-premium">Премия: ${Utils.formatCurrency(p.calculatedPremium || 0)}</span>
                            ${p.verificationMode === 'iin_kdp' && !corporateBypass
                                ? `<span class="person-pill ${p.kdpStatus === 'confirmed' ? 'person-pill-kdp-ok' : 'person-pill-kdp-pending'}">${p.kdpStatus === 'confirmed' ? 'КДП подтверждено' : 'КДП не подтверждено'}</span>`
                                : ''}
                        </div>
                        <div class="person-card-details">${getDetails(p)}</div>
                    </div>
                    <div class="person-card-actions">
                        <button class="btn btn-ghost btn-sm btn-icon person-action-btn" onclick="Pages['new-contract'].removePerson(${idx}, this.closest('.person-card'))" title="Удалить застрахованного" aria-label="Удалить застрахованного">${Utils.getSystemIcon('xmark-circle', { size: 16 })}</button>
                    </div>
                </div>
            `).join('');
            document.getElementById('personsCounter').textContent = `(${App.contractForm.persons.length} / ${App.settings.maxPersons})`;
        },

        removePerson(idx, cardElement) {
            const removeAndRefresh = () => {
                App.contractForm.persons.splice(idx, 1);
                this.renderPersons();
                this.updateReview();
            };

            if (cardElement) {
                cardElement.classList.add('is-removing');
                window.setTimeout(removeAndRefresh, 210);
                return;
            }
            removeAndRefresh();
        },

        requestKDP(options = {}) {
            if (!options.fromIinFlow && App.contractForm.persons.length === 0) {
                Toast.error('Сначала добавьте застрахованных');
                return Promise.resolve(false);
            }

            if (!options.fromIinFlow && App.contractForm.kdpConfirmed) {
                return Promise.resolve(true);
            }

            if (this.isCorporateKdpBypassEnabled()) {
                return Promise.resolve(true);
            }

            Toast.info('Отправка SMS с запросом КДП...');
            AuditLog.add('request_kdp', 'contract', App.contractForm.id, 'Запрос КДП по SMS');

            return new Promise((resolve) => {
                setTimeout(() => {
                    App.contractForm.kdpConfirmed = true;
                    App.contractForm.kdpConfirmedAt = new Date().toISOString();

                    this.updateReview();
                    AuditLog.add('kdp_confirmed', 'contract', App.contractForm.id, 'КДП подтверждено');
                    Toast.success('КДП успешно подтверждено');
                    resolve(true);
                }, 1500);
            });
        },

        getSportRateFactor() {
            if (!(App.contractForm.purpose === 'sport' && Utils.isTravelProduct(App.contractForm.productType))) return 1;
            const sportType = MockData.sportTypes.find(item => item.id === App.contractForm.sportType);
            return sportType?.rateFactor || 1.15;
        },

        getPersonRiskFactor(person) {
            const ageGroup = this.getAgeGroupByBirthDate(person.birthDate);
            let factor = 1;
            if (ageGroup === 'u1') factor *= 1.45;
            if (ageGroup === 'o64') factor *= 1.4;
            if (person.residency === 'nonresident') factor *= 1.08;
            if (person.verificationMode === 'calculator') factor *= 1.05;
            return factor;
        },

        calculatePremiumBreakdown() {
            const f = App.contractForm;
            const basePremium = Utils.isTravelProduct(f.productType) ? 5000 : 3000;
            const amountMultiplier = (f.amount || 10000) / 10000;
            const days = Utils.daysBetween(f.startDate, f.endDate) || 1;
            const countryRule = this.resolveCountryRules();
            const usdRate = CurrencyTicker.rates.USD.rate;
            const productRate = Utils.isTravelProduct(f.productType) ? usdRate * 1.03 : usdRate;
            const sportFactor = this.getSportRateFactor();
            const discountFactor = this.isCorporateDiscountApplied()
                ? Math.max(0, 1 - (Number(f.corporateDiscountPercent || 0) / 100))
                : 1;

            const unit = basePremium * amountMultiplier * (days / 7) * countryRule.rateFactor * (productRate / 475) * sportFactor * discountFactor;
            const perPerson = f.persons.map(person => Math.round(unit * this.getPersonRiskFactor(person)));
            const total = perPerson.reduce((sum, value) => sum + value, 0);
            return { total, perPerson };
        },

        updateReview() {
            const f = App.contractForm;
            this.applyCountryRules();

            document.getElementById('reviewProduct').textContent = Utils.getProductLabel(f.productType, { full: true });
            document.getElementById('reviewTerritory').textContent = f.territories.map(t => MockData.countries.find(c => c.code === t)?.name || t).join(', ') || '-';

            if (Utils.isTravelProduct(f.productType)) {
                document.getElementById('reviewProgramRow')?.classList.remove('hidden');
                document.getElementById('reviewAmountRow')?.classList.remove('hidden');
                const prog = MockData.programs.find(p => p.id === f.program);
                const variant = MockData.programVariants.find(v => v.id === f.variant);
                const sportType = MockData.sportTypes.find(s => s.id === f.sportType);
                const sportText = f.purpose === 'sport' && sportType ? ` / ${sportType.name}` : '';
                document.getElementById('reviewProgram').textContent = `${prog?.name || '-'} / ${variant?.name || '-'}${sportText}`;
                document.getElementById('reviewAmount').textContent =
                    MockData.insuranceAmounts.find(a => a.value == f.amount && a.currency === (f.amountCurrency || 'USD'))?.label ||
                    `${Number(f.amount || 0).toLocaleString('ru-RU')} ${f.amountCurrency || 'USD'}`;
            } else {
                document.getElementById('reviewProgramRow')?.classList.add('hidden');
                document.getElementById('reviewAmountRow')?.classList.add('hidden');
            }

            document.getElementById('reviewPeriod').textContent = f.startDate && f.endDate ? `${Utils.formatDate(f.startDate)} - ${Utils.formatDate(f.endDate)}` : '-';
            document.getElementById('reviewPersons').textContent = f.persons.length;

            const corporateBypass = this.isCorporateKdpBypassEnabled();
            const requiresKdp = f.persons.some(person => person.verificationMode === 'iin_kdp');
            const allKdpConfirmed = !requiresKdp || f.persons
                .filter(person => person.verificationMode === 'iin_kdp')
                .every(person => person.kdpStatus === 'confirmed' || corporateBypass);
            f.kdpConfirmed = allKdpConfirmed || corporateBypass;
            const kdpBadge = corporateBypass
                ? '<span class="badge badge-info">Не требуется (корп. скидка)</span>'
                : !requiresKdp
                ? '<span class="badge badge-info">Не требуется</span>'
                : allKdpConfirmed
                    ? '<span class="badge badge-success">Получено</span>'
                    : '<span class="badge badge-error">Требуется</span>';
            document.getElementById('reviewKdp').innerHTML = kdpBadge;

            // Calculate premium breakdown (per person + total)
            const premiumBreakdown = this.calculatePremiumBreakdown();
            const premium = premiumBreakdown.total;
            f.persons = f.persons.map((person, index) => ({
                ...person,
                calculatedPremium: premiumBreakdown.perPerson[index] || 0
            }));
            if (document.getElementById('personsContainer')) {
                this.renderPersons();
            }
            App.contractForm.premium = premium;
            document.getElementById('reviewPremium').textContent = Utils.formatCurrency(premium);

            // Enable/disable activate button
            const personsReady = f.persons.length > 0 && f.persons.every(person => this.isPersonReadyForActivation(person));
            const canActivate = !!(
                f.generalContractId &&
                f.territories.length > 0 &&
                personsReady &&
                f.startDate &&
                f.endDate &&
                Utils.daysBetween(f.startDate, f.endDate) > 0
            );
            document.getElementById('activateBtn').disabled = !canActivate;
        },

        saveDraft() {
            if (App.contractForm.startDate < Utils.getTomorrow()) {
                Toast.error('Дата начала должна быть не ранее следующего дня от даты выписки');
                return;
            }

            const contract = {
                ...App.contractForm,
                status: 'draft',
                companyId: App.currentUser?.companyId,
                createdBy: App.currentUser?.id,
                createdAt: Utils.getToday(),
                type: App.contractForm.productType
            };

            App.contracts.unshift(contract);
            AuditLog.add('create_draft', 'contract', contract.id, 'Договор создан');
            Toast.success('Статус договора: Создан');
        },

        async activate() {
            const f = App.contractForm;
            const hasInvalidPersons = f.persons.some(person => !this.isPersonReadyForActivation(person));
            const hasUnconfirmedIinKdp = f.persons.some(person => person.verificationMode === 'iin_kdp' && person.kdpStatus !== 'confirmed');
            const corporateBypass = this.isCorporateKdpBypassEnabled();
            const corporateTouchedInvalid = this.isCorporateBenefitsEnabled() && this.isCorporateBlockTouched() && !this.isCorporateDiscountApplied();

            // Validation
            if (!f.generalContractId) { Toast.error('Для выбранного продукта отсутствует генеральный договор'); return; }
            if (f.territories.length === 0) { Toast.error('Выберите территорию'); return; }
            if (f.persons.length === 0) { Toast.error('Добавьте застрахованных'); return; }
            if (corporateTouchedInvalid) { Toast.error('Заполните корпоративные поля полностью (компания, номер ДМС, размер скидки)'); return; }
            if (hasInvalidPersons) { Toast.error('Проверьте данные застрахованных лиц'); return; }
            if (hasUnconfirmedIinKdp && !corporateBypass) { Toast.error('Подтвердите КДП для всех резидентов с ИИН'); return; }
            if (!f.startDate || !f.endDate) { Toast.error('Укажите период страхования'); return; }
            if (f.startDate < Utils.getTomorrow()) { Toast.error('Дата начала должна быть не ранее следующего дня от даты выписки'); return; }
            f.kdpConfirmed = corporateBypass || !hasUnconfirmedIinKdp;

            // Show loading
            document.getElementById('activationStatus')?.classList.remove('hidden');
            document.getElementById('activationSpinner')?.classList.remove('hidden');
            document.getElementById('activateBtn').disabled = true;

            AuditLog.add('activate_request', 'contract', f.id, 'Отправка на активацию в CRM');

            // Build contract
            const contract = {
                ...f,
                status: 'pending',
                companyId: App.currentUser?.companyId,
                createdBy: App.currentUser?.id,
                createdAt: Utils.getToday(),
                type: f.productType
            };

            // Call CRM
            const result = await CRMSimulator.activate(contract);

            document.getElementById('activationSpinner')?.classList.add('hidden');

            if (result.success) {
                contract.status = 'active';
                contract.activatedAt = Utils.getToday();
                contract.crmId = result.crmId;
                contract.policyNumber = result.policyNumber;
                contract.esbdSent = contract.premium > 0;
                if (!contract.esbdSent) {
                    AuditLog.add('esbd_skip_zero_premium', 'contract', contract.id, 'Нулевая премия: передача в ЕСБД не выполнялась');
                }

                App.contracts.unshift(contract);

                document.getElementById('activationStatusTitle').textContent = '✓ Договор активирован';
                document.getElementById('activationStatusTitle').style.color = 'var(--color-success)';
                document.getElementById('activationStatusDesc').innerHTML = `Номер полиса: <strong>${result.policyNumber}</strong><br><a href="${result.pdfLink}">Скачать PDF</a>`;

                AuditLog.add('crm_response_ok', 'contract', f.id, `Активирован: ${result.policyNumber}`);
                Toast.success('Договор успешно активирован!');
            } else {
                contract.status = 'rejected';
                contract.rejectedAt = Utils.getToday();
                contract.rejectionReason = result.reason;

                App.contracts.unshift(contract);

                document.getElementById('activationStatusTitle').textContent = '✗ Отказ активации';
                document.getElementById('activationStatusTitle').style.color = 'var(--color-error)';
                document.getElementById('activationStatusDesc').innerHTML = `<strong>${result.reason}</strong><br>${result.reasonText}`;

                document.getElementById('activateBtn').disabled = false;

                AuditLog.add('crm_response_fail', 'contract', f.id, `Отказ: ${result.reason}`);
                Toast.error(`Отказ: ${MockData.reasonCodes[result.reason]?.title || result.reason}`);
            }
        }
    },

    // REPORTS PAGE
    'reports': {
        init() {
            this.populateProductFilter();
            this.populateFilters();
            this.render();
            this.bindEvents();
        },

        populateProductFilter() {
            const productSelect = document.getElementById('reportProductFilter');
            if (!productSelect) return;

            productSelect.innerHTML = '<option value="">Все</option>' +
                (MockData.productCatalog || []).map(product =>
                    `<option value="${product.id}">${product.shortName || product.code || product.name}</option>`
                ).join('');
        },

        populateFilters() {
            const companySelect = document.getElementById('reportCompanyFilter');
            const scope = Permissions.getScope();

            if (scope === 'global') {
                companySelect.innerHTML = '<option value="">Все</option>' +
                    MockData.tourCompanies.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
            } else if (scope === 'region') {
                const regionCompanies = MockData.tourCompanies.filter(c => c.regionId === App.currentUser?.regionId);
                companySelect.innerHTML = '<option value="">Все в регионе</option>' +
                    regionCompanies.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
            } else {
                document.getElementById('reportCompanyFilterGroup')?.classList.add('hidden');
            }
        },

        render(filters = {}) {
            let contracts = Permissions.filterByScope(App.contracts);

            // Apply filters
            if (filters.dateFrom) contracts = contracts.filter(c => c.createdAt >= filters.dateFrom);
            if (filters.dateTo) contracts = contracts.filter(c => c.createdAt <= filters.dateTo);
            if (filters.product) contracts = contracts.filter(c => c.type === filters.product);
            if (filters.status) contracts = contracts.filter(c => c.status === filters.status);
            if (filters.company) contracts = contracts.filter(c => c.companyId === filters.company);

            // Stats
            const total = contracts.length;
            const totalPremium = contracts.reduce((sum, c) => sum + (c.premium || 0), 0);
            const avgPremium = total > 0 ? Math.round(totalPremium / total) : 0;
            const rejected = contracts.filter(c => c.status === 'rejected').length;
            const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;

            document.getElementById('reportTotalContracts').textContent = total;
            document.getElementById('reportTotalPremium').textContent = Utils.formatCurrency(totalPremium);
            document.getElementById('reportAvgPremium').textContent = Utils.formatCurrency(avgPremium);
            document.getElementById('reportRejectionRate').textContent = rejectionRate + '%';

            // Table
            const tbody = document.getElementById('reportTableBody');
            tbody.innerHTML = contracts.slice(0, 50).map(c => {
                const company = MockData.tourCompanies.find(tc => tc.id === c.companyId);
                const statusInfo = MockData.contractStatuses[c.status];
                return `
                    <tr>
                        <td>${Utils.formatDate(c.createdAt)}</td>
                        <td>${c.policyNumber || c.id}</td>
                        <td>${Utils.getProductLabel(c.type)}</td>
                        <td>${company?.name || '-'}</td>
                        <td>${c.territories?.join(', ') || '-'}</td>
                        <td><span class="status-badge" style="color: ${statusInfo?.color}">${statusInfo?.name || c.status}</span></td>
                        <td>${Utils.formatCurrency(c.premium || 0)}</td>
                    </tr>
                `;
            }).join('');

            this.currentData = contracts;
        },

        bindEvents() {
            document.getElementById('reportApplyBtn')?.addEventListener('click', () => {
                this.render({
                    dateFrom: document.getElementById('reportDateFrom')?.value,
                    dateTo: document.getElementById('reportDateTo')?.value,
                    product: document.getElementById('reportProductFilter')?.value,
                    status: document.getElementById('reportStatusFilter')?.value,
                    company: document.getElementById('reportCompanyFilter')?.value
                });
            });

            document.getElementById('exportCsvBtn')?.addEventListener('click', () => this.exportCSV());
            document.getElementById('exportJsonBtn')?.addEventListener('click', () => this.exportJSON());
        },

        exportCSV() {
            if (!Permissions.can('reportsExport')) {
                Toast.error('Нет прав на экспорт');
                return;
            }

            const data = this.currentData || [];
            const maskSensitive = MockData.roles[App.currentRole]?.permissions.maskSensitive;

            let csv = 'Дата,Номер,Тип,Компания,Статус,Премия,КорпСкидка%,КлиентскаяКомпания,ДМС,Карта,Альянс,ПереданоЕСБД\n';
            data.forEach(c => {
                const company = MockData.tourCompanies.find(tc => tc.id === c.companyId);
                csv += `${c.createdAt},${c.policyNumber || c.id},${c.type},${company?.name || ''},${c.status},${c.premium || 0},${c.corporateDiscountPercent || 0},"${c.corporateClientCompany || ''}","${c.corporateDmsNumber || ''}","${c.corporateCardNumber || ''}",${c.corporateAlliance ? 'Да' : 'Нет'},${c.esbdSent === false ? 'Нет' : 'Да'}\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `report_${Utils.getToday()}.csv`;
            link.click();

            Toast.success('CSV экспортирован');
            AuditLog.add('export_csv', 'report', null, `Экспорт ${data.length} записей`);
        },

        exportJSON() {
            if (!Permissions.can('reportsExport')) {
                Toast.error('Нет прав на экспорт');
                return;
            }

            const data = (this.currentData || []).map(c => {
                const company = MockData.tourCompanies.find(tc => tc.id === c.companyId);
                const masked = Permissions.maskSensitiveData(c);
                return {
                    date: c.createdAt,
                    number: c.policyNumber || c.id,
                    type: c.type,
                    company: company?.name,
                    status: c.status,
                    premium: c.premium,
                    corporateDiscountPercent: c.corporateDiscountPercent || 0,
                    corporateClientCompany: c.corporateClientCompany || '',
                    corporateDmsNumber: c.corporateDmsNumber || '',
                    corporateCardNumber: c.corporateCardNumber || '',
                    corporateAlliance: !!c.corporateAlliance,
                    esbdSent: c.esbdSent !== false
                };
            });

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `report_${Utils.getToday()}.json`;
            link.click();

            Toast.success('JSON экспортирован');
            AuditLog.add('export_json', 'report', null, `Экспорт ${data.length} записей`);
        }
    },

    // ADMIN PAGE
    'admin': {
        init() {
            this.setupTabs();
            this.renderUsers();
            this.renderBlanks();
            this.bindEvents();
            this.openDefaultTab();
        },

        setupTabs() {
            const canUsers = Permissions.can('adminUsers');
            const canBlanks = Permissions.can('adminBlanks');
            const canSettings = Permissions.can('adminSettings');

            document.querySelector('[data-admin-tab="users"]')?.classList.toggle('hidden', !canUsers);
            document.querySelector('[data-admin-tab="blanks"]')?.classList.toggle('hidden', !canBlanks);
            document.querySelector('[data-admin-tab="settings"]')?.classList.toggle('hidden', !canSettings);
        },

        openAdminTab(tab) {
            document.querySelectorAll('[data-admin-tab]').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.adminTab === tab);
            });

            document.getElementById('adminUsersTab')?.classList.toggle('hidden', tab !== 'users');
            document.getElementById('adminBlanksTab')?.classList.toggle('hidden', tab !== 'blanks');
            document.getElementById('adminSettingsTab')?.classList.toggle('hidden', tab !== 'settings');
        },

        openDefaultTab() {
            if (Permissions.can('adminUsers')) {
                this.openAdminTab('users');
                return;
            }
            if (Permissions.can('adminBlanks')) {
                this.openAdminTab('blanks');
                return;
            }
            if (Permissions.can('adminSettings')) {
                this.openAdminTab('settings');
            }
        },

        renderUsers() {
            if (!Permissions.can('adminUsers')) {
                document.querySelector('[data-admin-tab="users"]')?.classList.add('hidden');
                document.getElementById('adminUsersTab')?.classList.add('hidden');
                return;
            }

            const users = Permissions.filterUsersByScope(MockData.users);
            const tbody = document.getElementById('adminUsersTable');
            if (!tbody) return;

            tbody.innerHTML = users.map(u => {
                const role = MockData.roles[u.role];
                const company = MockData.tourCompanies.find(c => c.id === u.companyId);
                const region = MockData.regions.find(r => r.id === u.regionId);
                return `
                    <tr>
                        <td>${u.name}</td>
                        <td>${u.email}</td>
                        <td><span class="badge badge-neutral">${role?.name || u.role}</span></td>
                        <td>${company?.name || '-'}</td>
                        <td>${region?.name || '-'}</td>
                        <td>
                            <button class="btn btn-ghost btn-sm btn-icon admin-action-btn" onclick="Toast.info('Редактирование пользователя (mock)')" title="Редактировать" aria-label="Редактировать">${Utils.getSystemIcon('pencil', { size: 16 })}</button>
                        </td>
                    </tr>
                `;
            }).join('');
        },

        renderBlanks() {
            if (!Permissions.can('adminBlanks')) {
                document.querySelector('[data-admin-tab="blanks"]')?.classList.add('hidden');
                document.getElementById('adminBlanksTab')?.classList.add('hidden');
                return;
            }

            const scope = Permissions.getScope();
            let companies = MockData.tourCompanies;

            if (scope === 'region') {
                companies = companies.filter(c => c.regionId === App.currentUser?.regionId);
            } else if (scope === 'company') {
                companies = companies.filter(c => c.id === App.currentUser?.companyId);
            }

            const tbody = document.getElementById('adminBlanksTable');
            const rows = [];

            companies.forEach(company => {
                company.paperBlanks.forEach(blank => {
                    rows.push(`
                        <tr>
                            <td>${company.name}</td>
                            <td>${blank.series}</td>
                            <td>${blank.number}</td>
                            <td><span class="badge ${blank.status === 'free' ? 'badge-success' : 'badge-neutral'}">${blank.status === 'free' ? 'Свободен' : 'Использован'}</span></td>
                            <td>${blank.usedBy || '-'}</td>
                        </tr>
                    `);
                });
            });

            tbody.innerHTML = rows.join('');
        },

        bindEvents() {
            document.querySelectorAll('[data-admin-tab]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const tab = e.target.dataset.adminTab;
                    this.openAdminTab(tab);
                });
            });

            document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
                App.settings.maxPersons = parseInt(document.getElementById('settingMaxPersons')?.value) || 5;
                App.settings.maxTerritories = parseInt(document.getElementById('settingMaxTerritories')?.value) || 3;
                App.settings.enablePartnerAdmin = document.getElementById('settingEnablePartnerAdmin')?.checked;
                Toast.success('Настройки сохранены');
                AuditLog.add('save_settings', 'system', null, 'Обновление настроек системы');
            });
        }
    },

    // TEST LAB PAGE
    'test-lab': {
        init() {
            this.bindEvents();
        },

        bindEvents() {
            document.getElementById('runStressTestBtn')?.addEventListener('click', () => this.runStressTest());
            document.getElementById('clearTestResultsBtn')?.addEventListener('click', () => this.clearResults());
            document.getElementById('clearIntegrationLogBtn')?.addEventListener('click', () => {
                App.integrationLog = [];
                this.renderIntegrationLog();
            });

            // CRM Simulator controls - now centralized in Test Lab
            document.getElementById('testCrmResponseMode')?.addEventListener('change', (e) => {
                App.crmSimulator.mode = e.target.value;
                document.getElementById('testCrmFailReasonGroup')?.classList.toggle('hidden', e.target.value !== 'fail');
            });
            document.getElementById('testCrmFailReason')?.addEventListener('change', (e) => App.crmSimulator.failReason = e.target.value);
            document.getElementById('testCrmLatency')?.addEventListener('change', (e) => App.crmSimulator.latency = parseInt(e.target.value) || 500);
            document.getElementById('testCrmTimeoutChance')?.addEventListener('change', (e) => App.crmSimulator.timeoutChance = parseInt(e.target.value) || 5);
            document.getElementById('testAmlCheckEnabled')?.addEventListener('change', (e) => App.crmSimulator.amlEnabled = e.target.checked);
        },

        results: [],

        async runStressTest() {
            this.results = [];
            const container = document.getElementById('testResultsContainer');
            container.innerHTML = '<div class="text-center p-5"><div class="loading-spinner" style="margin: 0 auto;"></div><p class="mt-4">Выполнение тестов...</p></div>';

            // Test 1: Role permissions
            await this.test('Проверка ролей: menu visibility', () => {
                const originalRole = App.currentRole;
                let passed = true;

                // Operator should not see admin
                App.currentRole = 'operator_partner';
                if (Permissions.can('adminUsers')) passed = false;

                // Owner should see admin
                App.currentRole = 'owner';
                if (!Permissions.can('adminUsers')) passed = false;

                // Observer should not create
                App.currentRole = 'observer_assistance';
                if (Permissions.can('create')) passed = false;

                App.currentRole = originalRole;
                return passed;
            });

            // Test 2: Max persons limit
            await this.test('Лимит застрахованных (max 5)', () => {
                const form = { persons: [] };
                for (let i = 0; i < 6; i++) {
                    if (form.persons.length < App.settings.maxPersons) {
                        form.persons.push({ iin: `00000000000${i}` });
                    }
                }
                return form.persons.length === 5;
            });

            // Test 3: Max territories limit
            await this.test('Лимит территорий (max 3)', () => {
                const territories = [];
                ['TR', 'AE', 'TH', 'EG'].forEach(code => {
                    if (territories.length < App.settings.maxTerritories) {
                        territories.push(code);
                    }
                });
                return territories.length === 3;
            });

            // Test 4: KDP required
            await this.test('КДП обязательно для активации', () => {
                const contract = { kdpConfirmed: false, territories: ['TR'], persons: [{}], startDate: '2025-01-01', endDate: '2025-01-10' };
                // Activation should fail without KDP
                return contract.kdpConfirmed === false;
            });

            // Test 5: CRM FAIL handling
            await this.test('CRM FAIL: AML_HIT обработка', async () => {
                const originalMode = App.crmSimulator.mode;
                App.crmSimulator.mode = 'fail';
                App.crmSimulator.failReason = 'AML_HIT';
                App.crmSimulator.latency = 100;

                const contract = { id: 'test', externalId: 'test', persons: [{}], territories: ['TR'], kdpConfirmed: true };
                const result = await CRMSimulator.activate(contract);

                App.crmSimulator.mode = originalMode;
                return result.success === false && result.reason === 'AML_HIT';
            });

            // Test 6: CRM OK handling
            await this.test('CRM OK: статус Active', async () => {
                const originalMode = App.crmSimulator.mode;
                App.crmSimulator.mode = 'ok';
                App.crmSimulator.latency = 100;

                const contract = { id: 'test2', externalId: 'test2', companyId: 'tc-1', type: 'travel', persons: [{}], territories: ['TR'], kdpConfirmed: true };
                const result = await CRMSimulator.activate(contract);

                App.crmSimulator.mode = originalMode;
                return result.success === true && result.policyNumber;
            });

            // Test 7: Void restriction
            await this.test('Запрет порчи после начала периода', () => {
                const today = Utils.getToday();
                const contract = { startDate: today, status: 'active' };
                return !Permissions.canVoidContract(contract);
            });

            // Test 8: Cancel restriction
            await this.test('Запрет расторжения после начала периода', () => {
                const today = Utils.getToday();
                const contract = { startDate: today, status: 'active' };
                return !Permissions.canCancelContract(contract);
            });

            this.renderResults();
            this.renderIntegrationLog();
        },

        async test(name, fn) {
            try {
                const result = await fn();
                this.results.push({ name, passed: !!result, error: null });
            } catch (e) {
                this.results.push({ name, passed: false, error: e.message });
            }
        },

        renderResults() {
            const container = document.getElementById('testResultsContainer');
            const passed = this.results.filter(r => r.passed).length;
            const failed = this.results.filter(r => !r.passed).length;

            document.getElementById('testPassedCount').textContent = `Passed: ${passed}`;
            document.getElementById('testFailedCount').textContent = `Failed: ${failed}`;

            container.innerHTML = this.results.map(r => `
                <div class="test-result-item">
                    <span class="test-result-icon ${r.passed ? 'pass' : 'fail'}">${r.passed ? '✓' : '✗'}</span>
                    <div>
                        <div class="test-result-name">${r.name}</div>
                        ${r.error ? `<div class="test-result-details text-error">${r.error}</div>` : ''}
                    </div>
                </div>
            `).join('');
        },

        renderIntegrationLog() {
            const container = document.getElementById('integrationLogContainer');
            const logs = App.integrationLog.slice(0, 10);

            if (logs.length === 0) {
                container.innerHTML = '<div class="text-center text-secondary p-5">Журнал пуст</div>';
                return;
            }

            container.innerHTML = logs.map(log => `
                <div class="integration-log-item">
                    <div class="integration-log-header">
                        <span class="font-medium">${log.action} • ${log.contractId}</span>
                        <span class="integration-log-status ${log.responseStatus === 'OK' ? 'text-success' : log.responseStatus === 'FAIL' ? 'text-error' : ''}">${log.responseStatus}</span>
                    </div>
                    <div class="integration-log-time">${log.timestamp} • ${log.latencyMs ? log.latencyMs + 'ms' : 'pending'}</div>
                    ${log.responsePayload ? `<div class="integration-log-payload mt-2">${JSON.stringify(log.responsePayload, null, 2)}</div>` : ''}
                </div>
            `).join('');
        },

        clearResults() {
            this.results = [];
            document.getElementById('testResultsContainer').innerHTML = '<div class="empty-state" style="padding: var(--space-6);"><p class="text-secondary">Нажмите "Run Stress Test" для запуска тестов</p></div>';
            document.getElementById('testPassedCount').textContent = 'Passed: 0';
            document.getElementById('testFailedCount').textContent = 'Failed: 0';
        }
    }
};

window.Pages = Pages;

// =============================================================================
// INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize modules
    Toast.init();
    Theme.init();
    RoleSimulator.init();
    CurrencyTicker.init();
    AuditLog.render();

    // Global event listeners
    document.getElementById('themeToggle')?.addEventListener('click', () => Theme.toggle());
    document.getElementById('auditLogToggle')?.addEventListener('click', () => Drawer.toggle('auditDrawer'));
    document.getElementById('auditDrawerClose')?.addEventListener('click', () => Drawer.close('auditDrawer'));
    document.getElementById('auditDrawerBackdrop')?.addEventListener('click', () => Drawer.close('auditDrawer'));

    // Sidebar toggle
    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        const isCollapsed = sidebar?.classList.toggle('collapsed');
        mainContent?.classList.toggle('sidebar-collapsed', !!isCollapsed);

        const toggleButton = document.getElementById('sidebarToggle');
        if (toggleButton) {
            const label = isCollapsed ? 'Развернуть меню' : 'Свернуть меню';
            toggleButton.setAttribute('aria-label', label);
            toggleButton.setAttribute('title', label);
            toggleButton.setAttribute('aria-expanded', String(!isCollapsed));
        }
    });

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        App.currentUser = null;
        AuditLog.add('logout', 'session', null, 'Выход из системы');
        Router.navigate('login');
    });

    // Modal close buttons
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
        btn.addEventListener('click', () => Modal.hide('confirmModal'));
    });
    document.getElementById('modalBackdrop')?.addEventListener('click', () => Modal.hide('confirmModal'));

    // Initialize router
    Router.init();
});
