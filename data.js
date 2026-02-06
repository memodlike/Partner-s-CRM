/**
 * data.js - Mock Data & Reference Dictionaries
 * Кабинет партнёра - Partner Cabinet Prototype
 */

// =============================================================================
// REGIONS & TOUR COMPANIES
// =============================================================================

const REGIONS = [
    { id: 'reg-1', name: 'Алматинская область', code: 'ALM' },
    { id: 'reg-2', name: 'Астана', code: 'AST' },
    { id: 'reg-3', name: 'Шымкент', code: 'SHY' }
];

const TOUR_COMPANIES = [
    {
        id: 'tc-1',
        name: 'Silk Road Travel',
        regionId: 'reg-1',
        prefix: 'SRT',
        generalContracts: [
            { id: 'gc-1', number: 'ГД-2024/001', validFrom: '2024-01-01', validTo: '2025-12-31', product: 'travel' },
            { id: 'gc-2', number: 'ГД-2024/002', validFrom: '2024-01-01', validTo: '2025-12-31', product: 'mandatory' }
        ],
        paperBlanks: [
            { id: 'pb-1', series: 'А', number: '000001', status: 'free' },
            { id: 'pb-2', series: 'А', number: '000002', status: 'free' },
            { id: 'pb-3', series: 'А', number: '000003', status: 'used', usedBy: 'cnt-1' },
            { id: 'pb-4', series: 'А', number: '000004', status: 'free' },
            { id: 'pb-5', series: 'А', number: '000005', status: 'used', usedBy: 'cnt-2' }
        ],
        enablePartnerUserAdmin: true
    },
    {
        id: 'tc-2',
        name: 'Nomad Tours',
        regionId: 'reg-1',
        prefix: 'NMD',
        generalContracts: [
            { id: 'gc-3', number: 'ГД-2024/003', validFrom: '2024-01-01', validTo: '2025-12-31', product: 'travel' }
        ],
        paperBlanks: [
            { id: 'pb-6', series: 'Б', number: '000001', status: 'free' },
            { id: 'pb-7', series: 'Б', number: '000002', status: 'free' }
        ],
        enablePartnerUserAdmin: false
    },
    {
        id: 'tc-3',
        name: 'Astana Travel',
        regionId: 'reg-2',
        prefix: 'AST',
        generalContracts: [
            { id: 'gc-4', number: 'ГД-2024/004', validFrom: '2024-01-01', validTo: '2025-12-31', product: 'travel' },
            { id: 'gc-5', number: 'ГД-2024/005', validFrom: '2024-01-01', validTo: '2025-12-31', product: 'mandatory' }
        ],
        paperBlanks: [
            { id: 'pb-8', series: 'В', number: '000001', status: 'free' },
            { id: 'pb-9', series: 'В', number: '000002', status: 'used', usedBy: 'cnt-3' },
            { id: 'pb-10', series: 'В', number: '000003', status: 'free' }
        ],
        enablePartnerUserAdmin: true
    },
    {
        id: 'tc-4',
        name: 'Capital Voyages',
        regionId: 'reg-2',
        prefix: 'CVY',
        generalContracts: [
            { id: 'gc-6', number: 'ГД-2024/006', validFrom: '2024-01-01', validTo: '2025-12-31', product: 'travel' }
        ],
        paperBlanks: [
            { id: 'pb-11', series: 'Г', number: '000001', status: 'free' }
        ],
        enablePartnerUserAdmin: false
    },
    {
        id: 'tc-5',
        name: 'South Wind',
        regionId: 'reg-3',
        prefix: 'SWD',
        generalContracts: [
            { id: 'gc-7', number: 'ГД-2024/007', validFrom: '2024-01-01', validTo: '2025-12-31', product: 'travel' },
            { id: 'gc-8', number: 'ГД-2024/008', validFrom: '2024-01-01', validTo: '2025-12-31', product: 'mandatory' }
        ],
        paperBlanks: [
            { id: 'pb-12', series: 'Д', number: '000001', status: 'free' },
            { id: 'pb-13', series: 'Д', number: '000002', status: 'free' },
            { id: 'pb-14', series: 'Д', number: '000003', status: 'free' }
        ],
        enablePartnerUserAdmin: true
    },
    {
        id: 'tc-6',
        name: 'Desert Star',
        regionId: 'reg-3',
        prefix: 'DST',
        generalContracts: [
            { id: 'gc-9', number: 'ГД-2024/009', validFrom: '2024-01-01', validTo: '2025-12-31', product: 'travel' }
        ],
        paperBlanks: [
            { id: 'pb-15', series: 'Е', number: '000001', status: 'free' },
            { id: 'pb-16', series: 'Е', number: '000002', status: 'used', usedBy: 'cnt-4' }
        ],
        enablePartnerUserAdmin: false
    }
];

