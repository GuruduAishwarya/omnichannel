import Swal from "sweetalert2";

export const ERROR_MESSAGE = "Something went wrong";

//common validation 

export const onlyAlphabets = {
    value: /^[A-Za-z]+$/,
    message: 'Please enter only alphabets',
};

export const onlyAlphabetsandSpaces = {
    value: /^[A-Za-z\s]+$/, // Include \s for space character
    message: 'Please enter only alphabets',
};


export const isValidTemplateName = {
    // Regular expression to match lowercase letters, numbers, and underscores only
    value: /^[a-z0-9_]+$/,
    message: 'Allows only lower case characters, numbers and underscores',
}

export const onlyNumbers = {
    value: /^[0-9]+$/,
    message: 'Please enter only numbers',
}
export const onlyNumbersandSpaces = {
    value: /^[0-9\s]+$/,
    message: 'Please enter only numbers',
}

export const onlyAlphaNumeric = {
    value: /^[a-zA-Z0-9]+$/,
    message: 'Please enter only numbers and alphabets',
};
export const onlyAlphaNumericSpaces = {
    value: /^[a-zA-Z0-9\s]+$/,
    message: 'Please enter only numbers and alphabets',
};

export const noSpacesValidation = (value) => {
    return !/\s/.test(value) || "Spaces are not allowed.";
};

export const noEmptySpacesValidation = (value) => {
    return value.trim().length > 0 || "Input cannot be only spaces.";
};


export const createPattern = (allowedSpecialChars) => {  //allows  special characters as per the requirements along with alphanumeric values
    // Escape special characters in the allowedSpecialChars string
    const escapedSpecialChars = allowedSpecialChars.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
    const pattern = new RegExp(`^[a-zA-Z0-9${escapedSpecialChars} ]+$`);
    const message = `Please enter only numbers, alphabets and ${allowedSpecialChars}`;
    return { value: pattern, message: message };
};

export const MaxLengthValidation = (maxLength) => ({
    value: maxLength,
    message: `Maximum length exceeded. Maximum ${maxLength} characters allowed.`,
});
export const MinLengthValidation = (minLength) => ({
    value: minLength,
    message: `Minimum length is not reached. Minimum ${minLength} characters allowed.`,
});

export const emailValidation = {
    value: /^\S+@\S+\.\S+$/,
    message: 'Please enter a valid email address',

};

export const passwordPattern = {
    value: /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/,
    message: "Password must be at least 6 characters long and include at least one letter and one number.",
};


export const usernameValidations = {
    maxLength: MaxLengthValidation(150),
    minLength: MinLengthValidation(8),
    pattern: {
        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        message: "Invalid email format",
    },
}
export const passwordValidations = {
    maxLength: MaxLengthValidation(15),
    minLength: MinLengthValidation(6),
    pattern: {
        value:
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,}$/,
        message:
            "Password must contain at least 6 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character.",
    },
}

export const formatDate = (dateInput, format) => {
    // const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // const dd = String(date.getDate()).padStart(2, '0');
    // const mm = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
    // let monthName = month[date.getUTCMonth()];
    // const yyyy = date.getFullYear();
    // // console.log('month', month);

    // switch (format) {
    //     case 'dd-mm-yyyy':
    //         return `${dd}-${mm}-${yyyy}`;
    //     case 'dd/mm/yyyy':
    //         return `${dd}/${mm}/${yyyy}`;
    //     case 'mm/dd/yyyy':
    //         return `${mm}/${dd}/${yyyy}`;
    //     case 'month dd, yyyy':
    //         return `${monthName} ${dd}, ${yyyy}`;
    //     // Add more format cases as needed
    //     default:
    //         return `${dd}-${mm}-${yyyy}`;
    // }

    // If the input is a string, convert it to a Date object
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    // console.log('date', date)

    // Check if the date is not null and is a valid Date object
    if (!date || isNaN(date.getTime())) {
        return '-';
    } else {

        const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
        let monthName = month[date.getUTCMonth()];
        const yyyy = date.getFullYear();

        switch (format) {
            case 'dd-mm-yyyy':
                return `${dd}-${mm}-${yyyy}`;
            case 'yyyy-mm-dd':
                return `${yyyy}-${mm}-${dd}`;
            case 'dd/mm/yyyy':
                return `${dd}/${mm}/${yyyy}`;
            case 'mm/dd/yyyy':
                return `${mm}/${dd}/${yyyy}`;
            case 'month dd, yyyy':
                return `${monthName} ${dd}, ${yyyy}`;
            // Add more format cases as needed
            default:
                return `${dd}-${mm}-${yyyy}`;
        }
    }
};

