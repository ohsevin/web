import { isFavoritesRoute, isPersonalRoute, isPublicFilesRoute } from '../../helpers/route'
import {
  isDownloadAsArchiveAvailable,
  triggerDownloadAsArchive
} from '../../helpers/download/downloadAsArchive'
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['getToken']),
    $_downloadFolder_items() {
      return [
        {
          icon: 'archive',
          handler: this.$_downloadFolder_trigger,
          label: () => {
            return this.$gettext('Download folder')
          },
          isEnabled: ({ resource }) => {
            if (
              !isPersonalRoute(this.$route) &&
              !isPublicFilesRoute(this.$route) &&
              !isFavoritesRoute(this.$route)
            ) {
              return false
            }
            if (!resource.isFolder) {
              return false
            }
            if (!isDownloadAsArchiveAvailable()) {
              return false
            }
            return resource.canDownload()
          },
          canBeDefault: true,
          componentType: 'oc-button',
          class: 'oc-files-actions-download-archive-trigger'
        }
      ]
    }
  },
  methods: {
    async $_downloadFolder_trigger(resource) {
      await triggerDownloadAsArchive({
        folderPath: resource.path,
        token: this.getToken
      })
    }
  }
}
