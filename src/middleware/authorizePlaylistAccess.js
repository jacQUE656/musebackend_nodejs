import createAuthorizeResourceAccess from "./authorizeResourceAccess.js";
import rbac from "../config/roles.js";
import playlists from "../db_services/playlists.js";

const { PERMISSIONS } = rbac;

const authorizePlaylistAccess = createAuthorizeResourceAccess({
  resourceName: "playlist",
  getById: playlists.getById,
  ownerField: "ownerId",
  permissions: {
    manageAny: PERMISSIONS.PLAYLIST_MANAGE_ANY,
    updateOwn: PERMISSIONS.PLAYLIST_UPDATE_OWN,
    deleteOwn: PERMISSIONS.PLAYLIST_DELETE_OWN,
  },
});

export default authorizePlaylistAccess;