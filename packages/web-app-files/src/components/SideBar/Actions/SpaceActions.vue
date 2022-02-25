<template>
  <div>
    <portal v-if="$data.$_editQuota_modalOpen" to="app.runtime.modal">
      <oc-modal
        id="edit-quota-modal"
        focus-trap-initial="#quota-input-select"
        :title="$gettext('Edit quota for space') + ' ' + resources[0].name"
        :button-cancel-text="$gettext('Cancel')"
        :button-confirm-text="$gettext('Confirm')"
        :button-confirm-disabled="$_editQuota_modalButtonConfirmDisabled"
        @confirm="$_editQuota_editQuotaSpace"
        @cancel="$_editQuota_closeModal"
      >
        <template #content>
          <oc-select
            id="quota-input-select"
            v-model="$data.$_editQuota_selectedOption"
            :selectable="$_editQuota_OptionSelectable"
            taggable
            push-tags
            :clearable="false"
            :options="$data.$_editQuota_options"
            :create-option="$_editQuota_createOption"
            option-label="displayValue"
            :label="$gettext('Space quota')"
          >
            <template #selected-option="{ displayValue, displayUnit }">
              <span>{{ displayValue }}</span>
              <span v-if="displayUnit" class="oc-text-muted oc-ml-s">{{ displayUnit }}</span>
            </template>
            <template #search="{ attributes, events }">
              <input class="vs__search" v-bind="attributes" v-on="events" />
            </template>
            <template #option="{ displayValue, displayUnit, error }">
              <div class="oc-flex oc-flex-between">
                <span>{{ displayValue }}</span>
                <span v-if="displayUnit" class="oc-text-muted">{{ displayUnit }}</span>
              </div>
              <div v-if="error" class="oc-text-input-danger">{{ error }}</div>
            </template>
          </oc-select>
        </template>
      </oc-modal>
    </portal>
    <portal v-if="$data.$_editReadmeContent_modalOpen" to="app.runtime.modal">
      <oc-modal
        focus-trap-initial="#description-input-area"
        :title="$gettext('Edit description for space') + ' ' + resources[0].name"
        :button-cancel-text="$gettext('Cancel')"
        :button-confirm-text="$gettext('Confirm')"
        @confirm="$_editReadmeContent_editReadmeContentSpace"
        @cancel="$_editReadmeContent_closeModal"
      >
        <template #content>
          <label v-translate class="oc-label" for="description-input-area">Space description</label>
          <textarea
            id="description-input-area"
            v-model="$data.$_editReadmeContent_content"
            class="oc-width-1-1 oc-height-1-1 oc-text-input"
            rows="30"
          ></textarea>
        </template>
      </oc-modal>
    </portal>
    <input
      id="space-image-upload-input"
      ref="spaceImageInput"
      type="file"
      name="file"
      multiple
      tabindex="-1"
      accept="image/*"
      @change="$_uploadImage_uploadImageSpace"
    />
    <oc-list id="oc-spaces-actions-sidebar" class-name="oc-mt-s">
      <action-menu-item
        v-for="(action, index) in actions"
        :key="`action-${index}`"
        :action="action"
        :items="resources"
        class="oc-py-xs"
      />
    </oc-list>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ActionMenuItem from '../../ActionMenuItem.vue'
import Rename from '../../../mixins/spaces/actions/rename'
import Delete from '../../../mixins/spaces/actions/delete'
import Disable from '../../../mixins/spaces/actions/disable'
import Restore from '../../../mixins/spaces/actions/restore'
import EditDescription from '../../../mixins/spaces/actions/editDescription'
import EditReadmeContent from '../../../mixins/spaces/actions/editReadmeContent'
import UploadImage from '../../../mixins/spaces/actions/uploadImage'
import EditQuota from '../../../mixins/spaces/actions/editQuota'

export default {
  name: 'SpaceActions',
  title: ($gettext) => {
    return $gettext('Actions')
  },
  components: { ActionMenuItem },
  mixins: [
    Rename,
    Delete,
    EditDescription,
    EditReadmeContent,
    Disable,
    Restore,
    UploadImage,
    EditQuota
  ],
  computed: {
    ...mapGetters('Files', ['highlightedFile']),

    resources() {
      return [this.highlightedFile]
    },

    actions() {
      return [
        ...this.$_rename_items,
        ...this.$_editDescription_items,
        ...this.$_uploadImage_items,
        ...this.$_editReadmeContent_items,
        ...this.$_editQuota_items,
        ...this.$_restore_items,
        ...this.$_delete_items,
        ...this.$_disable_items
      ].filter((item) => item.isEnabled({ resources: this.resources }))
    }
  }
}
</script>

<style lang="scss">
#space-image-upload-input {
  position: absolute;
  left: -99999px;
}

#oc-spaces-actions-sidebar {
  > li a,
  > li a:hover {
    color: var(--oc-color-swatch-passive-default);
    display: inline-flex;
    gap: 10px;
    vertical-align: top;
  }
}
</style>
