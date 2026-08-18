import prisma from "../config/dbConnect.js";

async function createNotification({userId, type, title, message , songId = null , albumId = null, playlistId = null}) {
 return prisma.notification.create({
    data: {userId,type,title,message,songId,albumId,playlistId},
 });   
}

async function createNotificationForMany(userIds, {type, title, message , songId = null , albumId = null, playlistId = null}) {
 return prisma.notification.createMany({
    data: userIds.map((userId) => ({userId, type, title, message, songId, albumId, playlistId}));
 });   
}

async function getByUser(userId, {sip = 0, take = 30, unreadOnly=false} = {}) {
    return prisma.notification.findMany({
        where: {userId, ...(unreadOnly ? {isRead: false} : {})},
        orderBy: {createdAt: "desc"},
        skip,
        take,
    });
}

async function getUnreadCount(userId) {
    return prisma.notification.count({where: {userId, isRead: false}});
}

async function markAllRead(userId) {
    return prisma.notification.updateMany({
        where: {userId, isRead: false},
        data: {isRead: true},
    });
}

async function markAsRead(id, userId) {
    return prisma.notification.update({
        where: {id, userId},
        data: {isRead: true},
    });
}



async function remove(id, userId) {
    return prisma.notification.deleteMany({
        where: {id, userId}
    });
}

export default {
    createNotification,
    createNotificationForMany,
    getByUser,
    getUnreadCount,
    markAllRead,
    markAsRead,
    remove
}