export const simpleAlert = (text) => {
    return Swal.fire(text)
}

/////// Constant Values //////////
export const whereToPost = [
    { value: 1, label: "Instagram", icon: "/assets/images/icon/insta.png", postTypes: ["post", "reel", "story"] },
    { value: 2, label: "Facebook", icon: "/assets/images/icon/facebook.png", postTypes: ["post", "video", "text"] },
    { value: 3, label: "Youtube", icon: "/assets/images/icon/youtube.png", postTypes: ["video", "short"] },
    { value: 4, label: "Pinterest", icon: "/assets/images/icon/pinterest.png", postTypes: ["post", "video"] },
    { value: 5, label: 'LinkedIn', icon: '/assets/images/icon/linkedin2.png', postTypes: ['post', 'video', 'text', 'document'] }
];

export const platformLimits = {
    1: 2200, // Instagram
    2: 63206, // Facebook (default or adjust accordingly)
    3: 5500, // YouTube
    5: 3000, // LinkedIn character limit for posts
    4: 800, // Pinterest
};

export const socialMediaMap = {
    1: "instagram",
    2: "facebook",
    3: "youtube",
    4: "pinterest",
    5: "linkedin"
};

export const rawCountryData = [
    {
        code: "af",
        dialCode: "93",
    },
    {
        code: "ax",
        dialCode: "358",
        priority: 1,
    },
    {
        code: "al",
        dialCode: "355",
    },
    {
        code: "dz",
        dialCode: "213",
    },
    {
        code: "as",
        dialCode: "1",
        priority: 5,
        areaCodes: ["684"],
    },
    {
        code: "ad",
        dialCode: "376",
    },
    {
        code: "ao",
        dialCode: "244",
    },
    {
        code: "ai",
        dialCode: "1",
        priority: 6,
        areaCodes: ["264"],
    },
    {
        code: "ag",
        dialCode: "1",
        priority: 7,
        areaCodes: ["268"],
    },
    {
        code: "ar",
        dialCode: "54",
    },
    {
        code: "am",
        dialCode: "374",
    },
    {
        code: "aw",
        dialCode: "297",
    },
    {
        code: "ac",
        dialCode: "247",
    },
    {
        code: "au",
        dialCode: "61",
        priority: 0,
        nationalPrefix: null,
        nationalPrefixFormattingRule: "0",
    },
    {
        code: "at",
        dialCode: "43",
    },
    {
        code: "az",
        dialCode: "994",
    },
    {
        code: "bs",
        dialCode: "1",
        priority: 8,
        areaCodes: ["242"],
    },
    {
        code: "bh",
        dialCode: "973",
    },
    {
        code: "bd",
        dialCode: "880",
    },
    {
        code: "bb",
        dialCode: "1",
        priority: 9,
        areaCodes: ["246"],
    },
    {
        code: "by",
        dialCode: "375",
    },
    {
        code: "be",
        dialCode: "32",
    },
    {
        code: "bz",
        dialCode: "501",
    },
    {
        code: "bj",
        dialCode: "229",
    },
    {
        code: "bm",
        dialCode: "1",
        priority: 10,
        areaCodes: ["441"],
    },
    {
        code: "bt",
        dialCode: "975",
    },
    {
        code: "bo",
        dialCode: "591",
    },
    {
        code: "ba",
        dialCode: "387",
    },
    {
        code: "bw",
        dialCode: "267",
    },
    {
        code: "br",
        dialCode: "55",
    },
    {
        code: "io",
        dialCode: "246",
    },
    {
        code: "vg",
        dialCode: "1",
        priority: 11,
        areaCodes: ["284"],
    },
    {
        code: "bn",
        dialCode: "673",
    },
    {
        code: "bg",
        dialCode: "359",
    },
    {
        code: "bf",
        dialCode: "226",
    },
    {
        code: "bi",
        dialCode: "257",
    },
    {
        code: "kh",
        dialCode: "855",
    },
    {
        code: "cm",
        dialCode: "237",
    },
    {
        code: "ca",
        dialCode: "1",
        priority: 1,
        areaCodes: ["204", "226", "236", "249", "250", "263", "289", "306", "343", "354", "365", "367", "368", "382", "387", "403", "416", "418", "428", "431", "437", "438", "450", "584", "468", "474", "506", "514", "519", "548", "579", "581", "584", "587", "604", "613", "639", "647", "672", "683", "705", "709", "742", "753", "778", "780", "782", "807", "819", "825", "867", "873", "879", "902", "905"],
    },
    {
        code: "cv",
        dialCode: "238",
    },
    {
        code: "bq",
        dialCode: "599",
        priority: 1,
        areaCodes: ["3", "4", "7"],
    },
    {
        code: "ky",
        dialCode: "1",
        priority: 12,
        areaCodes: ["345"],
    },
    {
        code: "cf",
        dialCode: "236",
    },
    {
        code: "td",
        dialCode: "235",
    },
    {
        code: "cl",
        dialCode: "56",
    },
    {
        code: "cn",
        dialCode: "86",
    },
    {
        code: "cx",
        dialCode: "61",
        priority: 2,
        areaCodes: ["89164"],
        nationalPrefixFormattingRule: "0",
    },
    {
        code: "cc",
        dialCode: "61",
        priority: 1,
        areaCodes: ["89162"],
        nationalPrefixFormattingRule: "0",
    },
    {
        code: "co",
        dialCode: "57",
    },
    {
        code: "km",
        dialCode: "269",
    },
    {
        code: "cg",
        dialCode: "242",
    },
    {
        code: "cd",
        dialCode: "243",
    },
    {
        code: "ck",
        dialCode: "682",
    },
    {
        code: "cr",
        dialCode: "506",
    },
    {
        code: "ci",
        dialCode: "225",
    },
    {
        code: "hr",
        dialCode: "385",
    },
    {
        code: "cu",
        dialCode: "53",
    },
    {
        code: "cw",
        dialCode: "599",
        priority: 0,
    },
    {
        code: "cy",
        dialCode: "357",
    },
    {
        code: "cz",
        dialCode: "420",
    },
    {
        code: "dk",
        dialCode: "45",
    },
    {
        code: "dj",
        dialCode: "253",
    },
    {
        code: "dm",
        dialCode: "1",
        priority: 13,
        areaCodes: ["767"],
    },
    {
        code: "do",
        dialCode: "1",
        priority: 2,
        areaCodes: ["809", "829", "849"],
    },
    {
        code: "ec",
        dialCode: "593",
    },
    {
        code: "eg",
        dialCode: "20",
    },
    {
        code: "sv",
        dialCode: "503",
    },
    {
        code: "gq",
        dialCode: "240",
    },
    {
        code: "er",
        dialCode: "291",
    },
    {
        code: "ee",
        dialCode: "372",
    },
    {
        code: "sz",
        dialCode: "268",
    },
    {
        code: "et",
        dialCode: "251",
    },
    {
        code: "fk",
        dialCode: "500",
    },
    {
        code: "fo",
        dialCode: "298",
    },
    {
        code: "fj",
        dialCode: "679",
    },
    {
        code: "fi",
        dialCode: "358",
        priority: 0,
    },
    {
        code: "fr",
        dialCode: "33",
    },
    {
        code: "gf",
        dialCode: "594",
    },
    {
        code: "pf",
        dialCode: "689",
    },
    {
        code: "ga",
        dialCode: "241",
    },
    {
        code: "gm",
        dialCode: "220",
    },
    {
        code: "ge",
        dialCode: "995",
    },
    {
        code: "de",
        dialCode: "49",
    },
    {
        code: "gh",
        dialCode: "233",
    },
    {
        code: "gi",
        dialCode: "350",
    },
    {
        code: "gr",
        dialCode: "30",
    },
    {
        code: "gl",
        dialCode: "299",
    },
    {
        code: "gd",
        dialCode: "1",
        priority: 14,
        areaCodes: ["473"],
    },
    {
        code: "gp",
        dialCode: "590",
        priority: 0,
    },
    {
        code: "gu",
        dialCode: "1",
        priority: 15,
        areaCodes: ["671"],
    },
    {
        code: "gt",
        dialCode: "502",
    },
    {
        code: "gg",
        dialCode: "44",
        priority: 1,
        areaCodes: ["1481", "7781", "7839", "7911"],
        nationalPrefixFormattingRule: "0",
    },
    {
        code: "gn",
        dialCode: "224",
    },
    {
        code: "gw",
        dialCode: "245",
    },
    {
        code: "gy",
        dialCode: "592",
    },
    {
        code: "ht",
        dialCode: "509",
    },
    {
        code: "hn",
        dialCode: "504",
    },
    {
        code: "hk",
        dialCode: "852",
    },
    {
        code: "hu",
        dialCode: "36",
    },
    {
        code: "is",
        dialCode: "354",
    },
    {
        code: "in",
        dialCode: "91",
    },
    {
        code: "id",
        dialCode: "62",
    },
    {
        code: "ir",
        dialCode: "98",
    },
    {
        code: "iq",
        dialCode: "964",
    },
    {
        code: "ie",
        dialCode: "353",
    },
    {
        code: "im",
        dialCode: "44",
        priority: 2,
        areaCodes: ["1624", "74576", "7524", "7924", "7624"],
        nationalPrefixFormattingRule: "0",
    },
    {
        code: "il",
        dialCode: "972",
    },
    {
        code: "it",
        dialCode: "39",
        priority: 0,
    },
    {
        code: "jm",
        dialCode: "1",
        priority: 4,
        areaCodes: ["876", "658"],
    },
    {
        code: "jp",
        dialCode: "81",
    },
    {
        code: "je",
        dialCode: "44",
        priority: 3,
        areaCodes: ["1534", "7509", "7700", "7797", "7829", "7937"],
        nationalPrefixFormattingRule: "0",
    },
    {
        code: "jo",
        dialCode: "962",
    },
    {
        code: "kz",
        dialCode: "7",
        priority: 1,
        areaCodes: ["33", "7"],
        nationalPrefixFormattingRule: "8",
    },
    {
        code: "ke",
        dialCode: "254",
    },
    {
        code: "ki",
        dialCode: "686",
    },
    {
        code: "xk",
        dialCode: "383",
    },
    {
        code: "kw",
        dialCode: "965",
    },
    {
        code: "kg",
        dialCode: "996",
    },
    {
        code: "la",
        dialCode: "856",
    },
    {
        code: "lv",
        dialCode: "371",
    },
    {
        code: "lb",
        dialCode: "961",
    },
    {
        code: "ls",
        dialCode: "266",
    },
    {
        code: "lr",
        dialCode: "231",
    },
    {
        code: "ly",
        dialCode: "218",
    },
    {
        code: "li",
        dialCode: "423",
    },
    {
        code: "lt",
        dialCode: "370",
    },
    {
        code: "lu",
        dialCode: "352",
    },
    {
        code: "mo",
        dialCode: "853",
    },
    {
        code: "mg",
        dialCode: "261",
    },
    {
        code: "mw",
        dialCode: "265",
    },
    {
        code: "my",
        dialCode: "60",
    },
    {
        code: "mv",
        dialCode: "960",
    },
    {
        code: "ml",
        dialCode: "223",
    },
    {
        code: "mt",
        dialCode: "356",
    },
    {
        code: "mh",
        dialCode: "692",
    },
    {
        code: "mq",
        dialCode: "596",
    },
    {
        code: "mr",
        dialCode: "222",
    },
    {
        code: "mu",
        dialCode: "230",
    },
    {
        code: "yt",
        dialCode: "262",
        priority: 1,
        areaCodes: ["269", "639"],
        nationalPrefixFormattingRule: "0",
    },
    {
        code: "mx",
        dialCode: "52",
    },
    {
        code: "fm",
        dialCode: "691",
    },
    {
        code: "md",
        dialCode: "373",
    },
    {
        code: "mc",
        dialCode: "377",
    },
    {
        code: "mn",
        dialCode: "976",
    },
    {
        code: "me",
        dialCode: "382",
    },
    {
        code: "ms",
        dialCode: "1",
        priority: 16,
        areaCodes: ["664"],
    },
    {
        code: "ma",
        dialCode: "212",
        priority: 0,
        nationalPrefix: null,
        nationalPrefixFormattingRule: "0",
    },
    {
        code: "mz",
        dialCode: "258",
    },
    {
        code: "mm",
        dialCode: "95",
    },
    {
        code: "na",
        dialCode: "264",
    },
    {
        code: "nr",
        dialCode: "674",
    },
    {
        code: "np",
        dialCode: "977",
    },
    {
        code: "nl",
        dialCode: "31",
    },
    {
        code: "nc",
        dialCode: "687",
    },
    {
        code: "nz",
        dialCode: "64",
    },
    {
        code: "ni",
        dialCode: "505",
    },
    {
        code: "ne",
        dialCode: "227",
    },
    {
        code: "ng",
        dialCode: "234",
    },
    {
        code: "nu",
        dialCode: "683",
    },
    {
        code: "nf",
        dialCode: "672",
    },
    {
        code: "kp",
        dialCode: "850",
    },
    {
        code: "mk",
        dialCode: "389",
    },
    {
        code: "mp",
        dialCode: "1",
        priority: 17,
        areaCodes: ["670"],
    },
    {
        code: "no",
        dialCode: "47",
        priority: 0,
    },
    {
        code: "om",
        dialCode: "968",
    },
    {
        code: "pk",
        dialCode: "92",
    },
    {
        code: "pw",
        dialCode: "680",
    },
    {
        code: "ps",
        dialCode: "970",
    },
    {
        code: "pa",
        dialCode: "507",
    },
    {
        code: "pg",
        dialCode: "675",
    },
    {
        code: "py",
        dialCode: "595",
    },
    {
        code: "pe",
        dialCode: "51",
    },
    {
        code: "ph",
        dialCode: "63",
    },
    {
        code: "pl",
        dialCode: "48",
    },
    {
        code: "pt",
        dialCode: "351",
    },
    {
        code: "pr",
        dialCode: "1",
        priority: 3,
        areaCodes: ["787", "939"],
    },
    {
        code: "qa",
        dialCode: "974",
    },
    {
        code: "re",
        dialCode: "262",
        priority: 0,
        nationalPrefix: null,
        nationalPrefixFormattingRule: "0",
    },
    {
        code: "ro",
        dialCode: "40",
    },
    {
        code: "ru",
        dialCode: "7",
        priority: 0,
        nationalPrefix: null,
        nationalPrefixFormattingRule: "8",
    },
    {
        code: "rw",
        dialCode: "250",
    },
    {
        code: "ws",
        dialCode: "685",
    },
    {
        code: "sm",
        dialCode: "378",
    },
    {
        code: "st",
        dialCode: "239",
    },
    {
        code: "sa",
        dialCode: "966",
    },
    {
        code: "sn",
        dialCode: "221",
    },
    {
        code: "rs",
        dialCode: "381",
    },
    {
        code: "sc",
        dialCode: "248",
    },
    {
        code: "sl",
        dialCode: "232",
    },
    {
        code: "sg",
        dialCode: "65",
    },
    {
        code: "sx",
        dialCode: "1",
        priority: 21,
        areaCodes: ["721"],
    },
    {
        code: "sk",
        dialCode: "421",
    },
    {
        code: "si",
        dialCode: "386",
    },
    {
        code: "sb",
        dialCode: "677",
    },
    {
        code: "so",
        dialCode: "252",
    },
    {
        code: "za",
        dialCode: "27",
    },
    {
        code: "kr",
        dialCode: "82",
    },
    {
        code: "ss",
        dialCode: "211",
    },
    {
        code: "es",
        dialCode: "34",
    },
    {
        code: "lk",
        dialCode: "94",
    },
    {
        code: "bl",
        dialCode: "590",
        priority: 1,
    },
    {
        code: "sh",
        dialCode: "290",
    },
    {
        code: "kn",
        dialCode: "1",
        priority: 18,
        areaCodes: ["869"],
    },
    {
        code: "lc",
        dialCode: "1",
        priority: 19,
        areaCodes: ["758"],
    },
    {
        code: "mf",
        dialCode: "590",
        priority: 2,
    },
    {
        code: "pm",
        dialCode: "508",
    },
    {
        code: "vc",
        dialCode: "1",
        priority: 20,
        areaCodes: ["784"],
    },
    {
        code: "sd",
        dialCode: "249",
    },
    {
        code: "sr",
        dialCode: "597",
    },
    {
        code: "sj",
        dialCode: "47",
        priority: 1,
        areaCodes: ["79"],
    },
    {
        code: "se",
        dialCode: "46",
    },
    {
        code: "ch",
        dialCode: "41",
    },
    {
        code: "sy",
        dialCode: "963",
    },
    {
        code: "tw",
        dialCode: "886",
    },
    {
        code: "tj",
        dialCode: "992",
    },
    {
        code: "tz",
        dialCode: "255",
    },
    {
        code: "th",
        dialCode: "66",
    },
    {
        code: "tl",
        dialCode: "670",
    },
    {
        code: "tg",
        dialCode: "228",
    },
    {
        code: "tk",
        dialCode: "690",
    },
    {
        code: "to",
        dialCode: "676",
    },
    {
        code: "tt",
        dialCode: "1",
        priority: 22,
        areaCodes: ["868"],
    },
    {
        code: "tn",
        dialCode: "216",
    },
    {
        code: "tr",
        dialCode: "90",
    },
    {
        code: "tm",
        dialCode: "993",
    },
    {
        code: "tc",
        dialCode: "1",
        priority: 23,
        areaCodes: ["649"],
    },
    {
        code: "tv",
        dialCode: "688",
    },
    {
        code: "ug",
        dialCode: "256",
    },
    {
        code: "ua",
        dialCode: "380",
    },
    {
        code: "ae",
        dialCode: "971",
    },
    {
        code: "gb",
        dialCode: "44",
        priority: 0,
        nationalPrefix: null,
        nationalPrefixFormattingRule: "0",
    },
    {
        code: "us",
        dialCode: "1",
        priority: 0,
    },
    {
        code: "uy",
        dialCode: "598",
    },
    {
        code: "vi",
        dialCode: "1",
        priority: 24,
        areaCodes: ["340"],
    },
    {
        code: "uz",
        dialCode: "998",
    },
    {
        code: "vu",
        dialCode: "678",
    },
    {
        code: "va",
        dialCode: "39",
        priority: 1,
        areaCodes: ["06698"],
    },
    {
        code: "ve",
        dialCode: "58",
    },
    {
        code: "vn",
        dialCode: "84",
    },
    {
        code: "wf",
        dialCode: "681",
    },
    {
        code: "eh",
        dialCode: "212",
        priority: 1,
        areaCodes: ["5288", "5289"],
        nationalPrefixFormattingRule: "0",
    },
    {
        code: "ye",
        dialCode: "967",
    },
    {
        code: "zm",
        dialCode: "260",
    },
    {
        code: "zw",
        dialCode: "263",
    },
];

