'use strict';

const isEmptyObj = (obj) => {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
};

const exposedData = (user) => {
    let cleanUser = {
        name: user.name,
        email: user.email,
        subscription: user.braintree.subscription || user.subscription,
        nationality: user.nationality || "",
        creditCards: user.braintree.creditCards,
        avatarURL: user.avatarURL || "/public/imgs/profile/cropped5ac0f4d48a2a273cd5f7b71a1526154727.jpg",
        clubName: user.clubName,
        profiles: user.profiles
    }
    return cleanUser;
};

const PROFILES = {
    PLAYER: {
        type: 'PLAYER',
        height: '',
        position: '',
        foot: '',
        age: '',
        jersey: ''
    },
    MANAGER: {
        type: 'MANAGER',
        level: '',
    },
}
Object.freeze(PROFILES);

exports.exposedData = exposedData;
exports.PROFILES = PROFILES;