// =============================================================================
// USERS & ROLES
// =============================================================================

const ROLES = {
    operator_partner: {
        id: 'operator_partner',
        name: 'Оператор туркомпании',
        description: 'Создание и активация договоров, просмотр своей компании',
        scope: 'company',
        permissions: {
            create: true,
            activate: true,
            viewOwn: true,
            viewCompany: true,
            viewRegion: false,
            viewAll: false,
            reports: false,
            reportsExport: false,
            adminUsers: false,
            adminSettings: false,
            adminBlanks: false,
            voidBeforeStart: true,
            cancelBeforeStart: true
        }
    },
    partner_admin: {
        id: 'partner_admin',
        name: 'Админ туркомпании',
        description: 'Полное управление своей компанией + отчеты',
        scope: 'company',
        permissions: {
            create: true,
            activate: true,
            viewOwn: true,
            viewCompany: true,
            viewRegion: false,
            viewAll: false,
            reports: true,
            reportsExport: true,
            adminUsers: 'conditional', // depends on company setting
            adminSettings: false,
            adminBlanks: false,
            voidBeforeStart: true,
            cancelBeforeStart: true
        }
    },
    region_curator: {
        id: 'region_curator',
        name: 'Куратор региона',
        description: 'Просмотр и отчеты по региону, управление бланками',
        scope: 'region',
        permissions: {
            create: false,
            activate: false,
            viewOwn: true,
            viewCompany: true,
            viewRegion: true,
            viewAll: false,
            reports: true,
            reportsExport: true,
            adminUsers: false,
            adminSettings: false,
            adminBlanks: true,
            voidBeforeStart: false,
            cancelBeforeStart: false
        }
    },
    region_admin: {
        id: 'region_admin',
        name: 'Админ региона',
        description: 'Полное управление регионом',
        scope: 'region',
        permissions: {
            create: false,
            activate: false,
            viewOwn: true,
            viewCompany: true,
            viewRegion: true,
            viewAll: false,
            reports: true,
            reportsExport: true,
            adminUsers: true,
            adminSettings: true,
            adminBlanks: true,
            voidBeforeStart: true,
            cancelBeforeStart: true
        }
    },
    owner: {
        id: 'owner',
        name: 'Владелец / Суперадмин СК',
        description: 'Полный доступ ко всей системе',
        scope: 'global',
        permissions: {
            create: true,
            activate: true,
            viewOwn: true,
            viewCompany: true,
            viewRegion: true,
            viewAll: true,
            reports: true,
            reportsExport: true,
            adminUsers: true,
            adminSettings: true,
            adminBlanks: true,
            voidBeforeStart: true,
            cancelBeforeStart: true
        }
    },
    observer_assistance: {
        id: 'observer_assistance',
        name: 'Наблюдатель / Ассистанс',
        description: 'Только поиск и проверка валидности',
        scope: 'global',
        permissions: {
            create: false,
            activate: false,
            viewOwn: false,
            viewCompany: false,
            viewRegion: false,
            viewAll: true,
            reports: false,
            reportsExport: false,
            adminUsers: false,
            adminSettings: false,
            adminBlanks: false,
            voidBeforeStart: false,
            cancelBeforeStart: false,
            searchOnly: true,
            maskSensitive: true
        }
    }
};

