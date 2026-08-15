import createAuthorizeResourceAccess from "./authorizeResourceAccess.js";
import rbac from "../config/roles.js";
import songs from "../db_services/songs.js";

const { PERMISSIONS } = rbac;

const authorizeSongAccess = createAuthorizeResourceAccess({
    resourceName: "songs",
    getById: songs.getById,
    ownerField: "uploaderId",
    permissions: {
    manageAny: PERMISSIONS.SONG_MANAGE_ANY,
    updateOwn: PERMISSIONS.SONG_UPDATE_OWN,
    deleteOwn: PERMISSIONS.SONG_DELETE_OWN,
    publicOwn: PERMISSIONS.SONG_PUBLIC_OWN,
    },
});

export default authorizeSongAccess;