export const status = {
    1: 'Published',
    2: 'Save to Draft',
    3: 'Schedule',
    4: 'Send for approval',
};
export const channelImages = {
    1: 'insta.png',
    2: 'facebook.png',
    3: 'youtube.png',
    4: 'pinterest.png',
    5: 'linkedin.png', // Add this line for LinkedIn icon
};
export const platformColors = {
    instagram: '#d592ff',
    facebook: '#50b5ff', // Updated to the correct Facebook color
    youtube: '#ff9b8a', // Updated to the correct YouTube color
    twitter: '#1DA1F2',
    linkedin: '#0077B5',
    google: '#4285F4',
    telegram: '#0088CC',
    pinterest: '#E60023',
    tiktok: '#000000',
};
export const eventColors = ['#50b5ff', '#a09e9e', '#49f0d3', '#d592ff', '#ffba68', '#ff9b8a', '#50b5ff'];

export const setMenuIdData = (menuData) => {
    try {
        if (typeof document !== 'undefined') {
            const expires = new Date(Date.now() + 7 * 864e5).toUTCString();
            document.cookie = 'admin_menu_data=' + encodeURIComponent(JSON.stringify(menuData)) + '; expires=' + expires + '; path=/';
        }
    } catch (error) {
        console.error('Error storing menu data in cookie:', error);
    }
};