const USERS = [
    // TC-1 Silk Road Travel (Almaty)
    { id: 'u-1', email: 'operator1@silkroad.kz', name: 'Айгуль Сериккызы', role: 'operator_partner', companyId: 'tc-1', regionId: 'reg-1' },
    { id: 'u-2', email: 'operator2@silkroad.kz', name: 'Бауыржан Касымов', role: 'operator_partner', companyId: 'tc-1', regionId: 'reg-1' },
    { id: 'u-3', email: 'admin@silkroad.kz', name: 'Динара Ахметова', role: 'partner_admin', companyId: 'tc-1', regionId: 'reg-1' },
    
    // TC-2 Nomad Tours (Almaty)
    { id: 'u-4', email: 'operator@nomad.kz', name: 'Ерлан Нурланов', role: 'operator_partner', companyId: 'tc-2', regionId: 'reg-1' },
    { id: 'u-5', email: 'admin@nomad.kz', name: 'Жанна Темирова', role: 'partner_admin', companyId: 'tc-2', regionId: 'reg-1' },
    
    // TC-3 Astana Travel
    { id: 'u-6', email: 'operator1@astanatravel.kz', name: 'Зарина Бекетова', role: 'operator_partner', companyId: 'tc-3', regionId: 'reg-2' },
    { id: 'u-7', email: 'operator2@astanatravel.kz', name: 'Ильяс Муратов', role: 'operator_partner', companyId: 'tc-3', regionId: 'reg-2' },
    { id: 'u-8', email: 'admin@astanatravel.kz', name: 'Камила Жумагулова', role: 'partner_admin', companyId: 'tc-3', regionId: 'reg-2' },
    
    // TC-4 Capital Voyages (Astana)
    { id: 'u-9', email: 'operator@capitalvoyages.kz', name: 'Лаура Сагинбаева', role: 'operator_partner', companyId: 'tc-4', regionId: 'reg-2' },
    { id: 'u-10', email: 'admin@capitalvoyages.kz', name: 'Марат Оспанов', role: 'partner_admin', companyId: 'tc-4', regionId: 'reg-2' },
    
    // TC-5 South Wind (Shymkent)
    { id: 'u-11', email: 'operator1@southwind.kz', name: 'Нурай Калиева', role: 'operator_partner', companyId: 'tc-5', regionId: 'reg-3' },
    { id: 'u-12', email: 'operator2@southwind.kz', name: 'Олжас Турсынбеков', role: 'operator_partner', companyId: 'tc-5', regionId: 'reg-3' },
    { id: 'u-13', email: 'admin@southwind.kz', name: 'Перизат Аманкулова', role: 'partner_admin', companyId: 'tc-5', regionId: 'reg-3' },
    
    // TC-6 Desert Star (Shymkent)
    { id: 'u-14', email: 'operator@desertstar.kz', name: 'Рустем Ибрагимов', role: 'operator_partner', companyId: 'tc-6', regionId: 'reg-3' },
    { id: 'u-15', email: 'admin@desertstar.kz', name: 'Сауле Нурмуханова', role: 'partner_admin', companyId: 'tc-6', regionId: 'reg-3' },
    
    // Regional users
    { id: 'u-16', email: 'curator.almaty@insurance.kz', name: 'Талғат Жүнісов', role: 'region_curator', companyId: null, regionId: 'reg-1' },
    { id: 'u-17', email: 'admin.almaty@insurance.kz', name: 'Улан Серікбаев', role: 'region_admin', companyId: null, regionId: 'reg-1' },
    { id: 'u-18', email: 'curator.astana@insurance.kz', name: 'Фариза Ералиева', role: 'region_curator', companyId: null, regionId: 'reg-2' },
    
    // Global users
    { id: 'u-19', email: 'owner@insurance.kz', name: 'Хан Болатов', role: 'owner', companyId: null, regionId: null },
    { id: 'u-20', email: 'assistance@insurance.kz', name: 'Шынар Қасымқызы', role: 'observer_assistance', companyId: null, regionId: null }
];

// =============================================================================
// REFERENCE DICTIONARIES
// =============================================================================

const COUNTRIES = [
    { code: 'TR', name: 'Турция', popular: true },
    { code: 'AE', name: 'ОАЭ', popular: true },
    { code: 'TH', name: 'Таиланд', popular: true },
    { code: 'EG', name: 'Египет', popular: true },
    { code: 'GE', name: 'Грузия', popular: true },
    { code: 'IT', name: 'Италия', popular: false },
    { code: 'ES', name: 'Испания', popular: false },
    { code: 'FR', name: 'Франция', popular: false },
    { code: 'DE', name: 'Германия', popular: false },
    { code: 'GR', name: 'Греция', popular: false },
    { code: 'CZ', name: 'Чехия', popular: false },
    { code: 'HU', name: 'Венгрия', popular: false },
    { code: 'PL', name: 'Польша', popular: false },
    { code: 'UK', name: 'Великобритания', popular: false },
    { code: 'US', name: 'США', popular: false },
    { code: 'CN', name: 'Китай', popular: false },
    { code: 'JP', name: 'Япония', popular: false },
    { code: 'KR', name: 'Южная Корея', popular: false },
    { code: 'VN', name: 'Вьетнам', popular: false },
    { code: 'ID', name: 'Индонезия', popular: false },
    { code: 'MY', name: 'Малайзия', popular: false },
    { code: 'SG', name: 'Сингапур', popular: false },
    { code: 'MV', name: 'Мальдивы', popular: false },
    { code: 'LK', name: 'Шри-Ланка', popular: false },
    { code: 'SCHENGEN', name: 'Шенген (все страны)', popular: true },
    { code: 'WORLD', name: 'Весь мир', popular: false }
];

// Country rules for insurance amounts
const COUNTRY_RULES = {
    SCHENGEN: { minAmount: 30000, currency: 'EUR', requiredAmount: 30000 },
    US: { minAmount: 50000, currency: 'USD' },
    DEFAULT: { minAmount: 10000, currency: 'USD' }
};

