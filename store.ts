import { create } from 'zustand';
import { AppState, LocationContext, User, UserRole, LocationType, Coupon, Language, Question, Category, Task, Answer, QuestionDraft, Report } from './types';

// Constants
export const QUESTION_COST = 10;

// Comprehensive Mock Data for Locations (Sorted Alphabetically)
const MOCK_LOCATIONS: LocationContext[] = [
  // A
  { id: 'au', name: 'Австралия', type: LocationType.COUNTRY, flagEmoji: '🇦🇺', phoneCode: '61' },
  { id: 'at', name: 'Австрия', type: LocationType.COUNTRY, flagEmoji: '🇦🇹', phoneCode: '43' },
  { id: 'az', name: 'Азербайджан', type: LocationType.COUNTRY, flagEmoji: '🇦🇿', phoneCode: '994' },
  { id: 'al', name: 'Албания', type: LocationType.COUNTRY, flagEmoji: '🇦🇱', phoneCode: '355' },
  { id: 'dz', name: 'Алжир', type: LocationType.COUNTRY, flagEmoji: '🇩🇿', phoneCode: '213' },
  { id: 'ao', name: 'Ангола', type: LocationType.COUNTRY, flagEmoji: '🇦🇴', phoneCode: '244' },
  { id: 'ad', name: 'Андорра', type: LocationType.COUNTRY, flagEmoji: '🇦🇩', phoneCode: '376' },
  { id: 'ar', name: 'Аргентина', type: LocationType.COUNTRY, flagEmoji: '🇦🇷', phoneCode: '54' },
  { id: 'am', name: 'Армения', type: LocationType.COUNTRY, flagEmoji: '🇦🇲', phoneCode: '374' },
  { id: 'af', name: 'Афганистан', type: LocationType.COUNTRY, flagEmoji: '🇦🇫', phoneCode: '93' },

  // Б
  { id: 'bs', name: 'Багамы', type: LocationType.COUNTRY, flagEmoji: '🇧🇸', phoneCode: '1' },
  { id: 'bd', name: 'Бангладеш', type: LocationType.COUNTRY, flagEmoji: '🇧🇩', phoneCode: '880' },
  { id: 'bb', name: 'Барбадос', type: LocationType.COUNTRY, flagEmoji: '🇧🇧', phoneCode: '1' },
  { id: 'bh', name: 'Бахрейн', type: LocationType.COUNTRY, flagEmoji: '🇧🇭', phoneCode: '973' },
  { id: 'by', name: 'Беларусь', type: LocationType.COUNTRY, flagEmoji: '🇧🇾', phoneCode: '375' },
  { id: 'bz', name: 'Белиз', type: LocationType.COUNTRY, flagEmoji: '🇧🇿', phoneCode: '501' },
  { id: 'be', name: 'Бельгия', type: LocationType.COUNTRY, flagEmoji: '🇧🇪', phoneCode: '32' },
  { id: 'bg', name: 'Болгария', type: LocationType.COUNTRY, flagEmoji: '🇧🇬', phoneCode: '359' },
  { id: 'bo', name: 'Боливия', type: LocationType.COUNTRY, flagEmoji: '🇧🇴', phoneCode: '591' },
  { id: 'ba', name: 'Босния и Герцеговина', type: LocationType.COUNTRY, flagEmoji: '🇧🇦', phoneCode: '387' },
  { id: 'br', name: 'Бразилия', type: LocationType.COUNTRY, flagEmoji: '🇧🇷', phoneCode: '55' },
  { id: 'bn', name: 'Бруней', type: LocationType.COUNTRY, flagEmoji: '🇧🇳', phoneCode: '673' },
  { id: 'bt', name: 'Бутан', type: LocationType.COUNTRY, flagEmoji: '🇧🇹', phoneCode: '975' },

  // В
  { id: 'vu', name: 'Вануату', type: LocationType.COUNTRY, flagEmoji: '🇻🇺', phoneCode: '678' },
  { id: 'va', name: 'Ватикан', type: LocationType.COUNTRY, flagEmoji: '🇻🇦', phoneCode: '39' },
  { id: 'gb', name: 'Великобритания', type: LocationType.COUNTRY, flagEmoji: '🇬🇧', phoneCode: '44' },
  { id: 'hu', name: 'Венгрия', type: LocationType.COUNTRY, flagEmoji: '🇭🇺', phoneCode: '36' },
  { id: 've', name: 'Венесуэла', type: LocationType.COUNTRY, flagEmoji: '🇻🇪', phoneCode: '58' },
  { id: 'vn', name: 'Вьетнам', type: LocationType.COUNTRY, flagEmoji: '🇻🇳', phoneCode: '84' },

  // Г
  { id: 'ht', name: 'Гаити', type: LocationType.COUNTRY, flagEmoji: '🇭🇹', phoneCode: '509' },
  { id: 'gy', name: 'Гайана', type: LocationType.COUNTRY, flagEmoji: '🇬🇾', phoneCode: '592' },
  { id: 'gh', name: 'Гана', type: LocationType.COUNTRY, flagEmoji: '🇬🇭', phoneCode: '233' },
  { id: 'gt', name: 'Гватемала', type: LocationType.COUNTRY, flagEmoji: '🇬🇹', phoneCode: '502' },
  { id: 'de', name: 'Германия', type: LocationType.COUNTRY, flagEmoji: '🇩🇪', phoneCode: '49' },
  { id: 'hn', name: 'Гондурас', type: LocationType.COUNTRY, flagEmoji: '🇭🇳', phoneCode: '504' },
  { id: 'hk', name: 'Гонконг', type: LocationType.COUNTRY, flagEmoji: '🇭🇰', phoneCode: '852' },
  { id: 'gr', name: 'Греция', type: LocationType.COUNTRY, flagEmoji: '🇬🇷', phoneCode: '30' },
  { id: 'ge', name: 'Грузия', type: LocationType.COUNTRY, flagEmoji: '🇬🇪', phoneCode: '995' },

  // Д
  { id: 'dk', name: 'Дания', type: LocationType.COUNTRY, flagEmoji: '🇩🇰', phoneCode: '45' },
  { id: 'do', name: 'Доминикана', type: LocationType.COUNTRY, flagEmoji: '🇩🇴', phoneCode: '1' },

  // Е
  { id: 'eg', name: 'Египет', type: LocationType.COUNTRY, flagEmoji: '🇪🇬', phoneCode: '20' },

  // И
  { id: 'il', name: 'Израиль', type: LocationType.COUNTRY, flagEmoji: '🇮🇱', phoneCode: '972' },
  { id: 'in', name: 'Индия', type: LocationType.COUNTRY, flagEmoji: '🇮🇳', phoneCode: '91' },
  { id: 'id', name: 'Индонезия', type: LocationType.COUNTRY, flagEmoji: '🇮🇩', phoneCode: '62' },
  { id: 'jo', name: 'Иордания', type: LocationType.COUNTRY, flagEmoji: '🇯🇴', phoneCode: '962' },
  { id: 'iq', name: 'Ирак', type: LocationType.COUNTRY, flagEmoji: '🇮🇶', phoneCode: '964' },
  { id: 'ir', name: 'Иран', type: LocationType.COUNTRY, flagEmoji: '🇮🇷', phoneCode: '98' },
  { id: 'ie', name: 'Ирландия', type: LocationType.COUNTRY, flagEmoji: '🇮🇪', phoneCode: '353' },
  { id: 'is', name: 'Исландия', type: LocationType.COUNTRY, flagEmoji: '🇮🇸', phoneCode: '354' },
  { id: 'es', name: 'Испания', type: LocationType.COUNTRY, flagEmoji: '🇪🇸', phoneCode: '34' },
  { id: 'it', name: 'Италия', type: LocationType.COUNTRY, flagEmoji: '🇮🇹', phoneCode: '39' },

  // Й
  { id: 'ye', name: 'Йемен', type: LocationType.COUNTRY, flagEmoji: '🇾🇪', phoneCode: '967' },

  // К
  { id: 'kz', name: 'Казахстан', type: LocationType.COUNTRY, flagEmoji: '🇰🇿', phoneCode: '7' },
  { id: 'kh', name: 'Камбоджа', type: LocationType.COUNTRY, flagEmoji: '🇰🇭', phoneCode: '855' },
  { id: 'ca', name: 'Канада', type: LocationType.COUNTRY, flagEmoji: '🇨🇦', phoneCode: '1' },
  { id: 'qa', name: 'Катар', type: LocationType.COUNTRY, flagEmoji: '🇶🇦', phoneCode: '974' },
  { id: 'ke', name: 'Кения', type: LocationType.COUNTRY, flagEmoji: '🇰🇪', phoneCode: '254' },
  { id: 'cy', name: 'Кипр', type: LocationType.COUNTRY, flagEmoji: '🇨🇾', phoneCode: '357' },
  { id: 'kg', name: 'Киргизия', type: LocationType.COUNTRY, flagEmoji: '🇰🇬', phoneCode: '996' },
  { id: 'cn', name: 'Китай', type: LocationType.COUNTRY, flagEmoji: '🇨🇳', phoneCode: '86' },
  { id: 'co', name: 'Колумбия', type: LocationType.COUNTRY, flagEmoji: '🇨🇴', phoneCode: '57' },
  { id: 'cr', name: 'Коста-Рика', type: LocationType.COUNTRY, flagEmoji: '🇨🇷', phoneCode: '506' },
  { id: 'cu', name: 'Куба', type: LocationType.COUNTRY, flagEmoji: '🇨🇺', phoneCode: '53' },
  { id: 'kw', name: 'Кувейт', type: LocationType.COUNTRY, flagEmoji: '🇰🇼', phoneCode: '965' },

  // Л
  { id: 'la', name: 'Лаос', type: LocationType.COUNTRY, flagEmoji: '🇱🇦', phoneCode: '856' },
  { id: 'lv', name: 'Латвия', type: LocationType.COUNTRY, flagEmoji: '🇱🇻', phoneCode: '371' },
  { id: 'lb', name: 'Ливан', type: LocationType.COUNTRY, flagEmoji: '🇱🇧', phoneCode: '961' },
  { id: 'lt', name: 'Литва', type: LocationType.COUNTRY, flagEmoji: '🇱🇹', phoneCode: '370' },
  { id: 'li', name: 'Лихтенштейн', type: LocationType.COUNTRY, flagEmoji: '🇱🇮', phoneCode: '423' },
  { id: 'lu', name: 'Люксембург', type: LocationType.COUNTRY, flagEmoji: '🇱🇺', phoneCode: '352' },

  // М
  { id: 'my', name: 'Малайзия', type: LocationType.COUNTRY, flagEmoji: '🇲🇾', phoneCode: '60' },
  { id: 'mv', name: 'Мальдивы', type: LocationType.COUNTRY, flagEmoji: '🇲🇻', phoneCode: '960' },
  { id: 'mt', name: 'Мальта', type: LocationType.COUNTRY, flagEmoji: '🇲🇹', phoneCode: '356' },
  { id: 'ma', name: 'Марокко', type: LocationType.COUNTRY, flagEmoji: '🇲🇦', phoneCode: '212' },
  { id: 'mx', name: 'Мексика', type: LocationType.COUNTRY, flagEmoji: '🇲🇽', phoneCode: '52' },
  { id: 'md', name: 'Молдова', type: LocationType.COUNTRY, flagEmoji: '🇲🇩', phoneCode: '373' },
  { id: 'mc', name: 'Монако', type: LocationType.COUNTRY, flagEmoji: '🇲🇨', phoneCode: '377' },
  { id: 'mn', name: 'Монголия', type: LocationType.COUNTRY, flagEmoji: '🇲🇳', phoneCode: '976' },
  { id: 'mm', name: 'Мьянма', type: LocationType.COUNTRY, flagEmoji: '🇲🇲', phoneCode: '95' },

  // Н
  { id: 'np', name: 'Непал', type: LocationType.COUNTRY, flagEmoji: '🇳🇵', phoneCode: '977' },
  { id: 'ng', name: 'Нигерия', type: LocationType.COUNTRY, flagEmoji: '🇳🇬', phoneCode: '234' },
  { id: 'nl', name: 'Нидерланды', type: LocationType.COUNTRY, flagEmoji: '🇳🇱', phoneCode: '31' },
  { id: 'ni', name: 'Никарагуа', type: LocationType.COUNTRY, flagEmoji: '🇳🇮', phoneCode: '505' },
  { id: 'nz', name: 'Новая Зеландия', type: LocationType.COUNTRY, flagEmoji: '🇳🇿', phoneCode: '64' },
  { id: 'no', name: 'Норвегия', type: LocationType.COUNTRY, flagEmoji: '🇳🇴', phoneCode: '47' },

  // О
  { id: 'ae', name: 'ОАЭ', type: LocationType.COUNTRY, flagEmoji: '🇦🇪', phoneCode: '971' },
  { id: 'om', name: 'Оман', type: LocationType.COUNTRY, flagEmoji: '🇴🇲', phoneCode: '968' },

  // П
  { id: 'pk', name: 'Пакистан', type: LocationType.COUNTRY, flagEmoji: '🇵🇰', phoneCode: '92' },
  { id: 'pa', name: 'Панама', type: LocationType.COUNTRY, flagEmoji: '🇵🇦', phoneCode: '507' },
  { id: 'pg', name: 'Папуа — Новая Гвинея', type: LocationType.COUNTRY, flagEmoji: '🇵🇬', phoneCode: '675' },
  { id: 'py', name: 'Парагвай', type: LocationType.COUNTRY, flagEmoji: '🇵🇾', phoneCode: '595' },
  { id: 'pe', name: 'Перу', type: LocationType.COUNTRY, flagEmoji: '🇵🇪', phoneCode: '51' },
  { id: 'pl', name: 'Польша', type: LocationType.COUNTRY, flagEmoji: '🇵🇱', phoneCode: '48' },
  { id: 'pt', name: 'Португалия', type: LocationType.COUNTRY, flagEmoji: '🇵🇹', phoneCode: '351' },

  // Р
  { id: 'ru', name: 'Россия', type: LocationType.COUNTRY, flagEmoji: '🇷🇺', phoneCode: '7' },
  { id: 'ro', name: 'Румыния', type: LocationType.COUNTRY, flagEmoji: '🇷🇴', phoneCode: '40' },

  // С
  { id: 'sv', name: 'Сальвадор', type: LocationType.COUNTRY, flagEmoji: '🇸🇻', phoneCode: '503' },
  { id: 'sm', name: 'Сан-Марино', type: LocationType.COUNTRY, flagEmoji: '🇸🇲', phoneCode: '378' },
  { id: 'sa', name: 'Саудовская Аравия', type: LocationType.COUNTRY, flagEmoji: '🇸🇦', phoneCode: '966' },
  { id: 'mk', name: 'Северная Македония', type: LocationType.COUNTRY, flagEmoji: '🇲🇰', phoneCode: '389' },
  { id: 'sn', name: 'Сенегал', type: LocationType.COUNTRY, flagEmoji: '🇸🇳', phoneCode: '221' },
  { id: 'rs', name: 'Сербия', type: LocationType.COUNTRY, flagEmoji: '🇷🇸', phoneCode: '381' },
  { id: 'sg', name: 'Сингапур', type: LocationType.COUNTRY, flagEmoji: '🇸🇬', phoneCode: '65' },
  { id: 'sy', name: 'Сирия', type: LocationType.COUNTRY, flagEmoji: '🇸🇾', phoneCode: '963' },
  { id: 'sk', name: 'Словакия', type: LocationType.COUNTRY, flagEmoji: '🇸🇰', phoneCode: '421' },
  { id: 'si', name: 'Словения', type: LocationType.COUNTRY, flagEmoji: '🇸🇮', phoneCode: '386' },
  { id: 'us', name: 'США', type: LocationType.COUNTRY, flagEmoji: '🇺🇸', phoneCode: '1' },

  // Т
  { id: 'tj', name: 'Таджикистан', type: LocationType.COUNTRY, flagEmoji: '🇹🇯', phoneCode: '992' },
  { id: 'th', name: 'Таиланд', type: LocationType.COUNTRY, flagEmoji: '🇹🇭', phoneCode: '66' },
  { id: 'tw', name: 'Тайвань', type: LocationType.COUNTRY, flagEmoji: '🇹🇼', phoneCode: '886' },
  { id: 'tn', name: 'Тунис', type: LocationType.COUNTRY, flagEmoji: '🇹🇳', phoneCode: '216' },
  { id: 'tm', name: 'Туркменистан', type: LocationType.COUNTRY, flagEmoji: '🇹🇲', phoneCode: '993' },
  { id: 'tr', name: 'Турция', type: LocationType.COUNTRY, flagEmoji: '🇹🇷', phoneCode: '90' },

  // У
  { id: 'ug', name: 'Уганда', type: LocationType.COUNTRY, flagEmoji: '🇺🇬', phoneCode: '256' },
  { id: 'uz', name: 'Узбекистан', type: LocationType.COUNTRY, flagEmoji: '🇺🇿', phoneCode: '998' },
  { id: 'ua', name: 'Украина', type: LocationType.COUNTRY, flagEmoji: '🇺🇦', phoneCode: '380' },
  { id: 'uy', name: 'Уругвай', type: LocationType.COUNTRY, flagEmoji: '🇺🇾', phoneCode: '598' },

  // Ф
  { id: 'fj', name: 'Фиджи', type: LocationType.COUNTRY, flagEmoji: '🇫🇯', phoneCode: '679' },
  { id: 'ph', name: 'Филиппины', type: LocationType.COUNTRY, flagEmoji: '🇵🇭', phoneCode: '63' },
  { id: 'fi', name: 'Финляндия', type: LocationType.COUNTRY, flagEmoji: '🇫🇮', phoneCode: '358' },
  { id: 'fr', name: 'Франция', type: LocationType.COUNTRY, flagEmoji: '🇫🇷', phoneCode: '33' },

  // Х
  { id: 'hr', name: 'Хорватия', type: LocationType.COUNTRY, flagEmoji: '🇭🇷', phoneCode: '385' },

  // Ч
  { id: 'me', name: 'Черногория', type: LocationType.COUNTRY, flagEmoji: '🇲🇪', phoneCode: '382' },
  { id: 'cz', name: 'Чехия', type: LocationType.COUNTRY, flagEmoji: '🇨🇿', phoneCode: '420' },
  // Czech Cities (Capital first, then alphabetical)
  { id: 'cz_prg', name: 'Прага', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' }, // Capital
  { id: 'cz_brn', name: 'Брно', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
  { id: 'cz_hav', name: 'Гавиржов', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
  { id: 'cz_hk', name: 'Градец-Кралове', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
  { id: 'cz_dec', name: 'Дечин', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
  { id: 'cz_zli', name: 'Злин', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
  { id: 'cz_jih', name: 'Йиглава', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
  { id: 'cz_kar', name: 'Карвина', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
  { id: 'cz_kv', name: 'Карловы Вары', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
  { id: 'cz_kla', name: 'Кладно', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
  { id: 'cz_lib', name: 'Либерец', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
  { id: 'cz_mos', name: 'Мост', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
  { id: 'cz_olo', name: 'Оломоуц', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
  { id: 'cz_opa', name: 'Опава', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
  { id: 'cz_ost', name: 'Острава', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
  { id: 'cz_par', name: 'Пардубице', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
  { id: 'cz_plz', name: 'Пльзень', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
  { id: 'cz_tep', name: 'Теплице', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
  { id: 'cz_ust', name: 'Усти-над-Лабем', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
  { id: 'cz_fry', name: 'Фридек-Мистек', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
  { id: 'cz_bud', name: 'Ческе-Будеёвице', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },

  { id: 'cl', name: 'Чили', type: LocationType.COUNTRY, flagEmoji: '🇨🇱', phoneCode: '56' },

  // Ш
  { id: 'ch', name: 'Швейцария', type: LocationType.COUNTRY, flagEmoji: '🇨🇭', phoneCode: '41' },
  { id: 'se', name: 'Швеция', type: LocationType.COUNTRY, flagEmoji: '🇸🇪', phoneCode: '46' },
  { id: 'lk', name: 'Шри-Ланка', type: LocationType.COUNTRY, flagEmoji: '🇱🇰', phoneCode: '94' },

  // Э
  { id: 'ec', name: 'Эквадор', type: LocationType.COUNTRY, flagEmoji: '🇪🇨', phoneCode: '593' },
  { id: 'ee', name: 'Эстония', type: LocationType.COUNTRY, flagEmoji: '🇪🇪', phoneCode: '372' },
  { id: 'et', name: 'Эфиопия', type: LocationType.COUNTRY, flagEmoji: '🇪🇹', phoneCode: '251' },

  // Ю
  { id: 'za', name: 'ЮАР', type: LocationType.COUNTRY, flagEmoji: '🇿🇦', phoneCode: '27' },
  { id: 'kr', name: 'Южная Корея', type: LocationType.COUNTRY, flagEmoji: '🇰🇷', phoneCode: '82' },

  // Я
  { id: 'jm', name: 'Ямайка', type: LocationType.COUNTRY, flagEmoji: '🇯🇲', phoneCode: '1' },
  { id: 'jp', name: 'Япония', type: LocationType.COUNTRY, flagEmoji: '🇯🇵', phoneCode: '81' },
];

export const MOCK_CATEGORIES: Category[] = [
    { id: 'visa', name: 'cat.visa', icon: 'visa' },
    { id: 'money', name: 'cat.money', icon: 'money' },
    { id: 'leisure', name: 'cat.leisure', icon: 'leisure' },
    { id: 'food', name: 'cat.food', icon: 'food' },
    { id: 'animals', name: 'cat.animals', icon: 'animals' },
    { id: 'housing', name: 'cat.housing', icon: 'housing' },
    { id: 'law', name: 'cat.law', icon: 'law' },
    { id: 'health', name: 'cat.health', icon: 'health' },
    { id: 'internet', name: 'cat.internet', icon: 'internet' },
    { id: 'beauty', name: 'cat.beauty', icon: 'beauty' },
    { id: 'culture', name: 'cat.culture', icon: 'culture' },
    { id: 'courses', name: 'cat.courses', icon: 'courses' },
    { id: 'nostrification', name: 'cat.nostrification', icon: 'nostrification' },
    { id: 'education', name: 'cat.education', icon: 'education' },
    { id: 'society', name: 'cat.society', icon: 'society' },
    { id: 'reviews', name: 'cat.reviews', icon: 'reviews' },
    { id: 'shopping', name: 'cat.shopping', icon: 'shopping' },
    { id: 'help', name: 'cat.help', icon: 'help' },
    { id: 'travel', name: 'cat.travel', icon: 'travel' },
    { id: 'job', name: 'cat.job', icon: 'job' },
    { id: 'family', name: 'cat.family', icon: 'family' },
    { id: 'sport', name: 'cat.sport', icon: 'sport' },
    { id: 'transport', name: 'cat.transport', icon: 'transport' },
    { id: 'services', name: 'cat.services', icon: 'services' },
    { id: 'humor', name: 'cat.humor', icon: 'humor' },
    { id: 'language', name: 'cat.language', icon: 'language' },
    { id: 'events', name: 'cat.events', icon: 'events' },
    { id: 'other', name: 'cat.other', icon: 'other' },
];

const MOCK_TASKS: Task[] = [
    { id: 't1', title: 'task.daily', reward: 2000, icon: 'calendar', isCompleted: false, type: 'DAILY' },
    { id: 't2', title: 'task.share', reward: 1000, icon: 'share', isCompleted: false, type: 'ONE_TIME' },
    { id: 't3', title: 'task.profile', reward: 500, icon: 'user', isCompleted: true, type: 'ONE_TIME' },
];

// Mock Users DB - Updated with 'Notionists' avatars
const MOCK_USERS: Record<string, User> = {
    'u2': {
        id: 'u2',
        username: 'anna_prague',
        displayName: 'Анна',
        role: UserRole.USER,
        reputationScore: 120,
        walletBalance: 50,
        starsBalance: 10,
        avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Anna&backgroundColor=eab308',
        bio: 'Живу в Праге 5 лет. Знаю лучшие кофейни.',
        websiteUrl: 'https://t.me/anna_cz',
        inventory: [],
        likedEntityIds: []
    },
    'u3': {
        id: 'u3',
        username: 'dima_code',
        displayName: 'Дмитрий',
        role: UserRole.USER,
        reputationScore: 45,
        walletBalance: 10,
        starsBalance: 0,
        avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Dima&backgroundColor=2563eb',
        bio: 'Разработчик, переехал по рабочей визе.',
        inventory: [],
        likedEntityIds: []
    }
};

// Mock Data for Questions (Czech Context)
const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    title: "Лучший коворкинг в Праге?",
    authorId: 'u2',
    locationId: 'cz_prg', 
    categoryId: 'job',
    text: "Ищу тихое место для работы с быстрым интернетом в районе Прага-2 или Прага-3. Желательно с переговорками. Бюджет до 5000 крон в месяц.",
    createdAt: new Date().toISOString(),
    views: 142,
    likes: 24,
    tags: ['Работа', 'Коворкинг', 'Интернет'],
    isSolved: true,
    isAnonymous: false,
    bestAnswerSnippet: "Рекомендую WeWork на Narodni или Opero. В Opero очень красивая атмосфера.",
    backgroundStyle: 'white'
  },
  {
    id: 'q2',
    title: "Проездной Lítačka",
    authorId: 'u3',
    locationId: 'cz_prg', 
    categoryId: 'transport',
    text: "Как выгоднее оформить проездной на год? Можно ли это сделать онлайн без посещения офиса?",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    views: 350,
    likes: 15,
    tags: ['Транспорт', 'Проездной'],
    isSolved: false,
    isAnonymous: false,
    backgroundStyle: '#fee2e2'
  },
  {
    id: 'q3',
    title: "Где искать квартиру?",
    authorId: 'u_current', 
    locationId: 'cz_prg', 
    categoryId: 'housing',
    text: "На каком сайте лучше всего искать аренду без комиссии риелтора? Bezrealitky работает?",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    views: 50,
    likes: 3,
    tags: ['Жилье', 'Аренда'],
    isSolved: false,
    isAnonymous: false,
    backgroundStyle: '#dcfce7'
  }
];

export const MOCK_COUPONS: Coupon[] = [
  { 
    id: 'c1', 
    title: 'Кофе в подарок', 
    description: 'Бесплатный капучино в сети кофеен Costa Coffee.', 
    cost: 50, 
    partnerName: 'Costa Coffee', 
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=150&q=80',
    promoCode: 'FREE-COFFEE-CZ',
    expiresAt: '2025-12-31T23:59:59Z'
  },
  { 
    id: 'c2', 
    title: 'Скидка 10% на продукты', 
    description: 'Скидка на чек от 500 крон в Albert.', 
    cost: 100, 
    partnerName: 'Albert', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Albert_logo.svg/1200px-Albert_logo.svg.png',
    promoCode: 'ALBERT-10',
    expiresAt: '2025-06-30T23:59:59Z'
  },
  { 
    id: 'c3', 
    title: 'Билет в Зоопарк', 
    description: 'Скидка 50% на второй билет в Пражский зоопарк.', 
    cost: 250, 
    partnerName: 'Zoo Praha', 
    imageUrl: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=150&q=80',
    promoCode: 'ZOO-50-OFF',
    expiresAt: '2025-08-31T23:59:59Z'
  },
];

// Detect Browser Language initially
const detectLanguage = (): Language => {
    // Forcing Russian as default per request
    return 'ru';
};

interface Store extends AppState {
  savedScrollPositions: Record<string, number>;
  questions: Question[]; // Global questions state
  categories: Category[];
  availableLocations: LocationContext[];
  availableCoupons: Coupon[];
  tasks: Task[];
  
  setLocation: (location: LocationContext) => void;
  setLanguage: (lang: Language) => void;
  setUser: (user: User) => void;
  registerUser: (name: string, username: string, avatarUrl: string, bio?: string, websiteUrl?: string) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  getUserById: (id: string) => User | undefined;
  getAllUsers: () => Record<string, User>;
  buyCoupon: (couponId: string) => boolean; // Returns success/fail
  sendTip: (amount: number, answerId: string, currency: 'STARS' | 'COINS') => boolean; // Send stars or coins
  claimTaskReward: (taskId: string) => void;
  addQuestion: (data: { title: string, text: string, categoryId: string, locationId: string, isAnonymous: boolean, attachments: string[], backgroundStyle?: string }) => boolean;
  deleteQuestion: (questionId: string) => void;
  toggleLike: (entityId: string, type: 'QUESTION' | 'ANSWER') => void;
  
  saveScrollPosition: (path: string, position: number) => void;
  connectWallet: (address: string) => void;
  disconnectWallet: () => void;

  // Draft Actions
  updateQuestionDraft: (draft: Partial<QuestionDraft>) => void;
  clearQuestionDraft: () => void;

  // Moderation Actions
  submitReport: (entityId: string, entityType: 'QUESTION' | 'ANSWER', reason: string, description: string) => void;
  resolveReport: (reportId: string, action: 'DISMISS' | 'DELETE' | 'BAN_24H' | 'BAN_FOREVER') => void;
}

export const useStore = create<Store>((set, get) => ({
  currentUser: null, 
  selectedLocation: null,
  savedScrollPositions: {},
  language: detectLanguage(),
  isLoading: false,
  questions: MOCK_QUESTIONS,
  categories: MOCK_CATEGORIES,
  availableLocations: MOCK_LOCATIONS,
  availableCoupons: MOCK_COUPONS,
  tasks: MOCK_TASKS,
  reports: [],
  
  // Default empty draft
  questionDraft: {
      title: '',
      text: '',
      categoryId: '',
      locationId: '',
      isAnonymous: false,
      attachments: []
  },

  setLocation: (location) => {
    const { currentUser } = get();
    set({ selectedLocation: location });
    if (currentUser) {
      set({
        currentUser: {
          ...currentUser,
          currentLocationId: location.id
        }
      });
    }
  },

  setLanguage: (lang) => {
    const { currentUser } = get();
    set({ language: lang });
    if (currentUser) {
        set({
            currentUser: {
                ...currentUser,
                language: lang
            }
        });
    }
  },

  saveScrollPosition: (path, position) => {
    set((state) => ({
        savedScrollPositions: {
            ...state.savedScrollPositions,
            [path]: position
        }
    }));
  },
  
  setUser: (user) => {
    const { availableLocations } = get();
    if (user.currentLocationId) {
        const savedLoc = availableLocations.find(l => l.id === user.currentLocationId);
        if (savedLoc) {
            set({ selectedLocation: savedLoc });
        }
    }
    if (user.language) {
        set({ language: user.language });
    }
    set({ currentUser: user });
  },
  
  registerUser: (name, username, avatarUrl, bio = '', websiteUrl = '') => {
    const { language } = get();
    const newUser: User = {
        id: 'u_current', // Fixed ID for mocking purposes
        username: username.toLowerCase().replace(/\s/g, ''),
        displayName: name,
        role: UserRole.USER, 
        reputationScore: 0,
        walletBalance: 100, // Starting balance
        starsBalance: 50, // Starting stars
        avatarUrl: avatarUrl,
        bio: bio,
        websiteUrl: websiteUrl,
        inventory: [],
        language: language,
        likedEntityIds: []
    };
    set({ currentUser: newUser });
  },

  updateUserProfile: (updates) => {
      const { currentUser } = get();
      if (!currentUser) return;
      set({ currentUser: { ...currentUser, ...updates } });
  },

  getUserById: (id: string) => {
      const { currentUser } = get();
      if (currentUser && currentUser.id === id) return currentUser;
      return MOCK_USERS[id];
  },

  getAllUsers: () => {
      const { currentUser } = get();
      const allUsers = { ...MOCK_USERS };
      if (currentUser) {
          allUsers[currentUser.id] = currentUser;
      }
      return allUsers;
  },

  buyCoupon: (couponId) => {
    const { currentUser, availableCoupons } = get();
    if (!currentUser) return false;

    const coupon = availableCoupons.find(c => c.id === couponId);
    if (!coupon) return false;

    if (currentUser.walletBalance >= coupon.cost) {
      set({
        currentUser: {
          ...currentUser,
          walletBalance: currentUser.walletBalance - coupon.cost,
          inventory: [...currentUser.inventory, coupon.id]
        }
      });
      return true;
    }
    return false;
  },

  toggleLike: (entityId, type) => {
      const { currentUser, questions } = get();
      if (!currentUser) return;

      const isLiked = currentUser.likedEntityIds.includes(entityId);
      const newLikedIds = isLiked 
          ? currentUser.likedEntityIds.filter(id => id !== entityId)
          : [...currentUser.likedEntityIds, entityId];
      
      const diff = isLiked ? -1 : 1;

      // Update User
      set({ currentUser: { ...currentUser, likedEntityIds: newLikedIds } });

      // Update Question if needed
      if (type === 'QUESTION') {
          const updatedQuestions = questions.map(q => 
              q.id === entityId ? { ...q, likes: (q.likes || 0) + diff } : q
          );
          set({ questions: updatedQuestions });
      }
  },

  sendTip: (amount, answerId, currency) => {
    const { currentUser, questions } = get();
    if (!currentUser) return false;

    // 1. Deduct Balance
    let success = false;
    if (currency === 'STARS') {
        if (currentUser.starsBalance >= amount) {
            set({ currentUser: { ...currentUser, starsBalance: currentUser.starsBalance - amount } });
            success = true;
        }
    } else {
        if (currentUser.walletBalance >= amount) {
            set({ currentUser: { ...currentUser, walletBalance: currentUser.walletBalance - amount } });
            success = true;
        }
    }

    if (!success) return false;

    // 2. Update Answer Stats logic (In a real app, this would be a backend call)
    return true;
  },

  claimTaskReward: (taskId) => {
      const { currentUser, tasks } = get();
      if (!currentUser) return;
      
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1 || tasks[taskIndex].isCompleted) return;

      const updatedTasks = [...tasks];
      updatedTasks[taskIndex].isCompleted = true;
      const reward = updatedTasks[taskIndex].reward;

      set({
          tasks: updatedTasks,
          currentUser: {
              ...currentUser,
              walletBalance: currentUser.walletBalance + reward
          }
      });
  },

  addQuestion: (data) => {
    const { currentUser, questions } = get();
    if(!currentUser) return false;

    if (currentUser.walletBalance < QUESTION_COST) {
        return false; // Not enough funds
    }

    const newQ: Question = {
        id: `q_${Date.now()}`,
        title: data.title,
        authorId: currentUser.id,
        locationId: data.locationId,
        categoryId: data.categoryId,
        text: data.text,
        attachmentUrls: data.attachments,
        isAnonymous: data.isAnonymous,
        backgroundStyle: data.backgroundStyle || 'white',
        tags: [], // Can be generated by AI later
        views: 0,
        likes: 0,
        isSolved: false,
        createdAt: new Date().toISOString()
    };

    set({ 
        questions: [newQ, ...questions],
        currentUser: {
            ...currentUser,
            walletBalance: currentUser.walletBalance - QUESTION_COST
        }
    });
    
    // Clear draft after successful submission
    set({ questionDraft: { title: '', text: '', categoryId: '', locationId: '', isAnonymous: false, attachments: [] } });

    return true;
  },

  deleteQuestion: (questionId) => {
      set(state => ({
          questions: state.questions.filter(q => q.id !== questionId)
      }));
  },

  connectWallet: (address) => {
      const { currentUser } = get();
      if (currentUser) {
          set({ currentUser: { ...currentUser, walletAddress: address } });
      }
  },

  disconnectWallet: () => {
      const { currentUser } = get();
      if (currentUser) {
          set({ currentUser: { ...currentUser, walletAddress: undefined } });
      }
  },

  updateQuestionDraft: (draft) => {
      const { questionDraft } = get();
      set({ questionDraft: { ...questionDraft, ...draft } });
  },

  clearQuestionDraft: () => {
      set({ questionDraft: { title: '', text: '', categoryId: '', locationId: '', isAnonymous: false, attachments: [] } });
  },

  submitReport: (entityId, entityType, reason, description) => {
      const { reports, currentUser } = get();
      if (!currentUser) return;

      const newReport: Report = {
          id: `rep_${Date.now()}`,
          entityId,
          entityType,
          reporterId: currentUser.id,
          reason,
          description,
          status: 'PENDING',
          createdAt: new Date().toISOString()
      };

      set({ reports: [...reports, newReport] });
  },

  resolveReport: (reportId, action) => {
      const { reports, questions } = get();
      
      const updatedReports = reports.map(r => {
          if (r.id === reportId) {
              return { ...r, status: action === 'DISMISS' ? 'DISMISSED' : 'RESOLVED' } as Report;
          }
          return r;
      });
      
      set({ reports: updatedReports });

      if (action === 'DELETE') {
          const report = reports.find(r => r.id === reportId);
          if (report && report.entityType === 'QUESTION') {
              set({ questions: questions.filter(q => q.id !== report.entityId) });
          }
      }
  }
}));