export const getMenuIdData = () => {
    try {
        if (typeof document !== 'undefined') {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; admin_menu_data=`);
            if (parts.length === 2) {
                const menuData = JSON.parse(decodeURIComponent(parts.pop().split(';').shift()));
                return menuData;
            }
        }
        return {};
    } catch (error) {
        console.error('Error retrieving menu data from cookie:', error);
        return {};
    }
};

// Updated function to get specific menu ID by platform and type
export const getMenuId = (platform, type) => {
    try {
        if (typeof document !== 'undefined') {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; admin_menu_data=`);
            if (parts.length === 2) {
                const menuData = JSON.parse(decodeURIComponent(parts.pop().split(';').shift()));

                // Check if the requested platform and type exist
                if (!menuData[platform]) {
                    console.log(`Platform "${platform}" not found in menu data`);
                    return null;
                }

                if (!menuData[platform][type]) {
                    console.log(`Menu type "${type}" not found for platform "${platform}"`);
                    return null;
                }

                return menuData[platform][type];
            }
        }
        return null;
    } catch (error) {
        console.error('Error retrieving menu ID from cookie:', error);
        return null;
    }
};

// Permission action types
export const permissionTypes = {
    VIEW: 'view',   // Permission to view content
    ADD: 'add',     // Permission to add/create content
    EDIT: 'edit',   // Permission to edit/update content
    DELETE: 'delete', // Permission to delete content
    EXPORT: 'export'  // Permission to export content
};