const PURPOSE_OF_TRIP = [
    { id: 'tourism', name: 'Туризм' },
    { id: 'guest', name: 'Частный визит (гостевой)' },
    { id: 'business', name: 'Бизнес / Деловая поездка' },
    { id: 'education', name: 'Обучение / Стажировка' },
    { id: 'sport', name: 'Спорт / Активный отдых' },
    { id: 'business_tourism', name: 'Деловой туризм' }
];

const PROGRAMS = [
    { id: 'base', name: 'Base (Базовая)', multiTrip: false },
    { id: 'multi', name: 'Multi Trip (Мультипоездка)', multiTrip: true, hint: 'Покрытие нескольких поездок в течение года, каждая до 90 дней' }
];

const PROGRAM_VARIANTS = [
    { id: 'standard', name: 'Standart', includesCovid: false },
    { id: 'plus', name: 'Plus', includesCovid: false },
    { id: 'covid', name: '+COVID', includesCovid: true },
    { id: 'covid_only', name: 'COVID-only', includesCovid: true, covidOnly: true }
];

const INSURANCE_AMOUNTS = [
    { value: 10000, currency: 'USD', label: '10 000 USD' },
    { value: 30000, currency: 'USD', label: '30 000 USD' },
    { value: 50000, currency: 'USD', label: '50 000 USD' }
];

const BLANK_TYPES = [
    { id: 'paper', name: 'Бумажный бланк' },
    { id: 'electronic', name: 'Электронный полис' }
];

// =============================================================================
// REASON CODES (CRM Failure Reasons)
// =============================================================================

const REASON_CODES = {
    AML_HIT: {
        code: 'AML_HIT',
        title: 'AML проверка не пройдена',
        description: 'Клиент обнаружен в списках AML Prime Source. Требуется дополнительная проверка комплаенс-службой.'
    },
    SANCTION_MATCH: {
        code: 'SANCTION_MATCH',
        title: 'Санкционное ограничение',
        description: 'Клиент или связанные лица находятся в санкционном списке. Страхование невозможно.'
    },
    KDP_MISSING: {
        code: 'KDP_MISSING',
        title: 'Отсутствует согласие КДП',
        description: 'Не получено согласие на обработку персональных данных от застрахованного лица.'
    },
    INVALID_IIN: {
        code: 'INVALID_IIN',
        title: 'Некорректный ИИН',
        description: 'Указанный ИИН не прошёл валидацию или не найден в базе данных.'
    },
    DUPLICATE: {
        code: 'DUPLICATE',
        title: 'Дубликат договора',
        description: 'Обнаружен действующий договор с аналогичными параметрами для данного застрахованного.'
    },
    DATE_INVALID: {
        code: 'DATE_INVALID',
        title: 'Некорректные даты',
        description: 'Указанный период страхования некорректен или находится вне допустимого диапазона.'
    },
    LIMIT_EXCEEDED: {
        code: 'LIMIT_EXCEEDED',
        title: 'Превышен лимит',
        description: 'Превышен лимит количества застрахованных лиц или территорий покрытия.'
    },
    CRM_VALIDATION_ERROR: {
        code: 'CRM_VALIDATION_ERROR',
        title: 'Ошибка валидации CRM',
        description: 'Данные не прошли внутреннюю валидацию CRM. Проверьте корректность заполнения полей.'
    },
    INTEGRATION_TIMEOUT: {
        code: 'INTEGRATION_TIMEOUT',
        title: 'Таймаут интеграции',
        description: 'Истекло время ожидания ответа от внешней системы. Попробуйте повторить запрос позже.'
    }
};

// =============================================================================
// CONTRACT STATUSES
// =============================================================================

const CONTRACT_STATUSES = {
    draft: { id: 'draft', name: 'Черновик', color: '#8E8E93', canEdit: true, canActivate: true },
    pending: { id: 'pending', name: 'На проверке CRM', color: '#FF9500', canEdit: false, canActivate: false },
    active: { id: 'active', name: 'Активен', color: '#34C759', canEdit: false, canActivate: false },
    rejected: { id: 'rejected', name: 'Отклонён', color: '#FF3B30', canEdit: true, canActivate: true },
    cancelled: { id: 'cancelled', name: 'Расторгнут', color: '#8E8E93', canEdit: false, canActivate: false },
    voided: { id: 'voided', name: 'Испорчен', color: '#8E8E93', canEdit: false, canActivate: false }
};

// =============================================================================
// MOCK CONTRACTS (History)
// =============================================================================

const generateIIN = (birthYear) => {
    const year = birthYear.toString().slice(-2);
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const serial = String(Math.floor(Math.random() * 900000) + 100000);
    return `${year}${month}${day}${serial}`;
};

