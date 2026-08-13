const ROLES = Object.freeze({
  ADMIN: "admin",
  USER: "user",
  PREMIUM_USER: "premium_user",
});

const PERMISSIONS = Object.freeze({
  SONG_READ: "song:read",
  SONG_CREATE: "song:create",
  SONG_UPDATE_OWN: "song:update:own",
  SONG_DELETE_OWN: "song:delete:own",
  SONG_MANAGE_ANY: "song:manage:any", // admin: update/delete ANY song
  SONG_PUBLIC_OWN: "song:public:own",  // premium_user: make song public for other users to see

  ALBUM_READ: "album:read",
  ALBUM_CREATE: "album:create",
  ALBUM_UPDATE_OWN: "album:update:own",
  ALBUM_DELETE_OWN: "album:delete:own",
  ALBUM_MANAGE_ANY: "album:manage:any", // admin: update/delete ANY album
  ALBUM_PUBLIC_OWN: "album:public:own",

  PLAYLIST_READ: "playlist:read",
  PLAYLIST_CREATE: "playlist:create",
  PLAYLIST_UPDATE_OWN: "playlist:update:own",
  PLAYLIST_DELETE_OWN: "playlist:delete:own",
  PLAYLIST_MANAGE_ANY: "playlist:manage:any", // admin: update/delete ANY playlist
  PLAYLIST_PUBLIC_OWN: "playlist:public:own",
});

const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.ADMIN]: [
    PERMISSIONS.SONG_READ,
    PERMISSIONS.SONG_CREATE,
    PERMISSIONS.SONG_MANAGE_ANY,
    PERMISSIONS.ALBUM_READ,
    PERMISSIONS.ALBUM_CREATE,
    PERMISSIONS.ALBUM_MANAGE_ANY,
    PERMISSIONS.PLAYLIST_READ,
    PERMISSIONS.PLAYLIST_CREATE,
    PERMISSIONS.PLAYLIST_UPDATE_OWN,
    PERMISSIONS.PLAYLIST_DELETE_OWN,
    PERMISSIONS.PLAYLIST_MANAGE_ANY,
  ],
  [ROLES.USER]: [
    PERMISSIONS.SONG_READ,
    PERMISSIONS.SONG_CREATE,
    PERMISSIONS.SONG_UPDATE_OWN,
    PERMISSIONS.SONG_DELETE_OWN,
    PERMISSIONS.ALBUM_READ,
    PERMISSIONS.ALBUM_CREATE,
    PERMISSIONS.ALBUM_UPDATE_OWN,
    PERMISSIONS.ALBUM_DELETE_OWN,
    PERMISSIONS.PLAYLIST_READ,
    PERMISSIONS.PLAYLIST_CREATE, // any user can build their own playlists
    PERMISSIONS.PLAYLIST_UPDATE_OWN, // ...and edit/delete only the ones they own
    PERMISSIONS.PLAYLIST_DELETE_OWN,
  ],
  [ROLES.PREMIUM_USER]: [
    PERMISSIONS.SONG_CREATE,
    PERMISSIONS.SONG_READ,
    PERMISSIONS.SONG_UPDATE_OWN,
    PERMISSIONS.SONG_DELETE_OWN,
    PERMISSIONS.SONG_PUBLIC_OWN,
    PERMISSIONS.ALBUM_CREATE,
    PERMISSIONS.ALBUM_READ,
    PERMISSIONS.ALBUM_UPDATE_OWN,
    PERMISSIONS.ALBUM_DELETE_OWN,
    PERMISSIONS.ALBUM_PUBLIC_OWN,
    PERMISSIONS.PLAYLIST_READ,
    PERMISSIONS.PLAYLIST_CREATE,
    PERMISSIONS.PLAYLIST_UPDATE_OWN,
    PERMISSIONS.PLAYLIST_DELETE_OWN,
    PERMISSIONS.PLAYLIST_PUBLIC_OWN,
  ],
});

function roleHasPermission(role, permission) {
  const permissions = ROLE_PERMISSIONS[role];
  return Array.isArray(permissions) && permissions.includes(permission);
}

export default { ROLES, PERMISSIONS, ROLE_PERMISSIONS, roleHasPermission };