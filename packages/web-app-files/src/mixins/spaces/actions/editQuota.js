import { mapActions, mapMutations, mapState } from 'vuex'
import { clientService } from 'web-pkg/src/services'

export default {
  data: function () {
    return {
      $_editQuota_modalOpen: false,
      $_editQuota_options: [
        {
          displayValue: '1',
          displayUnit: 'GB',
          value: Math.pow(10, 9)
        },
        {
          displayValue: '5',
          displayUnit: 'GB',
          value: 5 * Math.pow(10, 9)
        },
        {
          displayValue: '10',
          displayUnit: 'GB',
          value: 10 * Math.pow(10, 9)
        },
        {
          displayValue: '50',
          displayUnit: 'GB',
          value: 50 * Math.pow(10, 9)
        },
        {
          displayValue: '100',
          displayUnit: 'GB',
          value: 100 * Math.pow(10, 9)
        },
        {
          displayValue: '500',
          displayUnit: 'GB',
          value: 500 * Math.pow(10, 9)
        },
        {
          displayValue: '1000',
          displayUnit: 'GB',
          value: 10000 * Math.pow(10, 9)
        },
        {
          displayValue: this.$gettext('No restriction'),
          displayUnit: '',
          unlimited: true
        }
      ],
      $_editQuota_selectedOption: {}
    }
  },
  computed: {
    ...mapState('Files', ['currentFolder']),
    $_editQuota_items() {
      return [
        {
          name: 'editQuota',
          icon: 'hard-drive',
          label: () => {
            return this.$gettext('Edit quota')
          },
          handler: this.$_editQuota_trigger,
          isEnabled: ({ resources }) => {
            if (resources.length !== 1) {
              return false
            }

            return resources[0].spaceReadmeData
          },
          componentType: 'oc-button',
          class: 'oc-files-actions-edit-quota-content-trigger'
        }
      ]
    },
    $_editQuota_modalButtonConfirmDisabled() {
      const space = this.currentFolder
      return space.spaceQuota.total === this.$data.$_editQuota_selectedOption.value
    }
  },
  methods: {
    ...mapActions(['showMessage']),
    ...mapMutations('Files', ['UPDATE_RESOURCE_FIELD']),
    $_editQuota_trigger({ resources }) {
      if (resources.length !== 1) {
        return
      }
      this.$data.$_editQuota_modalOpen = true

      const selectedQuotaInOptions = this.$data.$_editQuota_options.find(
        (option) => option.value === resources[0].spaceQuota.total
      )

      if (selectedQuotaInOptions) {
        this.$data.$_editQuota_selectedOption = selectedQuotaInOptions
      } else {
        const newOption = {
          displayValue: (resources[0].spaceQuota.total * Math.pow(10, -9))
            .toFixed(2)
            .toString()
            .replace('.00', ''),
          displayUnit: 'GB',
          value: resources[0].spaceQuota.total
        }
        this.$data.$_editQuota_options.push(newOption)
        this.$data.$_editQuota_options = [
          ...this.$data.$_editQuota_options
            .filter((o) => o.value)
            .sort((a, b) => a.value - b.value),
          ...this.$data.$_editQuota_options.filter((o) => !o.value)
        ]
        this.$data.$_editQuota_selectedOption = newOption
      }
    },

    $_editQuota_editQuotaSpace() {
      const space = this.currentFolder
      const newTotalQuota = this.$data.$_editQuota_selectedOption.value

      if (isNaN(newTotalQuota)) {
        return this.showMessage({
          title: this.$gettext('Editing space quota failed…'),
          status: 'danger'
        })
      }

      const graphClient = clientService.graphAuthenticated(this.configuration.server, this.getToken)
      return graphClient.drives
        .updateDrive(
          space.id,
          { quota: { total: this.$data.$_editQuota_selectedOption.value } },
          {}
        )
        .then(({ data }) => {
          this.$_editQuota_closeModal()
          this.UPDATE_RESOURCE_FIELD({
            id: space.id,
            field: 'spaceQuota',
            value: data.quota
          })
          this.showMessage({
            title: this.$gettext('Space quota successfully edited')
          })
        })
        .catch((error) => {
          this.showMessage({
            title: this.$gettext('Editing space quota failed…'),
            desc: error,
            status: 'danger'
          })
        })
    },

    $_editQuota_closeModal() {
      this.$data.$_editQuota_modalOpen = false
    },
    $_editQuota_OptionSelectable(option) {
      if (option.unlimited) {
        return true
      }

      if (!option.value) {
        return false
      }

      return !isNaN(option.value)
    },
    $_editQuota_createOption(option) {
      if (option.endsWith('.') || option.endsWith(',')) {
        option = option.slice(0, -1)
      }

      const optionIsNumberRegex = /^[1-9]\d*(([.,])\d+)?$/g

      if (!optionIsNumberRegex.test(option)) {
        return {
          displayValue: option,
          error: this.$gettext('Invalid input')
        }
      }

      option = option.replace(',', '.')
      return {
        displayValue: parseFloat(option).toFixed(2).toString().replace('.00', ''),
        displayUnit: 'GB',
        value: parseFloat(option).toFixed(2) * Math.pow(10, 9)
      }
    }
  }
}