const MOCK_PERSONS = [
    { iin: generateIIN(1985), lastName: 'Қасымов', firstName: 'Арман', middleName: 'Бекетович', birthDate: '1985-03-15', docType: 'id_card', docNumber: '012345678' },
    { iin: generateIIN(1990), lastName: 'Нұрланова', firstName: 'Айгерім', middleName: 'Сәкенқызы', birthDate: '1990-07-22', docType: 'passport', docNumber: 'N12345678' },
    { iin: generateIIN(1978), lastName: 'Сериков', firstName: 'Болат', middleName: 'Маратович', birthDate: '1978-11-03', docType: 'id_card', docNumber: '034567890' },
    { iin: generateIIN(2015), lastName: 'Қасымов', firstName: 'Алихан', middleName: 'Арманұлы', birthDate: '2015-05-10', docType: 'birth_cert', docNumber: 'I-АА 123456' },
    { iin: generateIIN(1982), lastName: 'Темірова', firstName: 'Дана', middleName: 'Қайратқызы', birthDate: '1982-09-18', docType: 'id_card', docNumber: '056789012' }
];

// Generate today and future dates
const today = new Date();
const formatDate = (date) => date.toISOString().split('T')[0];
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const CONTRACTS = [
    // Active contracts
    {
        id: 'cnt-1',
        externalId: 'ext-001',
        type: 'travel',
        status: 'active',
        companyId: 'tc-1',
        createdBy: 'u-1',
        createdAt: formatDate(addDays(today, -30)),
        activatedAt: formatDate(addDays(today, -30)),
        generalContractId: 'gc-1',
        blankType: 'paper',
        blankId: 'pb-3',
        policyNumber: 'SRT-VZR-2024-00001',
        crmId: 'CRM-123456',
        territories: ['TR'],
        program: 'base',
        variant: 'standard',
        purpose: 'tourism',
        amount: 30000,
        startDate: formatDate(addDays(today, -25)),
        endDate: formatDate(addDays(today, 5)),
        persons: [MOCK_PERSONS[0], MOCK_PERSONS[1]],
        kdpConfirmed: true,
        kdpConfirmedAt: formatDate(addDays(today, -30)),
        premium: 12500
    },
    {
        id: 'cnt-2',
        externalId: 'ext-002',
        type: 'travel',
        status: 'active',
        companyId: 'tc-1',
        createdBy: 'u-2',
        createdAt: formatDate(addDays(today, -15)),
        activatedAt: formatDate(addDays(today, -15)),
        generalContractId: 'gc-1',
        blankType: 'paper',
        blankId: 'pb-5',
        policyNumber: 'SRT-VZR-2024-00002',
        crmId: 'CRM-123457',
        territories: ['AE', 'TH'],
        program: 'base',
        variant: 'plus',
        purpose: 'tourism',
        amount: 50000,
        startDate: formatDate(addDays(today, 5)),
        endDate: formatDate(addDays(today, 20)),
        persons: [MOCK_PERSONS[2]],
        kdpConfirmed: true,
        kdpConfirmedAt: formatDate(addDays(today, -15)),
        premium: 18750
    },
    {
        id: 'cnt-3',
        externalId: 'ext-003',
        type: 'mandatory',
        status: 'active',
        companyId: 'tc-3',
        createdBy: 'u-6',
        createdAt: formatDate(addDays(today, -10)),
        activatedAt: formatDate(addDays(today, -10)),
        generalContractId: 'gc-5',
        blankType: 'paper',
        blankId: 'pb-9',
        policyNumber: 'AST-OST-2024-00001',
        crmId: 'CRM-123458',
        territories: ['SCHENGEN'],
        startDate: formatDate(addDays(today, -5)),
        endDate: formatDate(addDays(today, 25)),
        persons: [MOCK_PERSONS[3]],
        kdpConfirmed: true,
        kdpConfirmedAt: formatDate(addDays(today, -10)),
        premium: 8500
    },
    {
        id: 'cnt-4',
        externalId: 'ext-004',
        type: 'travel',
        status: 'active',
        companyId: 'tc-6',
        createdBy: 'u-14',
        createdAt: formatDate(addDays(today, -5)),
        activatedAt: formatDate(addDays(today, -5)),
        generalContractId: 'gc-9',
        blankType: 'paper',
        blankId: 'pb-16',
        policyNumber: 'DST-VZR-2024-00001',
        crmId: 'CRM-123459',
        territories: ['EG'],
        program: 'base',
        variant: 'covid',
        purpose: 'tourism',
        amount: 30000,
        startDate: formatDate(addDays(today, 10)),
        endDate: formatDate(addDays(today, 24)),
        persons: [MOCK_PERSONS[4]],
        kdpConfirmed: true,
        kdpConfirmedAt: formatDate(addDays(today, -5)),
        premium: 14200
    },
    
    // Draft contracts
    {
        id: 'cnt-5',
        externalId: 'ext-005',
        type: 'travel',
        status: 'draft',
        companyId: 'tc-1',
        createdBy: 'u-1',
        createdAt: formatDate(today),
        generalContractId: 'gc-1',
        blankType: 'electronic',
        territories: ['GE'],
        program: 'base',
        variant: 'standard',
        purpose: 'guest',
        amount: 10000,
        startDate: formatDate(addDays(today, 7)),
        endDate: formatDate(addDays(today, 14)),
        persons: [],
        kdpConfirmed: false,
        premium: 0
    },
    {
        id: 'cnt-6',
        externalId: 'ext-006',
        type: 'mandatory',
        status: 'draft',
        companyId: 'tc-2',
        createdBy: 'u-4',
        createdAt: formatDate(addDays(today, -1)),
        generalContractId: 'gc-3',
        blankType: 'electronic',
        territories: ['TR'],
        startDate: formatDate(addDays(today, 3)),
        endDate: formatDate(addDays(today, 10)),
        persons: [MOCK_PERSONS[0]],
        kdpConfirmed: false,
        premium: 5200
    },
    
    // Rejected contracts
    {
        id: 'cnt-7',
        externalId: 'ext-007',
        type: 'travel',
        status: 'rejected',
        companyId: 'tc-3',
        createdBy: 'u-7',
        createdAt: formatDate(addDays(today, -3)),
        rejectedAt: formatDate(addDays(today, -3)),
        generalContractId: 'gc-4',
        blankType: 'electronic',
        territories: ['US'],
        program: 'base',
        variant: 'standard',
        purpose: 'business',
        amount: 50000,
        startDate: formatDate(addDays(today, 10)),
        endDate: formatDate(addDays(today, 25)),
        persons: [MOCK_PERSONS[2]],
        kdpConfirmed: true,
        kdpConfirmedAt: formatDate(addDays(today, -3)),
        rejectionReason: 'AML_HIT',
        premium: 22500
    },
    {
        id: 'cnt-8',
        externalId: 'ext-008',
        type: 'travel',
        status: 'rejected',
        companyId: 'tc-5',
        createdBy: 'u-11',
        createdAt: formatDate(addDays(today, -2)),
        rejectedAt: formatDate(addDays(today, -2)),
        generalContractId: 'gc-7',
        blankType: 'electronic',
        territories: ['SCHENGEN'],
        program: 'multi',
        variant: 'plus',
        purpose: 'tourism',
        amount: 30000,
        startDate: formatDate(addDays(today, 5)),
        endDate: formatDate(addDays(today, 370)),
        persons: [MOCK_PERSONS[1]],
        kdpConfirmed: true,
        kdpConfirmedAt: formatDate(addDays(today, -2)),
        rejectionReason: 'SANCTION_MATCH',
        premium: 45000
    },
    
    // Cancelled contracts
    {
        id: 'cnt-9',
        externalId: 'ext-009',
        type: 'travel',
        status: 'cancelled',
        companyId: 'tc-4',
        createdBy: 'u-9',
        createdAt: formatDate(addDays(today, -20)),
        activatedAt: formatDate(addDays(today, -20)),
        cancelledAt: formatDate(addDays(today, -18)),
        generalContractId: 'gc-6',
        blankType: 'electronic',
        policyNumber: 'CVY-VZR-2024-00001',
        crmId: 'CRM-123460',
        territories: ['IT', 'ES', 'FR'],
        program: 'base',
        variant: 'standard',
        purpose: 'tourism',
        amount: 30000,
        startDate: formatDate(addDays(today, -10)),
        endDate: formatDate(addDays(today, 4)),
        persons: [MOCK_PERSONS[0], MOCK_PERSONS[1], MOCK_PERSONS[3]],
        kdpConfirmed: true,
        kdpConfirmedAt: formatDate(addDays(today, -20)),
        cancellationReason: 'Отмена поездки по желанию клиента',
        premium: 28500
    },
    
    // Pending contracts (in CRM review)
    {
        id: 'cnt-10',
        externalId: 'ext-010',
        type: 'travel',
        status: 'pending',
        companyId: 'tc-1',
        createdBy: 'u-2',
        createdAt: formatDate(today),
        generalContractId: 'gc-1',
        blankType: 'electronic',
        territories: ['TH', 'VN'],
        program: 'base',
        variant: 'covid',
        purpose: 'tourism',
        amount: 30000,
        startDate: formatDate(addDays(today, 14)),
        endDate: formatDate(addDays(today, 28)),
        persons: [MOCK_PERSONS[4]],
        kdpConfirmed: true,
        kdpConfirmedAt: formatDate(today),
        premium: 16800
    }
];

