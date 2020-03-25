var User = require('../models/user')
var Club = require('../models/club')
const mongoose = require('mongoose');

const isEmptyObj = (obj) => {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
};

const exposedUserData = (user) => {
    let cleanUser = {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.braintree.subscription || user.subscription,
        nationality: user.nationality || "",
        creditCards: user.braintree.creditCards,
        avatarURL: user.avatarURL || '/public/imgs/profile/cropped5ac0f4d48a2a273cd5f7b71a1526154727.jpg',
        profiles: user.profiles,
        clubId: user.clubId,
        teamId: user.teamId
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
        teams: club.teams,
        _id: club._id,
        logoUrl: club.logoUrl || '/public/imgs/clubs/default.png',
    };
}

const createClub = (name, email, phone, ownerId) => {
    return new Promise((resolve, reject) => {
        var club = new Club({name: name, email: email, phoneNumber: phone, owner: mongoose.Types.ObjectId(ownerId)})
        club.save((err, club) => {
            if (err) {
                return reject(err);
            }
            resolve(club);
        });
    });
}

const updateClub = (clubId, owner) => {
    return new Promise((resolve, reject) => {
        var owners = [];
        Club.findOne({_id: clubId}, (err, clubs) =>{
            owners.push(clubs.owner[0]);
            // clubs.owner.forEach(function(own){
            //     owners.push(own);
            // });

            owners.push(owner);
            Club.findOneAndUpdate({_id: clubId}, {owner: owners}, (err, club) =>{
                resolve(club);
            });


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

const PROFILE_TYPE = {
    PLAYER: 'PLAYER',
    MANAGER: 'MANAGER',
    OWNER: 'OWNER' 
}
Object.freeze(PROFILE_TYPE);

const CLUB_REQUEST_STATUS = {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
}
Object.freeze(CLUB_REQUEST_STATUS);

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
exports.findClub = findClub
exports.createClub = createClub
exports.updateClub = updateClub
exports.findUserByEmail = findUserByEmail
exports.PROFILES = PROFILES;
exports.PROFILE_TYPE = PROFILE_TYPE;
exports.CLUB_REQUEST_STATUS = CLUB_REQUEST_STATUS;
