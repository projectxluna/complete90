'use strict';
const User = require('../models/user')
const Club = require('../models/club')

const isEmptyObj = (obj) => {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
};

const exposedUserData = (user) => {
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
}

const exposedClubData = (club) => {
    if (!club) {
        return;
    }
    return {
        name: club.name,
        createdAt: club.createdAt,
        teams: club.teams
    };
}

const createClub = (name, ownerId) => {
    return new Promise((resolve, reject) => {
        var club = new Club({name: name, owner: ownerId})
        club.save((err, club) => {
            if (err) {
                return reject(err);
            }
            resolve(club);
        });
    });
}

const findClub = (ownerId) => {
    return new Promise((resolve, reject) => {
        Club.findOne({owner: ownerId}, (err, club) => {
            resolve(club);
        });
    });
}

const findUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        User.findOne({
            email: email
        }, (err, found) => {
            if (err) {
                reject(err);
            }
            resolve(found);
        })
    });
}
const createUser = (user) => {
    return new Promise((resolve, reject) => {
        User.findOne({
            email: user.email
        }, (err, found) => {
            if (found || err) {
                return reject(err || 'Email already in use. Please Login');
            }
            user.save((err, user) => {
                if (err) {
                    return reject(err);
                }
                resolve(user);
            });
        });
    });
}

const PROFILE_TYPE = {
    PLAYER: 'PLAYER',
    MANAGER: 'MANAGER',
    OWNER: 'OWNER' 
}
Object.freeze(PROFILE_TYPE);

const PROFILES = {
    PLAYER: {
        type: PROFILE_TYPE.PLAYER,
        height: '',
        position: '',
        foot: '',
        age: '',
        jersey: ''
    },
    MANAGER: {
        type: PROFILE_TYPE.MANAGER,
        level: '',
    },
}
Object.freeze(PROFILES);

exports.exposedUserData = exposedUserData;
exports.exposedClubData = exposedClubData
exports.createUser = createUser
exports.findClub = findClub
exports.createClub = createClub
exports.findUserByEmail = findUserByEmail
exports.PROFILES = PROFILES;
exports.PROFILE_TYPE = PROFILE_TYPE