// Generate more contracts for variety
for (let i = 11; i <= 40; i++) {
    const companyIdx = (i % 6);
    const company = TOUR_COMPANIES[companyIdx];
    const users = USERS.filter(u => u.companyId === company.id);
    const user = users[Math.floor(Math.random() * users.length)] || USERS[0];
    const daysAgo = Math.floor(Math.random() * 60) + 1;
    const isTravel = Math.random() > 0.3;
    const statusOptions = ['draft', 'active', 'active', 'active', 'rejected', 'cancelled'];
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    const countries = COUNTRIES.filter(c => c.popular);
    const territory = countries[Math.floor(Math.random() * countries.length)];
    
    const gc = company.generalContracts.find(g => g.product === (isTravel ? 'travel' : 'mandatory')) || company.generalContracts[0];
    
    const contract = {
        id: `cnt-${i}`,
        externalId: `ext-${String(i).padStart(3, '0')}`,
        type: isTravel ? 'travel' : 'mandatory',
        status: status,
        companyId: company.id,
        createdBy: user.id,
        createdAt: formatDate(addDays(today, -daysAgo)),
        generalContractId: gc.id,
        blankType: Math.random() > 0.5 ? 'paper' : 'electronic',
        territories: [territory.code],
        startDate: formatDate(addDays(today, -daysAgo + 5)),
        endDate: formatDate(addDays(today, -daysAgo + 12)),
        persons: [MOCK_PERSONS[Math.floor(Math.random() * MOCK_PERSONS.length)]],
        kdpConfirmed: status !== 'draft',
        premium: Math.floor(Math.random() * 30000) + 5000
    };
    
    if (isTravel) {
        contract.program = Math.random() > 0.8 ? 'multi' : 'base';
        contract.variant = ['standard', 'plus', 'covid'][Math.floor(Math.random() * 3)];
        contract.purpose = PURPOSE_OF_TRIP[Math.floor(Math.random() * PURPOSE_OF_TRIP.length)].id;
        contract.amount = INSURANCE_AMOUNTS[Math.floor(Math.random() * INSURANCE_AMOUNTS.length)].value;
    }
    
    if (status === 'active') {
        contract.activatedAt = formatDate(addDays(today, -daysAgo));
        contract.policyNumber = `${company.prefix}-${isTravel ? 'VZR' : 'OST'}-2024-${String(i).padStart(5, '0')}`;
        contract.crmId = `CRM-${100000 + i}`;
        contract.kdpConfirmedAt = formatDate(addDays(today, -daysAgo));
    } else if (status === 'rejected') {
        contract.rejectedAt = formatDate(addDays(today, -daysAgo));
        const reasons = Object.keys(REASON_CODES);
        contract.rejectionReason = reasons[Math.floor(Math.random() * reasons.length)];
        contract.kdpConfirmedAt = formatDate(addDays(today, -daysAgo));
    } else if (status === 'cancelled') {
        contract.activatedAt = formatDate(addDays(today, -daysAgo));
        contract.cancelledAt = formatDate(addDays(today, -daysAgo + 2));
        contract.policyNumber = `${company.prefix}-${isTravel ? 'VZR' : 'OST'}-2024-${String(i).padStart(5, '0')}`;
        contract.crmId = `CRM-${100000 + i}`;
        contract.cancellationReason = 'Отмена по требованию страхователя';
    }
    
    CONTRACTS.push(contract);
}

