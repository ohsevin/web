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
          displayValue: 'Unlimited quota',
          displayUnit: ''
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
          icon: 'markdown',
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
          displayValue: (resources[0].spaceQuota.total * Math.pow(10, -9)).toString(),
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

        console.log(this.$data.$_editQuota_options)
        this.$data.$_editQuota_selectedOption = newOption
      }
    },

    $_editQuota_editQuotaSpace() {
      const space = this.currentFolder

      const graphClient = clientService.graphAuthenticated(this.configuration.server, this.getToken)
      return graphClient.drives
        .updateDrive(
          space.id,
          { quota: { total: this.$data.$_editQuota_selectedOption.value } },
          {}
        )
        .then(() => {
          this.$_editQuota_closeModal()
          this.UPDATE_RESOURCE_FIELD({
            id: space.id,
            field: 'spaceQuota',
            value: {
              ...space.spaceQuota,
              ...{ total: this.$data.$_editQuota_selectedOption.value }
            }
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

    $_editQuota_createOption(value) {
      console.log(this.$data.$_editQuota_options)
      const displayValue = value.replace(',', '.')
      return {
        displayValue: value.replace(',', '.'),
        displayUnit: 'GB',
        value: parseFloat(displayValue) * Math.pow(10, 9)
      }
    }
  }
}