// =============================================================================
// AUDIT LOG EVENTS
// =============================================================================

const AUDIT_EVENTS = [
    { id: 'ae-1', timestamp: formatDate(addDays(today, -1)) + ' 09:15:32', userId: 'u-1', action: 'login', objectType: 'session', objectId: 'sess-001', details: 'Вход в систему' },
    { id: 'ae-2', timestamp: formatDate(addDays(today, -1)) + ' 09:20:45', userId: 'u-1', action: 'create_draft', objectType: 'contract', objectId: 'cnt-5', details: 'Создан черновик ВЗР' },
    { id: 'ae-3', timestamp: formatDate(addDays(today, -1)) + ' 09:25:10', userId: 'u-1', action: 'esbd_lookup', objectType: 'person', objectId: 'iin-123', details: 'Запрос данных из ЕСБД' },
    { id: 'ae-4', timestamp: formatDate(today) + ' 08:30:00', userId: 'u-2', action: 'login', objectType: 'session', objectId: 'sess-002', details: 'Вход в систему' },
    { id: 'ae-5', timestamp: formatDate(today) + ' 08:35:22', userId: 'u-2', action: 'request_kdp', objectType: 'contract', objectId: 'cnt-10', details: 'Запрос КДП по SMS' },
    { id: 'ae-6', timestamp: formatDate(today) + ' 08:36:05', userId: 'u-2', action: 'kdp_confirmed', objectType: 'contract', objectId: 'cnt-10', details: 'КДП подтверждено' },
    { id: 'ae-7', timestamp: formatDate(today) + ' 08:40:15', userId: 'u-2', action: 'activate_request', objectType: 'contract', objectId: 'cnt-10', details: 'Отправка на активацию в CRM' }
];

// =============================================================================
// CRM INTEGRATION LOG
// =============================================================================

const CRM_INTEGRATION_LOG = [
    {
        id: 'crm-1',
        timestamp: formatDate(addDays(today, -30)) + ' 10:15:32',
        requestId: 'req-001',
        contractId: 'cnt-1',
        action: 'activate',
        requestPayload: { externalId: 'ext-001', type: 'travel', persons: 2 },
        responseStatus: 'OK',
        responsePayload: { status: 'Active', crmId: 'CRM-123456', policyNumber: 'SRT-VZR-2024-00001' },
        latencyMs: 450
    },
    {
        id: 'crm-2',
        timestamp: formatDate(addDays(today, -3)) + ' 14:22:10',
        requestId: 'req-002',
        contractId: 'cnt-7',
        action: 'activate',
        requestPayload: { externalId: 'ext-007', type: 'travel', persons: 1 },
        responseStatus: 'FAIL',
        responsePayload: { status: 'Rejected', reasonCode: 'AML_HIT', reasonText: 'AML проверка не пройдена' },
        latencyMs: 1250
    },
    {
        id: 'crm-3',
        timestamp: formatDate(today) + ' 08:40:15',
        requestId: 'req-003',
        contractId: 'cnt-10',
        action: 'activate',
        requestPayload: { externalId: 'ext-010', type: 'travel', persons: 1 },
        responseStatus: 'PENDING',
        responsePayload: null,
        latencyMs: null
    }
];

// =============================================================================
// ESBD MOCK DATABASE
// =============================================================================

const ESBD_DATABASE = {
    '850315300123': { lastName: 'Қасымов', firstName: 'Арман', middleName: 'Бекетович', birthDate: '1985-03-15', gender: 'M', docType: 'id_card', docNumber: '012345678' },
    '900722400234': { lastName: 'Нұрланова', firstName: 'Айгерім', middleName: 'Сәкенқызы', birthDate: '1990-07-22', gender: 'F', docType: 'passport', docNumber: 'N12345678' },
    '781103500345': { lastName: 'Сериков', firstName: 'Болат', middleName: 'Маратович', birthDate: '1978-11-03', gender: 'M', docType: 'id_card', docNumber: '034567890' },
    '150510600456': { lastName: 'Қасымов', firstName: 'Алихан', middleName: 'Арманұлы', birthDate: '2015-05-10', gender: 'M', docType: 'birth_cert', docNumber: 'I-АА 123456' },
    '820918700567': { lastName: 'Темірова', firstName: 'Дана', middleName: 'Қайратқызы', birthDate: '1982-09-18', gender: 'F', docType: 'id_card', docNumber: '056789012' },
    '950425800678': { lastName: 'Ахметов', firstName: 'Руслан', middleName: 'Қайратұлы', birthDate: '1995-04-25', gender: 'M', docType: 'id_card', docNumber: '067890123' },
    '880612900789': { lastName: 'Жумабаева', firstName: 'Гульнар', middleName: 'Сейтқызы', birthDate: '1988-06-12', gender: 'F', docType: 'passport', docNumber: 'N23456789' }
};

// =============================================================================
// EXPORT ALL DATA
// =============================================================================

const MockData = {
    regions: REGIONS,
    tourCompanies: TOUR_COMPANIES,
    roles: ROLES,
    users: USERS,
    countries: COUNTRIES,
    countryRules: COUNTRY_RULES,
    purposeOfTrip: PURPOSE_OF_TRIP,
    programs: PROGRAMS,
    programVariants: PROGRAM_VARIANTS,
    insuranceAmounts: INSURANCE_AMOUNTS,
    blankTypes: BLANK_TYPES,
    reasonCodes: REASON_CODES,
    contractStatuses: CONTRACT_STATUSES,
    contracts: CONTRACTS,
    auditEvents: AUDIT_EVENTS,
    crmIntegrationLog: CRM_INTEGRATION_LOG,
    esbdDatabase: ESBD_DATABASE
};

// Make available globally
if (typeof window !== 'undefined') {
    window.MockData = MockData;
}
